"use client";

import { useState } from "react";

type QA = { q: string; a: React.ReactNode };

const items: QA[] = [
  {
    q: "Which streams do I need to watch to get drops?",
    a: (
      <p>
        All{" "}
        <a href="https://www.twitch.tv/directory/game/Rust?tl=c2542d6d-cd10-4532-919b-3d19f30a768b">
          Rust streams with the Drops Enabled tag
        </a>{" "}
        will count towards earning drops. However, streamer-specific drops will
        require you to watch a specific streamer in order to get their drop. All
        participating streamers are listed above and all active campaigns and
        their conditions can always be seen on{" "}
        <a href="https://www.twitch.tv/drops/campaigns">this Twitch page</a>.
      </p>
    ),
  },
  {
    q: "Is there any way to check my progress towards the next drop? What if I missed the drop?",
    a: (
      <p>
        You can track your progress on the{" "}
        <a href="https://www.twitch.tv/drops/inventory">
          Twitch Drops Inventory
        </a>{" "}
        page.
      </p>
    ),
  },
  {
    q: "Can I earn drops faster or more often by watching more than one channel at a time?",
    a: (
      <p>
        No, you will only be eligible to receive a drop for one active channel
        at a time. Watching more than one channel simultaneously will not result
        in more drops.
      </p>
    ),
  },
  {
    q: "How long does it take for drops to show up in my Steam inventory?",
    a: (
      <p>
        It can take up to 10 minutes after pressing the Claim button for items
        to show up in your Steam inventory. If the item does not show up after
        30 minutes then your Steam account may not have been linked to your
        Twitch account when you claimed the drop. You can link your accounts on
        the top of this page and then click the button to check for missing
        drops to attempt the reward again. You will need to own{" "}
        <a href="https://store.steampowered.com/app/252490/Rust/">Rust</a> on
        Steam in order to receive the items.
      </p>
    ),
  },
  {
    q: "Do I need Twitch Prime to be eligible?",
    a: (
      <p>
        No, you will just need a{" "}
        <a href="https://www.twitch.tv/login">Twitch account</a> and a{" "}
        <a href="https://store.steampowered.com/join/">Steam account</a> that
        has <a href="https://store.steampowered.com/app/252490/Rust/">Rust</a>{" "}
        in its library.
      </p>
    ),
  },
  {
    q: "I no longer have access to the Twitch account I linked my Steam account to and want to link a new one. What do I do?",
    a: (
      <p>
        You can unlink your old Twitch account by signing in with Steam on this
        page and then clicking the Unlink Account button. Then you will be able
        to link your accounts normally again.
      </p>
    ),
  },
  {
    q: "I haven't bought Rust yet but I claimed some drops on Twitch. Will I still be able to get the drops in my Steam account later?",
    a: (
      <p>
        Yes, as long as you have claimed the drops you will be able to get them
        when you purchase Rust later (within 180 days). However, they will not
        automatically appear in your Steam inventory. You will need to make sure
        your account is linked on this page and then click the &lsquo;Check for
        Missing Drops&rsquo; button. Please note that drops claimed more than
        180 days ago will expire and not be redeemable to a Steam item.
      </p>
    ),
  },
  {
    q: "What are crates used for?",
    a: (
      <>
        <p>
          Crates are Steam items which give you one random Rust item or skin
          when you open it. To open your crates all you need to do is:
        </p>
        <ol>
          <li>
            Open{" "}
            <a href="https://store.steampowered.com/app/252490/Rust/">Rust</a>
          </li>
          <li>In the main menu, click on Inventory</li>
          <li>Select a crate</li>
          <li>Click the button to open the crate</li>
        </ol>
      </>
    ),
  },
];

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number>(0);
  return (
    <div className="section is-large faq">
      <div className="container">
        <div className="section-header">
          <h1 className="title">Frequently Asked Questions</h1>
        </div>

        <div className="section-body">
          {items.map((item, i) => (
            <div
              key={i}
              className={`faq-question${openIdx === i ? "" : " collapsed"}`}
            >
              <div
                className="title"
                onClick={() => setOpenIdx(openIdx === i ? -1 : i)}
              >
                <span>{item.q}</span>
                <div className="expand-button">
                  <i className="mdi mdi-plus" />
                </div>
              </div>
              <div className="faq-body">{item.a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
