import { writeFile } from "fs/promises";
import { ensureDir } from "fs-extra";
import { join } from "path";
import { compileTemplate } from "../utils/template";
import { Post } from "./posts";
import { config } from "../config";
import { BlogStats } from "./stats";

export async function generatePages(posts: Post[], stats: BlogStats) {
  // 对文章进行排序：精选文章在前，按时间降序排列
  const sortedPosts = posts.sort((a, b) => {
    // 精选文章优先
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;

    // 精选级别相同则按时间降序
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const totalPages = Math.ceil(sortedPosts.length / config.postsPerPage);

  console.log(`生成 ${totalPages} 个文章列表页`);

  // 1. 生成独立主页（根目录）
  const homeDir = config.distDir;
  await ensureDir(homeDir);

  const homeHtml = await compileTemplate("home", {
    posts: sortedPosts,
    currentPage: 0,
    totalPages,
    config,
    isHome: true,
    stats: stats,
  });

  const homePath = join(homeDir, "index.html");
  await writeFile(homePath, homeHtml);
  console.log(`已生成独立主页: ${homePath}`);

  // 2. 生成文章列表页（从/page/1/开始）
  for (let i = 0; i < totalPages; i++) {
    const currentPage = i + 1;
    const start = i * config.postsPerPage;
    const end = start + config.postsPerPage;
    const pagePosts = sortedPosts.slice(start, end);

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
