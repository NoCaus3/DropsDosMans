import { readSession } from "@/lib/session";
import { getLinkById } from "@/lib/db";

type Active = "drops" | "connect";

export default async function Header({ active = "drops" }: { active?: Active }) {
  const session = await readSession();
  const link = session ? await getLinkById(session.sid) : null;
  const avatar = link?.twitch_avatar ?? link?.steam_avatar ?? null;
  const dropsEnabled = !!link?.drops_enabled;
  const connectActive = active === "connect" && !dropsEnabled;

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
          className={connectActive ? "is-active is-active-exact" : ""}
          href="/connect"
        >
          Connect Account
        </a>
        <a
          href="https://store.steampowered.com/app/252490?utm_source=w_campaign=ncsts"
          target="_blank"
          rel="noreferrer"
          className="buy"
        >
          <i className="mdi mdi-steam" />
          <span>Buy Rust</span>
        </a>
      </div>
      <div className="user">
        {avatar ? (
          <a href="/connect#account" className="avatar">
            <img src={avatar} alt="" />
          </a>
        ) : (
          <a href="/connect" className="connect">
            <i className="mdi mdi-account" />
          </a>
        )}
      </div>
    </div>
  );
}
