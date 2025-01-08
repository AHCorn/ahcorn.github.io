let searchIndex = null;
let fuse = null;

// 配置 Fuse.js 的搜索选项
const fuseOptions = {
    includeScore: true,
    threshold: 0.4,
    keys: [
        { name: 'title', weight: 0.7 },
        { name: 'content', weight: 0.5 },
        { name: 'tags', weight: 0.3 }
    ]
};

// 初始化搜索索引
async function initializeSearch() {
    try {
        const response = await fetch('/index.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonFeed = await response.json();
        if (!jsonFeed.items || !Array.isArray(jsonFeed.items)) {
            console.error('Invalid search index format:', jsonFeed);
            return;
        }
        searchIndex = jsonFeed.items.map(item => ({
            title: item.title,
            content: item.content_text || item.content || '',
            permalink: item.url || item.external_url,
            summary: item.summary || '',
            date: item.date_published || item.date_modified,
            tags: item.tags || []
        }));
        console.log(`Loaded ${searchIndex.length} articles for search`);
        fuse = new Fuse(searchIndex, fuseOptions);
    } catch (e) {
        console.error('Error initializing search:', e);
        document.getElementById('search-results').innerHTML = 
            '<p class="no-results">搜索功能初始化失败，请刷新页面重试</p>';
    }
}

// 执行搜索
function performSearch(query) {
    if (!fuse) {
        console.error('Fuse.js not initialized');
        return [];
    }
    const results = fuse.search(query);
    console.log('Search results:', results);
    return results;
}

// 渲染搜索结果
function renderResults(results) {
    const searchResults = document.getElementById('search-results');
    if (!results.length) {
        searchResults.innerHTML = '<p class="no-results">未找到相关结果</p>';
        return;
    }

    const resultsHtml = results
        .map(({ item }) => `
            <article class="search-result">
                <h2><a href="${item.permalink}">${item.title}</a></h2>
                <div class="meta">
                    ${item.date ? `<span class="date">${new Date(item.date).toLocaleDateString('zh-CN')}</span>` : ''}
                    ${item.tags && item.tags.length ? `<span class="tags">标签: ${item.tags.join(', ')}</span>` : ''}
                </div>
                <p class="summary">${item.summary ? item.summary : (item.content ? item.content.substring(0, 200) + '...' : '')}</p>
            </article>
        `)
        .join('');

    searchResults.innerHTML = resultsHtml;
}

// 事件监听器
document.addEventListener('DOMContentLoaded', () => {
    initializeSearch();

    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    // 搜索按钮点击事件
    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            const results = performSearch(query);
            renderResults(results);
        }
    });

    // 输入框回车事件
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                const results = performSearch(query);
                renderResults(results);
            }
        }
    });

    // 添加实时搜索功能
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        const query = e.target.value.trim();
        if (query) {
            debounceTimer = setTimeout(() => {
                const results = performSearch(query);
                renderResults(results);
            }, 300);
        } else {
            searchResults.innerHTML = '';
        }
    });
}); 