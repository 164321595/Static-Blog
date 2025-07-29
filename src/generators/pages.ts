import { writeFile } from "fs/promises";
import { ensureDir } from "fs-extra";
import { join } from "path";
import { compileTemplate } from "../utils/template";
import { Post } from "./posts";
import { config } from "../config";
import { BlogStats } from "./stats"; // 新增

export async function generatePages(posts: Post[], stats: BlogStats) {
  // 新增stats参数
  const totalPages = Math.ceil(posts.length / config.postsPerPage);

  console.log(`生成 ${totalPages} 个文章列表页`);

  // 1. 生成独立主页（根目录）
  const homeDir = config.distDir;
  await ensureDir(homeDir);

  const homeHtml = await compileTemplate("home", {
    posts: posts,
    currentPage: 0,
    totalPages,
    config,
    isHome: true,
    stats: stats, // 传递统计信息
  });

  const homePath = join(homeDir, "index.html");
  await writeFile(homePath, homeHtml);
  console.log(`已生成独立主页: ${homePath}`);

  // 2. 生成文章列表页（从/page/1/开始）
  for (let i = 0; i < totalPages; i++) {
    const currentPage = i + 1;
    const start = i * config.postsPerPage;
    const end = start + config.postsPerPage;
    const pagePosts = posts.slice(start, end);

    const pageDir = join(config.distDir, "page", `${currentPage}`);
    await ensureDir(pageDir);

    const html = await compileTemplate("pages", {
      posts: pagePosts,
      currentPage,
      totalPages,
      config,
      isPage: true,
      stats: stats, // 传递统计信息
    });

    const pagePath = join(pageDir, "index.html");
    await writeFile(pagePath, html);
    console.log(`已生成文章列表第${currentPage}页: ${pagePath}`);
  }
}
