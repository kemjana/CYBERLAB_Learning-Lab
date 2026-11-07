import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { PlayerProvider } from "@/components/PlayerProvider";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Cyber Lab: practice spotting scams and attacks",
  description:
    "Hands-on security challenges with an AI coach: phishing, passwords, and a prompt-injection capture-the-flag.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <PlayerProvider>
          <Header />
          <main>{children}</main>
          <footer className="foot">
            For education only. All emails, companies, and links here are fictional. Never type a real password into any practice tool.
          </footer>
        </PlayerProvider>
      </body>
    </html>
  );
}
