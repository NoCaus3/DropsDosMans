import type { Campaign } from "@/lib/campaigns";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatUtcLabel(unixSeconds: number) {
  const d = new Date(unixSeconds * 1000);
  const month = MONTHS[d.getUTCMonth()];
  const day = d.getUTCDate();
  const year = d.getUTCFullYear();
  const h24 = d.getUTCHours();
  const minute = String(d.getUTCMinutes()).padStart(2, "0");
  const h12 = h24 % 12 || 12;
  const ampm = h24 >= 12 ? "PM" : "AM";
  return `${month} ${day}, ${year} at ${h12}:${minute} ${ampm} UTC`;
}

function localizeDateScript(id: string, ms: number) {
  return `document.addEventListener("DOMContentLoaded", () => { for (const element of document.querySelectorAll("[data-date-id='${id}']")) { element.innerText = new Date(${ms}).toLocaleString(navigator.language, {year:'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }); } });`;
}

function EventHero({ campaign }: { campaign: Campaign }) {
  const startMs = campaign.start_at * 1000;
  const endMs = campaign.end_at * 1000;
  const dateIdStart = `date-${campaign.id}-start-${campaign.start_at}`;
  const dateIdEnd = `date-${campaign.id}-end-${campaign.end_at}`;

  return (
    <>
      {campaign.hero_image_url && (
        <div className="hero-image">
          <img src={campaign.hero_image_url} alt={campaign.name} />
        </div>
      )}

      <div className="campaign campaign campaign-0 is-active ">
        <div className="round-info">
          <div className="line"></div>
          <span className="round-info-number">Round {campaign.round_number}</span>
          <i className="mdi mdi-close"></i>
          <span className="round-info-title">{campaign.name}</span>
          <i className="mdi mdi-close"></i>
          <span className="round-info-live">Event Live</span>
          <div className="line"></div>
        </div>

        <div className="event-date">
          <span
            className="date"
            data-date-id={dateIdStart}
            suppressHydrationWarning
          >
            {formatUtcLabel(campaign.start_at)}
          </span>
          <script
            dangerouslySetInnerHTML={{
              __html: localizeDateScript(dateIdStart, startMs),
            }}
          />{" "}
          <span className="until">Until</span>{" "}
          <span
            className="date"
            data-date-id={dateIdEnd}
            suppressHydrationWarning
          >
            {formatUtcLabel(campaign.end_at)}
          </span>
          <script
            dangerouslySetInnerHTML={{
              __html: localizeDateScript(dateIdEnd, endMs),
            }}
          />
        </div>

        <div className="counter timer">
          <span className="title">time remaining</span>
          <div className="counter-boxes">
            <div className="count-box">
              <h1 className="value day" suppressHydrationWarning>
                0
              </h1>
              <span>Days</span>
            </div>
            <div className="count-box">
              <h1 className="value hour" suppressHydrationWarning>
                0
              </h1>
              <span>Hours</span>
            </div>
            <div className="count-box">
              <h1 className="value minute" suppressHydrationWarning>
                0
              </h1>
              <span>Minutes</span>
            </div>
            <div className="count-box">
              <h1 className="value second" suppressHydrationWarning>
                0
              </h1>
              <span>Seconds</span>
            </div>
          </div>
        </div>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `setupCountdown('.campaign-0', ${startMs}, ${endMs});`,
        }}
      />
    </>
  );
}

function HowItWorks() {
  return (
    <div className="how-it-works">
      <div className="title-section">
        <span className="subtitle">Getting Drops</span>
        <span className="title">How it Works</span>
      </div>
      <div className="hiw-body">
        <p>
          You&rsquo;ll need an account on both Steam and Twitch to claim drops.
          If one of your accounts is already linked to a different account, you
          can unlink it by signing into that account first.
        </p>
        <a href="/connect#account" className="button is-outline">
          Connect Accounts
        </a>
      </div>
    </div>
  );
}

export default function Hero({ campaign }: { campaign: Campaign | null }) {
  return (
    <div className="hero">
      <div className="container">
        <div className="hero-body">
          {campaign ? (
            <EventHero campaign={campaign} />
          ) : (
            <>
              <h1 className="title hero-title">
                Drops dos <span>Mans</span>
              </h1>
              <HowItWorks />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
