import { writeFile } from "fs/promises";
import { join } from "path";
import { Post } from "./posts";
import { config } from "../config";
import { format } from "date-fns";

export async function generateSitemap(posts: Post[]) {
  console.log("生成 sitemap.xml");

  const urls = [
    { loc: `${config.baseUrl}/`, lastmod: format(new Date(), "yyyy-MM-dd") },
    {
      loc: `${config.baseUrl}/tags/`,
      lastmod: format(new Date(), "yyyy-MM-dd"),
    },
  ];

  // 添加文章URL
  for (const post of posts) {
    urls.push({
      loc: `${config.baseUrl}/posts/${post.slug}/`,
      lastmod: post.updated
        ? format(new Date(post.updated), "yyyy-MM-dd")
        : format(new Date(post.date), "yyyy-MM-dd"),
    });
  }

  // 添加标签页URL
  const tags = [...new Set(posts.flatMap((post) => post.tags || []))];
  for (const tag of tags) {
    urls.push({
      loc: `${config.baseUrl}/tags/${tag}/`,
      lastmod: format(new Date(), "yyyy-MM-dd"),
    });
  }

  // 生成sitemap.xml
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls
    .map(
      (url) => `
    <url>
      <loc>${config.siteUrl}${url.loc}</loc>
      <lastmod>${url.lastmod}</lastmod>
    </url>
  `
    )
    .join("")}
</urlset>`;

  await writeFile(join(config.distDir, "sitemap.xml"), sitemap);
}
