import { createClient } from "@libsql/client";

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

let initialized = false;

export async function initDb() {
  if (initialized) return;
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
  initialized = true;
}

export type UserLink = {
  id: number;
  steam_id: string | null;
  steam_persona: string | null;
  steam_avatar: string | null;
  twitch_id: string | null;
  twitch_login: string | null;
  twitch_display_name: string | null;
  twitch_email: string | null;
  twitch_avatar: string | null;
  drops_enabled: number;
};

async function queryOne(sql: string, args: (string | number)[]) {
  const r = await db.execute({ sql, args });
  return (r.rows[0] as unknown as UserLink) ?? null;
}

export async function getLinkBySteamId(steamId: string) {
  await initDb();
  return queryOne(
    "SELECT * FROM user_links WHERE steam_id = ? AND deleted_at IS NULL",
    [steamId],
  );
}

export async function getLinkByTwitchId(twitchId: string) {
  await initDb();
  return queryOne(
    "SELECT * FROM user_links WHERE twitch_id = ? AND deleted_at IS NULL",
    [twitchId],
  );
}

export async function getLinkById(id: number) {
  await initDb();
  return queryOne(
    "SELECT * FROM user_links WHERE id = ? AND deleted_at IS NULL",
    [id],
  );
}

export async function upsertSteam(
  sessionRowId: number | null,
  steamId: string,
  persona: string | null,
  avatar: string | null,
) {
  await initDb();
  const existing = await getLinkBySteamId(steamId);
  if (existing) {
    await db.execute({
      sql: `UPDATE user_links SET steam_persona=?, steam_avatar=?, updated_at=unixepoch() WHERE id=?`,
      args: [persona, avatar, existing.id],
    });
    return existing.id;
  }
  if (sessionRowId) {
    const row = await getLinkById(sessionRowId);
    if (row && !row.steam_id) {
      await db.execute({
        sql: `UPDATE user_links SET steam_id=?, steam_persona=?, steam_avatar=?, updated_at=unixepoch() WHERE id=?`,
        args: [steamId, persona, avatar, sessionRowId],
      });
      return sessionRowId;
    }
  }
  const r = await db.execute({
    sql: `INSERT INTO user_links (steam_id, steam_persona, steam_avatar) VALUES (?,?,?)`,
    args: [steamId, persona, avatar],
  });
  return Number(r.lastInsertRowid);
}

export async function upsertTwitch(
  sessionRowId: number | null,
  twitch: {
    id: string;
    login: string;
    display_name: string;
    email: string | null;
    avatar: string | null;
    access_token: string;
    refresh_token: string;
    expires_at: number;
  },
) {
  await initDb();
  const existing = await getLinkByTwitchId(twitch.id);
  if (existing) {
    await db.execute({
      sql: `UPDATE user_links SET twitch_login=?, twitch_display_name=?, twitch_email=?, twitch_avatar=?,
              twitch_access_token=?, twitch_refresh_token=?, twitch_token_expires_at=?,
              updated_at=unixepoch() WHERE id=?`,
      args: [
        twitch.login,
        twitch.display_name,
        twitch.email,
        twitch.avatar,
        twitch.access_token,
        twitch.refresh_token,
        twitch.expires_at,
        existing.id,
      ],
    });
    return existing.id;
  }
  if (sessionRowId) {
    const row = await getLinkById(sessionRowId);
    if (row && !row.twitch_id) {
      await db.execute({
        sql: `UPDATE user_links SET twitch_id=?, twitch_login=?, twitch_display_name=?, twitch_email=?, twitch_avatar=?,
                twitch_access_token=?, twitch_refresh_token=?, twitch_token_expires_at=?,
                updated_at=unixepoch() WHERE id=?`,
        args: [
          twitch.id,
          twitch.login,
          twitch.display_name,
          twitch.email,
          twitch.avatar,
          twitch.access_token,
          twitch.refresh_token,
          twitch.expires_at,
          sessionRowId,
        ],
      });
      return sessionRowId;
    }
  }
  const r = await db.execute({
    sql: `INSERT INTO user_links (twitch_id, twitch_login, twitch_display_name, twitch_email, twitch_avatar,
            twitch_access_token, twitch_refresh_token, twitch_token_expires_at)
          VALUES (?,?,?,?,?,?,?,?)`,
    args: [
      twitch.id,
      twitch.login,
      twitch.display_name,
      twitch.email,
      twitch.avatar,
      twitch.access_token,
      twitch.refresh_token,
      twitch.expires_at,
    ],
  });
  return Number(r.lastInsertRowid);
}

export async function enableDrops(rowId: number) {
  await initDb();
  await db.execute({
    sql: `UPDATE user_links SET drops_enabled=1, updated_at=unixepoch() WHERE id=?`,
    args: [rowId],
  });
}

export async function softDeleteLink(rowId: number) {
  await initDb();
  await db.execute({
    sql: `UPDATE user_links SET deleted_at=unixepoch(), updated_at=unixepoch() WHERE id=? AND deleted_at IS NULL`,
    args: [rowId],
  });
}
