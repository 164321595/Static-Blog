// src/utils/fs.ts 或对应的样式复制文件
import { copy } from "fs-extra";
import { config } from "../config";

export async function copyStyles() {
  console.log("复制样式文件及目录结构");

  try {
    // 移除 recursive: true，保留 overwrite 即可
    await copy(config.stylesDir, config.outputStylesDir, {
      overwrite: true, // 仅保留这个选项（TypeScript 类型支持）
    });
    
    console.log(`样式文件已全部复制到 ${config.outputStylesDir}`);
  } catch (error) {
    console.error("复制样式文件时出错:", error);
    throw error;
  }
}