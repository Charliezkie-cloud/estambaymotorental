import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Block admin and auth routes from indexing
        disallow: ["/admin/", "/admin-login/", "/api/"],
      },
    ],
    sitemap: "https://estambaymotorental.vercel.app/sitemap.xml",
    host: "https://estambaymotorental.vercel.app",
  };
}
