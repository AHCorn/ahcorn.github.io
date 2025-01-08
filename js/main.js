document.addEventListener("DOMContentLoaded", function() {
    // 为所有文章内的图片添加 data-fancybox 属性
    document.querySelectorAll('.post-content img').forEach(img => {
        if (!img.closest('a')) {  // 如果图片不在链接内
            img.setAttribute('data-fancybox', 'gallery');
            img.setAttribute('data-src', img.src);
            img.style.cursor = 'pointer';
        }
    });

    // 处理表格中的单个图片
    document.querySelectorAll('.post-content td').forEach(td => {
        const images = td.getElementsByTagName('img');
        if (images.length === 1) {  // 如果单元格中只有一个图片
            const img = images[0];
            img.style.width = '100%';
            img.style.height = 'auto';
            img.style.objectFit = 'contain';
            // 移除可能影响布局的margin和padding
            img.style.margin = '0';
            img.style.padding = '0';
            // 确保td没有额外的padding影响布局
            td.style.padding = '0';
        }
    });

    // 处理表格中只有一个单元格且只包含一个图片的情况
    document.querySelectorAll('.post-content table').forEach(table => {
        const cells = table.getElementsByTagName('td');
        if (cells.length === 1) {
            const images = cells[0].getElementsByTagName('img');
            if (images.length === 1) {
                const img = images[0];
                img.style.width = '100%';
                img.style.height = 'auto';
                img.style.display = 'block';
                table.style.width = '100%';
                cells[0].style.padding = '0';
            }
        }
    });
}); 