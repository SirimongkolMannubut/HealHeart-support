import "./globals.css";

export const metadata = {
  title: "HealHeart - Anonymous Support Community",
  description: "A safe, anonymous space to share your life problems and receive encouragement from a supportive community.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
