// GitHub API 请求限制处理
const GITHUB_API_BASE = 'https://api.github.com';
const CACHE_DURATION = 3600000; // 1小时的缓存时间

// 从缓存中获取数据
function getFromCache(key) {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    
    try {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp > CACHE_DURATION) {
            localStorage.removeItem(key);
            return null;
        }
        return data;
    } catch (e) {
        localStorage.removeItem(key);
        return null;
    }
}

// 将数据存入缓存
function setToCache(key, data) {
    const cacheData = {
        data,
        timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
}

// 获取仓库信息
async function fetchRepoInfo(repoPath) {
    const cacheKey = `github_repo_${repoPath}`;
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    try {
        const response = await fetch(`${GITHUB_API_BASE}/repos/${repoPath}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setToCache(cacheKey, data);
        return data;
    } catch (error) {
        console.error(`Error fetching repo info for ${repoPath}:`, error);
        return null;
    }
}

// 更新仓库卡片
async function updateRepoCard(card, repoInfo) {
    if (!repoInfo) {
        card.style.display = 'none';
        return;
    }

    // 更新仓库名称
    const nameElement = card.querySelector('.repo-name');
    if (nameElement) nameElement.textContent = repoInfo.name;

    // 更新统计信息
    const starsElement = card.querySelector('.stars-count');
    if (starsElement) starsElement.textContent = repoInfo.stargazers_count.toLocaleString();

    const forksElement = card.querySelector('.forks-count');
    if (forksElement) forksElement.textContent = repoInfo.forks_count.toLocaleString();

    // 更新描述
    const descElement = card.querySelector('.repo-description');
    if (descElement) {
        descElement.textContent = repoInfo.description || '暂无描述';
    }

    // 更新语言信息
    const languageElement = card.querySelector('.language-name');
    const languageColorElement = card.querySelector('.language-color');
    if (languageElement && languageColorElement && repoInfo.language) {
        languageElement.textContent = repoInfo.language;
        // 设置编程语言对应的颜色
        const languageColors = {
            "JavaScript": "#f1e05a",
            "Python": "#3572A5",
            "Java": "#b07219",
            "HTML": "#e34c26",
            "CSS": "#563d7c",
            "TypeScript": "#2b7489",
            "PHP": "#4F5D95",
            "Ruby": "#701516",
            "Go": "#00ADD8",
            "C++": "#f34b7d",
            "C": "#555555",
            "Shell": "#89e051",
            "Vue": "#2c3e50"
        };
        languageColorElement.style.backgroundColor = languageColors[repoInfo.language] || '#858585';
    }

    // 更新链接
    const linkElement = card.querySelector('.repo-link');
    if (linkElement) {
        linkElement.href = repoInfo.html_url;
    }

    // 显示卡片
    card.style.opacity = '1';
}

// 初始化所有仓库卡片
async function initRepoCards() {
    const cards = document.querySelectorAll('.repo-card');
    for (const card of cards) {
        const repoPath = card.dataset.repo;
        if (!repoPath) continue;

        const repoInfo = await fetchRepoInfo(repoPath);
        await updateRepoCard(card, repoInfo);
    }
}

// 当 DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', initRepoCards); 