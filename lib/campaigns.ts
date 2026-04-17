import { db, initDb } from "@/lib/db";

export type Campaign = {
  id: number;
  slug: string;
  round_number: number;
  name: string;
  hero_image_url: string | null;
  start_at: number;
  end_at: number;
};

export type CampaignDrop = {
  id: number;
  campaign_id: number;
  position: number;
  drop_type: string;
  required_hours: number;
  item_id: string | null;
  video_url: string | null;
  image_url: string | null;
  claimed_count: number;
};

export async function getActiveCampaign(): Promise<Campaign | null> {
  await initDb();
  const now = Math.floor(Date.now() / 1000);
  const r = await db.execute({
    sql: `SELECT id, slug, round_number, name, hero_image_url, start_at, end_at
          FROM campaigns
          WHERE deleted_at IS NULL AND end_at > ?
          ORDER BY start_at ASC
          LIMIT 1`,
    args: [now],
  });
  return (r.rows[0] as unknown as Campaign) ?? null;
}

export async function getCampaignDrops(campaignId: number): Promise<CampaignDrop[]> {
  await initDb();
  const r = await db.execute({
    sql: `SELECT id, campaign_id, position, drop_type, required_hours, item_id, video_url, image_url, claimed_count
          FROM campaign_drops
          WHERE campaign_id = ?
          ORDER BY position ASC`,
    args: [campaignId],
  });
  return r.rows as unknown as CampaignDrop[];
}
