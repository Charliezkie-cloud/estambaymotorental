import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Estambay Moto Rentals",
    short_name: "Estambay Moto",
    description:
      "Affordable motorcycle rental — hourly, half-day, and daily rates. Browse our fleet and book online today.",
    start_url: "/",
    display: "standalone",
    background_color: "#051424",
    theme_color: "#051424",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
