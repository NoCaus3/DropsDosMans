import { createClient } from "@libsql/client";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

function loadEnvLocal() {
  const envPath = resolve(dirname(fileURLToPath(import.meta.url)), "..", ".env.local");
  const text = readFileSync(envPath, "utf8");
  return Object.fromEntries(
    text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const i = line.indexOf("=");
        return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
      }),
  );
}

const env = loadEnvLocal();
const db = createClient({
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN,
});

console.log("→ Connected to", env.TURSO_DATABASE_URL);

await db.batch(
  [
    `CREATE TABLE IF NOT EXISTS user_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      steam_id TEXT,
      steam_persona TEXT,
      steam_avatar TEXT,
      twitch_id TEXT,
      twitch_login TEXT,
      twitch_display_name TEXT,
      twitch_email TEXT,
      twitch_avatar TEXT,
      twitch_access_token TEXT,
      twitch_refresh_token TEXT,
      twitch_token_expires_at INTEGER,
      drops_enabled INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch()),
      deleted_at INTEGER
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_user_links_steam_id_active
      ON user_links(steam_id)
      WHERE deleted_at IS NULL AND steam_id IS NOT NULL`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_user_links_twitch_id_active
      ON user_links(twitch_id)
      WHERE deleted_at IS NULL AND twitch_id IS NOT NULL`,
  ],
  "write",
);

console.log("✓ Table user_links + partial unique indexes ready");

const tables = await db.execute(
  "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
);
console.log("→ Tables:", tables.rows.map((r) => r.name).join(", "));

const columns = await db.execute("PRAGMA table_info(user_links)");
console.log("→ Columns:");
for (const r of columns.rows) {
  console.log(`  - ${r.name} (${r.type})${r.pk ? " PK" : ""}`);
}

const indexes = await db.execute(
  "SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='user_links' ORDER BY name",
);
console.log("→ Indexes:", indexes.rows.map((r) => r.name).join(", "));
