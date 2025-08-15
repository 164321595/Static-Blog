// src/utils/template.ts
import nunjucks from "nunjucks";
import { join } from "path";
import { config } from "../config";
import { format } from "date-fns";
import zhCN from "date-fns/locale/zh-CN";
import { formatRelativeDate } from "./time";
const env = nunjucks.configure(join(__dirname, "../templates"), {
  autoescape: false,
  trimBlocks: true,
  lstripBlocks: true,
});

// 注册range过滤器（生成从start到end的数组）
env.addFilter("range", (start: number, end: number) => {
  const result: number[] = [];
  for (let i = start; i <= end; i++) {
    result.push(i);
  }
  return result;
});

// 其他过滤器（max/min/date等）保持不变
env.addFilter("max", (a: number, b: number) => Math.max(a, b));
env.addFilter("min", (a: number, b: number) => Math.min(a, b));

env.addFilter("date", (date: string, formatStr: string) => {
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return "未知日期";
    return format(dateObj, formatStr, { locale: zhCN });
  } catch (err) {
    console.error("日期格式化错误:", err);
    return "未知日期";
  }
});

// 添加 filterByTag 过滤器
env.addFilter("filterByTag", (posts: any[], tag: string) => {
  if (!posts || !Array.isArray(posts)) return [];
  return posts.filter((post) => post.tags && post.tags.includes(tag));
});

env.addFilter("filterByFeatured", (posts: any[]) => {
  if (!posts || !Array.isArray(posts)) return [];

  const featuredPosts = posts.filter((post) => post.featured === true);
  console.log(
    `[FilterByFeatured] 总文章数: ${posts.length}, 精选文章数: ${featuredPosts.length}`
  );

  // 打印每篇精选文章的标题
  featuredPosts.forEach((post) => {
    console.log(`  - 精选文章: ${post.title} (featured: ${post.featured})`);
  });

  return featuredPosts;
});

env.addFilter("truncate", (str: string, length: number) => {
  if (str.length <= length) return str;
  return str.substring(0, length) + "...";
});

export async function compileTemplate(
  name: string,
  context: object = {}
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    env.render(
      `${name}.njk`,
      { now: new Date(), config, ...context },
      (err, res) => {
        if (err) reject(err);
        else if (res === null) reject(new Error("模板渲染返回空值"));
        else resolve(res);
      }
    );
  });
}

env.addFilter("relativeDate", (date: string) => {
  return formatRelativeDate(date);
});
