import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LFG × Clean Sprint",
  description: "A shared household reset sprint for Jay and Zara.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
