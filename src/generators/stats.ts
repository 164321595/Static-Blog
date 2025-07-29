import { join } from "path";
import { writeFile } from "fs/promises";
import { Post } from "./posts";
import { config } from "../config"; // 引入配置

/**
 * 博客统计信息接口（含精选文章分析）
 */
export interface BlogStats {
  totalPosts: number; // 文章总数
  latestPostDate: string; // 最新文章日期
  totalTags: number; // 标签总数
  totalTagMap: Record<string, number>; // 全量标签分布
  featuredCount: number; // 精选文章总数
  featuredTagMap: Record<string, number>; // 精选文章标签分布
}

/**
 * 生成博客统计信息（修复标签遍历类型错误）
 */
export async function generateStats(posts: Post[]): Promise<BlogStats> {
  // 1. 基础统计
  const totalPosts = posts.length;
  const latestPostDate =
    posts.length > 0
      ? new Date(posts[0].date).toLocaleDateString("zh-CN")
      : "暂无文章";

  // 2. 全量标签统计（添加类型校验，确保tags是数组）
  const totalTagMap: Record<string, number> = {};
  posts.forEach((post) => {
    // 关键修复：如果tags不是数组，默认空数组
    const tags = Array.isArray(post.tags) ? post.tags : [];
    tags.forEach((tag) => {
      totalTagMap[tag] = (totalTagMap[tag] || 0) + 1;
    });
  });
  const totalTags = Object.keys(totalTagMap).length;

  // 3. 精选文章统计
  const featuredPosts = posts.filter((post) => post.featured);
  const featuredCount = featuredPosts.length;

  // 4. 精选文章标签统计（同样添加类型校验）
  const featuredTagMap: Record<string, number> = {};
  featuredPosts.forEach((post) => {
    // 关键修复：如果tags不是数组，默认空数组
    const tags = Array.isArray(post.tags) ? post.tags : [];
    tags.forEach((tag) => {
      featuredTagMap[tag] = (featuredTagMap[tag] || 0) + 1;
    });
  });

  // 保存统计结果到文件
  const stats: BlogStats = {
    totalPosts,
    latestPostDate,
    totalTags,
    totalTagMap,
    featuredCount,
    featuredTagMap,
  };

  await writeFile(
    join(config.distDir, "stats.json"),
    JSON.stringify(stats, null, 2)
  );

  return stats;
}
