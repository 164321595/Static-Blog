
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    
    if (searchInput && searchResults) {
      let searchIndex = [];
      
      // 加载搜索索引
      fetch('/Static-Blog/search.json')
        .then(response => response.json())
        .then(data => {
          searchIndex = data;
        });
      
      searchInput.addEventListener('input', function() {
        const query = this.value.trim().toLowerCase();
        
        if (query.length < 2) {
          searchResults.innerHTML = '';
          searchResults.style.display = 'none';
          return;
        }
        
        const results = searchIndex.filter(item => 
          item.title.toLowerCase().includes(query) ||
          item.content.toLowerCase().includes(query) ||
          item.tags.some(tag => tag.toLowerCase().includes(query))
        ).slice(0, 10);
        
        if (results.length > 0) {
          searchResults.innerHTML = results.map(item => `
            <div class="search-result-item">
              <h3><a href="/Static-Blog/posts/${item.slug}/">${item.title}</a></h3>
              <p>作者: ${item.author || '未知'}</p>
            </div>
          `).join('');
          searchResults.style.display = 'block';
        } else {
          searchResults.innerHTML = '<div class="search-result-item">没有找到匹配的结果</div>';
          searchResults.style.display = 'block';
        }
      });
      
      // 点击页面其他区域关闭搜索结果
      document.addEventListener('click', function(e) {
        if (!searchResults.contains(e.target)) {
          searchResults.style.display = 'none';
        }
      });
    }
  