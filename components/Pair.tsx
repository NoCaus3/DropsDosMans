import { readSession } from "@/lib/session";
import { getLinkById, type UserLink } from "@/lib/db";

type PairState =
  | { kind: "logged-out" }
  | { kind: "steam-only"; link: UserLink }
  | { kind: "twitch-only"; link: UserLink }
  | { kind: "both-linked-not-activated"; link: UserLink }
  | { kind: "both-linked-activated"; link: UserLink };

function resolveState(link: UserLink | null): PairState {
  if (!link || (!link.steam_id && !link.twitch_id)) return { kind: "logged-out" };
  if (link.steam_id && !link.twitch_id) return { kind: "steam-only", link };
  if (!link.steam_id && link.twitch_id) return { kind: "twitch-only", link };
  if (link.steam_id && link.twitch_id && !link.drops_enabled) {
    return { kind: "both-linked-not-activated", link };
  }
  return { kind: "both-linked-activated", link };
}

export default async function Pair() {
  const session = await readSession();
  const link = session ? await getLinkById(session.sid) : null;
  const state = resolveState(link);

  switch (state.kind) {
    case "logged-out":
      return <PairLoggedOut />;
    case "steam-only":
      return <PairSteamOnly link={state.link} />;
    case "twitch-only":
      return <PairTwitchOnly link={state.link} />;
    case "both-linked-not-activated":
      return <PairBothLinkedNotActivated link={state.link} />;
    case "both-linked-activated":
      return <PairActivated link={state.link} />;
  }
}

