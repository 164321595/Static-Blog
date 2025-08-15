import { writeFile } from "fs/promises";
import { ensureDir } from "fs-extra";
import { join } from "path";
import { compileTemplate } from "../utils/template";
import { Post } from "./posts";
import { config } from "../config";
import { BlogStats } from "./stats";

export async function generatePages(posts: Post[], stats: BlogStats) {
  // 1. 为首页创建按更新日期排序的文章列表（不考虑精选）
  const homePosts = [...posts].sort((a, b) => {
    // 优先使用更新日期，没有则使用发布日期
    const dateA = a.updated ? new Date(a.updated) : new Date(a.date);
    const dateB = b.updated ? new Date(b.updated) : new Date(b.date);
    return dateB.getTime() - dateA.getTime(); // 最新的在前
  });

  // 2. 为列表页创建排序：精选文章在前，且统一按更新日期排序（核心修改）
  const listPagePosts = [...posts].sort((a, b) => {
    // 第一步：精选文章优先
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;

    // 第二步：精选状态相同则按「更新日期优先」排序（修复非精选文章排序问题）
    const dateA = a.updated ? new Date(a.updated) : new Date(a.date);
    const dateB = b.updated ? new Date(b.updated) : new Date(b.date);
    return dateB.getTime() - dateA.getTime(); // 最新的在前
  });

  const totalPages = Math.ceil(listPagePosts.length / config.postsPerPage);

  console.log(`生成 ${totalPages} 个文章列表页`);

  // 生成独立主页
  const homeDir = config.distDir;
  await ensureDir(homeDir);

  const homeHtml = await compileTemplate("home", {
    posts: homePosts,
    currentPage: 0,
    totalPages,
    config,
    isHome: true,
    stats: stats,
  });

  const homePath = join(homeDir, "index.html");
  await writeFile(homePath, homeHtml);
  console.log(`已生成独立主页: ${homePath}`);

  // 生成文章列表页
  for (let i = 0; i < totalPages; i++) {
    const currentPage = i + 1;
    const start = i * config.postsPerPage;
    const end = start + config.postsPerPage;
    const pagePosts = listPagePosts.slice(start, end);

    const pageDir = join(config.distDir, "page", `${currentPage}`);
    await ensureDir(pageDir);

    const html = await compileTemplate("pages", {
      posts: pagePosts,
      currentPage,
      totalPages,
      config,
      isPage: true,
      stats: stats,
    });

    const pagePath = join(pageDir, "index.html");
    await writeFile(pagePath, html);
    console.log(`已生成文章列表第${currentPage}页: ${pagePath}`);
  }
}
