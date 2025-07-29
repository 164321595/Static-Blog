# Static Blog Generator

`static-blog-generator` 是一个使用 Node.js 和 TypeScript 构建的静态博客生成器。它可以将 Markdown 文件转换为静态 HTML 页面，同时支持标签分类、搜索功能、统计信息展示等特性。

## 特性

- **静态页面生成**：将 Markdown 文件转换为静态 HTML 页面，方便部署和托管。

- **标签分类**：支持文章标签分类，自动生成标签页面和标签索引页。

- **搜索功能**：提供搜索功能，用户可以快速查找文章。

- **统计信息**：生成博客的统计信息，如文章总数、最新文章日期、标签总数等。

- **模板化设计**：使用 Nunjucks 模板引擎，方便定制博客页面。

## 安装

确保你已经安装了 Node.js 和 npm。然后克隆项目并安装依赖：

```
git clone https://github.com/your-repo/static-blog-generator.git

cd static-blog-generator

npm install
```

## 使用方法

### 构建博客

运行以下命令来生成静态博客页面：

```
npm run build
```

生成的页面将存储在 `dist` 目录中。

### 本地预览

使用以下命令在本地启动一个静态服务器来预览博客：

```
npm run serve
```

### 开发模式

在开发过程中，你可以使用以下命令来监听文件变化并自动重新构建博客：

```
npm run dev
```

## 配置

你可以在 `src/config.ts` 文件中配置博客的相关信息，如网站名称、文章每页显示数量、默认封面图片等。

```
export const config = {

     siteName: "酱姆(≧∇≦)ﾉ",

     siteUrl: "https://example.com",

     contentDir: join(process.cwd(), "content"),

     distDir: join(process.cwd(), "dist"),

     postsPerPage: 5,

     enableSearch: true,

     paginationRange: 3,

     baseUrl: "",

     defaultCoverImage: "https://picsum.photos/600/400?random=default",

     postCounts: {

       featured: 3,

       latest: 5

     },

     // 其他配置项...

};
```

## 目录结构

```
static-blog-generator/

├── content/         # Markdown 文章文件

├── src/             # 源代码

│   ├── generators/  # 生成器模块

│   ├── templates/   # 模板文件

│   ├── utils/       # 工具函数

│   ├── config.ts    # 配置文件

│   └── build.ts     # 构建脚本

├── styles/          # 样式文件

├── dist/            # 生成的静态页面

└── package.json     # 项目依赖和脚本配置
```

## 部署到 GitHub Pages

### 前提条件



1.  已将项目推送到 GitHub 仓库（`https://github.com/164321595/Static-Blog`）

2.  运行 `npm run build` 生成 `dist` 目录

### 自动部署（推荐）


1.  创建 `.github/workflows/deploy.yml` 文件，内容如下：


```
name: Deploy to GitHub Pages

on:

     push:

       branches: \[ main ]

jobs:

     deploy:

       runs-on: ubuntu-latest

       steps:

         \- uses: actions/checkout@v4

         \- uses: actions/setup-node@v4

           with: { node-version: 18 }

         \- run: npm install && npm run build

         \- uses: peaceiris/actions-gh-pages@v3

           with:

             github\_token: \${{ secrets.GITHUB\_TOKEN }}

             publish\_dir: ./dist
```

1.  推送代码后，在仓库 **Settings → Pages** 中选择 `gh-pages` 分支作为源

2.  访问地址：`https://（yourname）.github.io/Static-Blog`

### 简单部署

1.  直接将dist文件夹内容放入任意库中的main支条（index.html直接暴露）

2.  推送代码后，仓库 **Settings → Pages** 中选择 `main` 分支作为源

3.  说明：本项目默认baseUrl为“” 为了适合GitHubPages的项目类网页，需要在src/config.ts中修改baseUrl为库名称。例如：Static-Blog库，则填写“/Static-Blog”。

## 贡献

如果你想为这个项目做出贡献，请遵循以下步骤：

1.  Fork 项目

2.  创建新的分支 (`git checkout -b feature/your-feature`)

3.  提交你的更改 (`git commit -am 'Add some feature'`)

4.  推送分支 (`git push origin feature/your-feature`)

5.  创建 Pull Request

## 许可证

本项目采用 MIT 许可证。有关更多信息，请参阅 [LICENSE](LICENSE) 文件。

## 作者

酱姆大大

## 感谢

感谢使用 `static-blog-generator`！如果你有任何问题或建议，请随时在 [GitHub 仓库](https://github.com/164321595/Static-Blog) 中提交 Issue。

## 特别说明

content中为mk文件内容：

各式为

---

title: "标题"

date: YYYY-MM-DD

updated: YYYY-MM-DD

tags: [标签, 标签]

author: "作者"

cover: "本地资源路径Or网址路径等"

featured: true Or false （是否为精选文章）

---

（内容）如下等支持基础mk文件和Latex数学公式渲染支持。

-----------------------------

# ＜游戏诊断＞(≧∀≦) ゞ！

## ██ 游戏症状 ██

```
[每日游戏时长] 5小时+（工作只是游戏间隙）

[游戏段位] 正在努力上分（比KPI重要）

[精神状态] 打游戏时精神抖擞，工作时昏昏欲睡
```

-----------------------------