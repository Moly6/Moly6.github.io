# 个人网站设计规范 (Personal Website SPEC)

## 1. 概念与愿景

为技术博主"Magic Yuan"创建一个现代化的个人展示网站，独立于现有Hexo博客系统。网站风格融合极简主义与玻璃拟态设计语言，打造专业、有深度的个人品牌形象。整体感觉应该是：**科技感、沉浸式、现代简约**。

## 2. 设计语言

### 美学方向
- **风格**：现代极简 + 玻璃拟态(Glassmorphism)
- **参考**：Apple官网 + Stripe Dashboard
- **关键词**：深邃、科技感、层次分明、精致

### 色彩系统
```
Primary:        #6366f1 (Indigo-500)
Secondary:      #8b5cf6 (Violet-500)
Accent:         #06b6d4 (Cyan-500)
Background:     #0f0f23 (深邃蓝黑)
Surface:        #1a1a2e (卡片背景)
Surface-Light:  #16213e (悬浮层)
Text-Primary:   #f1f5f9 (Slate-100)
Text-Secondary: #94a3b8 (Slate-400)
Border:         rgba(255,255,255,0.1)
```

### 渐变强调色
```
Gradient-Primary: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)
Gradient-Glow:    radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)
```

### 排版系统
- **标题字体**：'Inter', -apple-system, BlinkMacSystemFont, sans-serif
- **正文字体**：'Inter', system-ui, sans-serif
- **代码字体**：'JetBrains Mono', 'Fira Code', monospace
- **字号比例**：12 / 14 / 16 / 18 / 24 / 32 / 48 / 64px
- **行高**：1.5 (正文), 1.2 (标题), 1.75 (长文本)

### 空间系统
- **基础单位**：4px
- **间距比例**：4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96px
- **容器最大宽度**：1200px
- **内容区最大宽度**：800px

### 动效设计
- **微交互时长**：150-300ms
- **缓动函数**：cubic-bezier(0.4, 0, 0.2, 1)
- **入场动画**：fade-in + translateY(-10px)
- **悬浮反馈**：scale(1.02) + 阴影增强
- **减少动画**：@media (prefers-reduced-motion: reduce)

### 视觉资产
- **图标**：Lucide Icons (线性风格, 24px, 1.5px描边)
- **图片策略**：WebP格式, 懒加载, 保持比例
- **装饰元素**：渐变光晕背景, 玻璃拟态卡片

## 3. 布局与结构

### 页面架构
```
/me              → 个人网站首页 (关于)
/me/skills       → 技能展示页
/me/projects     → 项目作品页
/me/contact      → 联系方式页
```

### 统一页面布局
```
┌─────────────────────────────────────┐
│  Header (固定导航栏, 64px高)         │
├─────────────────────────────────────┤
│                                     │
│  Main Content (动态高度)            │
│  - Hero Section (首页)              │
│  - Content Cards (内容卡片)          │
│                                     │
├─────────────────────────────────────┤
│  Footer (信息栏, 紧凑)               │
└─────────────────────────────────────┘
```

### 导航结构
```
[Logo/Name]     [关于] [技能] [作品] [联系]     [返回博客]
```

### 响应式策略
- **Mobile**: < 768px (单列, 触摸优化, 48px触控目标)
- **Tablet**: 768px - 1024px (双列网格)
- **Desktop**: > 1024px (完整布局)

## 4. 功能与交互

### 首页 (/me)
- **Hero区**：头像(圆形, 120px)、姓名、标语
- **简介卡片**：玻璃拟态背景, 个人描述
- **快速统计**：技能数量、项目数量、联系方式链接

### 技能页 (/me/skills)
- **技能分类**：按领域分组(WPF/.NET, Python, Web, DevOps)
- **技能展示**：进度条 + 图标 + 熟练度标签
- **交互**：悬浮显示详情

### 项目页 (/me/projects)
- **项目卡片**：封面图 + 标题 + 描述 + 技术栈标签
- **交互**：悬浮放大 + 跳转链接
- **筛选**：按技术栈筛选(可选)

### 联系页 (/me/contact)
- **联系表单**：姓名、邮箱、主题、内容
- **社交链接**：GitHub, Gitee, Email (带图标)
- **响应状态**：加载中、成功、错误反馈

### 全局交互
- **页面切换**：淡入淡出过渡
- **导航高亮**：当前页面标识
- **滚动行为**：平滑滚动

## 5. 组件清单

### 导航栏 (Navbar)
- **外观**：玻璃拟态背景(backdrop-blur), 高度64px
- **状态**：默认、悬浮(亮度增加)、当前页(下划线指示)
- **响应式**：移动端汉堡菜单

### 卡片组件 (Card)
- **外观**：圆角12px, 玻璃拟态边框, 内阴影
- **状态**：默认、悬浮(scale 1.02, 阴影增强)
- **变体**：英雄卡片(大)、标准卡片(中)、信息卡片(小)

### 按钮 (Button)
- **外观**：圆角8px, 渐变背景或描边
- **状态**：默认、悬浮(亮度+10%)、按下(scale 0.98)、禁用(opacity 0.5)
- **变体**：主要按钮(渐变)、次要按钮(描边)、图标按钮

### 技能进度条 (SkillBar)
- **外观**：圆角4px, 背景条 + 渐变填充条
- **动画**：页面入场时从0%填充到目标值
- **标签**：左侧技能名，右侧百分比

### 输入框 (Input)
- **外观**：圆角8px, 透明背景, 边框
- **状态**：默认、聚焦(边框高亮+阴影)、错误(红色边框)、禁用
- **标签**：浮动标签或上方标签

### 页脚 (Footer)
- **外观**：简洁, 深色背景, 链接列表
- **内容**：版权信息、社交链接、快速导航

## 6. 技术实现

### 目录结构
```
source/
  me/
    index.html          # 首页/关于
    skills.html         # 技能页
    projects.html       # 项目页
    contact.html        # 联系页
    css/
      me-global.css     # 全局样式
      me-home.css       # 首页样式
      me-skills.css     # 技能页样式
      me-projects.css   # 项目页样式
      me-contact.css    # 联系页样式
    js/
      me-main.js        # 主脚本
      me-components.js  # 组件脚本
    assets/
      me-avatar.png      # 头像
```

### Hexo集成
```yaml
# _config.yml
skip_render:
  - "me/**"  # 跳过Hexo渲染，独立处理
```

### 导航集成
```yaml
# _config.butterfly.yml
menu:
  首页: / || fas fa-home
  个人: /me || fas fa-user  # 新增
  分类: /categories/ || fas fa-folder-open
  ...
```

### HTML语义化
- `<header>` - 页面头部
- `<nav>` - 导航
- `<main>` - 主内容
- `<section>` - 内容区块
- `<article>` - 文章/卡片
- `<footer>` - 页脚
- `<button>` - 按钮
- `<input>` / `<textarea>` - 表单

### 无障碍(Accessibility)
- 颜色对比度 ≥ 4.5:1
- 键盘可导航
- ARIA标签
- 减少动画偏好支持

## 7. 可扩展性设计

### 预留扩展点
- `/me/resume` - 简历页
- `/me/gallery` - 作品集画廊
- `/me/blog` - 关联博客文章

### 路径扩展规则
- 所有页面位于 `/me/` 目录下
- 二级路径统一格式 `/me/[page-name]`
- 每个页面有独立CSS文件和共享全局样式
