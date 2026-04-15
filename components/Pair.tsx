import { readSession } from "@/lib/session";
import { getLinkById, type UserLink } from "@/lib/db";

export default async function Pair() {
  const session = await readSession();
  const link: UserLink | null = session
    ? await getLinkById(session.sid)
    : null;

  const hasSteam = !!link?.steam_id;
  const hasTwitch = !!link?.twitch_id;
  const dropsEnabled = !!link?.drops_enabled;

  const step1Active = !hasSteam && !hasTwitch;
  const step2Active = (hasSteam && !hasTwitch) || (!hasSteam && hasTwitch);
  const step3Active = hasSteam && hasTwitch;

  return (
    <div className="section pair" id="account">
      <div className="container">
        <div className="section-header">
          <div className="section-icon">
            <img
              src={
                step3Active
                  ? "https://files.facepunch.com/lewis/1b1311b1/account-linked.png"
                  : "https://files.facepunch.com/lewis/1b1311b1/account-unlinked.png"
              }
              alt="Connect Accounts Icon"
            />
          </div>
          <h1 className="title">Pair Account</h1>
          <p className="subtitle">
            Pair your <span>Steam Account</span> with your{" "}
            <span>Twitch Account</span> to enable Twitch Drops.
          </p>
        </div>

        <div className="pair-steps">
          {/* STEP 1 */}
          <div className={`step${step1Active ? " is-active" : ""}`}>
            <div className="step-number">
              <span className="title">Step</span>
              <span className="value">1</span>
            </div>
            <div className="step-body">
              <h2 className="step-title">Sign in with one of your accounts</h2>
              <p className="step-subtitle">
                You&rsquo;ll need an account on both Steam and Twitch to claim
                drops. If one of your accounts is already linked to a different
                account, you can unlink it by signing into that account first.
              </p>
              {step1Active && (
                <div className="step-footer">
                  <form>
                    <button
                      className="button steam"
                      type="submit"
                      formAction="/api/auth/steam"
                      formMethod="get"
                    >
                      <i className="mdi mdi-steam" />
                      Sign in with Steam
                    </button>
                    <span className="subtext">Or</span>
                    <button
                      className="button twitch"
                      type="submit"
                      formAction="/api/auth/twitch"
                      formMethod="get"
                    >
                      <i className="mdi mdi-twitch" />
                      Sign in with Twitch
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* STEP 2 */}
          <div className={`step${step2Active ? " is-active" : ""}`}>
            <div className="step-number">
              <span className="title">Step</span>
              <span className="value">2</span>
            </div>
            <div className="step-body">
              <h2 className="step-title">
                {hasSteam
                  ? "Sign in with your Twitch account"
                  : hasTwitch
                    ? "Sign in with your Steam account"
                    : "Sign in with your other account"}
              </h2>
              <p className="step-subtitle">
                Both a Steam account and a Twitch account are required to claim
                drops.
                {hasSteam && link?.steam_persona && (
                  <>
                    {" "}
                    Signed in as <strong>{link.steam_persona}</strong> on Steam.
                  </>
                )}
                {hasTwitch && link?.twitch_display_name && (
                  <>
                    {" "}
                    Signed in as{" "}
                    <strong>{link.twitch_display_name}</strong> on Twitch.
                  </>
                )}
              </p>
              {step2Active && (
                <div className="step-footer">
                  <form>
                    {hasSteam ? (
                      <button
                        className="button twitch"
                        type="submit"
                        formAction="/api/auth/twitch"
                        formMethod="get"
                      >
                        <i className="mdi mdi-twitch" />
                        Sign in with Twitch
                      </button>
                    ) : (
                      <button
                        className="button steam"
                        type="submit"
                        formAction="/api/auth/steam"
                        formMethod="get"
                      >
                        <i className="mdi mdi-steam" />
                        Sign in with Steam
                      </button>
                    )}
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* STEP 3 */}
          <div className={`step${step3Active ? " is-active" : ""}`}>
            <div className="step-number">
              <span className="title">Step</span>
              <span className="value">3</span>
            </div>
            <div className="step-body">
              <h2 className="step-title">
                {dropsEnabled ? "Twitch Drops Activated" : "Activate Twitch Drops"}
              </h2>
              <p className="step-subtitle">
                {dropsEnabled
                  ? "Your accounts are linked and drops are active. Watch Rust streams with Drops Enabled to earn rewards."
                  : "Lastly, press the button below to finish activating drops so you can begin to receive drops in your Steam account. Previously claimed drops can be sent to you by clicking on the \u201cCheck for missing drops\u201d button on the next page."}
              </p>
              {step3Active && (
                <div className="step-footer">
                  <form method="post">
                    <div className="button-row">
                      {!dropsEnabled && (
                        <button
                          className="button is-primary"
                          type="submit"
                          formAction="/api/auth/enable"
                        >
                          <i className="mdi mdi-check-circle" />
                          <span>Activate Drops</span>
                        </button>
                      )}
                      <button
                        title="Logout"
                        className="button is-dark logout"
                        type="submit"
                        formAction="/api/auth/logout"
                      >
                        <i className="mdi mdi-logout" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
