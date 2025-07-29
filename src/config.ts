// src/config.ts
import { join } from "path";
import { glob } from "glob";

const contentDir = join(process.cwd(), "content");
const distDir = join(process.cwd(), "dist");

// 打印 contentDir 路径，确保正确
console.log("Markdown 文件搜索路径:", contentDir);

export const config = {
  siteName: "酱姆(≧∇≦)ﾉ",
  siteUrl: "https://example.com",
  contentDir,
  distDir,
  postsPerPage: 5,
  enableSearch: true,
  paginationRange: 3,
  baseUrl: "", // 添加统一前缀
  defaultCoverImage: "https://picsum.photos/600/400?random=default",

  // 新增：文章数量配置
  postCounts: {
    featured: 2, // 精选文章显示数量
    latest: 5, // 最新文章显示数量
  },

  // 获取所有 Markdown 文件（兼容 Windows 和 Unix 路径）
  async postFiles(): Promise<string[]> {
    try {
      const files = await glob(`${contentDir}/**/*.md`, {
        ignore: "**/node_modules/**", // 忽略 node_modules
        absolute: true, // 返回绝对路径
        nocase: true, // 忽略大小写（兼容 .MD 或 .md）
      });
      console.log("找到的 Markdown 文件:", files);
      return files;
    } catch (err) {
      console.error("查找 Markdown 文件失败:", err);
      return [];
    }
  },

  // 样式目录
  get stylesDir(): string {
    return join(process.cwd(), "styles");
  },

  // 输出样式目录
  get outputStylesDir(): string {
    return join(distDir, "styles");
  },

  // 脚本输出目录
  get outputScriptsDir(): string {
    return join(distDir, "scripts");
  },
};