function PairShell({
  variant,
  children,
}: {
  variant: "setup" | "success";
  children: React.ReactNode;
}) {
  if (variant === "setup") {
    return (
      <div className="section pair" id="account">
        <div className="container">
          <div className="section-header">
            <div className="section-icon">
              <img
                src="https://files.facepunch.com/lewis/1b1311b1/account-unlinked.png"
                alt="Connect Accounts Icon"
              />
            </div>
            <h1 className="title">Pair Account</h1>
            <p className="subtitle">
              Pair your <span>Steam Account</span> with your{" "}
              <span>Twitch Account</span> to enable Twitch Drops.
            </p>
          </div>
          <div className="pair-steps">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="section pair" id="account">
      <div className="container">
        <div className="section-header">
          <div className="section-icon">
            <img
              src="https://files.facepunch.com/lewis/1b1311b1/account-linked.png"
              alt="Accounts Successfully Linked Icon"
            />
          </div>
          <h1 className="title">Successfully paired</h1>
          <p className="subtitle">
            You&rsquo;ve successfully paired your <span>Steam Account</span>{" "}
            and your <span>Twitch Account</span> to enable Twitch Drops.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}

function StepNumber({ value }: { value: number }) {
  return (
    <div className="step-number">
      <span className="title">Step</span>
      <span className="value">{value}</span>
    </div>
  );
}

function SteamSignInButton() {
  return (
    <button
      className="button steam"
      type="submit"
      formAction="/api/auth/steam"
      formMethod="get"
    >
      <i className="mdi mdi-steam" />
      Sign in with Steam
    </button>
  );
}

function TwitchSignInButton() {
  return (
    <button
      className="button twitch"
      type="submit"
      formAction="/api/auth/twitch"
      formMethod="get"
    >
      <i className="mdi mdi-twitch" />
      Sign in with Twitch
    </button>
  );
}

function LogoutButton() {
  return (
    <button
      title="Logout"
      className="button is-dark logout"
      type="submit"
      formAction="/api/auth/logout"
    >
      <i className="mdi mdi-logout" />
      <span>Logout</span>
    </button>
  );
}

function AccountBlock({
  avatar,
  username,
  altPrefix,
}: {
  avatar: string | null;
  username: string | null;
  altPrefix: string;
}) {
  return (
    <div className="account">
      {avatar && (
        <img
          src={avatar}
          className="avatar"
          alt={`Your ${altPrefix} avatar`}
        />
      )}
      <span className="username" title={username ?? ""}>
        {username}
      </span>
    </div>
  );
}

function StepCompleteSteam({
  link,
  includeLogout,
}: {
  link: UserLink;
  includeLogout: boolean;
}) {
  return (
    <div className="step is-complete">
      <StepNumber value={1} />
      <div className="step-body">
        <h2 className="step-title">
          {" "}
          <i className="mdi mdi-steam" /> Steam Account
        </h2>
        <div className="step-footer">
          <AccountBlock
            avatar={link.steam_avatar}
            username={link.steam_persona}
            altPrefix="Steam"
          />
          {includeLogout && (
            <form method="post">
              <LogoutButton />
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function StepCompleteTwitch({
  number,
  link,
  includeLogout,
}: {
  number: number;
  link: UserLink;
  includeLogout: boolean;
}) {
  return (
    <div className="step is-complete">
      <StepNumber value={number} />
      <div className="step-body">
        <h2 className="step-title">
          <i className="mdi mdi-twitch" /> Twitch Account
        </h2>
        <div className="step-footer">
          <AccountBlock
            avatar={link.twitch_avatar}
            username={link.twitch_display_name}
            altPrefix="Twitch"
          />
          {includeLogout && (
            <form method="post">
              <LogoutButton />
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function StepSignInOther({ missing }: { missing: "steam" | "twitch" }) {
  return (
    <div className="step is-active">
      <StepNumber value={2} />
      <div className="step-body">
        <h2 className="step-title">Sign in with your other account</h2>
        <p className="step-subtitle">
          Both a Steam account and a Twitch account are required to claim
          drops.
        </p>
        <div className="step-footer">
          <form>
            {missing === "steam" ? <SteamSignInButton /> : <TwitchSignInButton />}
          </form>
        </div>
      </div>
    </div>
  );
}

function StepActivate({ active }: { active: boolean }) {
  return (
    <div className={`step${active ? " is-active" : ""}`}>
      <StepNumber value={3} />
      <div className="step-body">
        <h2 className="step-title">Activate Twitch Drops</h2>
        <p className="step-subtitle">
          Lastly, press the button below to finish activating drops so you can
          begin to receive drops in your Steam account. Previously claimed
          drops can be sent to you by clicking on the &ldquo;Check for missing
          drops&rdquo; button on the next page.
        </p>
        <div className="step-footer">
          <form method="post">
            <div className="button-row">
              <button
                className="button is-primary"
                type="submit"
                formAction="/api/auth/enable"
              >
                <i className="mdi mdi-check-circle" />
                <span>Activate Drops</span>
              </button>
              <LogoutButton />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function AccountBoxSteam({ link }: { link: UserLink }) {
  return (
    <div className="account-box steam">
      <div className="account-box-header">
        <i className="mdi mdi-steam" />
        <span>Steam Account</span>
      </div>
      <div className="account-box-body">
        <div className="user">
          <div className="avatar">
            {link.steam_avatar && (
              <img src={link.steam_avatar} alt="Your Steam avatar" />
            )}
          </div>
          <span className="username">{link.steam_persona}</span>
        </div>
      </div>
    </div>
  );
}

function AccountBoxTwitch({ link }: { link: UserLink }) {
  return (
    <div className="account-box  twitch">
      <div className="account-box-header">
        <i className="mdi mdi-twitch" />
        <span>Twitch Account</span>
      </div>
      <div className="account-box-body">
        <div className="user">
          <div className="avatar">
            {link.twitch_avatar && (
              <img src={link.twitch_avatar} alt="Your Twitch avatar" />
            )}
          </div>
          <span className="username">{link.twitch_display_name}</span>
        </div>
      </div>
    </div>
  );
}

function PairLoggedOut() {
  return (
    <PairShell variant="setup">
      <div className="step is-active">
        <StepNumber value={1} />
        <div className="step-body">
          <h2 className="step-title">Sign in with one of your accounts</h2>
          <p className="step-subtitle">
            You&rsquo;ll need an account on both Steam and Twitch to claim
            drops. If one of your accounts is already linked to a different
            account, you can unlink it by signing into that account first.
          </p>
          <div className="step-footer">
            <form>
              <SteamSignInButton />
              <span className="subtext">Or</span>
              <TwitchSignInButton />
            </form>
          </div>
        </div>
      </div>

      <div className="step">
        <StepNumber value={2} />
        <div className="step-body">
          <h2 className="step-title">Sign in with your other account</h2>
          <p className="step-subtitle">
            Both a Steam account and a Twitch account are required to claim
            drops.
          </p>
          <div className="step-footer">
            <form>
              <SteamSignInButton />
            </form>
          </div>
        </div>
      </div>

      <StepActivate active={false} />
    </PairShell>
  );
}

function PairSteamOnly({ link }: { link: UserLink }) {
  return (
    <PairShell variant="setup">
      <StepCompleteSteam link={link} includeLogout={true} />
      <StepSignInOther missing="twitch" />
      <StepActivate active={false} />
    </PairShell>
  );
}

function PairTwitchOnly({ link }: { link: UserLink }) {
  return (
    <PairShell variant="setup">
      <StepCompleteTwitch number={1} link={link} includeLogout={true} />
      <StepSignInOther missing="steam" />
      <StepActivate active={false} />
    </PairShell>
  );
}

function PairBothLinkedNotActivated({ link }: { link: UserLink }) {
  return (
    <PairShell variant="setup">
      <StepCompleteSteam link={link} includeLogout={false} />
      <StepCompleteTwitch number={2} link={link} includeLogout={false} />
      <StepActivate active={true} />
    </PairShell>
  );
}

function PairActivated({ link }: { link: UserLink }) {
  return (
    <PairShell variant="success">
      <div className="columns">
        <div className="column">
          <AccountBoxSteam link={link} />
        </div>
        <div className="column">
          <AccountBoxTwitch link={link} />
        </div>
      </div>
      <div className="account-action-links">
        <form method="post">
          <button
            className="button is-outline"
            type="submit"
            formAction="/api/auth/logout"
          >
            <i className="mdi mdi-logout-variant" />
            <span>Logout</span>
          </button>
          <button
            className="button is-outline"
            type="submit"
            formAction="/api/auth/unlink"
          >
            <i className="mdi mdi-link-variant-off" />
            <span>Unlink Account</span>
          </button>
          <button
            className="button is-outline"
            type="submit"
            formAction="/api/auth/refresh-drops"
          >
            <i className="mdi mdi-refresh" />
            <span>Check for Missing Drops</span>
          </button>
        </form>
      </div>
    </PairShell>
  );
}
