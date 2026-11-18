import type { NextConfig } from "next";

/** Legacy Xara URLs → new routes. 301s keep the old pages' search rankings. */
const legacyRedirects: [string, string][] = [
  ["/index.htm", "/"],
  ["/index.html", "/"],
  ["/advertise.htm", "/advertise"],
  ["/hotels.htm", "/hotels"],
  ["/hotels-in-branson.htm", "/hotels"],
  ["/shows-in-branson.htm", "/shows"],
  ["/branson-shops.htm", "/shopping"],
  ["/speciality-shops.htm", "/specialty-shops"],
  ["/things-to-do.htm", "/things-to-do"],
  ["/restaurants.htm", "/restaurants"],
  ["/veterans-services.htm", "/veteran-services"],
  ["/day-trips.htm", "/day-trips"],
  ["/contact-us.htm", "/contact"],
  ["/contact-ut.htm", "/contact"],
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  turbopack: {
    root: import.meta.dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  experimental: {
    // Admin logo uploads go through Server Actions.
    serverActions: { bodySizeLimit: "5mb" },
  },
  images: {
    qualities: [75, 85],
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" }],
  },
  async redirects() {
    return legacyRedirects.map(([source, destination]) => ({ source, destination, statusCode: 301 }));
  },
};

export default nextConfig;
