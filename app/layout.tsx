import type { Metadata } from "next";
import { Bebas_Neue, Inter, Spectral } from "next/font/google";
import "./globals.css";

const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(!t)t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.classList.toggle("dark",t==="dark")}catch(e){}})()`;

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  weight: "400",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spectral = Spectral({
  variable: "--font-spectral",
  weight: ["400", "600"],
  style: "italic",
  subsets: ["latin"],
});

const siteDescription =
  "New music, live dates, and stories from one of Nepal's defining alternative-rock bands.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Albatross — Nepali Alternative Rock",
  description: siteDescription,

  robots: { index: true, follow: true },
  openGraph: {
    siteName: "Albatross",
    type: "website",
    locale: "en_US",
    title: "Albatross — Nepali Alternative Rock",
    description: siteDescription,
    images: [{ url: "/stills/2m4gYL9jmJE.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Albatross — Nepali Alternative Rock",
    description: siteDescription,
    images: ["/stills/2m4gYL9jmJE.jpg"],
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
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${bebasNeue.variable} ${inter.variable} ${spectral.variable} h-full antialiased`}
    >

      <body suppressHydrationWarning className="flex min-h-full flex-col font-sans">

        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {children}
      </body>
    </html>
  );
}
