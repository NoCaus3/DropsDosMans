type Active = "drops" | "connect";

export default function Header({ active = "drops" }: { active?: Active }) {
  return (
    <div className="header">
      <a href="/" className="logo">
        <img
          src="https://files.facepunch.com/lewis/1b2811b1/marque-inside.svg"
          alt="Rust Logo"
        />
      </a>
      <div className="navigation">
        <a
          className={active === "drops" ? "is-active is-active-exact" : ""}
          href="/#drops"
        >
          Twitch Drops
        </a>
        <a
          className={active === "connect" ? "is-active is-active-exact" : ""}
          href="/connect"
        >
          Connect Account
        </a>
        <a
          href="https://store.steampowered.com/app/252490"
          target="_blank"
          rel="noreferrer"
          className="buy"
        >
          <i className="mdi mdi-steam" />
          <span>Buy Rust</span>
        </a>
      </div>
      <div className="user">
        <a href="/connect" className="connect">
          <i className="mdi mdi-account" />
        </a>
      </div>
    </div>
  );
}
