import { writeFile } from "fs/promises";
import { ensureDir } from "fs-extra";
import { join } from "path";
import { Post } from "./posts";
import { config } from "../config";

export async function generateSearchIndex(posts: Post[]) {
  console.log("生成搜索索引");

  // 优化搜索数据：清理内容确保JSON格式正确，同时保留原有结构避免类型错误
  const searchData = posts.map((post) => ({
    title: post.title,
    slug: post.slug,
    // 清理Markdown特殊符号，但保留数学公式符号，确保JSON格式正确
    content: post.rawContent
      .replace(/[#*`_\-\[\]\(\)]/g, " ")
      .replace(/\s+/g, " ")
      .replace(/[\\`"']/g, "\\$&"), // 转义JSON特殊字符，避免格式错误
    tags: post.tags || [],
    author: post.author || "未知作者", // 补充默认值，避免undefined
    date: post.date,
  }));

  await ensureDir(config.outputScriptsDir);

  // 生成搜索索引JSON（使用JSON.stringify自动处理转义）
  await writeFile(
    join(config.distDir, "search.json"),
    JSON.stringify(searchData)
  );
  // 生成搜索脚本（彻底修复正则转义问题）
  const searchScript = `
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  
  if (searchInput && searchResults) {
    // 添加基础样式
    const style = document.createElement('style');
    style.textContent = \`
      .search-result-item {
        transition: all 0.3s ease;
      }
      .search-result-item:hover {
        transform: translateX(4px);
      }
      .search-highlight {
        background: linear-gradient(120deg, transparent 0%, transparent 45%, rgba(251, 191, 36, 0.3) 45%, rgba(251, 191, 36, 0.3) 55%, transparent 55%, transparent 100%);
        padding: 0 2px;
      }
      .search-results {
        border: 1px solid rgba(59, 130, 246, 0.1);
        display: none;
        position: absolute;
        width: 100%;
        z-index: 100;
      }
      .search-results-header {
        border-bottom: 1px dashed rgba(59, 130, 246, 0.2);
      }
      .animate-pulse-slow {
        animation: pulse-slow 2s infinite;
      }
    \`;
    document.head.appendChild(style);
    
    let searchIndex = [];
    let isInputFocused = false;
    
    // 加载搜索索引
    fetch('${config.baseUrl}/search.json')
      .then(response => {
        if (!response.ok) throw new Error('搜索索引加载失败');
        return response.json();
      })
      .then(data => {
        searchIndex = data;
      })
      .catch(err => {
        console.error('搜索功能初始化失败:', err);
        searchInput.placeholder = '搜索功能暂时不可用';
        searchInput.disabled = true;
      });
    
    // 工具函数：转义正则特殊字符（使用函数封装避免转义冲突）
    function escapeRegExp(str) {
      return str.replace(/[.*+?^\\$\{\}()|[\]]/g, '\\\\$&');
    }
    
    // 输入事件处理
    searchInput.addEventListener('input', function() {
      const query = this.value.trim().toLowerCase();
      
      if (query.length < 1) {
        searchResults.innerHTML = '';
        searchResults.style.display = 'none';
        return;
      }
      
      // 搜索逻辑
      const results = searchIndex.filter(item => {
        const cleanTitle = item.title.replace(/[^\w\u4e00-\u9fa5\s]/g, '').toLowerCase();
        const cleanContent = item.content.replace(/[^\w\u4e00-\u9fa5\s]/g, '').toLowerCase();
        const cleanTags = item.tags.map(tag => tag.replace(/[^\w\u4e00-\u9fa5\s]/g, '').toLowerCase());
        
        return cleanTitle.includes(query) || 
               cleanContent.includes(query) || 
               cleanTags.some(tag => tag.includes(query));
      }).slice(0, 10);
      
      // 高亮匹配文本（使用工具函数转义）
      const highlightMatch = (text, query) => {
        if (!query) return text;
        const escapedQuery = escapeRegExp(query); // 调用工具函数
        const regex = new RegExp(\`(\${escapedQuery})\`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
      };
      
      if (results.length > 0) {
        searchResults.innerHTML = \`
          <div class="search-results-header p-3 text-sm text-gray-500 dark:text-gray-400">
            找到 \${results.length} 个结果
          </div>
        \`;
        
        results.forEach((item, index) => {
          const resultItem = document.createElement('div');
          resultItem.className = 'search-result-item p-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0 rounded-md hover:bg-primary/5 dark:hover:bg-gray-800 transition-all duration-300';
          resultItem.style.opacity = '0';
          resultItem.style.transform = 'translateY(10px)';
          resultItem.style.transitionDelay = \`\${index * 50}ms\`;
          
          resultItem.innerHTML = \`
            <h3 class="text-lg font-medium"><a href="${config.baseUrl}/posts/\${item.slug}/" 
                     class="text-primary hover:underline hover:text-primary/80">\${highlightMatch(item.title, query)}</a></h3>
            <div class="flex flex-wrap items-center gap-x-4 mt-1 text-sm">
              <p class="text-gray-500 dark:text-gray-400">
                <i class="fa fa-user-o mr-1"></i>\${item.author || '未知'}
              </p>
              <p class="text-gray-500 dark:text-gray-400">
                <i class="fa fa-calendar-o mr-1"></i>\${item.date ? new Date(item.date).toLocaleDateString() : ''}
              </p>
            </div>
            \${item.tags.length > 0 ? \`
              <div class="flex flex-wrap gap-1 mt-2">
                \${item.tags.slice(0, 2).map(tag => \`
                  <span class="text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">\${highlightMatch(tag, query)}</span>
                \`).join('')}
                \${item.tags.length > 2 ? \`<span class="text-xs text-gray-400">+ \${item.tags.length - 2} 个标签</span>\` : ''}
              </div>
            \` : ''}
          \`;
          
          searchResults.appendChild(resultItem);
          
          setTimeout(() => {
            resultItem.style.opacity = '1';
            resultItem.style.transform = 'translateY(0)';
          }, 50);
        });
        
        searchResults.style.display = 'block';
      } else {
        searchResults.innerHTML = \`
          <div class="search-result-item p-6 text-center">
            <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
              <i class="fa fa-search text-primary text-2xl"></i>
            </div>
            <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">没有找到匹配的结果</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              尝试使用不同的关键词或检查拼写
            </p>
          </div>
        \`;
        searchResults.style.display = 'block';
      }
    });
    
    // 焦点事件处理
    searchInput.addEventListener('focus', function() {
      isInputFocused = true;
      if (this.value.trim().length >= 1) {
        this.dispatchEvent(new Event('input'));
      }
    });
    
    searchInput.addEventListener('blur', function() {
      isInputFocused = false;
      setTimeout(() => {
        searchResults.style.opacity = '0';
        searchResults.style.transform = 'translateY(-5px)';
        setTimeout(() => {
          searchResults.style.display = 'none';
          searchResults.style.opacity = '1';
          searchResults.style.transform = 'translateY(0)';
        }, 200);
      }, 200);
    });
    
    searchResults.addEventListener('click', function(e) {
      e.stopPropagation();
    });
    
    document.addEventListener('click', function(e) {
      if (!searchInput.contains(e.target) && !searchResults.contains(e.target) && isInputFocused) {
        searchInput.blur();
      }
    });
    
    searchResults.style.scrollbarWidth = 'thin';
    searchResults.style.scrollbarColor = 'rgba(59, 130, 246, 0.5) rgba(249, 250, 251, 0.95)';
    searchResults.style.transition = 'all 0.2s ease';
    
    searchResults.innerHTML += \`
      <style>
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        
        .search-results::-webkit-scrollbar {
          width: 6px;
        }
        
        .search-results::-webkit-scrollbar-track {
          background: rgba(249, 250, 251, 0.95);
          border-radius: 10px;
        }
        
        .search-results::-webkit-scrollbar-thumb {
          background-color: rgba(59, 130, 246, 0.5);
          border-radius: 10px;
        }
        
        .dark .search-results::-webkit-scrollbar-track {
          background: rgba(17, 24, 39, 0.95);
        }
      </style>
    \`;
  }
`;

  await writeFile(join(config.outputScriptsDir, "search.js"), searchScript);
}
