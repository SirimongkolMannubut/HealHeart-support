import "./globals.css";
import type { Metadata } from "next";

export const metadata = {
  title: "HealHeart - Anonymous Support Community",
  description: "A safe, anonymous space to share your life problems and receive encouragement from a supportive community.",
  manifest: "/manifest.json",
  themeColor: "#fb923c",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HealHeart",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#fb923c" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="HealHeart" />
      </head>
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
