import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Gatherly - High-Fidelity Event Management",
    template: "%s | Gatherly"
  },
  description:
    "A powerful event management platform where organizers create, manage, and scale events with precision. Bridge physical and digital experiences seamlessly.",
  icons: {
    icon: "/gatherly.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

import { ToastProvider } from "@/components/ui/Toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning>
        <ClerkProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
