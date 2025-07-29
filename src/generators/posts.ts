// src/generators/posts.ts
import { readFile, writeFile } from "fs/promises";
import { stat } from "fs/promises";
import { join, parse } from "path";
import matter from "gray-matter";
import { render } from "../utils/markdown";
import { compileTemplate } from "../utils/template";
import { formatDate, formatRelativeTime } from "../utils/time";
import { config } from "../config";
import { ensureDir } from "fs-extra";

export interface Post {
  title: string;
  slug: string;
  content: string;
  rawContent: string;
  date: string;
  relativeDate: string;
  author?: string;
  updated?: string;
  relativeUpdated?: string;
  tags?: string[];
  cover: string;
  featured: boolean; // 新增字段
}

export async function generatePosts(): Promise<Post[]> {
  const posts: Post[] = [];
  const files = await config.postFiles();

  console.log(`找到 ${files.length} 篇文章`);

  for (const file of files) {
    try {
      // 1. 读取文件内容
      const rawContent = await readFile(file, "utf-8");

      // 2. 解析YAML元数据（关键步骤）
      const { data, content } = matter(rawContent);

      // 打印解析到的原始data，检查是否包含cover
      console.log(`\n===== 处理文章：${file} =====`);
      console.log("解析到的YAML元数据：", JSON.stringify(data, null, 2)); // 打印完整data
      console.log("文章中配置的cover：", data.cover ?? "未配置"); // 重点查看这里

      const stats = await stat(file);
      const parsedPath = parse(file);
      const slug = parsedPath.name;

      // 日期处理（无关当前问题，保留）
      const fileBirthTime = stats.birthtime.toISOString();
      const fileModifyTime = stats.mtime.toISOString();
      const postDate = data.date || fileBirthTime;
      const postUpdated =
        stats.mtime > stats.birthtime ? fileModifyTime : undefined;

      // 3. 确定最终cover地址
      const finalCover = data.cover || config.defaultCoverImage;
      console.log("最终使用的cover：", finalCover); // 输出最终结果
      console.log("===========================\n");

      const post: Post = {
        title: data.title || slug,
        slug,
        content: render(content),
        rawContent: content,
        date: postDate,
        relativeDate: formatRelativeTime(postDate),
        author: data.author,
        tags: data.tags || [],
        cover: finalCover,
        featured: data.featured || false, // 新增字段
      };

      if (postUpdated) {
        post.updated = postUpdated;
        post.relativeUpdated = formatRelativeTime(postUpdated);
      }

      // 生成HTML（无关当前问题，保留）
      const html = await compileTemplate("post", { post, config });
      const outputDir = join(config.distDir, "posts", slug);
      await ensureDir(outputDir);
      await writeFile(join(outputDir, "index.html"), html);

      posts.push(post);
    } catch (err) {
      console.error(`处理文章 ${file} 时出错:`, err);
    }
  }

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
