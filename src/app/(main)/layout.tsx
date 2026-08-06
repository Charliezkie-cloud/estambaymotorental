import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Roboto } from "next/font/google";
import "../globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "next-themes";
import Navbar from "@/components/layouts/navbar";
import { Toaster } from "@/components/ui/sonner";
import Footer from "@/components/layouts/footer";
import { TooltipProvider } from "@/components/ui/tooltip";

const robotoHeading = Roboto({subsets:['latin'],variable:'--font-heading'});

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://estambaymotorental.vercel.app"),

  title: {
    default: "Estambay Moto Rentals | Affordable Motorcycle Rental",
    template: "%s | Estambay Moto Rentals",
  },
  description:
    "Rent a motorcycle with Estambay Moto Rentals. We offer affordable hourly, half-day, and daily motorcycle rental rates. Browse our fleet and book online today.",
  keywords: [
    "motorcycle rental",
    "moto rental",
    "motorbike for rent",
    "motorcycle hire",
    "affordable motorcycle rental",
    "Estambay Moto Rentals",
    "motorcycle booking",
    "bike rental near me",
    "daily motorcycle rental",
    "hourly motorcycle rental",
  ],
  authors: [{ name: "Estambay Moto Rentals" }],
  creator: "Estambay Moto Rentals",
  publisher: "Estambay Moto Rentals",

  // Canonical / alternate
  alternates: {
    canonical: "/",
  },

  // Open Graph (Facebook, LinkedIn, WhatsApp, etc.)
  openGraph: {
    type: "website",
    url: "https://estambaymotorental.vercel.app",
    siteName: "Estambay Moto Rentals",
    title: "Estambay Moto Rentals | Affordable Motorcycle Rental",
    description:
      "Rent a motorcycle with Estambay Moto Rentals. Affordable hourly, half-day, and daily rates. Browse our fleet and book online today.",
    images: [
      {
        url: "/hero-image.jpg",
        width: 1200,
        height: 630,
        alt: "Estambay Moto Rentals – Motorcycle Fleet",
      },
    ],
    locale: "en_PH",
  },

  // Twitter / X Card
  twitter: {
    card: "summary_large_image",
    title: "Estambay Moto Rentals | Affordable Motorcycle Rental",
    description:
      "Rent a motorcycle with Estambay Moto Rentals. Affordable hourly, half-day, and daily rates. Browse our fleet and book online today.",
    images: ["/hero-image.jpg"],
  },

  // Search engine directives
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // App-level icons
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },

  // Verification tokens — fill in once registered with Google Search Console
  // verification: {
  //   google: "YOUR_GOOGLE_VERIFICATION_TOKEN",
  // },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Estambay Moto Rentals",
  description:
    "Affordable motorcycle rental with hourly, half-day, and daily rates. Browse our fleet and book online today.",
  url: "https://estambaymotorental.vercel.app",
  image: "https://estambaymotorental.vercel.app/hero-image.jpg",
  priceRange: "₱₱",
  telephone: "",
  address: {
    "@type": "PostalAddress",
    addressCountry: "PH",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "00:00",
      closes: "23:59",
    },
  ],
  sameAs: [],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable, robotoHeading.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[#051424]/80">
        {/* JSON-LD Structured Data for Google rich results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider attribute="class"
                       defaultTheme="dark"
                       enableSystem
                       disableTransitionOnChange>
          <TooltipProvider>
            <header>
              <Navbar />
            </header>
            {children}
            <Footer />
          </TooltipProvider>
          <Toaster position="bottom-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
