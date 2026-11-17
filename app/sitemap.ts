import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site-config"

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/pricing",
    "/about",
    "/diagnostic",
    "/sima-abacus",
    "/schools",
    "/for-employers",
    "/contact",
    "/signup",
    "/privacy",
    "/terms",
  ]
  return paths.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }))
}
