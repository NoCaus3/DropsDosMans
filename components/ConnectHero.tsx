import EventCampaign from "@/components/EventCampaign";
import type { Campaign } from "@/lib/campaigns";

export default function ConnectHero({
  campaign,
}: {
  campaign: Campaign | null;
}) {
  return (
    <div className="hero connect-page">
      <div className="container">
        <div className="hero-body">
          <h1 className="title hero-title">Connect Account</h1>
          {campaign && <EventCampaign campaign={campaign} />}
        </div>
      </div>
    </div>
  );
}
