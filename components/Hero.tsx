export default function Hero() {
  return (
    <div className="hero">
      <div className="container">
        <div className="hero-body">
          <h1 className="title hero-title">
            Drops dos <span>Mans</span>
          </h1>

          <div className="how-it-works">
            <div className="title-section">
              <span className="subtitle">Getting Drops</span>
              <span className="title">How it Works</span>
            </div>
            <div className="hiw-body">
              <p>
                You&rsquo;ll need an account on both Steam and Twitch to claim
                drops. If one of your accounts is already linked to a different
                account, you can unlink it by signing into that account first.
              </p>
              <a href="/connect#account" className="button is-outline">
                Connect Accounts
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
