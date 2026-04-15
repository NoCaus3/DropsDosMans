export default function Footer() {
  return (
    <div className="footer">
      <div className="footer-container">
        <a href="https://facepunch.com">
          <img
            src="https://files.facepunch.com/lewis/1b1711b1/facepunch-logo.png"
            className="footer-container__logo"
            alt="Facepunch Logo"
          />
        </a>
        <i className="mdi mdi-close" />
        <a href="https://rust.facepunch.com">
          <img
            src="https://files.facepunch.com/lewis/1b2811b1/rust-marque.svg"
            className="footer-container__logo"
            alt="Rust Logo"
          />
        </a>
        <i className="mdi mdi-close" />
        <a href="https://twitch.com">
          <img
            src="https://files.facepunch.com/lewis/1b1711b1/twitch-logo.png"
            className="footer-container__logo"
            alt="Twitch Logo"
          />
        </a>
      </div>
      <span className="footer-copyright">
        © 2026 Facepunch Studios - All rights reserved
      </span>
    </div>
  );
}
