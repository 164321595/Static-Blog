import { writeFile } from "fs-extra";
import { join } from "path";
import { config } from "../config";
import { compileTemplate } from "../utils/template"; // 改用项目中已有的compileTemplate

/**
 * 生成404页面
 * 遵循项目现有模板编译方式，使用compileTemplate渲染模板
 */
export async function generate404() {
  try {
    console.log("开始生成404页面...");

    // 渲染404模板（使用项目中已有的compileTemplate函数）
    const html = await compileTemplate("404", {
      config,
      title: "404 - 页面不存在",
      is404: true, // 供模板使用的标识
      now: new Date(), // 保持与其他页面一致的上下文
    });

    // 输出到dist根目录（静态服务默认识别404.html为错误页面）
    const outputPath = join(config.distDir, "404.html");
    await writeFile(outputPath, html);

    console.log(`404页面已生成: ${outputPath}`);
    return outputPath;
  } catch (err) {
    console.error("生成404页面失败:", err);
    throw err; // 抛出错误让上层处理
  }
}
