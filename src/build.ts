import { emptyDir, ensureDir } from "fs-extra";
import { join } from "path";
import { generatePosts, Post } from "./generators/posts";
import { generatePages } from "./generators/pages";
import { generateTags } from "./generators/tags";
import { generateSitemap } from "./generators/sitemap";
import { generateSearchIndex } from "./generators/search";
import { generate404 } from "./generators/404";
import { generateStats, BlogStats } from "./generators/stats"; // 新增
import { copyStyles } from "./utils/fs";
import { config } from "./config";

async function build() {
  console.log("开始构建静态博客...");

  // 清空并创建dist目录
  await emptyDir(config.distDir);
  await ensureDir(join(config.distDir, "posts"));
  await ensureDir(join(config.distDir, "page"));
  await ensureDir(join(config.distDir, "tags"));
  await ensureDir(join(config.distDir, "scripts"));

  // 生成所有内容
  const posts = await generatePosts();
  const stats = await generateStats(posts); // 生成统计信息

  // 将stats传递给所有生成器
  await generatePages(posts, stats);
  await generateTags(posts, stats);
  await generateSitemap(posts);
  await generate404();

  if (config.enableSearch) {
    await generateSearchIndex(posts);
  }

  // 复制静态资源
  await copyStyles();

  console.log("构建完成! 输出目录:", config.distDir);
  console.log("统计信息:", stats);
}

build().catch((err) => {
  console.error("构建过程中出错:", err);
  process.exit(1);
});
