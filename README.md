# 静态博客生成器

### 项目架构

#### 整体架构

本项目采用模块化架构设计，各个模块职责明确，便于维护和扩展。主要分为以下几个部分：

- **配置模块**：`src/config.ts` 文件负责整个项目的配置管理，包括网站名称、文章每页显示数量、默认封面图片等信息。通过集中管理配置，方便对项目进行定制。

- **生成器模块**：`src/generators` 目录下包含多个生成器，每个生成器负责特定类型页面的生成。例如，`posts.ts` 生成文章页面，`tags.ts` 生成标签页面，`stats.ts` 生成博客统计信息等。

- **工具函数模块**：`src/utils` 目录下包含各种工具函数，如 `markdown.ts` 用于将 Markdown 内容转换为 HTML，`template.ts` 用于模板编译，`fs.ts` 用于文件操作等。

- **模板文件**：`src/templates` 目录下存放 Nunjucks 模板文件，用于定义博客页面的结构和样式。

- **构建脚本**：`src/build.ts` 是项目的构建脚本，负责调用各个生成器生成静态页面，并复制静态资源。

#### 目录结构

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

### 技术选型

#### 编程语言

- **Node.js**：作为服务器端 JavaScript 运行环境，提供了丰富的文件操作和网络功能，适合用于静态网站生成。

- **TypeScript**：在 JavaScript 的基础上添加了静态类型检查，提高了代码的可维护性和健壮性。

#### 模板引擎

- **Nunjucks**：一个功能强大的 JavaScript 模板引擎，支持模板继承、过滤器等特性，方便定制博客页面。

#### 工具库

- **fs-extra**：在 Node.js 原生 `fs` 模块的基础上进行扩展，提供了更多便捷的文件操作方法。

- **gray-matter**：用于解析 Markdown 文件中的 YAML 元数据。

- **markdown-it**：用于将 Markdown 内容转换为 HTML。

- **markdown-it-mathjax3**：支持在 Markdown 中渲染 LaTeX 数学公式。

- **date-fns**：用于日期格式化和相对时间计算。

- **glob**：用于查找符合特定模式的文件路径。

### 实现思路

#### 静态页面生成

1.  **读取 Markdown 文件**：通过 `glob` 库查找 `content` 目录下的所有 Markdown 文件。

2.  **解析元数据**：使用 `gray-matter` 解析 Markdown 文件中的 YAML 元数据，提取文章的标题、日期、标签等信息。

3.  **转换 Markdown 内容**：使用 `markdown-it` 和 `markdown-it-mathjax3` 将 Markdown 内容转换为 HTML。

4.  **渲染模板**：使用 Nunjucks 模板引擎将文章信息和 HTML 内容渲染到相应的模板中，生成静态 HTML 页面。

#### 标签分类

1.  **收集标签信息**：遍历所有文章，收集每个文章的标签信息。

2.  **生成标签页面**：为每个标签生成对应的分页页面，并为每个标签的第一页创建根目录重定向。

3.  **生成标签索引页**：生成包含所有标签的索引页。

#### 搜索功能

1.  **生成搜索索引**：将文章的标题、内容、标签等信息存储在 `search.json` 文件中。

2.  **实现搜索逻辑**：在前端页面中，通过输入关键词，从 `search.json` 中查找匹配的文章，并高亮显示匹配的文本。

#### 统计信息

1.  **计算统计数据**：统计文章总数、最新文章日期、标签总数等信息。

2.  **保存统计结果**：将统计结果保存到 `stats.json` 文件中，并在页面中展示。

### 遇到的挑战

#### 一、LaTeX 公式渲染引擎选型难题

**问题描述**：

在实现 Markdown 中 LaTeX 公式渲染时，最初选择轻量级的 **KaTeX**，因其渲染速度快且文件体积小。但在实际使用中遇到以下问题：

1.  **公式位置偏移**：复杂公式（如矩阵、多行公式）在页面中布局混乱，与文本基线对齐异常。

2.  **字符渲染偏差**：部分特殊符号（如希腊字母、花括号）渲染样式与标准 LaTeX 不一致，出现模糊或变形。

3.  **兼容性限制**：KaTeX 对部分 LaTeX 扩展语法（如 `\newcommand`）支持不足，导致自定义公式无法渲染。

**解决过程**：

经过多次调试样式和语法适配无果后，决定改用 **MathJax**。通过 `markdown-it-mathjax3` 插件集成 MathJax，配置步骤如下：

1.  在模板中引入 MathJax CDN：

```
\<script src="/styles/mathjax-full/es5/tex-chtml.js">\</script>
```

2.  自动配置 Markdown-it 插件：

**结果**：MathJax 完美支持复杂公式渲染，且样式与标准 LaTeX 一致，尽管文件体积较大，但兼容性和渲染质量显著提升。

#### 二、Tailwind CSS 本地导入与版本兼容问题

**问题描述**：

尝试使用 Tailwind CSS **v4.0+** 版本时，遇到以下问题：

