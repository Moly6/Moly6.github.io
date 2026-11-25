// Live2D 增强功能脚本
(function () {
    'use strict';

    // 随机问候语
    const greetings = [
        '欢迎来到Magic Yuan的博客！',
        '今天也要努力学习哦～',
        '发现了什么有趣的内容吗？',
        '记得多喝水，保护好眼睛！',
        '代码写累了就休息一下吧～',
        '学习新技术的时候，实践是最好的老师！',
        '遇到bug不要慌，慢慢调试总能解决～'
    ];

    // 点击相关的提示
    const bodyMessage = [
        '你好呀！很高兴见到你～',
        '有什么可以帮到你的吗？',
        '再点击试试看？',
        '(´∀｀)ゞ',
        '你在戳我呢！好痒～',
        '想我的时候你就摸摸头~'
    ];
    const headMessage = [
        '哎呀，你戳到我的脸啦！',
        '别摸我的头啦～',
        '好舒服呀～',
        '你想干什么呀？',
        '讨厌～人家会害羞的！',
        '摸头杀是犯规的！',
        '(*´∀｀*)',
        '好痒好痒～'
    ];

    /**
     * 通过 allorigins 代理绕过 CORS，自动处理 JSON 解包
     * @param {string} url - 目标请求地址
     * @returns {Promise<any>} - 返回解包后的 JSON 数据
     */
    async function corsFetch(url) {
        const proxyUrl = 'https://api.allorigins.win/get?url=' + encodeURIComponent(url);
        const response = await fetch(proxyUrl, { cache: 'no-cache' });

        if (!response.ok) {
            throw new Error(`代理请求失败: ${response.status}`);
        }

        const dataWrapped = await response.json();

        try {
            // 尝试解析为 JSON，失败则返回原始字符串
            return JSON.parse(dataWrapped.contents);
        } catch (e) {
            return dataWrapped.contents;
        }
    }


    // 全局变量，确保所有函数都能访问
    let showMessage, getHitokoto, closeTimer;

    // 等待Live2D加载完成
    function waitForLive2D() {
        if (typeof L2Dwidget !== 'undefined') {
            initLive2DEnhance();
        } else {
            setTimeout(waitForLive2D, 500);
        }
    } function initLive2DEnhance() {
        // console.log('Live2D增强功能已启动');
        initLive2DInteraction();
        // 初始化对话框
        initCustomDialog();
    }

    // 官方风格的对话框方案
    function initCustomDialog() {
        showMessage = function (text, duration = 5000) {
            const dialogElement = document.querySelector('.live2d-widget-dialog');
            const containerElement = document.querySelector('.live2d-widget-dialog-container');
            if (!dialogElement) {
                console.log('对话框元素未正确创建，请检查代码。');
                return;
            }
            containerElement.style.right = '-30px';

            dialogElement.style.opacity = 1;
            dialogElement.innerHTML = text;
            clearTimeout(closeTimer);
            closeTimer = setTimeout(function () {
                dialogElement.style.opacity = 0;
            }, duration);
        };


        // 获取一言API - 赋值给全局变量
        getHitokoto = async function () {
            try {
                // 获取时间戳
                const timestamp = new Date().getTime();
                const data = await corsFetch('https://v1.hitokoto.cn?t=' + timestamp);
                if (!data || !data.hitokoto) {
                    throw new Error('API返回数据格式不正确');
                }
                showMessage(`${data.hitokoto} —— ${data.from || '佚名'}`, 6000);
            } catch (error) {
                console.log('一言API请求失败或解析失败:', error);
                const localQuotes = [
                    '代码如诗，简洁而美丽。',
                    '程序员的浪漫，藏在每一行代码里。',
                    '学而时习之，不亦说乎？',
                    '工欲善其事，必先利其器。',
                    '山重水复疑无路，柳暗花明又一村。',
                    '纸上得来终觉浅，绝知此事要躬行。'
                ];
                showMessage(localQuotes[Math.floor(Math.random() * localQuotes.length)]);
            }
        };
        initEnhancedFeatures();
    }

    function initEnhancedFeatures() {

        // 时间相关的问候
        function getTimeGreeting() {
            const now = new Date();
            const hour = now.getHours();
            if (hour < 5) {
                return '夜深了，还在坚持？早点休息，明天更美好～';
            } else if (hour < 8) {
                return '清晨好，万物复苏，适合早读～';
            } else if (hour < 12) {
                return '上午好，工作学习效率高，一起加油～';
            } else if (hour === 12) {
                return '中午好，午餐时间到了，记得吃饭哦～';
            } else if (hour < 14) {
                return '午后好，适合小憩一下，恢复精力～';
            } else if (hour < 18) {
                return '下午好，剩下的时光也要努力～';
            } else if (hour < 21) {
                return '傍晚好，夕阳无限好，别忘了放松～';
            } else {
                return '晚上好，夜色渐浓，早点休息吧～';
            }
        }

        // 页面加载时的欢迎消息
        setTimeout(() => {
            showMessage(getTimeGreeting(), 6000);
        }, 3000);

        // 定期显示随机消息
        setInterval(() => {
            if (Math.random() < 0.3) { // 30%的概率显示消息
                const message = greetings[Math.floor(Math.random() * greetings.length)];
                showMessage(message);
            }
        }, 30000); // 每30秒检查一次

        // 定期显示一言（每20秒）
        setInterval(() => {
            if (Math.random() < 0.4) { // 40%的概率显示一言
                getHitokoto();
            }
        }, 20000); // 每20秒检查一次

        // 监听页面可见性变化
        var originTitle = document.title;
        var titleTime;
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                setTimeout(() => {
                    showMessage('欢迎回来！', 3000);
                }, 1000);
                document.title = '燕子,没有你我怎么活啊😭' + originTitle;
                titleTime = setTimeout(function () {
                    document.title = originTitle;
                }, 2345);
            } else {
                document.title = '还会再见吗燕子😭';
                clearTimeout(titleTime);
            }
        });

        // 监听滚动事件
        let lastScrollTime = 0;
        window.addEventListener('scroll', () => {
            const now = Date.now();
            if (now - lastScrollTime > 10000) { // 10秒内只触发一次
                lastScrollTime = now;
                if (Math.random() < 0.2) { // 20%的概率
                    const messages = [
                        '看到什么有趣的内容了吗？',
                        '慢慢看，不要着急～',
                        '这篇文章怎么样？'
                    ];
                    showMessage(messages[Math.floor(Math.random() * messages.length)]);
                }
            }
        });

        // 复制代码时的提示
        document.addEventListener('copy', () => {
            setTimeout(() => {
                showMessage('复制成功！记得理解代码的含义哦～', 3000);
            }, 500);
        });

        // 检测用户在页面停留时间较长
        let pageLoadTime = Date.now();
        setInterval(() => {
            const stayTime = Date.now() - pageLoadTime;
            if (stayTime > 300000 && Math.random() < 0.1) { // 停留超过5分钟，10%概率
                showMessage('看了这么久，记得休息一下眼睛哦～');
            }
        }, 60000); // 每分钟检查一次
    }

    // 初始化Live2D交互事件监听器
    function initLive2DInteraction() {
        if (typeof L2Dwidget !== 'undefined' && typeof L2Dwidget.on === 'function') {
            L2Dwidget.on('tapface', () => {
                showMessage(headMessage[Math.floor(Math.random() * headMessage.length)]);
            });
            L2Dwidget.on('tapbody', () => {
                showMessage(bodyMessage[Math.floor(Math.random() * bodyMessage.length)]);
            });
        } else {
            setTimeout(initLive2DInteraction, 500);
        }
    }

    // 页面加载完成后启动
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForLive2D);
    } else {
        waitForLive2D();
    }

})();
