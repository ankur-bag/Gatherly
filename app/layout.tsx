import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const display = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Avento — The Event Management Platform",
  description:
    "Connects every step from RSVP to revenue, delivering clear reports and next-best actions to improve ROI by 20-35%",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="antialiased">
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
