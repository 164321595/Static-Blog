document.addEventListener("DOMContentLoaded", function() {
    // 创建canvas元素绘制图标
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");

    // 配置选项 - 可根据需要修改
    const config = {
        icon: "\uf15c", // 默认使用书签图标
        iconSize: 18,
        backgroundColor: ["#165DFF", "#7B61FF"], // 渐变颜色
        borderRadius: 6,
        iconColor: "white",
    };

    // 创建渐变背景
    const gradient = ctx.createLinearGradient(0, 0, 32, 32);
    gradient.addColorStop(0, config.backgroundColor[0]);
    gradient.addColorStop(1, config.backgroundColor[1]);

    // 绘制圆角矩形背景
    ctx.beginPath();
    const radius = config.borderRadius;
    ctx.moveTo(radius, 0);
    ctx.lineTo(32 - radius, 0);
    ctx.arcTo(32, 0, 32, radius, radius);
    ctx.lineTo(32, 32 - radius);
    ctx.arcTo(32, 32, 32 - radius, 32, radius);
    ctx.lineTo(radius, 32);
    ctx.arcTo(0, 32, 0, 32 - radius, radius);
    ctx.lineTo(0, radius);
    ctx.arcTo(0, 0, radius, 0, radius);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // 检查Font Awesome是否已加载
    const head = document.head;
    const hasFontAwesome = () => {
        return (
            document.querySelector('link[href*="font-awesome"]') ||
            document.querySelector("style[data-fa-version]")
        );
    };

    // 绘制图标
    const drawIcon = () => {
        ctx.fillStyle = config.iconColor;
        ctx.font = `${config.iconSize}px "FontAwesome"`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(config.icon, 16, 16);

        // 生成并应用favicon
        const faviconUrl = canvas.toDataURL("image/x-icon");
        updateFavicon(faviconUrl);
    };

    // 更新页面favicon
    const updateFavicon = (url) => {
        let favicon =
            document.querySelector('link[rel="icon"]') ||
            document.querySelector('link[rel="shortcut icon"]');

        if (!favicon) {
            favicon = document.createElement("link");
            favicon.rel = "shortcut icon";
            head.appendChild(favicon);
        }

        favicon.href = url;
    };

    // 加载Font Awesome
    const loadFontAwesome = () => {
        if (hasFontAwesome()) {
            // 检查是否已加载Font Awesome字体
            if (isFontAwesomeLoaded()) {
                drawIcon();
            } else {
                // 等待字体加载
                setTimeout(loadFontAwesome, 100);
            }
        } else {
            // 加载Font Awesome
            const link = document.createElement("link");
            link.href =
                "https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css";
            link.rel = "stylesheet";
            link.onload = drawIcon;
            link.onerror = () => {
                // 加载失败时使用备用方案
                console.error("Font Awesome加载失败，使用备用favicon");
                config.icon = "B"; // 使用字母B作为备用图标
                config.fontFamily = "Arial, sans-serif";
                drawIcon();
            };
            head.appendChild(link);
        }
    };

    // 检查Font Awesome字体是否已加载
    const isFontAwesomeLoaded = () => {
        const testSpan = document.createElement("span");
        testSpan.innerHTML = "\uf000"; // Font Awesome的第一个图标
        testSpan.style.fontFamily = "FontAwesome";
        testSpan.style.position = "absolute";
        testSpan.style.top = "-9999px";
        document.body.appendChild(testSpan);

        const width = testSpan.offsetWidth;
        document.body.removeChild(testSpan);

        return width > 0;
    };

    // 启动流程
    loadFontAwesome();
});