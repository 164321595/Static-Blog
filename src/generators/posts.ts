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
  featured: boolean;
}

export async function generatePosts(): Promise<Post[]> {
  const posts: Post[] = [];
  const files = await config.postFiles();

  console.log(`找到 ${files.length} 篇文章`);

  for (const file of files) {
    try {
      // 1. 读取文件内容
      const rawContent = await readFile(file, "utf-8");

      // 2. 解析YAML元数据
      const { data, content } = matter(rawContent);

      console.log(`\n===== 处理文章：${file} =====`);
      console.log("解析到的YAML元数据：", JSON.stringify(data, null, 2));
      console.log("文章中配置的updated：", data.updated ?? "未配置");

      const stats = await stat(file);
      const parsedPath = parse(file);
      const slug = parsedPath.name;

      // 3. 日期处理 - 允许更新日期等于发布日期
      // 发布日期：优先YAML的date，其次文件创建时间
      const postDate = data.date
        ? new Date(data.date).toISOString()
        : stats.birthtime.toISOString();

      // 更新日期：优先YAML的updated，其次文件修改时间
      let postUpdated: string | undefined;
      if (data.updated) {
        // 使用YAML中指定的更新时间
        postUpdated = new Date(data.updated).toISOString();
      } else if (stats.mtime >= stats.birthtime) {
        // 修改为 >= 允许相同时间
        // 当修改时间晚于或等于创建时间时使用文件修改时间
        postUpdated = stats.mtime.toISOString();
      }

      // 仅当更新时间早于发布时间时才移除（允许等于）
      if (postUpdated && new Date(postUpdated) < new Date(postDate)) {
        // 修改为 < 而非 <=
        postUpdated = undefined;
        console.log("注意：更新时间早于发布时间，已忽略");
      }

      // 4. 确定最终cover地址
      const finalCover = data.cover || config.defaultCoverImage;
      console.log("最终使用的cover：", finalCover);
      console.log("处理的日期：", { postDate, postUpdated });
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
        featured: data.featured || false,
      };

      // 5. 计算相对更新时间
      if (postUpdated) {
        post.updated = postUpdated;
        post.relativeUpdated = formatRelativeTime(postUpdated);
        console.log(`计算的相对更新时间: ${post.relativeUpdated}`);
      }

      // 生成HTML
      const html = await compileTemplate("post", { post, config });
      const outputDir = join(config.distDir, "posts", slug);
      await ensureDir(outputDir);
      await writeFile(join(outputDir, "index.html"), html);

      posts.push(post);
    } catch (err) {
      console.error(`处理文章 ${file} 时出错:`, err);
    }
  }

  // 将原有的按发布日期排序改为按更新日期排序
  return posts.sort((a, b) => {
    const dateA = a.updated ? new Date(a.updated) : new Date(a.date);
    const dateB = b.updated ? new Date(b.updated) : new Date(b.date);
    return dateB.getTime() - dateA.getTime(); // 最新的在前
  });
}
