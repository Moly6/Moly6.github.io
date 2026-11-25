var BlogUtils = {
  // 本地存储工具
  storage: {
    set(key, value, ttl = 1, _expiryType = 'dd') {
      if (ttl === 0) return this;

      let expiry;
      switch (_expiryType) {
        case 'ss': expiry = Date.now() + ttl * 1000; break;
        case 'ms': expiry = Date.now() + ttl; break;
        case 'HH': expiry = Date.now() + ttl * 3600000; break;
        case 'mm': expiry = Date.now() + ttl * 60000; break;
        case 'dd':
        default: expiry = Date.now() + ttl * 86400000; break;
      }

      const item = { value, expiry };
      localStorage.setItem(key, JSON.stringify(item));
      return this;
    },

    get(key) {
      const itemStr = localStorage.getItem(key);
      if (!itemStr) return void 0;

      try {
        const { value, expiry } = JSON.parse(itemStr);
        if (Date.now() > expiry) {
          localStorage.removeItem(key);
          return void 0;
        }
        return value;
      } catch {
        localStorage.removeItem(key);
        return void 0;
      }
    },

    remove(key) {
      localStorage.removeItem(key);
      return this;
    }
  },

  keys: {
    bg: "blogbg", // 背景存储键
    elBg: "web_bg", // 背景元素 ID
    theme: "theme", // 主题存储键
  },

  // 设置页面集成
  settings: {
    // 设置管理器实例引用（保留以备未来扩展）
    manager: null,

    // 设置管理器引用
    setManager(manager) {
      this.manager = manager;
    },

    // 设置背景快捷方法 - 直接使用 wallpaper.change
    setBackground(background) {
      BlogUtils.wallpaper.change(background);
    }
  },

  // 确保背景元素存在
  ensureBgElement() {
    let bgElement = document.getElementById(this.keys.elBg);
    if (!bgElement) {
      bgElement = document.createElement("div");
      bgElement.id = this.keys.elBg;

      // 确保在 body 的第一个位置插入，避免覆盖其他内容
      if (document.body.firstChild) {
        document.body.insertBefore(bgElement, document.body.firstChild);
      } else {
        document.body.appendChild(bgElement);
      }

      // console.log('✅ 背景元素已创建:', bgElement);
    }
    return bgElement;
  },

  // 壁纸切换工具
  wallpaper: {
    change(background, silent = false) {
      if (!background) {
        console.warn('⚠️ 背景参数为空');
        return;
      }

      const bgElement = BlogUtils.ensureBgElement();

      try {
        if (background.charAt(0) === "#") {
          // 纯色背景
          bgElement.style.backgroundColor = background;
          bgElement.style.backgroundImage = "none";
          // console.log('🎨 设置纯色背景:', background);
        } else if (background.startsWith('data:image/')) {
          // Base64 图片背景
          bgElement.style.backgroundImage = `url("${background}")`;
          bgElement.style.backgroundColor = "";
          bgElement.style.backgroundSize = "cover";
          bgElement.style.backgroundPosition = "center";
          bgElement.style.backgroundRepeat = "no-repeat";
          // console.log('🖼️ 设置 Base64 图片背景');
        } else {
          // 网络图片背景
          let bgUrl;
          if (background.startsWith('url(')) {
            bgUrl = background;
          } else if (background.startsWith('linear-gradient') || background.startsWith('radial-gradient')) {
            bgUrl = background;
          } else {
            bgUrl = `url("${background}")`;
          }

          bgElement.style.backgroundImage = bgUrl;
          bgElement.style.backgroundColor = "";
          bgElement.style.backgroundSize = "cover";
          bgElement.style.backgroundPosition = "center";
          bgElement.style.backgroundRepeat = "no-repeat";
          console.log('🖼️ 设置网络图片背景:', bgUrl);
        }

        if (!silent) {
          BlogUtils.storage.set(BlogUtils.keys.bg, background, 1);
          console.log('💾 背景已保存到本地存储');
        }
      } catch (error) {
        console.error('❌ 背景设置失败:', error);
      }
    },

    // 清除背景
    clear() {
      BlogUtils.storage.remove(BlogUtils.keys.bg);
      this.change("#ffffff", true);
      console.log('🧹 背景已清除');
    },

    // 获取当前背景
    getCurrent() {
      return BlogUtils.storage.get(BlogUtils.keys.bg);
    }
  },

  // 加载壁纸
  loadWallpaper() {
    const savedBg = this.storage.get(this.keys.bg);
    if (savedBg) {
      // console.log('🔄 正在加载保存的背景:', savedBg);
      this.wallpaper.change(savedBg, true);
    } else {
      console.log('ℹ️ 未找到保存的背景，使用默认背景');
    }
  },
  // 增强的通知系统
  notification: {
    show(message, type = 'info', duration = 3000, options = {}) {
      const {
        showAction = false,
        actionText = 'ACTION',
        actionCallback = null
      } = options;
      if (typeof Snackbar !== 'undefined' && Snackbar.show) {
        const { position, bgLight, bgDark } = GLOBAL_CONFIG.Snackbar;
        const bg = document.documentElement.getAttribute('data-theme') === 'light' ? bgLight : bgDark;
        Snackbar.show({
          text: message,
          backgroundColor: bg,
          showAction,
          actionText,
          onActionClick: actionCallback,
          duration,
          pos: position,
          customClass: 'snackbar-css'
        });
      } else {
        this.fallbackNotification(message, type);
      }
    },
    // 带 Action 的快捷方法
    successWithAction(message, actionText, actionCallback, duration = 4000) {
      this.show(message, 'success', duration, {
        showAction: true,
        actionText,
        actionCallback
      });
    },
    errorWithAction(message, actionText, actionCallback, duration = 4000) {
      this.show(message, 'error', duration, {
        showAction: true,
        actionText,
        actionCallback
      });
    },
    // 降级通知实现
    fallbackNotification(message, type) {
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(message);
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              new Notification(message);
            }
          });
        }
      } else {
        alert(message);
      }
    }
  },
  overrideSnackbar() {
    if (!(typeof Snackbar !== 'undefined')) {
      console.warn('⚠️ Snackbar 库未找到');
      return;
    }
    const originalShow = Snackbar.show;
    Snackbar.show = function (options) {
      if (options.duration && options.duration < 2000) {
        options.duration = 2200;
      }
      if (options.duration) {
        document.documentElement.style.setProperty('--progress-duration', `${options.duration - 200}ms`);
      }
      if (options.customClass)
        options.customClass += ' snackbar-with-progress';
      else
        options.customClass = 'snackbar-with-progress';

      return originalShow.call(this, options);
    };
  },

  // 初始化
  init() {
    // console.log('🚀 BlogUtils 初始化开始');

    // 覆盖原生 Snackbar 方法
    this.overrideSnackbar();

    // 确保背景元素存在
    this.ensureBgElement();

    // 加载保存的背景
    this.loadWallpaper();

    // console.log('✅ BlogUtils 初始化完成');
  },
};




/**  
 * ------------------------  页面加载完成时初始化 ------------------------
 */
if (document.readyState === 'loading') {
  document.addEventListener("DOMContentLoaded", () => BlogUtils.init());
} else {
  BlogUtils.init();
}

window.BlogUtils = BlogUtils;

window.onscroll = percent;
function percent() {
  let a = document.documentElement.scrollTop || window.pageYOffset,
    b = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, document.body.offsetHeight, document.documentElement.offsetHeight, document.body.clientHeight, document.documentElement.clientHeight) - document.documentElement.clientHeight,
    result = Math.round(a / b * 100),
    up = document.querySelector("#go-up");

  if (up) {
    if (result <= 98) {
      up.childNodes[0].style.display = 'none';
      up.childNodes[1].style.display = 'block';
      up.childNodes[1].innerHTML = result;
    } else {
      up.childNodes[1].style.display = 'none';
      up.childNodes[0].style.display = 'block';
      up.childNodes[0].style.margin = '0 auto';
    }
  }
}
