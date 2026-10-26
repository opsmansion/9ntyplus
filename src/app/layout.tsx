import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const redditSans = localFont({
  src: [
    { path: "./fonts/RedditSans-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/RedditSans-ExtraBold.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-reddit-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "90+ by Opesi Mansion",
  description: "Something exciting is happening.",
  openGraph: {
    title: "90+ by Opesi Mansion",
    description: "Something exciting is happening.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${redditSans.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
