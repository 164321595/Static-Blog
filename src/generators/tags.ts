import { writeFile } from "fs/promises";
import { ensureDir } from "fs-extra";
import { join } from "path";
import { compileTemplate } from "../utils/template";
import { Post } from "./posts";
import { config } from "../config";
import { BlogStats } from "./stats"; // 新增

export async function generateTags(posts: Post[], stats: BlogStats) {
  // 新增stats参数
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
    const totalPages = Math.ceil(taggedPosts.length / config.postsPerPage);

    // 为每个标签创建分页
    for (let i = 0; i < totalPages; i++) {
      const currentPage = i + 1;
      const start = i * config.postsPerPage;
      const end = start + config.postsPerPage;
      const pagePosts = taggedPosts.slice(start, end);

      const html = await compileTemplate("tag", {
        tag,
        posts: pagePosts,
        currentPage,
        totalPages,
        config,
        isTag: true,
        stats: stats, // 传递统计信息
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

  // 生成标签索引页（传递stats）
  const html = await compileTemplate("tag-index", {
    tags,
    config,
    stats: stats, // 传递统计信息
  });

  await writeFile(join(config.distDir, "tags", "index.html"), html);
}
