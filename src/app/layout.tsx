import type { Metadata } from "next";
import { Inter, Poppins, Roboto_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans-ui",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-brand-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const mono = Roboto_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kutoot — Branch Performance Terminal",
  description: "Universal branch performance competition platform for India",
  icons: {
    icon: "/vercel.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} ${mono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
