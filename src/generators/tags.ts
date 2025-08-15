// src/generators/tags.ts
import { writeFile } from "fs/promises";
import { ensureDir } from "fs-extra";
import { join } from "path";
import { compileTemplate } from "../utils/template";
import { Post } from "./posts";
import { config } from "../config";
import { BlogStats } from "./stats";

export async function generateTags(posts: Post[], stats: BlogStats) {
  const tagsMap: Record<string, Post[]> = {};

  // 收集所有标签
  for (const post of posts) {
    if (post.tags && post.tags.length) {
      for (const tag of post.tags) {
        if (!tagsMap[tag]) {
          tagsMap[tag] = [];
        }
        tagsMap[tag].push(post);
      }
    }
  }

  const tags = Object.keys(tagsMap);
  if (tags.length === 0) {
    console.log("没有找到任何标签");
    return;
  }

  console.log(`生成 ${tags.length} 个标签的分页页面`);

  // 生成标签页面
  await ensureDir(join(config.distDir, "tags"));

  for (const [tag, taggedPosts] of Object.entries(tagsMap)) {
    // 对每个标签下的文章进行排序（使用统一逻辑）
    const sortedPosts = sortPosts(taggedPosts);

    const totalPages = Math.ceil(sortedPosts.length / config.postsPerPage);

    // 为每个标签创建分页
    for (let i = 0; i < totalPages; i++) {
      const currentPage = i + 1;
      const start = i * config.postsPerPage;
      const end = start + config.postsPerPage;
      const pagePosts = sortedPosts.slice(start, end);

      const html = await compileTemplate("tag", {
        tag,
        posts: pagePosts,
        currentPage,
        totalPages,
        config,
        isTag: true,
        stats: stats,
      });

      const outputDir = join(
        config.distDir,
        "tags",
        tag,
        "page",
        `${currentPage}`
      );
      await ensureDir(outputDir);
      await writeFile(join(outputDir, "index.html"), html);

      console.log(`已生成标签 "${tag}" 的第 ${currentPage}/${totalPages} 页`);
    }

    // 为每个标签的第一页创建根目录重定向
    const redirectHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta http-equiv="refresh" content="0;url=page/1/">
        <title>正在跳转至 ${tag} 标签的文章列表...</title>
      </head>
      <body>
        <script>
          window.location.href = 'page/1/';
        </script>
      </body>
      </html>
    `;

    await writeFile(
      join(config.distDir, "tags", tag, "index.html"),
      redirectHtml.trim()
    );
  }

  // 生成标签索引页
  const html = await compileTemplate("tag-index", {
    tags,
    config,
    stats: stats,
  });

  await writeFile(join(config.distDir, "tags", "index.html"), html);
}

// 排序函数：精选优先，同级别按更新日期排序（无更新日期则用发布日期）
function sortPosts(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => {
    // 第一步：精选文章优先
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;

    // 第二步：精选状态相同则按「更新日期优先」排序
    const dateA = a.updated ? new Date(a.updated) : new Date(a.date);
    const dateB = b.updated ? new Date(b.updated) : new Date(b.date);

    // 最新的在前（降序）
    return dateB.getTime() - dateA.getTime();
  });
}