1.  **PostCSS 配置冲突**：新版本依赖 PostCSS v8+，但项目中其他插件（如 Autoprefixer）与 PostCSS v8 不兼容，导致构建失败。

2.  **JIT 模式本地调试问题**：开启 Just-In-Time 模式后，部分动态类名（如 `hover:bg-red-500`）在本地开发时无法生效，需每次修改后重新构建。

3.  **自定义主题配置缺失**：新版本移除了部分默认配置项，需手动迁移主题配置，导致样式错乱。

**解决过程**：

回退到 **Tailwind CSS v3.0** 版本，并采用 **CDN 导入方式**避免本地配置复杂性：

1.  在模板头部引入 Tailwind CSS CDN：

```
<script src="https://cdn.tailwindcss.com"></script>
```

1.  移除本地 PostCSS 和 Tailwind 配置文件，直接通过 HTML 类名使用样式。

2.  针对动态类名需求，使用 `purge` 配置保留必要类名（适用于生产环境）：

**结果**：通过 CDN 导入简化了本地配置，避免了版本冲突，且开发效率显著提升。

####  三、微信分享方案重构：从URL复制到统一二维码

## 重构背景

原微信分享方案存在两个主要问题：
1. **功能局限**：仅提供URL复制功能，用户需要手动粘贴到微信
2. **体验割裂**：直接调用微信接口经常出现空白页或错误

## 技术方案演进

### 1. 原始方案（URL复制）
```javascript
function copyWeChatShare() {
navigator.clipboard.writeText(location.href);
alert('链接已复制，请粘贴到微信');
}
```

### 2. 过渡方案（微信JS-SDK尝试）
```javascript
function tryWeChatSDK() {
if (typeof WeixinJSBridge !== 'undefined') {
WeixinJSBridge.invoke('shareTimeline', {
title: document.title,
link: location.href
});
} else {
copyWeChatShare(); // 降级到复制
}
}
```

### 3. 最终方案（统一二维码）
```javascript
// 核心二维码生成
function generateWeChatQR() {
QRCode.toCanvas(document.getElementById('qrcode'), location.href, {
width: 200,
color: { dark: '#000', light: 'transparent' }
});
}

// 集成调用
function weChatShare() {
showModal('微信分享');
generateWeChatQR();
}
```

## 关键改进点

1. **统一入口**：
- 所有终端统一使用二维码界面
- 保留复制链接作为备用选项

2. **视觉优化**：
```css
.qrcode-modal {
backdrop-filter: blur(5px);
background: rgba(0,0,0,0.7);
}
.qrcode-container {
border-radius: 12px;
padding: 2rem;
}
```

3. **智能降级策略**：
```javascript
function safeGenerateQR() {
try {
generateWeChatQR();
} catch (e) {
document.getElementById('qrcode').innerHTML = `
<p>${location.href}</p>
<button onclick="copyWeChatShare()">复制链接</button>
`;
}
}
```
#### 四、项目基础框架构建的认知挑战

**问题描述**：

初期对静态博客生成器的架构设计缺乏清晰认知，导致以下问题：

1.  **模块职责模糊**：生成器模块与工具函数模块功能交叉，如文件操作逻辑分散在多个文件中。

2.  **构建流程混乱**：构建脚本 `build.ts` 直接调用生成器，未实现流程编排，难以扩展新功能（如 itemap 生成）。

3.  **依赖管理复杂**：模板引擎、Markdown 解析器等库的配置分散在多个文件，维护成本高。

**解决过程**：

1.  **模块化重构**：

- 将文件操作、模板渲染等通用逻辑封装到 `utils` 模块，生成器仅负责业务逻辑。

- 定义统一接口 `Generator`，规范生成器的 `generate` 方法，便于新增生成器（如 `sitemap.ts`）。

1.  **构建流程优化**：

```
// build.ts 流程编排

async function build() {

     await cleanDistDir(); // 清理旧文件

     await Promise.all(\[

       generatePosts(), // 生成文章

       generateTags(), // 生成标签页

       generateStats(), // 生成统计信息

       generateSearchIndex(), // 生成搜索索引

     ]);

     copyStaticAssets(); // 复制静态资源（如 CSS、字体）

}
```

1.  **配置中心化**：在 `config.ts` 中统一管理第三方库配置（如 Markdown-it 插件、Nunjucks 过滤器）。

**结果**：架构层次清晰，新增功能（如 RSS 订阅生成）时只需实现新生成器，无需修改核心流程。

### 总结

这些挑战贯穿项目开发全程，核心解决思路是：

1.  **技术选型权衡**：在性能、兼容性、开发成本间寻找平衡点（如放弃 KaTeX 选择 MathJax）。

2.  **模块化与标准化**：通过接口和工具函数封装重复逻辑，降低耦合度。

3.  **技术学习与使用**：对微信接口JS-SDK等学习认识，折中选项符合当前项目的技术。

4.  **渐进式架构设计**：从单一构建脚本逐步演进为模块化架构，适应需求变化。
