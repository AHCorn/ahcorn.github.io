document.addEventListener('DOMContentLoaded', function() {
    function initLazyBackgrounds() {
        const bgElements = document.querySelectorAll('[style*="background-image"], [style*="background:url"], [style*="background: url"]');
        bgElements.forEach(element => {
            if (!element.classList.contains('lazy-load')) {
                // 提取背景图URL
                const styleStr = element.getAttribute('style');
                const urlMatch = styleStr.match(/url\(['"]?(.*?)['"]?\)/);
                if (urlMatch && urlMatch[1]) {
                    const imageUrl = urlMatch[1];
                    // 先移除原有的背景图
                    element.style.backgroundImage = 'none';
                    element.setAttribute('data-bg', imageUrl);
                    element.classList.add('lazy-load');
                    // 添加过渡效果
                    element.style.transition = 'opacity 0.3s ease-in';
                    element.style.opacity = '0';
                }
            }
        });
    }

    const loadImage = (element) => {
        if (element.classList.contains('loaded')) return;
        
        const bgUrl = element.getAttribute('data-bg');
        if (!bgUrl) return;

        // 预加载图片
        const img = new Image();
        img.onload = () => {
            requestAnimationFrame(() => {
                element.style.backgroundImage = `url('${bgUrl}')`;
                // 添加一个小延迟以确保背景图设置完成
                setTimeout(() => {
                    element.style.opacity = '1';
                    element.classList.add('loaded');
                }, 50);
            });
        };
        img.src = bgUrl;
    };

    const lazyLoadObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                loadImage(element);
                observer.unobserve(element);
            }
        });
    }, {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
    });

    const setupLazyLoad = () => {
        initLazyBackgrounds();
        document.querySelectorAll('.lazy-load').forEach(img => {
            if (!img.classList.contains('loaded')) {
                lazyLoadObserver.observe(img);
            }
        });
    };

    // 初始化
    setupLazyLoad();

    // 监听动态加载的内容
    const contentObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                setupLazyLoad();
            }
        });
    });

    // 监听整个 body 的变化
    contentObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
}); 