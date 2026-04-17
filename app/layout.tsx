import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rust | Twitch Drops",
  description:
    "Connect your accounts to earn in-game rewards by watching Rust streams on Twitch.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Poppins:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@mdi/font@7.2.96/css/materialdesignicons.min.css"
        />
        <script src="/scripts.js" />
      </head>
      <body>{children}</body>
    </html>
  );
}
