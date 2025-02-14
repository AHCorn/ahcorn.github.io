document.addEventListener('DOMContentLoaded', function() {
    // 检查文章内容高度并控制标签云显示
    function checkContentHeight() {
        const articleContent = document.querySelector('.cardw');
        const tagsCloud = document.querySelector('.tags-cloud');
        const sidebarTool = document.querySelector('.sidebar-tool');
        
        if (articleContent && tagsCloud && sidebarTool) {
            const articleHeight = articleContent.offsetHeight;
            
            if (articleHeight < 680) {
                tagsCloud.style.display = 'none';
                sidebarTool.style.maxHeight = `${articleHeight}px`;
            } else {
                tagsCloud.style.display = 'block';
                sidebarTool.style.maxHeight = 'calc(100vh - 40px)';
            }
        }
    }

    // 在页面加载和窗口调整时检查
    window.addEventListener('load', checkContentHeight);
    window.addEventListener('resize', checkContentHeight);

    // 如果有动态加载的内容，在内容变化时也检查
    const contentObserver = new MutationObserver(checkContentHeight);
    const articleContent = document.querySelector('.cardw');
    if (articleContent) {
        contentObserver.observe(articleContent, {
            childList: true,
            subtree: true
        });
    }

    // 处理标签展示
    const tagLinks = document.querySelector('.tag-links');
    if (tagLinks) {
        const tags = Array.from(tagLinks.querySelectorAll('.tag-link'));
        if (tags.length > 1) {
            // 创建更多标签按钮
            const moreButton = document.createElement('span');
            moreButton.className = 'tag-more';
            moreButton.textContent = '...';
            moreButton.style.display = 'none';
            
            // 创建弹出窗口
            const popup = document.createElement('div');
            popup.className = 'tag-popup';
            
            // 检测标签是否需要换行
            function checkTagsOverflow() {
                // 获取"标签"文字的位置
                const labelElement = tagLinks.previousElementSibling;
                if (!labelElement) return;
                
                const labelRect = labelElement.getBoundingClientRect();
                const labelTop = labelRect.top;
                
                let firstOverflowIndex = -1;
                
                // 找到第一个换行的标签的索引
                for (let i = 0; i < tags.length; i++) {
                    const rect = tags[i].getBoundingClientRect();
                    if (Math.abs(rect.top - labelTop) >= 1) {
                        firstOverflowIndex = i;
                        break;
                    }
                }
                
                // 如果找到了换行的标签
                if (firstOverflowIndex !== -1) {
                    // 显示更多按钮
                    moreButton.style.display = 'inline-flex';
                    
                    // 处理标签显示
                    tags.forEach((tag, index) => {
                        if (index >= firstOverflowIndex) {
                            // 隐藏从第一个换行标签开始的所有标签
                            tag.style.display = 'none';
                            // 确保标签在弹窗中只添加一次
                            if (!popup.querySelector(`[href="${tag.getAttribute('href')}"]`)) {
                                const clonedTag = tag.cloneNode(true);
                                clonedTag.style.display = 'inline-flex';
                                popup.appendChild(clonedTag);
                            }
                        } else {
                            // 显示之前的标签
                            tag.style.display = 'inline-flex';
                        }
                    });
                    
                    // 清空弹窗中多余的标签
                    Array.from(popup.children).forEach(child => {
                        const href = child.getAttribute('href');
                        if (!tags.slice(firstOverflowIndex).some(tag => tag.getAttribute('href') === href)) {
                            popup.removeChild(child);
                        }
                    });
                } else {
                    // 如果没有标签需要换行，隐藏更多按钮
                    moreButton.style.display = 'none';
                    // 显示所有标签
                    tags.forEach(tag => tag.style.display = 'inline-flex');
                    // 清空弹窗
                    popup.innerHTML = '';
                }
            }
            
            // 添加更多按钮和弹出窗口
            tagLinks.appendChild(moreButton);
            document.body.appendChild(popup);
            
            // 处理鼠标事件
            let popupTimeout;
            
            const updatePopupPosition = () => {
                const rect = moreButton.getBoundingClientRect();
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                popup.style.position = 'absolute';
                popup.style.top = `${rect.bottom + scrollTop}px`;
                popup.style.left = `${rect.left}px`;
            };
            
            moreButton.addEventListener('mouseenter', () => {
                clearTimeout(popupTimeout);
                updatePopupPosition();
                requestAnimationFrame(() => {
                    popup.classList.add('show');
                });
            });
            
            popup.addEventListener('mouseenter', () => {
                clearTimeout(popupTimeout);
            });
            
            const hidePopup = () => {
                popupTimeout = setTimeout(() => {
                    popup.classList.remove('show');
                }, 300);
            };
            
            moreButton.addEventListener('mouseleave', hidePopup);
            popup.addEventListener('mouseleave', hidePopup);
            
            // 监听滚动和调整大小事件
            window.addEventListener('scroll', () => {
                if (popup.classList.contains('show')) {
                    updatePopupPosition();
                }
            }, { passive: true });
            
            window.addEventListener('resize', () => {
                checkTagsOverflow();
                if (popup.classList.contains('show')) {
                    updatePopupPosition();
                }
            });
            
            // 初始检查
            requestAnimationFrame(() => {
                checkTagsOverflow();
            });
        }
    }

    // 封面图片颜色提取
    const colorThief = new ColorThief();
    const img = document.getElementById('coverImage');
    const coverImage = document.querySelector('.cover-image');

    if (img && coverImage) {
        // 创建一个新的图片对象用于颜色提取
        const tempImg = new Image();
        tempImg.crossOrigin = "Anonymous";
        
        // 从原始图片获取真实的src（可能是data-src）
        const realSrc = img.dataset.src || img.src;
        
        tempImg.onload = function() {
            try {
                const color = colorThief.getPalette(tempImg, 5)[2];
                updateColors(color);
            } catch (e) {
                console.warn('Color extraction failed:', e);
                // 使用默认颜色作为后备
                updateColors([128, 128, 128]);
            }
        };
        
        // 设置错误处理
        tempImg.onerror = function() {
            console.warn('Failed to load image for color extraction');
            // 使用默认颜色作为后备
            updateColors([128, 128, 128]);
        };
        
        // 开始加载图片
        tempImg.src = realSrc;

        // 监听原始图片的加载完成事件
        img.addEventListener('load', function() {
            coverImage.classList.add('loaded');
        });
    }

    function updateColors(color) {
        const [r, g, b] = color;
        const infoCard = document.getElementById('infoCard');
        
        if (!infoCard) return;
        
        // 创建渐变色
        const gradient = `
            linear-gradient(135deg, 
                rgba(${r}, ${g}, ${b}, 0.5) 0%,
                rgba(${r}, ${g}, ${b}, 0.3) 100%
            )
        `;
        
        // 设置信息卡片的背景
        infoCard.style.background = gradient;
        
        // 更新遮罩层的颜色
        const overlays = infoCard.querySelectorAll('.overlay');
        if (overlays.length > 0) {
            overlays[0].style.background = `
                linear-gradient(135deg, 
                    rgba(255, 255, 255, 0.08) 0%,
                    rgba(255, 255, 255, 0) 100%
                )
            `;
        }
        if (overlays.length > 1) {
            overlays[1].style.background = `
                linear-gradient(to bottom, 
                    rgba(0, 0, 0, 0.15) 0%,
                    rgba(0, 0, 0, 0.3) 100%
                )
            `;
        }
        
        // 调整分类和标签的样式
        document.querySelectorAll('.category-link').forEach(link => {
            link.style.background = `rgba(${r}, ${g}, ${b}, 0.25)`;
            link.style.borderColor = `rgba(${r}, ${g}, ${b}, 0.4)`;
            
            // 悬停效果
            link.addEventListener('mouseover', () => {
                link.style.background = `rgba(${r}, ${g}, ${b}, 0.35)`;
            });
            link.addEventListener('mouseout', () => {
                link.style.background = `rgba(${r}, ${g}, ${b}, 0.25)`;
            });
        });
        
        // 标签使用较浅的颜色
        document.querySelectorAll('.tag-link').forEach(link => {
            link.style.background = `rgba(${r}, ${g}, ${b}, 0.15)`;
            link.style.borderColor = `rgba(${r}, ${g}, ${b}, 0.25)`;
            
            // 悬停效果
            link.addEventListener('mouseover', () => {
                link.style.background = `rgba(${r}, ${g}, ${b}, 0.25)`;
            });
            link.addEventListener('mouseout', () => {
                link.style.background = `rgba(${r}, ${g}, ${b}, 0.15)`;
            });
        });
    }

    // 生成目录
    const content = document.querySelector('.post-content');
    const headings = content.querySelectorAll('h2, h3, h4');
    const tocContent = document.querySelector('.toc-content');
    
    if (headings.length > 0 && tocContent) {
        const tocList = document.createElement('ul');
        let currentLevel = 2;
        let currentUl = tocList;
        let levelStack = [tocList];

        headings.forEach((heading, index) => {
            const level = parseInt(heading.tagName.charAt(1));
            heading.id = `heading-${index}`;

            if (level > currentLevel) {
                const ul = document.createElement('ul');
                levelStack[levelStack.length - 1].lastElementChild.appendChild(ul);
                levelStack.push(ul);
                currentUl = ul;
            } else if (level < currentLevel) {
                levelStack = levelStack.slice(0, level - 1);
                currentUl = levelStack[levelStack.length - 1];
            }

            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#heading-${index}`;
            a.textContent = heading.textContent;
            li.appendChild(a);
            currentUl.appendChild(li);

            currentLevel = level;
        });

        tocContent.appendChild(tocList);

        // 滚动监听
        const tocLinks = tocContent.querySelectorAll('a');
        const headingElements = Array.from(headings);
        
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const fromTop = window.scrollY + 100;
                    
                    let currentHeading = headingElements[0];
                    headingElements.forEach(heading => {
                        if (heading.offsetTop <= fromTop) {
                            currentHeading = heading;
                        }
                    });
                    
                    tocLinks.forEach(link => {
                        link.classList.remove('active');
                        if (currentHeading && link.getAttribute('href') === `#${currentHeading.id}`) {
                            link.classList.add('active');
                        }
                    });
                    
                    ticking = false;
                });
                ticking = true;
            }
        });

        // 点击目录滚动
        tocLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').slice(1);
                const target = document.getElementById(targetId);
                if (target) {
                    window.scrollTo({
                        top: target.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            });
        });
    } else if (tocContent) {
        const tocContainer = document.querySelector('.post-toc');
        if (tocContainer) {
            tocContainer.style.display = 'none';
        }
    }

    // 处理图片
    document.querySelectorAll('.post-content img').forEach(img => {
        if (!img.closest('.image-container')) {  // 避免重复处理
            const container = document.createElement('div');
            container.className = 'image-container';
            
            // 创建灯箱链接
            const link = document.createElement('a');
            // 使用 data-src 如果存在，否则使用 src
            const imgSrc = img.dataset.src || img.src;
            link.href = imgSrc;
            link.setAttribute('data-fancybox', 'gallery');
            if (img.alt) {
                link.setAttribute('data-caption', img.alt);
            }
            
            // 重新组织 DOM 结构
            img.parentNode.insertBefore(container, img);
            container.appendChild(link);
            link.appendChild(img);
            
            // 如果有 alt 文本，添加说明文字
            if (img.alt) {
                const caption = document.createElement('div');
                caption.className = 'image-caption';
                caption.textContent = img.alt;
                container.appendChild(caption);
            }
        }
    });

    // 设置文章高度变量
    function updateArticleHeight() {
        const article = document.querySelector('.post-content');
        if (article) {
            document.documentElement.style.setProperty('--article-height', `${article.offsetHeight}px`);
        }
    }
    
    // 初始更新和监听变化
    updateArticleHeight();
    window.addEventListener('resize', updateArticleHeight);
    
    // 监听文章内容变化（比如图片加载完成后）
    const observer = new MutationObserver(updateArticleHeight);
    const article = document.querySelector('.post-content');
    if (article) {
        observer.observe(article, { 
            childList: true, 
            subtree: true, 
            attributes: true 
        });
    }

    // 处理所有图片的加载动画
    function handleImageLoading() {
        const images = document.querySelectorAll('img');
        
        const loadImage = (img) => {
            // 如果图片已经加载完成
            if (img.complete) {
                img.classList.add('loaded');
            } else {
                // 图片加载完成时添加 loaded 类
                img.addEventListener('load', () => {
                    img.classList.add('loaded');
                });
                
                // 图片加载失败时也添加 loaded 类，避免永远显示不出来
                img.addEventListener('error', () => {
                    img.classList.add('loaded');
                });
            }
        };
        
        // 处理所有图片
        images.forEach(loadImage);
        
        // 使用 MutationObserver 监听新添加的图片
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeName === 'IMG') {
                        loadImage(node);
                    } else if (node.nodeType === 1) {
                        // 检查新添加的元素内的图片
                        node.querySelectorAll('img').forEach(loadImage);
                    }
                });
            });
        });
        
        // 监听整个文档的变化
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // 初始化图片加载处理
    handleImageLoading();

    // 初始化 Fancybox
    Fancybox.bind("[data-fancybox]", {
        animated: true,
        showClass: "fancybox-fadeIn",
        hideClass: "fancybox-fadeOut",
        dragToClose: false,
        Image: {
            zoom: true,
            click: true,
            wheel: "slide",
            fit: "contain"
        },
        Toolbar: {
            display: [
                "zoom",
                "slideshow",
                "fullscreen",
                "close"
            ]
        },
        Thumbs: {
            autoStart: false
        },
        Carousel: {
            transition: "slide",
            friction: 0.8
        }
    });

    // 处理代码块
    document.querySelectorAll('pre code').forEach(block => {
        // 检查是否已经有代码头部
        if (block.parentElement.querySelector('.code-header')) {
            return;
        }
        
        // 获取语言
        let language = 'plaintext';
        const classNames = block.className.split(' ');
        for (const className of classNames) {
            if (className.startsWith('language-')) {
                language = className.replace('language-', '');
                break;
            }
        }
        
        // 创建代码块头部
        const header = document.createElement('div');
        header.className = 'code-header';
        
        // 添加语言标识
        const langSpan = document.createElement('span');
        langSpan.className = 'code-lang';
        langSpan.textContent = language.toUpperCase();
        header.appendChild(langSpan);
        
        // 添加复制按钮
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.textContent = '复制代码';
        copyButton.onclick = async () => {
            try {
                await navigator.clipboard.writeText(block.textContent);
                copyButton.textContent = '已复制！';
                copyButton.classList.add('copied');
                setTimeout(() => {
                    copyButton.textContent = '复制代码';
                    copyButton.classList.remove('copied');
                }, 2000);
            } catch (err) {
                copyButton.textContent = '复制失败';
                setTimeout(() => {
                    copyButton.textContent = '复制代码';
                }, 2000);
            }
        };
        header.appendChild(copyButton);
        
        // 插入头部
        block.parentElement.insertBefore(header, block);
    });
}); 