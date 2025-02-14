document.addEventListener('DOMContentLoaded', function() {
    // 图片懒加载观察器
    const lazyImageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                element.classList.add('loaded');
                observer.unobserve(element);
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.01
    });

    // 处理所有图片和背景图片
    function handleLazyElements() {
        // 处理普通图片，排除侧边栏和顶栏的头像
        const images = document.querySelectorAll('img:not(.lazy-loading):not(.logo2):not(.mobile-header-title img):not(.mobile-menu-header img)');
        images.forEach(img => {
            // 跳过侧边栏和顶栏的头像
            if (img.closest('.mobile-header-title') || 
                img.closest('.mobile-menu-header') || 
                img.closest('.logo2') ||
                img.closest('.sidebar')) {
                return;
            }

            if (!img.classList.contains('lazy-loading')) {
                img.classList.add('lazy-loading');
                lazyImageObserver.observe(img);
            }
        });

        // 处理背景图片，排除侧边栏和顶栏
        const bgElements = document.querySelectorAll('[style*="background-image"], [style*="background:url"], [style*="background: url"]');
        bgElements.forEach(element => {
            // 跳过侧边栏和顶栏的元素
            if (element.closest('.mobile-header') || 
                element.closest('.mobile-menu') || 
                element.closest('.side-bar')) {
                return;
            }

            if (!element.classList.contains('lazy-loading')) {
                element.classList.add('lazy-loading');
                lazyImageObserver.observe(element);
            }
        });
    }

    // 初始化处理
    handleLazyElements();

    // 监听 DOM 变化
    const observer = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // 元素节点
                    if (node.tagName === 'IMG' || 
                        node.hasAttribute('style') && 
                        (node.getAttribute('style').includes('background-image') || 
                         node.getAttribute('style').includes('background:url') || 
                         node.getAttribute('style').includes('background: url'))) {
                        shouldUpdate = true;
                    }
                    // 检查子元素
                    const hasRelevantChildren = node.querySelector('img, [style*="background-image"], [style*="background:url"], [style*="background: url"]');
                    if (hasRelevantChildren) {
                        shouldUpdate = true;
                    }
                }
            });
        });
        
        if (shouldUpdate) {
            handleLazyElements();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style']
    });
}); 