import type { Metadata } from "next";
import { Doto, Space_Grotesk, Space_Mono } from "next/font/google";
import Script from "next/script";
import { DbProvider } from "@/components/db-provider";
import { MobileGate } from "@/components/mobile-gate";
import { SwRegister } from "@/components/sw-register";
import { BottomTabBar } from "@/components/bottom-tab-bar";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-data",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const doto = Doto({
  variable: "--font-doto",
  subsets: ["latin"],
  weight: "variable",
  axes: ["ROND"],
  preload: false,
});

export const metadata: Metadata = {
  title: "Moneta — Contabilità locale",
  description:
    "Contabilità personale 100% offline: conti, movimenti e budget salvati solo nel browser.",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="it"
      className={`${spaceGrotesk.variable} ${spaceMono.variable} ${doto.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem("moneta-theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);}catch(e){}})();`}
        </Script>
        <DbProvider>
          <MobileGate>
            {children}
            <BottomTabBar />
          </MobileGate>
        </DbProvider>
        <SwRegister />
      </body>
    </html>
  );
}