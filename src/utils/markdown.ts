import MarkdownIt from "markdown-it";
// 修改为使用 markdown-it-mathjax3
const mk = require("markdown-it-mathjax3");

// 禁用 typographer 或配置其不影响美元符号
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: false,
}).use(mk);

export function render(content: string): string {
  return md.render(content);
}
