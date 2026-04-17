import type { CampaignDrop } from "@/lib/campaigns";

export default function DropsList({ drops }: { drops: CampaignDrop[] }) {
  if (drops.length === 0) return null;

  return (
    <div className="section drops" id="drops">
      <div className="container">
        <div className="section-header generic">
          <h1 className="title">
            General Drops <span>({drops.length})</span>
          </h1>
          <span className="subtitle">
            Available across all drops enabled{" "}
            <a
              href="https://www.twitch.tv/directory/all/tags/Rust"
              target="_blank"
              rel="noreferrer"
            >
              Rust Twitch streams
            </a>
          </span>
        </div>
        <div className={`drops-container is-row-${drops.length}`}>
          {drops.map((drop) => (
            <DropBox key={drop.id} drop={drop} />
          ))}
        </div>
      </div>
    </div>
  );
}

function DropBox({ drop }: { drop: CampaignDrop }) {
  const hoursLabel = `${drop.required_hours} ${
    drop.required_hours === 1 ? "Hour" : "Hours"
  }`;

  return (
    <a
      href="https://www.twitch.tv/directory/category/rust"
      target="_blank"
      rel="noreferrer noopener"
      className="drop-box"
    >
      <div className="drop-box-header">
        <div className="streamer-info"></div>
      </div>
      <div className="drop-box-body">
        <div className="drop-lock">
          <i className="mdi mdi-lock"></i>
        </div>
        {drop.video_url ? (
          <video preload="auto" autoPlay loop muted playsInline>
            <source src={drop.video_url} type="video/mp4" />
            {drop.image_url && (
              <img
                src={drop.image_url}
                title="Your browser does not support the <video> tag"
              />
            )}
          </video>
        ) : drop.image_url ? (
          <img src={drop.image_url} alt={drop.drop_type} />
        ) : null}
      </div>
      <div className="drop-box-footer">
        <span className="drop-type">{drop.drop_type}</span>
        <div className="drop-time">
          <i className="mdi mdi-clock"></i>
          <span>{hoursLabel}</span>
        </div>
        <div className="drop-count">
          <i className="mdi mdi-trophy"></i>
          <span>
            <span className="drop-counter" data-itemid={drop.item_id ?? ""}>
              {drop.claimed_count.toLocaleString()}
            </span>{" "}
            claimed
          </span>
        </div>
      </div>
    </a>
  );
}
