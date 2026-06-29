import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Provider from "../trpc/Provider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "The Wharf",
  description: "The AI co-pilot that turns raw requests into shipped code.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Provider>
          {children}
        </Provider>
      </body>
    </html>
  );
}
