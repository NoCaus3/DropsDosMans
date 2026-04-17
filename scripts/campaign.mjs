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

const [, , action, slug] = process.argv;

function usage() {
  console.log("Usage:");
  console.log("  node scripts/campaign.mjs list");
  console.log("  node scripts/campaign.mjs deactivate <slug>");
  console.log("  node scripts/campaign.mjs activate <slug>");
  console.log("  node scripts/campaign.mjs seed-example");
  process.exit(1);
}

if (action === "list") {
  const r = await db.execute(
    "SELECT id, slug, round_number, name, start_at, end_at, deleted_at FROM campaigns ORDER BY id",
  );
  if (r.rows.length === 0) {
    console.log("(no campaigns)");
    process.exit(0);
  }
  const now = Math.floor(Date.now() / 1000);
  for (const row of r.rows) {
    const status = row.deleted_at
      ? "DELETED"
      : row.end_at <= now
        ? "ENDED"
        : row.start_at > now
          ? "UPCOMING"
          : "LIVE";
    console.log(
      `[${status}] id=${row.id} slug=${row.slug} round=${row.round_number} "${row.name}"`,
    );
  }
  process.exit(0);
}

if (action === "deactivate") {
  if (!slug) usage();
  const r = await db.execute({
    sql: "UPDATE campaigns SET deleted_at = unixepoch(), updated_at = unixepoch() WHERE slug = ? AND deleted_at IS NULL",
    args: [slug],
  });
  console.log(`✓ deactivated ${r.rowsAffected} campaign(s) with slug=${slug}`);
  process.exit(0);
}

if (action === "activate") {
  if (!slug) usage();
  const r = await db.execute({
    sql: "UPDATE campaigns SET deleted_at = NULL, updated_at = unixepoch() WHERE slug = ?",
    args: [slug],
  });
  console.log(`✓ activated ${r.rowsAffected} campaign(s) with slug=${slug}`);
  process.exit(0);
}

if (action === "seed-example") {
  const now = Math.floor(Date.now() / 1000);
  const startAt = now - 60;
  const endAt = now + 60 * 60 * 24 * 7;
  const exampleSlug = "example-round-1";
  const heroImage =
    "https://files.facepunch.com/lewis/1b1611b1/td_49-website-header_crop.png";

  const drops = [
    {
      position: 1,
      drop_type: "Caixa Bronze",
      required_hours: 2,
      item_id: "demo-1",
      video_url: "https://files.facepunch.com/lewis/1b1611b1/rock.mp4",
      image_url: "https://files.facepunch.com/lewis/1b1611b1/rock.jpg",
    },
    {
      position: 2,
      drop_type: "Caixa Prata",
      required_hours: 4,
      item_id: "demo-2",
      video_url: "https://files.facepunch.com/lewis/1b1611b1/sleeping-bag.mp4",
      image_url: "https://files.facepunch.com/lewis/1b1611b1/sleeping-bag.jpg",
    },
    {
      position: 3,
      drop_type: "Caixa Ouro",
      required_hours: 6,
      item_id: "demo-3",
      video_url: "https://files.facepunch.com/lewis/1b1611b1/garage-door.mp4",
      image_url: "https://files.facepunch.com/lewis/1b1611b1/garage-door.jpg",
    },
    {
      position: 4,
      drop_type: "Caixa Lendária",
      required_hours: 8,
      item_id: "demo-4",
      video_url: "https://files.facepunch.com/lewis/1b1611b1/l96.mp4",
      image_url: "https://files.facepunch.com/lewis/1b1611b1/l96.jpg",
    },
  ];

  const existing = await db.execute({
    sql: "SELECT id FROM campaigns WHERE slug = ?",
    args: [exampleSlug],
  });

  let campaignId;
  if (existing.rows.length > 0) {
    campaignId = existing.rows[0].id;
    await db.execute({
      sql: "UPDATE campaigns SET hero_image_url = ?, start_at = ?, end_at = ?, deleted_at = NULL, updated_at = unixepoch() WHERE id = ?",
      args: [heroImage, startAt, endAt, campaignId],
    });
    console.log(`✓ reactivated example campaign id=${campaignId}`);
  } else {
    const insert = await db.execute({
      sql: "INSERT INTO campaigns (slug, round_number, name, hero_image_url, start_at, end_at) VALUES (?, ?, ?, ?, ?, ?)",
      args: [exampleSlug, 1, "Exemplo do Mans", heroImage, startAt, endAt],
    });
    campaignId = Number(insert.lastInsertRowid);
    console.log(`✓ inserted example campaign id=${campaignId}`);
  }

  await db.execute({
    sql: "DELETE FROM campaign_drops WHERE campaign_id = ?",
    args: [campaignId],
  });
  for (const drop of drops) {
    await db.execute({
      sql: "INSERT INTO campaign_drops (campaign_id, position, drop_type, required_hours, item_id, video_url, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: [
        campaignId,
        drop.position,
        drop.drop_type,
        drop.required_hours,
        drop.item_id,
        drop.video_url,
        drop.image_url,
      ],
    });
  }
  console.log(`✓ wrote ${drops.length} drops with media URLs`);

  process.exit(0);
}

usage();
