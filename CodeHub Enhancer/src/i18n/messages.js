/* ============================================================
 * CodeHub Enhancer — i18n/messages.js
 * 中 / 英双语字典与极简翻译函数。
 * 在 popup 与 content script 中均以 window.CodeHubI18N 暴露，
 * 两者分别在自己的隔离上下文中加载本文件。
 * ============================================================ */
(function (root) {
  'use strict';

  const MSG = {
    zh: {
      'tagline': '液态玻璃代码浏览增强',
      'lang.off': '中文',
      'lang.on': 'EN',

      'tab.features': '功能开关',
      'tab.style': '样式设置',
      'tab.shortcut': '快捷键',
      'tab.about': '关于',

      'feature.fileTree': '侧边文件树',
      'feature.fileTree.desc': 'Alt+Shift+P 唤起 / 收起，支持搜索与拖拽宽度',
      'feature.quickActions': '快捷操作',
      'feature.quickActions.desc': '单文件下载、纯净复制、信息卡片、在线 IDE',
      'feature.pageClean': '页面净化',
      'feature.pageClean.desc': '隐藏推荐仓库、动态信息流等无关元素',
      'feature.codeEnhance': '代码美化',
      'feature.codeEnhance.desc': '字体、字号、主题、空白字符可视化',
      'feature.commitStats': '统计增强',
      'feature.commitStats.desc': '热力图 / 用户悬浮卡片 / 大改提交高亮',
      'feature.oiToolkit': 'OI 竞赛工具箱',
      'feature.oiToolkit.desc': '样例提取、模板复制、OI-Wiki / OJ 跳转',

      'style.blur': '玻璃模糊强度',
      'style.blur.desc': '数值越大，背景毛玻璃越模糊',
      'style.followDarkMode': '跟随深色模式',
      'style.followDarkMode.desc': '玻璃配色自动适配页面亮 / 暗主题',
      'style.fontFamily': '代码字体',
      'style.fontFamily.desc': '如 Consolas、JetBrains Mono，留空用默认',
      'style.fontFamily.ph': '字体名称',
      'style.codeFontSize': '代码字号',
      'style.codeFontSize.desc': '10 ~ 24 px',
      'style.codeTheme': '代码主题',
      'style.codeTheme.desc': '独立于平台 / 系统主题',
      'style.codeTheme.auto': '自动',
      'style.codeTheme.light': '浅色',
      'style.codeTheme.dark': '深色',
      'style.showWhitespace': '空白字符可视化',
      'style.showWhitespace.desc': '空格显示 ·，Tab 显示 →，便于排查缩进',

      'shortcut.toggle': '切换侧边文件树面板',
      'shortcut.note': '快捷键在 GitHub / Gitee / GitLab 页面生效。若与其他扩展冲突，可在浏览器地址栏打开 <span class="mono">chrome://extensions/shortcuts</span> 重新分配；关闭文件树模块后按快捷键会收到提示。',

      'about.privacy': '隐私说明',
      'about.privacy.text': '本扩展不收集任何账号信息、浏览历史或仓库内容；所有配置与临时数据仅保存在本机浏览器 <span class="mono">storage.local</span>，不连接自建服务器。权限仅限代码托管站点及其公开文件 / 接口地址，源码完全开源可审计。',
      'about.compare': '竞品对比',
      'about.changelog': '更新日志',
      'about.changelog.text': '<span class="mono">v0.1.0</span>：核心 MVP —— 液态玻璃 UI、Alt+Shift+P 快捷键、侧边文件树、单文件下载、纯净复制、基础 OI 样例提取、设置面板。',
      'about.reset': '恢复默认设置',

      'cmp.project': '项目',
      'cmp.platform': '平台',
      'cmp.oi': 'OI 工具箱',
      'cmp.ui': 'UI',
      'cmp.opensource': '开源',
      'cmp.paid': '付费',
      'cmp.octotree.ui': '传统',
      'cmp.octotree.opensource': '闭源',
      'cmp.octotree.paid': '高级功能付费',
      'cmp.refined.ui': '简约朴素',
      'cmp.refined.opensource': '开源',
      'cmp.refined.paid': '免费',
      'cmp.self.ui': 'iOS26 液态玻璃',
      'cmp.self.opensource': 'MIT',
      'cmp.self.paid': '全部免费',

      'sidebar.title': '文件树',
      'sidebar.ide': '在线 IDE 预览',
      'sidebar.close': '收起（Alt+Shift+P）',
      'sidebar.search': '搜索文件…',
      'sidebar.loadError': '文件树加载失败，可刷新页面重试',
      'sidebar.adaptFail': '文件树适配失败，已静默停用',
      'sidebar.loading': '加载文件树…',
      'sidebar.notRepo': '当前页面不是仓库文件页',
      'sidebar.empty': '暂无文件',
      'sidebar.footer': '{count} 个文件 · 分支 {branch}',
      'sidebar.copy': '复制代码',
      'sidebar.download': '下载文件',

      'toast.copied': '已复制 {name}',
      'toast.copyFail': '复制失败',
      'toast.copyFailRead': '复制失败：无法读取文件内容',
      'toast.downloaded': '已下载 {name}',
      'toast.downloadFail': '下载失败：无法读取文件内容',

      'toolbar.theme': '主题',
      'toolbar.whitespaceOn': '空白：开',
      'toolbar.whitespaceOff': '空白：关',
      'toolbar.copy': '复制代码',
      'toolbar.download': '下载文件',
      'toolbar.ide': '在线 IDE',
      'toolbar.noCode': '未找到可复制的代码',
      'toolbar.copied': '纯净代码已复制',

      'theme.auto': '自动',
      'theme.light': '浅色',
      'theme.dark': '深色',
      'toast.theme': '代码主题：{theme}',
      'toast.whitespaceOn': '空白字符可视化：开',
      'toast.whitespaceOff': '空白字符可视化：关',

      'info.repoSize': '仓库大小：{size}',
      'info.fileSize': '当前文件：{size}',
      'info.updated': '最近更新：{time}',

      'stats.contribution': '贡献',
      'stats.count': '当日贡献数：{count}',
      'stats.note': '注：逐行改动 / 文件数需逐提交接口，当前版本暂不展示',

      'msg.fileTreeDisabled': '文件树模块已关闭，请在设置面板开启',

      'hover.noRepoDesc': '（仓库暂无简介）',
      'hover.noBio': '（暂无简介）',
      'hover.followers': '关注 {followers} · 仓库 {repos}',
      'hover.profile': '个人主页',

      'oi.title': 'OI 工具箱',
      'oi.copyInput': '复制输入',
      'oi.copyOutput': '复制输出',
      'oi.inputCopied': '输入样例已复制',
      'oi.outputCopied': '输出样例已复制',
      'oi.tplCopied': '模板「{label}」已复制',
      'oi.wiki': '在 OI-Wiki 中查看该知识点',
      'oi.tpl.fastIO': '快速 IO',
      'oi.tpl.header': '万能头文件',
      'oi.tpl.sort': '排序',
      'oi.tpl.binarySearch': '二分查找',
      'oi.tpl.dfs': 'DFS 模板'
    },

    en: {
      'tagline': 'Liquid Glass code browsing enhancement',
      'lang.off': '中文',
      'lang.on': 'EN',

      'tab.features': 'Features',
      'tab.style': 'Appearance',
      'tab.shortcut': 'Shortcuts',
      'tab.about': 'About',

      'feature.fileTree': 'File tree sidebar',
      'feature.fileTree.desc': 'Toggle with Alt+Shift+P; supports search and drag-to-resize',
      'feature.quickActions': 'Quick actions',
      'feature.quickActions.desc': 'Single-file download, clean copy, info card, online IDE',
      'feature.pageClean': 'Page cleanup',
      'feature.pageClean.desc': 'Hide recommended repos, feeds and other clutter',
      'feature.codeEnhance': 'Code beautify',
      'feature.codeEnhance.desc': 'Font, size, theme, whitespace visualization',
      'feature.commitStats': 'Stats enhancement',
      'feature.commitStats.desc': 'Heatmap / user hover cards / highlight large commits',
      'feature.oiToolkit': 'OI toolkit',
      'feature.oiToolkit.desc': 'Sample extraction, template copy, OI-Wiki / OJ jump',

      'style.blur': 'Blur strength',
      'style.blur.desc': 'Higher value means more background blur',
      'style.followDarkMode': 'Follow dark mode',
      'style.followDarkMode.desc': 'Glass palette auto-adapts to light / dark themes',
      'style.fontFamily': 'Code font',
      'style.fontFamily.desc': 'e.g. Consolas, JetBrains Mono; leave empty for default',
      'style.fontFamily.ph': 'Font name',
      'style.codeFontSize': 'Code font size',
      'style.codeFontSize.desc': '10 ~ 24 px',
      'style.codeTheme': 'Code theme',
      'style.codeTheme.desc': 'Independent of platform / system theme',
      'style.codeTheme.auto': 'Auto',
      'style.codeTheme.light': 'Light',
      'style.codeTheme.dark': 'Dark',
      'style.showWhitespace': 'Whitespace visualization',
      'style.showWhitespace.desc': 'Show spaces as · and tabs as → to spot indentation',

      'shortcut.toggle': 'Toggle file tree sidebar',
      'shortcut.note': 'Shortcuts work on GitHub / Gitee / GitLab pages. If they conflict with other extensions, open <span class="mono">chrome://extensions/shortcuts</span> in the address bar to reassign them. When the file tree module is disabled, pressing the shortcut shows a hint.',

      'about.privacy': 'Privacy',
      'about.privacy.text': 'This extension does not collect any account info, browsing history or repository content; all settings and temporary data are kept in the browser\'s <span class="mono">storage.local</span>, with no self-hosted server. Permissions are limited to code-hosting sites and their public file / API endpoints, and the source code is fully open for audit.',
      'about.compare': 'Comparison',
      'about.changelog': 'Changelog',
      'about.changelog.text': '<span class="mono">v0.1.0</span>: Core MVP — Liquid Glass UI, Alt+Shift+P shortcut, file tree sidebar, single-file download, clean copy, basic OI sample extraction, settings panel.',
      'about.reset': 'Reset to defaults',

      'cmp.project': 'Project',
      'cmp.platform': 'Platform',
      'cmp.oi': 'OI Toolkit',
      'cmp.ui': 'UI',
      'cmp.opensource': 'Open Source',
      'cmp.paid': 'Paid',
      'cmp.octotree.ui': 'Traditional',
      'cmp.octotree.opensource': 'Closed source',
      'cmp.octotree.paid': 'Paid for advanced',
      'cmp.refined.ui': 'Minimal',
      'cmp.refined.opensource': 'Open source',
      'cmp.refined.paid': 'Free',
      'cmp.self.ui': 'iOS 26 Liquid Glass',
      'cmp.self.opensource': 'MIT',
      'cmp.self.paid': 'All free',

      'sidebar.title': 'File tree',
      'sidebar.ide': 'Preview in online IDE',
      'sidebar.close': 'Collapse (Alt+Shift+P)',
      'sidebar.search': 'Search files…',
      'sidebar.loadError': 'Failed to load file tree. Refresh the page to retry.',
      'sidebar.adaptFail': 'File tree adapter failed; disabled silently',
      'sidebar.loading': 'Loading file tree…',
      'sidebar.notRepo': 'This page is not a repository file page',
      'sidebar.empty': 'No files',
      'sidebar.footer': '{count} files · branch {branch}',
      'sidebar.copy': 'Copy code',
      'sidebar.download': 'Download file',

      'toast.copied': 'Copied {name}',
      'toast.copyFail': 'Copy failed',
      'toast.copyFailRead': 'Copy failed: unable to read file content',
      'toast.downloaded': 'Downloaded {name}',
      'toast.downloadFail': 'Download failed: unable to read file content',

      'toolbar.theme': 'Theme',
      'toolbar.whitespaceOn': 'Whitespace: on',
      'toolbar.whitespaceOff': 'Whitespace: off',
      'toolbar.copy': 'Copy code',
      'toolbar.download': 'Download file',
      'toolbar.ide': 'Online IDE',
      'toolbar.noCode': 'No copyable code found',
      'toolbar.copied': 'Clean code copied',

      'theme.auto': 'Auto',
      'theme.light': 'Light',
      'theme.dark': 'Dark',
      'toast.theme': 'Code theme: {theme}',
      'toast.whitespaceOn': 'Whitespace visualization: on',
      'toast.whitespaceOff': 'Whitespace visualization: off',

      'info.repoSize': 'Repo size: {size}',
      'info.fileSize': 'Current file: {size}',
      'info.updated': 'Last updated: {time}',

      'stats.contribution': 'Contribution',
      'stats.count': 'Contributions that day: {count}',
      'stats.note': 'Note: per-line changes / file counts require per-commit API; not shown in this version',

      'msg.fileTreeDisabled': 'File tree module is disabled; enable it in settings',

      'hover.noRepoDesc': '(no repository description)',
      'hover.noBio': '(no bio)',
      'hover.followers': 'Followers {followers} · Repos {repos}',
      'hover.profile': 'Profile',

      'oi.title': 'OI Toolkit',
      'oi.copyInput': 'Copy input',
      'oi.copyOutput': 'Copy output',
      'oi.inputCopied': 'Input sample copied',
      'oi.outputCopied': 'Output sample copied',
      'oi.tplCopied': 'Template "{label}" copied',
      'oi.wiki': 'View this topic on OI-Wiki',
      'oi.tpl.fastIO': 'Fast I/O',
      'oi.tpl.header': 'Universal header',
      'oi.tpl.sort': 'Sort',
      'oi.tpl.binarySearch': 'Binary search',
      'oi.tpl.dfs': 'DFS template'
    }
  };

  function translate(key, lang, params) {
    const dict = MSG[lang] || MSG.zh || {};
    let str = dict[key] != null ? dict[key] : ((MSG.zh && MSG.zh[key] != null) ? MSG.zh[key] : key);
    if (params && typeof params === 'object') {
      Object.keys(params).forEach((k) => {
        str = String(str).split('{' + k + '}').join(String(params[k]));
      });
    }
    return str;
  }

  root.CodeHubI18N = {
    MSG,
    translate,
    langOf(config) { return (config && config.language) || 'zh'; }
  };
})(typeof window !== 'undefined' ? window : this);
