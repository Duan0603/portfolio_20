import type { Metadata } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { profile } from "@/lib/data";
import { PrefsProvider } from "@/lib/prefs";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const body = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});

const coast = Instrument_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-coast", display: "swap", weight: ["500", "600", "700"] });

export const metadata: Metadata = {
  title: `${profile.name} — ${profile.title}`,
  description: profile.summary.en,
};

// Apply the stored appearance before first paint so the day colorway never flashes dark.
const colorwayScript = `try{if(localStorage.getItem("colorway")==="day")document.documentElement.dataset.colorway="day"}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} ${coast.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: colorwayScript }} />
      </head>
      <body>
        <PrefsProvider>{children}</PrefsProvider>
      </body>
    </html>
  );
}
