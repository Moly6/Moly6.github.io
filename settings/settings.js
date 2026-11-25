
/**
 * 设置页面交互脚本
 * 集成 BlogUtils，提供完整的设置管理功能
 */

// 防止重复声明，如果已存在就不再重新定义
if (typeof window.SettingsManager === 'undefined') {

  var SettingsManager = class {
    constructor() {
      // 等待 BlogUtils 初始化
      if (typeof window.BlogUtils === 'undefined') {
        console.warn('⚠️ BlogUtils 未找到，等待初始化...');
        setTimeout(() => this.init(), 100);
        return;
      }

      this.blogUtils = window.BlogUtils;
      this.currentPreviewColor = null; // 当前预览的颜色
      this.settings = {
        appearance: {
          fontSize: 16,
          pageWidth: '1200px'
        },
        background: {
          type: 'color',
          color: '#ffffff',
          opacity: 100,
          image: '',
          gradient: ''
        },
        behavior: {
          smoothScroll: true,
          backToTop: true,
          readingProgress: true
        },
        performance: {
          lazyLoad: true,
          animations: true,
          preload: false
        }
      };

      this.init();
    }

    /**
     * 初始化设置管理器
     */
    init() {
      // console.log('🚀 SettingsManager 初始化开始');

      // 初始化 Coloris 颜色选择器
      this.initColorPicker();

      // 加载保存的设置（仅用于UI状态记忆）
      this.loadSettings();

      // 绑定事件监听器
      this.bindEventListeners();

      // 应用当前设置
      this.applySettings();

      // 注册到 BlogUtils
      if (this.blogUtils && this.blogUtils.settings && this.blogUtils.settings.setManager) {
        this.blogUtils.settings.setManager(this);
      }

      // 全局引用
      window.settingsManager = this;

      // console.log('✅ SettingsManager 初始化完成');
    }

    /**
     * 初始化 Coloris 颜色选择器
     */
    initColorPicker() {
      setTimeout(() => {
        if (typeof Coloris !== 'undefined') {
          Coloris.setInstance("#bgColor", {
            theme: "polaroid",
            themeMode: "auto",
            alpha: true,
            swatches: ["#c8cee6", "#c8e6d8", "#c8e4e6", "#e6c8e1", "#c8d4e6"],
            selectInput: true,
            closeButton: true,
            closeLabel: "关闭",
            clearButton: true,
            clearLabel: "清除",
            defaultColor: "#c8cee6",
            format: "hex",
          });

          const bgColorInput = document.querySelector("#bgColor");
          if (bgColorInput) {
            bgColorInput.value = "#c8cee6";
          }
          // 🔧 手动调整插入位置（如果 parent 选项不工作）
          this.moveColorisToContainer();
        }
      }, 100);
    }

    /**
     * 将颜色选择器移动到指定容器
     */
    moveColorisToContainer() {
      setTimeout(() => {
        const colorPicker = document.querySelector('.clr-picker');
        const container = document.querySelector('.settings-container');

        if (colorPicker && container && colorPicker.parentNode === document.body) {
          container.appendChild(colorPicker);
        } else {
          colorPicker?.remove();
        }
      }, 200);
    }

    /**
     * 绑定所有事件监听器
     */
    bindEventListeners() {
      // 侧边栏导航
      this.bindSidebarNavigation();

      // 外观设置
      this.bindAppearanceSettings();

      // 背景设置
      this.bindBackgroundSettings();

      // 交互设置
      this.bindBehaviorSettings();

      // 性能设置
      this.bindPerformanceSettings();

      // 数据管理
      this.bindDataManagement();

      // 底部操作
      this.bindFooterActions();

      // 响应式菜单
      this.bindResponsiveMenu();
    }

    /**
     * 侧边栏导航
     */
    bindSidebarNavigation() {
      const navItems = document.querySelectorAll('.nav-item');
      const sections = document.querySelectorAll('.settings-section');

      navItems.forEach(item => {
        item.addEventListener('click', (e) => {
          const targetSection = e.currentTarget.dataset.section;

          // 更新导航状态
          navItems.forEach(nav => nav.classList.remove('active'));
          e.currentTarget.classList.add('active');

          // 切换内容区域
          sections.forEach(section => section.classList.remove('active'));
          const targetElement = document.getElementById(targetSection);
          if (targetElement) {
            targetElement.classList.add('active');
          }

          // 平滑滚动到顶部
          document.querySelector('.settings-main').scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        });
      });
    }
    getTheme() {
      return this.blogUtils.storage.get(this.blogUtils.keys.theme);
    }
    setTheme(theme) {
      this.blogUtils.storage.set(this.blogUtils.keys.theme, theme);
    }

    /**
     * 外观设置事件绑定
     */
    bindAppearanceSettings() {
      // 主题切换 - 使用博客原生机制
      const themeButtons = document.querySelectorAll('.theme-btn');
      themeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const theme = e.currentTarget.dataset.theme;

          // 更新按钮状态
          themeButtons.forEach(b => b.classList.remove('active'));
          e.currentTarget.classList.add('active');

          // 使用博客原生的主题切换（如果存在）
          if (typeof switchTheme === 'function') {
            switchTheme();
          } else if (document.documentElement.setAttribute) {
            document.documentElement.setAttribute('data-theme', theme);
          }

          this.setTheme(theme);
          this.showNotification(`已切换到${this.getTheme()}主题`, 'success');
        });
      });

      // 字体大小
      const fontSizeSlider = document.getElementById('fontSize');
      const fontSizeValue = document.querySelector('.font-size-value');

      if (fontSizeSlider && fontSizeValue) {
        fontSizeSlider.addEventListener('input', (e) => {
          const size = parseInt(e.target.value);
          this.updateSetting('appearance', 'fontSize', size);
          fontSizeValue.textContent = `${size}px`;
          this.applyFontSize(size);
        });
      }

      // 页面宽度
      const pageWidthSelect = document.getElementById('pageWidth');
      if (pageWidthSelect) {
        pageWidthSelect.addEventListener('change', (e) => {
          const width = e.target.value;
          this.updateSetting('appearance', 'pageWidth', width);
          this.applyPageWidth(width);
          this.showNotification('页面宽度已更新', 'success');
        });
      }
    }
    /**
     * 背景设置事件绑定
     */
    bindBackgroundSettings() {
      // 背景类型选择
      const bgTypeInputs = document.querySelectorAll('input[name="bgType"]');
      bgTypeInputs.forEach(input => {
        input.addEventListener('change', (e) => {
          const type = e.target.value;
          this.toggleBackgroundControls(type);
        });
      });    // 背景颜色 - 使用 Coloris 和预览/应用机制
      const bgColorPicker = document.getElementById('bgColor');
      const previewColorBtn = document.getElementById('previewColorBtn');
      const applyColorBtn = document.getElementById('applyColorBtn');

      if (bgColorPicker) {
        // Coloris 颜色改变事件（实时预览）
        bgColorPicker.addEventListener('input', (e) => {
          const color = e.target.value;
          this.currentPreviewColor = color;
          // 实时预览，不保存到本地存储
          if (this.blogUtils) {
            this.blogUtils.wallpaper.change(color, true); // silent=true
          }
        });

        // 预览按钮
        if (previewColorBtn) {
          previewColorBtn.addEventListener('click', () => {
            const color = bgColorPicker.value;
            if (color) {
              this.currentPreviewColor = color;
              if (this.blogUtils) {
                this.blogUtils.wallpaper.change(color, true); // silent=true
                this.showNotification('预览背景颜色', 'info');
              }
            }
          });
        }

        // 应用按钮
        if (applyColorBtn) {
          applyColorBtn.addEventListener('click', () => {
            const color = bgColorPicker.value;
            if (color) {
              if (this.blogUtils) {
                this.blogUtils.wallpaper.change(color, false); // silent=false，保存到本地
                this.currentPreviewColor = null; // 清除预览状态
                this.showNotification('背景颜色已保存', 'success');
              }
            }
          });
        }
      }

      // 颜色预设 - 预览模式
      const colorPresets = document.querySelectorAll('.color-preset');
      colorPresets.forEach(preset => {
        preset.addEventListener('click', (e) => {
          const color = e.currentTarget.dataset.color;
          if (bgColorPicker) bgColorPicker.value = color;
          this.currentPreviewColor = color;

          // 实时预览，不保存
          if (this.blogUtils) {
            this.blogUtils.wallpaper.change(color, true); // silent=true
            this.showNotification('预览预设颜色，点击"应用"保存', 'info');
          }
        });
      });

      // 图片文件上传
      this.bindImageUpload();
      // 图片URL输入 - 修改为更合理的触发方式
      const bgImageUrl = document.getElementById('bgImageUrl');
      if (bgImageUrl) {
        let urlInputTimer = null;

        // 使用防抖处理，避免频繁触发
        bgImageUrl.addEventListener('input', (e) => {
          // 清除之前的定时器
          if (urlInputTimer) {
            clearTimeout(urlInputTimer);
          }

          // 延迟执行，用户停止输入后再预览
          urlInputTimer = setTimeout(async () => {
            const imageUrl = e.target.value.trim();
            if (!imageUrl) return;
            // 版本1使用方式
            const result = await this.isValidImageUrl(imageUrl);
            console.log(result);
            if (result.isValid) {
              // 预览URL图片，不保存
              if (this.blogUtils) {
                this.blogUtils.wallpaper.change(result.base64, true); // silent=true
                this.showNotification('预览图片，点击底部"保存设置"应用', 'info');
              }
            }
          }, 800); // 800ms 延迟，用户停止输入后才触发
        });

        // 也可以监听回车键立即预览
        bgImageUrl.addEventListener('keypress', async (e) => {
          if (e.key === 'Enter') {
            const imageUrl = e.target.value.trim();

            if (!imageUrl) return;
            // 版本1使用方式
            const result = await this.isValidImageUrl(imageUrl);
            if (result.isValid) {
              // 预览URL图片，不保存
              if (this.blogUtils) {
                this.blogUtils.wallpaper.change(result.base64, true); // silent=true
                this.showNotification('预览图片，点击底部"保存设置"应用', 'info');
              }
            }
          }
        });

      }


      // 清除背景按钮
      const clearBgBtn = document.getElementById('clearBackground');
      if (clearBgBtn) {
        clearBgBtn.addEventListener('click', () => {
          if (this.blogUtils) {
            this.blogUtils.wallpaper.clear();
            this.showNotification('背景已清除', 'success');
          }
        });
      }

      // 背景透明度（保留原有功能）
      const opacitySlider = document.getElementById('bgOpacity');
      const opacityValue = document.querySelector('.opacity-value');

      if (opacitySlider && opacityValue) {
        opacitySlider.addEventListener('input', (e) => {
          const opacity = parseInt(e.target.value);
          opacityValue.textContent = `${opacity}%`;
          this.applyBackgroundOpacity(opacity);
        });
      }
    }
    /**
     * 验证图片URL并返回验证结果和base64
     * @param {string} url 图片URL
     * @returns {Promise<{isValid: boolean, base64?: string}>}
     */
    async isValidImageUrl(url) {
      try {
        if (!this.isValidUrl(url)) {
          return { isValid: false };
        }

        return new Promise((resolve) => {
          const img = new Image();

          img.onload = () => {
            // 图片加载成功，转换为base64
            this.convertImageToBase64(img)
              .then(base64 => {
                resolve({ isValid: true, base64 });
              })
              .catch(() => {
                resolve({ isValid: true, base64: url }); // 转换失败但图片有效，返回原URL
              });
          };

          img.onerror = () => {
            resolve({ isValid: false });
          };

          // 设置超时
          setTimeout(() => {
            resolve({ isValid: false });
          }, 5000); // 5秒超时

          img.src = url;
        });
      } catch {
        return { isValid: false };
      }
    }

    /**
     * 将Image对象转换为base64
     */
    convertImageToBase64(img) {
      return new Promise((resolve, reject) => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // 设置canvas尺寸
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;

          // 绘制图片
          ctx.drawImage(img, 0, 0);

          // 转换为base64
          const base64 = canvas.toDataURL('image/jpeg', 0.8);
          resolve(base64);
        } catch (error) {
          reject(error);
        }
      });
    }

    // 检查URL格式
    isValidUrl(url) {
      try {
        new URL(url);
        return true;
      } catch (e) {
        return false;
      }
    }
    /**
     * 绑定图片上传功能
     */
    bindImageUpload() {
      const uploadBtn = document.getElementById('uploadImageBtn');
      const fileInput = document.getElementById('bgImageFile');
      const preview = document.getElementById('imagePreview');
      const previewImg = document.getElementById('previewImg');
      const removeBtn = document.getElementById('removeImageBtn');

      if (!uploadBtn || !fileInput || !preview || !previewImg || !removeBtn) {
        console.warn('⚠️ 图片上传元素未找到');
        return;
      }

      // 点击上传按钮
      uploadBtn.addEventListener('click', () => {
        fileInput.click();
      });

      // 文件选择
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 验证文件类型
        if (!file.type.startsWith('image/')) {
          this.showNotification('请选择图片文件', 'error');
          return;
        }

        // 验证文件大小（限制 5MB）
        // if (file.size > 5 * 1024 * 1024) {
        //   this.showNotification('图片文件不能超过 5MB', 'error');
        //   return;
        // }

        // 转换为 base64
        this.convertImageToBase64(file)
          .then(base64 => {
            // 显示预览
            previewImg.src = base64;
            if (previewImg.parentElement.tagName.toLowerCase() === 'a') {
              previewImg.parentElement.href = base64;
            }
            preview.style.display = 'flex';
            uploadBtn.innerHTML = '<i class="fas fa-upload"></i> 重新选择';

            // 预览背景，不保存到本地
            if (this.blogUtils) {
              this.blogUtils.wallpaper.change(base64, true); // silent=true
              this.showNotification('图片预览中，点击底部"保存设置"应用', 'info');
            }
          })
          .catch(error => {
            console.error('❌ 图片转换失败:', error);
            this.showNotification('图片处理失败', 'error');
          });
      });

      // 移除图片
      removeBtn.addEventListener('click', () => {
        fileInput.value = '';
        preview.style.display = 'none';
        uploadBtn.innerHTML = '<i class="fas fa-upload"></i> 选择图片';

        if (this.blogUtils) {
          this.blogUtils.wallpaper.clear();
          this.showNotification('背景图片已移除', 'success');
        }
      });
    }

    /**
     * 将图片文件转换为 base64
     */
    convertImageToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
          try {
            // 可选：压缩图片
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');

              // 设置最大尺寸
              const maxWidth = 1920;
              const maxHeight = 1080;

              let { width, height } = img;

              // 计算缩放比例
              if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width *= ratio;
                height *= ratio;
              }

              canvas.width = width;
              canvas.height = height;

              // 绘制并转换
              ctx.drawImage(img, 0, 0, width, height);
              const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
              resolve(compressedBase64);
            };

            img.onerror = () => reject(new Error('图片加载失败'));
            img.src = reader.result;
          } catch (error) {
            reject(error);
          }
        };

        reader.onerror = () => reject(new Error('文件读取失败'));
        reader.readAsDataURL(file);
      });
    }

    /**
     * 交互设置事件绑定
     */
    bindBehaviorSettings() {
      const toggles = [
        { id: 'smoothScroll', setting: 'smoothScroll', apply: this.applySmoothScroll },
        { id: 'backToTop', setting: 'backToTop', apply: this.applyBackToTop },
        { id: 'readingProgress', setting: 'readingProgress', apply: this.applyReadingProgress }
      ];

      toggles.forEach(({ id, setting, apply }) => {
        const toggle = document.getElementById(id);
        if (toggle) {
          toggle.addEventListener('change', (e) => {
            const enabled = e.target.checked;
            this.updateSetting('behavior', setting, enabled);
            apply.call(this, enabled);
            this.showNotification(`${setting}已${enabled ? '启用' : '禁用'}`, 'info');
          });
        }
      });
    }

    /**
     * 性能设置事件绑定
     */
    bindPerformanceSettings() {
      const toggles = [
        { id: 'lazyLoad', setting: 'lazyLoad' },
        { id: 'animations', setting: 'animations' },
        { id: 'preload', setting: 'preload' }
      ];

      toggles.forEach(({ id, setting }) => {
        const toggle = document.getElementById(id);
        if (toggle) {
          toggle.addEventListener('change', (e) => {
            const enabled = e.target.checked;
            this.updateSetting('performance', setting, enabled);
            this.showNotification(`${setting}已${enabled ? '启用' : '禁用'}`, 'info');
          });
        }
      });
    }

    /**
     * 数据管理事件绑定
     */
    bindDataManagement() {
      // 清除本地存储
      const clearBtn = document.getElementById('clearLocalStorage');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          this.showConfirmDialog(
            '确认清除数据？',
            '这将删除所有保存的设置，操作不可恢复。',
            () => {
              this.clearLocalStorage();
              this.showNotification('本地数据已清除', 'success');
            }
          );
        });
      }

      // 导出设置
      const exportBtn = document.getElementById('exportSettings');
      if (exportBtn) {
        exportBtn.addEventListener('click', () => {
          this.exportSettings();
        });
      }

      // 导入设置
      const importBtn = document.getElementById('importSettings');
      const importFile = document.getElementById('importFile');

      if (importBtn && importFile) {
        importBtn.addEventListener('click', () => {
          importFile.click();
        });

        importFile.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (file) {
            this.importSettings(file);
          }
        });
      }
    }

    /**
     * 底部操作事件绑定
     */
    bindFooterActions() {
      // 重置设置
      const resetBtn = document.getElementById('resetSettings');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          this.showConfirmDialog(
            '确认重置所有设置？',
            '这将恢复所有设置到默认值，当前设置将丢失。',
            () => {
              this.resetSettings();
              this.showNotification('设置已重置', 'success');
            }
          );
        });
      }

      // 保存设置
      const saveBtn = document.getElementById('saveSettings');
      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          // 如果有预览的背景，先应用并保存
          const bgColorPicker = document.getElementById('bgColor');
          const bgImageUrl = document.getElementById('bgImageUrl');
          const previewImg = document.getElementById('previewImg');

          // 保存颜色背景
          if (bgColorPicker && this.currentPreviewColor) {
            if (this.blogUtils) {
              this.blogUtils.wallpaper.change(this.currentPreviewColor, false); // 保存到本地
              this.currentPreviewColor = null; // 清除预览状态
            }
          }

          // 保存URL图片背景
          if (bgImageUrl && bgImageUrl.value) {
            if (this.blogUtils) {
              this.blogUtils.wallpaper.change(bgImageUrl.value, false); // 保存到本地
            }
          }

          // 保存上传的图片背景
          if (previewImg && previewImg.src && previewImg.src.startsWith('data:image/')) {
            if (this.blogUtils) {
              this.blogUtils.wallpaper.change(previewImg.src, false); // 保存到本地
            }
          }

          this.saveSettings();
          this.showNotification('所有设置已保存', 'success');
        });
      }
    }

    /**
     * 响应式菜单绑定
     */
    bindResponsiveMenu() {
      const mobileToggle = document.getElementById('mobileMenuToggle');
      const sidebar = document.querySelector('.settings-sidebar');
      const overlay = document.getElementById('settingsOverlay');

      if (mobileToggle && sidebar && overlay) {
        // 移动端菜单切换
        mobileToggle.addEventListener('click', () => {
          sidebar.classList.toggle('mobile-open');
          overlay.classList.toggle('active');
          document.body.style.overflow = sidebar.classList.contains('mobile-open') ? 'hidden' : '';
        });

        // 点击遮罩层关闭菜单
        overlay.addEventListener('click', () => {
          sidebar.classList.remove('mobile-open');
          overlay.classList.remove('active');
          document.body.style.overflow = '';
        });

        // 响应窗口大小变化
        window.addEventListener('resize', () => {
          if (window.innerWidth > 768) {
            sidebar.classList.remove('mobile-open');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
          }
        });
      }
    }

    /**
     * 更新设置值
     */
    updateSetting(category, key, value) {
      if (this.settings[category]) {
        this.settings[category][key] = value;
      }
    }

    /**
     * 应用所有设置
     */
    applySettings() {
      const { appearance, behavior } = this.settings;

      // 应用外观设置（不包括背景） 
      this.applyFontSize(appearance.fontSize);
      this.applyPageWidth(appearance.pageWidth);

      // 应用交互设置
      this.applySmoothScroll(behavior.smoothScroll);
      this.applyBackToTop(behavior.backToTop);
      this.applyReadingProgress(behavior.readingProgress);

      // 更新UI状态
      this.updateUIFromSettings();
    }

    /**
     * 从设置更新UI状态
     */
    updateUIFromSettings() {
      const { appearance, background, behavior, performance } = this.settings;

      // 更新主题按钮
      document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === this.getTheme());
      });

      // 更新字体大小滑块
      const fontSizeSlider = document.getElementById('fontSize');
      const fontSizeValue = document.querySelector('.font-size-value');
      if (fontSizeSlider && fontSizeValue) {
        fontSizeSlider.value = appearance.fontSize;
        fontSizeValue.textContent = `${appearance.fontSize}px`;
      }

      // 更新页面宽度选择
      const pageWidthSelect = document.getElementById('pageWidth');
      if (pageWidthSelect) {
        pageWidthSelect.value = appearance.pageWidth;
      }

      // 更新背景设置
      document.querySelectorAll('input[name="bgType"]').forEach(input => {
        input.checked = input.value === background.type;
      });

      const bgColorPicker = document.getElementById('bgColor');
      if (bgColorPicker) bgColorPicker.value = background.color;

      const opacitySlider = document.getElementById('bgOpacity');
      const opacityValue = document.querySelector('.opacity-value');
      if (opacitySlider && opacityValue) {
        opacitySlider.value = background.opacity;
        opacityValue.textContent = `${background.opacity}%`;
      }

      // 更新开关状态
      const toggles = [
        { id: 'smoothScroll', value: behavior.smoothScroll },
        { id: 'backToTop', value: behavior.backToTop },
        { id: 'readingProgress', value: behavior.readingProgress },
        { id: 'lazyLoad', value: performance.lazyLoad },
        { id: 'animations', value: performance.animations },
        { id: 'preload', value: performance.preload }
      ];

      toggles.forEach(({ id, value }) => {
        const toggle = document.getElementById(id);
        if (toggle) toggle.checked = value;
      });
    }


    /**
     * 应用字体大小
     */
    applyFontSize(size) {
      document.documentElement.style.setProperty('--base-font-size', `${size}px`);
    }

    /**
     * 应用页面宽度
     */
    applyPageWidth(width) {
      document.documentElement.style.setProperty('--page-max-width', width);
    }

    /**
     * 应用背景设置
     */
    applyBackground() {
      const { type, color, opacity, image, gradient } = this.settings.background;

      if (window.BlogUtils && window.BlogUtils.wallpaper) {
        switch (type) {
          case 'color':
            window.BlogUtils.wallpaper.change(color, true);
            break;
          case 'image':
            if (image) window.BlogUtils.wallpaper.change(image, true);
            break;
          case 'gradient':
            if (gradient) window.BlogUtils.wallpaper.change(gradient, true);
            break;
        }
      }
    }

    /**
     * 应用背景颜色
     */
    applyBackgroundColor(color) {
      if (window.BlogUtils && window.BlogUtils.wallpaper) {
        window.BlogUtils.wallpaper.change(color, true);
      }
    }

    /**
     * 应用背景透明度
     */
    applyBackgroundOpacity(opacity) {
      const bgElement = document.getElementById('web_bg');
      if (bgElement) {
        bgElement.style.opacity = opacity / 100;
      }
    }

    /**
     * 应用平滑滚动
     */
    applySmoothScroll(enabled) {
      document.documentElement.style.scrollBehavior = enabled ? 'smooth' : 'auto';
    }

    /**
     * 应用返回顶部按钮
     */
    applyBackToTop(enabled) {
      const backToTopBtn = document.getElementById('go-up');
      if (backToTopBtn) {
        backToTopBtn.style.display = enabled ? '' : 'none';
      }
    }

    /**
     * 应用阅读进度条
     */
    applyReadingProgress(enabled) {
      // 这里可以添加阅读进度条的显示/隐藏逻辑
      // console.log(`阅读进度条已${enabled ? '启用' : '禁用'}`);
    }

    /**
     * 切换背景控制显示
     */
    toggleBackgroundControls(type) {
      const colorSetting = document.querySelector('.bg-color-setting');
      const imageSetting = document.querySelector('.bg-image-setting');
      const urlSetting = document.querySelector('.bg-url-setting');

      // 隐藏所有设置
      if (colorSetting) colorSetting.style.display = 'none';
      if (imageSetting) imageSetting.style.display = 'none';
      if (urlSetting) urlSetting.style.display = 'none';

      // 显示对应的设置
      switch (type) {
        case 'color':
          if (colorSetting) colorSetting.style.display = 'flex';
          break;
        case 'image':
          if (imageSetting) imageSetting.style.display = 'flex';
          if (urlSetting) urlSetting.style.display = 'flex';
          break;
        case 'gradient':
          // 将来可以添加渐变设置
          break;
      }
    }


    /**
     * 显示通知
     */
    showNotification(message, type = 'info') {
      if (window.BlogUtils && window.BlogUtils.notification) {
        window.BlogUtils.notification.show(message, type);
      } else {
        console.log(`[${type.toUpperCase()}] ${message}`);
      }
    }

    /**
     * 显示确认对话框
     */
    showConfirmDialog(title, message, onConfirm) {
      const confirmed = confirm(`${title}\n\n${message}`);
      if (confirmed && onConfirm) {
        onConfirm();
      }
    }

    /**
     * 加载保存的设置
     */
    loadSettings() {
      try {
        // 优先使用 BlogUtils.storage
        if (this.blogUtils && this.blogUtils.storage) {
          const saved = this.blogUtils.storage.get('blog-settings');
          if (saved) {
            this.settings = { ...this.settings, ...saved };
            console.log('✅ 设置已从 BlogUtils.storage 加载', this.settings);
            return;
          }
        }

        // 降级到 localStorage
        const saved = localStorage.getItem('blog-settings');
        if (saved) {
          const parsedSettings = JSON.parse(saved);
          this.settings = { ...this.settings, ...parsedSettings };
          console.log('✅ 设置已从 localStorage 加载', this.settings);
        }
      } catch (error) {
        console.warn('⚠️ 设置加载失败:', error);
      }
    }

    /**
     * 保存设置
     */
    saveSettings() {
      try {
        // 优先使用 BlogUtils.storage（7天过期）
        if (this.blogUtils && this.blogUtils.storage) {
          this.blogUtils.storage.set('blog-settings', this.settings, 7);
          console.log('💾 设置已保存到 BlogUtils.storage');
        } else {
          // 降级到 localStorage
          localStorage.setItem('blog-settings', JSON.stringify(this.settings));
          console.log('💾 设置已保存到 localStorage');
        }
      } catch (error) {
        console.error('❌ 设置保存失败:', error);
        this.showNotification('设置保存失败', 'error');
      }
    }

    /**
     * 重置设置
     */
    resetSettings() {
      this.settings = {
        appearance: {
          theme: 'light',
          fontSize: 16,
          pageWidth: '1200px'
        },
        background: {
          type: 'color',
          color: '#ffffff',
          opacity: 100,
          image: '',
          gradient: ''
        },
        behavior: {
          smoothScroll: true,
          backToTop: true,
          readingProgress: true
        },
        performance: {
          lazyLoad: true,
          animations: true,
          preload: false
        }
      };

      this.applySettings();
      this.saveSettings();
    }

    /**
     * 清除本地存储
     */
    clearLocalStorage() {
      try {
        // 使用 BlogUtils.storage 清除
        if (this.blogUtils && this.blogUtils.storage) {
          this.blogUtils.storage.remove('blog-settings');
          console.log('🧹 设置已从 BlogUtils.storage 清除');
        }

        // 同时清除 localStorage
        localStorage.removeItem('blog-settings');
        console.log('🧹 本地存储已清除');

        this.showNotification('本地存储已清除', 'success');
      } catch (error) {
        console.error('❌ 清除失败:', error);
        this.showNotification('清除失败', 'error');
      }
    }

    /**
     * 导出设置
     */
    exportSettings() {
      try {
        const dataStr = JSON.stringify(this.settings, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `blog-settings-${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        this.showNotification('设置已导出', 'success');
      } catch (error) {
        console.error('❌ 导出失败:', error);
        this.showNotification('导出失败', 'error');
      }
    }

    /**
     * 导入设置
     */
    importSettings(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target.result);
          this.settings = { ...this.settings, ...importedSettings };
          this.applySettings();
          this.saveSettings();
          this.showNotification('设置已导入', 'success');
        } catch (error) {
          console.error('❌ 导入失败:', error);
          this.showNotification('导入失败，请检查文件格式', 'error');
        }
      };
      reader.readAsText(file);
    }
  };

  // 将 SettingsManager 挂载到 window 对象上
  window.SettingsManager = SettingsManager;

} // 结束条件声明块
window.settingsManager = new SettingsManager();

