/* ============================================================
 * CodeHub Enhancer — common-core.js
 * 三个平台（GitHub / Gitee / GitLab）共用的核心工具：
 * 配置读写、DOM 工具、玻璃 UI 渲染、侧边文件树、模块编排。
 * 加载顺序：本文件先于 oi-tool.js 与各平台脚本执行。
 * ============================================================ */
(function () {
  'use strict';

  // 防止重复注入
  if (window.CodeHubCore) return;
  const Core = (window.CodeHubCore = {});
  const PREFIX = '[CodeHub Enhancer]';
  const I18N = window.CodeHubI18N || { translate: (k) => k };
  Core.lang = 'zh';
  Core.t = function (key, params) { return I18N.translate(key, Core.lang, params); };
  const t = Core.t;

  /* ==================== 一、默认配置与本地存储 ==================== */

  const DEFAULTS = {
    language: 'zh',         // zh | en，默认中文，popup 右上角可切换英文
    features: {
      fileTree: true,        // 侧边文件树（Alt+Shift+P 控制）
      quickActions: true,    // 单文件下载 / 纯净复制 / 信息卡片 / 在线 IDE
      pageClean: true,       // 页面净化
      codeEnhance: true,     // 代码字体 / 字号 / 主题 / 空白可视化
      commitStats: true,     // 热力图 / 用户卡片 / 提交高亮
      oiToolkit: true        // OI 竞赛工具箱
    },
    style: {
      blur: 20,              // 玻璃模糊强度 px（18 ~ 24）
      followDarkMode: true,  // 跟随页面深色模式
      fontFamily: '',        // 自定义代码字体，空 = 浏览器默认
      codeFontSize: 14,      // 代码字号
      codeTheme: 'auto',     // auto | light | dark
      showWhitespace: false  // 空白字符可视化
    }
  };

  function deepMerge(base, override) {
    const out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
    if (!override || typeof override !== 'object') return out;
    for (const k of Object.keys(override)) {
      if (override[k] && typeof override[k] === 'object' && !Array.isArray(override[k]) &&
          base[k] && typeof base[k] === 'object') {
        out[k] = deepMerge(base[k], override[k]);
      } else {
        out[k] = override[k];
      }
    }
    return out;
  }

  const config = {
    async get() {
      try {
        const raw = await chrome.storage.local.get('codehubConfig');
        return deepMerge(DEFAULTS, raw.codehubConfig || {});
      } catch (e) {
        return deepMerge(DEFAULTS, {});
      }
    },
    async set(patch) {
      const cur = await config.get();
      const next = deepMerge(cur, patch);
      try { await chrome.storage.local.set({ codehubConfig: next }); } catch (e) { /* 本地存储不可用时静默 */ }
      return next;
    },
    async reset() {
      try { await chrome.storage.local.set({ codehubConfig: DEFAULTS }); } catch (e) {}
      return deepMerge(DEFAULTS, {});
    }
  };

  /* ==================== 二、通用工具 ==================== */

  const utils = {
    log(...a) { console.log(PREFIX, ...a); },
    warn(...a) { console.warn(PREFIX, ...a); },

    qs(sel, root) { try { return (root || document).querySelector(sel); } catch (e) { return null; } },
    qsa(sel, root) {
      try { return Array.from((root || document).querySelectorAll(sel)); } catch (e) { return []; }
    },

    debounce(fn, ms) {
      let t;
      return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
    },

    escapeHtml(s) {
      return String(s).replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      }[c]));
    },

    ext(name) {
      const i = String(name).lastIndexOf('.');
      return i >= 0 ? String(name).slice(i + 1).toLowerCase() : '';
    },

    baseName(p) { return String(p).split('/').pop(); },

    async copyText(text) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (e) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        let ok = false;
        try { ok = document.execCommand('copy'); } catch (_) {}
        ta.remove();
        return ok;
      }
    },

    downloadBlob(blob, filename) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1200);
    },

    async fetchText(url) {
      const res = await fetch(url, { credentials: 'omit' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.text();
    },

    async fetchJson(url) {
      const res = await fetch(url, { credentials: 'omit' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    },

    formatSize(bytes) {
      if (bytes == null || isNaN(bytes)) return '—';
      const units = ['B', 'KB', 'MB', 'GB'];
      let v = Number(bytes), i = 0;
      while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
      return v.toFixed(i === 0 ? 0 : 1) + ' ' + units[i];
    }
  };

  /* ==================== 三、主题识别 ==================== */

  function detectTheme(cfg) {
    if (cfg.style.codeTheme !== 'auto') return cfg.style.codeTheme;
    const mq = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
    const html = document.documentElement;
    const attrDark =
      html.getAttribute('data-color-mode') === 'dark' ||
      html.getAttribute('data-theme') === 'dark' ||
      html.classList.contains('dark') ||
      html.classList.contains('dark-theme');
    return (mq || attrDark) ? 'dark' : 'light';
  }

  /* ==================== 四、文件类型 SVG 图标 ==================== */

  const svgWrap = (inner, color = 'currentColor') =>
    `<svg viewBox="0 0 16 16" fill="${color}" width="16" height="16">${inner}</svg>`;

  const ICONS = {
    folder: svgWrap('<path d="M1.5 3.25A1.25 1.25 0 0 1 2.75 2h3.2l1.2 1.3h6.15A1.25 1.25 0 0 1 14.5 4.5v8.25A1.25 1.25 0 0 1 13.25 14H2.75A1.25 1.25 0 0 1 1.5 12.75z" opacity="0.85"/>'),
    file: svgWrap('<path d="M3 1.75h6.5L13.5 6v8.25H3z" opacity="0.7"/>'),
    cpp: svgWrap('<path d="M3 1.75h6.5L13.5 6v8.25H3z" opacity="0.55"/><text x="3" y="12" font-size="6" fill="#4f8cff" font-weight="bold">C++</text>'),
    py: svgWrap('<path d="M3 1.75h6.5L13.5 6v8.25H3z" opacity="0.55"/><text x="3" y="12" font-size="6" fill="#3776ab" font-weight="bold">Py</text>'),
    js: svgWrap('<path d="M3 1.75h6.5L13.5 6v8.25H3z" opacity="0.55"/><text x="3" y="12" font-size="6" fill="#e8c33a" font-weight="bold">JS</text>'),
    md: svgWrap('<path d="M3 1.75h6.5L13.5 6v8.25H3z" opacity="0.55"/><text x="3" y="12" font-size="6" fill="#58a6ff" font-weight="bold">M↓</text>'),
    json: svgWrap('<path d="M3 1.75h6.5L13.5 6v8.25H3z" opacity="0.55"/><text x="3" y="12" font-size="6" fill="#7fb069" font-weight="bold">{}</text>'),
    txt: svgWrap('<path d="M3 1.75h6.5L13.5 6v8.25H3z" opacity="0.55"/><path d="M5 6h6M5 8.5h6M5 11h4" stroke="currentColor" stroke-width="1" fill="none" opacity="0.8"/>'),
    image: svgWrap('<rect x="2.5" y="3" width="11" height="10" rx="1.5" opacity="0.7"/><circle cx="6" cy="6.5" r="1.2" fill="#ffb86b"/><path d="M3 12l3-3 2.5 2.5L11 9l2 3z" fill="#7fb069"/>'),
    archive: svgWrap('<path d="M3 3h10v10H3z" opacity="0.55"/><path d="M6 3v2h4V3" stroke="currentColor" fill="none" opacity="0.8"/>'),
    html: svgWrap('<path d="M3 1.75h6.5L13.5 6v8.25H3z" opacity="0.55"/><text x="3" y="12" font-size="6" fill="#e8683a" font-weight="bold">&lt;&gt;</text>')
  };

  const icons = {
    byExt(name) {
      const e = utils.ext(name);
      if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'ico', 'avif'].includes(e)) return ICONS.image;
      if (['cpp', 'cc', 'cxx', 'c', 'h', 'hpp', 'hxx'].includes(e)) return ICONS.cpp;
      if (e === 'py') return ICONS.py;
      if (['js', 'jsx', 'ts', 'tsx', 'mjs'].includes(e)) return ICONS.js;
      if (['md', 'markdown'].includes(e)) return ICONS.md;
      if (e === 'json') return ICONS.json;
      if (['txt', 'log', 'ini', 'cfg', 'env'].includes(e)) return ICONS.txt;
      if (['html', 'htm', 'css', 'vue'].includes(e)) return ICONS.html;
      if (['zip', 'tar', 'gz', 'rar', '7z', 'jar'].includes(e)) return ICONS.archive;
      return ICONS.file;
    }
  };

  /* ==================== 五、玻璃 UI：Toast / 悬浮卡片 ==================== */

  function applyGlass(rootEl, cfg) {
    rootEl.classList.add('codehub-root');
    rootEl.setAttribute('data-codehub-theme', detectTheme(cfg));
    rootEl.style.setProperty('--lg-blur', (cfg.style.blur || 20) + 'px');
  }

  function toast(message, type = 'info') {
    let host = document.getElementById('codehub-toast-host');
    if (!host) {
      host = document.createElement('div');
      host.id = 'codehub-toast-host';
      host.className = 'codehub-root';
      document.body.appendChild(host);
    }
    const el = document.createElement('div');
    el.className = 'ch-toast ch-toast--' + type;
    el.textContent = message;
    host.appendChild(el);
    requestAnimationFrame(() => el.classList.add('ch-toast--show'));
    setTimeout(() => {
      el.classList.remove('ch-toast--show');
      setTimeout(() => el.remove(), 300);
    }, 2600);
  }

  function popover({ x, y, title, desc, meta }) {
    let host = document.getElementById('codehub-popover-host');
    if (!host) {
      host = document.createElement('div');
      host.id = 'codehub-popover-host';
      host.className = 'codehub-root';
      document.body.appendChild(host);
    }
    host.innerHTML = '';
    const el = document.createElement('div');
    el.className = 'ch-popover ch-pop-in';
    el.innerHTML =
      `<div class="ch-popover-title">${utils.escapeHtml(title)}</div>` +
      (desc ? `<div class="ch-popover-desc">${utils.escapeHtml(desc)}</div>` : '') +
      (meta ? `<div class="ch-popover-meta">${utils.escapeHtml(meta)}</div>` : '');
    el.style.left = Math.min(x, window.innerWidth - 310) + 'px';
    el.style.top = Math.min(y, window.innerHeight - 130) + 'px';
    host.appendChild(el);
    setTimeout(() => el.remove(), 3200);
    return el;
  }

  const ui = { toast, popover, applyGlass };

  /* ==================== 六、侧边文件树面板 ==================== */

  class Sidebar {
    constructor(adapter, cfg) {
      this.adapter = adapter;
      this.cfg = cfg;
      this.visible = false;
      this.width = 300;
      this.flat = [];
      this.query = '';
      this.expanded = new Set();
      this.repo = null;
      this.loading = false;
      this.el = null;
      this.treeEl = null;
    }

    async init() {
      this._build();
      await this.refresh();
      this._watchNavigation();
    }

    _build() {
      const el = document.createElement('aside');
      el.id = 'codehub-sidebar';
      applyGlass(el, this.cfg);
      el.style.width = this.width + 'px';
      el.classList.add('ch-hidden');

      el.innerHTML =
        `<div class="ch-sidebar-header">
           <span class="ch-sidebar-title">${t('sidebar.title')}</span>
           <span class="ch-muted" data-role="branch"></span>
           <span class="ch-spacer"></span>
           <button class="ch-btn ch-btn--icon" data-role="ide" title="${t('sidebar.ide')}" hidden>VS Code</button>
           <button class="ch-btn ch-btn--icon" data-role="close" title="${t('sidebar.close')}">✕</button>
         </div>
         <div class="ch-sidebar-search">
           <input class="ch-input" data-role="search" type="text" placeholder="${t('sidebar.search')}" />
         </div>
         <div class="ch-sidebar-tree ch-scroll" data-role="tree"></div>
         <div class="ch-sidebar-footer" data-role="footer"></div>
         <div id="codehub-sidebar-resize"></div>`;

      document.body.appendChild(el);
      this.el = el;
      this.treeEl = el.querySelector('[data-role="tree"]');
      this.branchEl = el.querySelector('[data-role="branch"]');
      this.ideBtn = el.querySelector('[data-role="ide"]');
      this.footerEl = el.querySelector('[data-role="footer"]');

      el.querySelector('[data-role="close"]').addEventListener('click', () => this.hide());
      this.ideBtn.addEventListener('click', () => this._openIde());
      this.searchInput = el.querySelector('[data-role="search"]');
      this.searchInput.addEventListener('input', utils.debounce(() => {
        this.query = this.searchInput.value.trim().toLowerCase();
        this.render();
      }, 120));

      this._bindResize();
    }

    _bindResize() {
      const handle = this.el.querySelector('#codehub-sidebar-resize');
      let startX = 0, startW = 0;
      const onMove = (e) => {
        this.width = Math.max(220, Math.min(480, startW + (e.clientX - startX)));
        this.el.style.width = this.width + 'px';
      };
      const onUp = () => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        handle.classList.remove('ch-active');
      };
      handle.addEventListener('pointerdown', (e) => {
        startX = e.clientX;
        startW = this.el.offsetWidth;
        handle.classList.add('ch-active');
        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onUp);
      });
    }

    _watchNavigation() {
      let last = location.href;
      const check = () => {
        if (location.href !== last) { last = location.href; this.refresh(); }
      };
      window.addEventListener('popstate', check);
      setInterval(check, 1500); // SPA 跳转兜底轮询
    }

    async refresh() {
      this.repo = this.adapter.detectRepo();
      if (!this.repo) {
        this.flat = [];
        this.branchEl.textContent = '';
        this.render();
        return;
      }
      this.branchEl.textContent = this.repo.branch;
      this.ideBtn.hidden = !this.adapter.onlineIdeUrl;
      await this.load();
    }

    async load() {
      if (!this.repo) return;
      this.loading = true;
      this.render();
      try {
        const list = await this.adapter.fetchTree(this.repo);
        this.flat = Array.isArray(list) ? list : [];
      } catch (e) {
        utils.warn('文件树加载失败:', e);
        this.flat = [];
        this.loading = false;
        this.treeEl.innerHTML = '<div class="ch-tree-empty">' + t('sidebar.loadError') + '</div>';
        toast(t('sidebar.adaptFail'), 'error');
        return;
      }
      this.loading = false;
      this.render();
    }

    _buildNodeMap() {
      const root = { name: '', path: '', type: 'tree', children: new Map() };
      for (const item of this.flat) {
        const parts = item.path.split('/');
        let cur = root;
        parts.forEach((seg, idx) => {
          const isLast = idx === parts.length - 1;
          if (!cur.children.has(seg)) {
            cur.children.set(seg, {
              name: seg,
              path: item.path,
              type: isLast ? item.type : 'tree',
              children: new Map()
            });
          }
          cur = cur.children.get(seg);
        });
      }
      return root;
    }

    render() {
      if (this.loading) {
        this.treeEl.innerHTML = '<div class="ch-tree-loading"><span class="ch-spinner"></span> ' + t('sidebar.loading') + '</div>';
        return;
      }
      if (!this.repo) {
        this.treeEl.innerHTML = '<div class="ch-tree-empty">' + t('sidebar.notRepo') + '</div>';
        return;
      }
      if (!this.flat.length) {
        this.treeEl.innerHTML = '<div class="ch-tree-empty">' + t('sidebar.empty') + '</div>';
        return;
      }
      const q = this.query;
      const root = this._buildNodeMap();
      this.treeEl.innerHTML = '';
      this._renderChildren(root.children, this.treeEl, q);
      const files = this.flat.filter((i) => i.type === 'blob').length;
      this.footerEl.textContent = t('sidebar.footer', { count: files, branch: this.repo.branch });
    }

    _renderChildren(map, container, q) {
      const entries = Array.from(map.values()).sort((a, b) => {
        if (a.type !== b.type) return a.type === 'tree' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
      for (const node of entries) {
        if (q && node.type === 'blob' && !node.path.toLowerCase().includes(q)) continue;
        if (q && node.type === 'tree') {
          const hasMatch = this.flat.some((f) =>
            f.path.startsWith(node.path + '/') && f.path.toLowerCase().includes(q));
          if (!hasMatch) continue;
          this.expanded.add(node.path);
        }

        if (node.type === 'tree') {
          const row = document.createElement('div');
          const collapsed = this.expanded.has(node.path) ? '' : ' ch-collapsed';
          row.className = 'ch-tree-item ch-tree-folder' + collapsed;
          row.innerHTML =
            `<span class="ch-tree-chevron">▾</span>` +
            `<span class="ch-tree-icon">${ICONS.folder}</span>` +
            `<span class="ch-tree-name">${utils.escapeHtml(node.name)}</span>`;
          row.addEventListener('click', () => {
            if (this.expanded.has(node.path)) this.expanded.delete(node.path);
            else this.expanded.add(node.path);
            row.classList.toggle('ch-collapsed');
          });
          container.appendChild(row);
          const childWrap = document.createElement('div');
          childWrap.className = 'ch-tree-children';
          this._renderChildren(node.children, childWrap, q);
          container.appendChild(childWrap);
        } else {
          const row = document.createElement('div');
          row.className = 'ch-tree-item ch-tree-file';
          row.innerHTML =
            `<span class="ch-tree-icon">${icons.byExt(node.name)}</span>` +
            `<span class="ch-tree-name" title="${utils.escapeHtml(node.path)}">${utils.escapeHtml(node.name)}</span>` +
            `<span class="ch-tree-actions">
               <button class="ch-btn ch-btn--icon" data-act="copy" title="${t('sidebar.copy')}">⧉</button>
               <button class="ch-btn ch-btn--icon" data-act="download" title="${t('sidebar.download')}">⬇</button>
             </span>`;
          row.addEventListener('click', () => this._openFile(node.path));
          row.querySelector('[data-act="copy"]').addEventListener('click', (e) => {
            e.stopPropagation();
            this._copyFile(node.path);
          });
          row.querySelector('[data-act="download"]').addEventListener('click', (e) => {
            e.stopPropagation();
            this._downloadFile(node.path);
          });
          container.appendChild(row);
        }
      }
    }

    _openFile(path) {
      const url = this.adapter.filePageUrl(this.repo, path);
      if (url) location.href = url;
    }

    async _copyFile(path) {
      try {
        const text = await utils.fetchText(this.adapter.rawFileUrl(this.repo, path));
        const clean = text.replace(/\r\n/g, '\n').replace(/\n+$/, '');
        const ok = await utils.copyText(clean);
        toast(ok ? t('toast.copied', { name: utils.baseName(path) }) : t('toast.copyFail'), ok ? 'info' : 'error');
      } catch (e) {
        utils.warn(e);
        toast(t('toast.copyFailRead'), 'error');
      }
    }

    async _downloadFile(path) {
      try {
        const res = await fetch(this.adapter.rawFileUrl(this.repo, path), { credentials: 'omit' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const blob = await res.blob();
        utils.downloadBlob(blob, utils.baseName(path));
        toast(t('toast.downloaded', { name: utils.baseName(path) }));
      } catch (e) {
        utils.warn(e);
        toast(t('toast.downloadFail'), 'error');
      }
    }

    _openIde() {
      const url = this.adapter.onlineIdeUrl(this.repo);
      if (url) window.open(url, '_blank');
    }

    toggle(force) {
      this.visible = typeof force === 'boolean' ? force : !this.visible;
      this.el.classList.toggle('ch-hidden', !this.visible);
      if (this.visible && this.repo && !this.flat.length && !this.loading) this.load();
    }
    show() { this.toggle(true); }
    hide() { this.toggle(false); }
  }

  /* ==================== 七、代码读取 / 净化 / 美化 ==================== */

  function cleanCodeText(root) {
    if (!root) return '';
    const clone = root.cloneNode(true);
    utils.qsa('.blob-num, .line-number, [data-line-number], .react-code-linenumber, .blob-code-marker', clone)
      .forEach((n) => n.remove());
    return (clone.textContent || '').replace(/ /g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  }

  function pickCodeBlock(adapter) {
    const selectors = (adapter.selectors && adapter.selectors.codeBlocks) || [
      'article pre', '.blob-wrapper pre', '.react-code-view pre', 'pre code'
    ];
    for (const sel of selectors) {
      const el = utils.qs(sel);
      if (el) return el;
    }
    return utils.qs('pre') || null;
  }

  function applyCodeEnhance(adapter, cfg, repo) {
    const html = document.documentElement;
    html.classList.remove('codehub-code-light', 'codehub-code-dark', 'codehub-code-font');
    if (!cfg.features.codeEnhance) return;

    html.classList.add('codehub-code-font');
    if (cfg.style.fontFamily) html.style.setProperty('--ch-code-font', `"${cfg.style.fontFamily}", Consolas, monospace`);
    html.style.setProperty('--ch-code-size', cfg.style.codeFontSize + 'px');

    const theme = detectTheme(cfg);
    html.classList.add('codehub-code-' + theme);

    renderWhitespace(cfg.style.showWhitespace);
  }

  function renderWhitespace(on) {
    const root = utils.qs('article, .blob-wrapper, .react-code-view, main');
    if (!root) return;
    if (!on) {
      root.querySelectorAll('.ch-ws-space, .ch-ws-tab').forEach((sp) => sp.replaceWith(sp.textContent));
      root.querySelectorAll('[data-ws-done]').forEach((b) => delete b.dataset.wsDone);
      return;
    }
    root.querySelectorAll('code, pre, .blob-code').forEach((block) => {
      if (block.dataset.wsDone) return;
      block.dataset.wsDone = '1';
      Array.from(block.childNodes).forEach((node) => {
        if (node.nodeType !== Node.TEXT_NODE) return;
        wrapWhitespace(node);
      });
    });
  }

  function wrapWhitespace(textNode) {
    const text = textNode.textContent;
    if (!/[ \t]/.test(text)) return;
    const frag = document.createDocumentFragment();
    const parts = text.split(/([ \t]+)/g);
    parts.forEach((part) => {
      if (!part) return;
      if (/^ +$/.test(part)) {
        const s = document.createElement('span');
        s.className = 'ch-ws-space';
        s.textContent = part;
        frag.appendChild(s);
      } else if (/^\t+$/.test(part)) {
        const s = document.createElement('span');
        s.className = 'ch-ws-tab';
        s.textContent = part;
        frag.appendChild(s);
      } else {
        frag.appendChild(document.createTextNode(part));
      }
    });
    textNode.replaceWith(frag);
  }

  function applyPageClean(adapter, cfg) {
    const selectors = (adapter.selectors && adapter.selectors.cleanables) || [];
    if (!selectors.length) return;
    if (cfg.features.pageClean) {
      selectors.forEach((sel) => {
        utils.qsa(sel).forEach((el) => {
          el.dataset.codehubHidden = '1';
          el.style.display = 'none';
        });
      });
    } else {
      utils.qsa('[data-codehub-hidden]').forEach((el) => {
        delete el.dataset.codehubHidden;
        el.style.display = '';
      });
    }
  }

  /* ==================== 八、文件页工具栏 / 信息卡片 ==================== */

  function mountFileToolbar(adapter, cfg, repo) {
    if (document.getElementById('codehub-file-toolbar')) return;
    const bar = document.createElement('div');
    bar.id = 'codehub-file-toolbar';
    bar.className = 'codehub-root ch-panel ch-pop-in';
    bar.style.cssText = 'position:fixed;top:12px;right:12px;z-index:2147482990;display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:10px 12px;max-width:360px;';
    applyGlass(bar, cfg);

    const themeBtn = document.createElement('button');
    themeBtn.className = 'ch-btn';
    themeBtn.textContent = t('toolbar.theme');
    themeBtn.addEventListener('click', () => cycleTheme(adapter, cfg, repo));

    const zoomOut = document.createElement('button');
    zoomOut.className = 'ch-btn ch-btn--icon';
    zoomOut.textContent = 'A-';
    zoomOut.addEventListener('click', () => adjustFontSize(cfg, -1));

    const zoomIn = document.createElement('button');
    zoomIn.className = 'ch-btn ch-btn--icon';
    zoomIn.textContent = 'A+';
    zoomIn.addEventListener('click', () => adjustFontSize(cfg, 1));

    const wsBtn = document.createElement('button');
    wsBtn.className = 'ch-btn';
    wsBtn.textContent = t(cfg.style.showWhitespace ? 'toolbar.whitespaceOn' : 'toolbar.whitespaceOff');
    wsBtn.addEventListener('click', () => toggleWhitespace(cfg, adapter, repo));

    const copyBtn = document.createElement('button');
    copyBtn.className = 'ch-btn ch-btn--primary';
    copyBtn.textContent = t('toolbar.copy');
    copyBtn.addEventListener('click', () => copyCurrentFile(adapter, repo));

    const dlBtn = document.createElement('button');
    dlBtn.className = 'ch-btn';
    dlBtn.textContent = t('toolbar.download');
    dlBtn.addEventListener('click', () => downloadCurrentFile(adapter, repo));

    bar.appendChild(copyBtn);
    bar.appendChild(dlBtn);
    bar.appendChild(themeBtn);
    bar.appendChild(zoomOut);
    bar.appendChild(zoomIn);
    bar.appendChild(wsBtn);

    const ideUrl = adapter.onlineIdeUrl && adapter.onlineIdeUrl(repo);
    if (ideUrl) {
      const ideBtn = document.createElement('button');
      ideBtn.className = 'ch-btn';
      ideBtn.textContent = t('toolbar.ide');
      ideBtn.addEventListener('click', () => window.open(ideUrl, '_blank'));
      bar.appendChild(ideBtn);
    }

    document.body.appendChild(bar);
  }

  async function copyCurrentFile(adapter, repo) {
    const block = pickCodeBlock(adapter);
    let text = block ? cleanCodeText(block) : '';
    if (!text) {
      try { text = await utils.fetchText(adapter.rawFileUrl(repo, repo.path)); } catch (e) { text = ''; }
    }
    if (!text) { toast(t('toolbar.noCode'), 'error'); return; }
    const ok = await utils.copyText(text.replace(/\r\n/g, '\n').replace(/\n+$/, ''));
    toast(ok ? t('toolbar.copied') : t('toast.copyFail'), ok ? 'info' : 'error');
  }

  async function downloadCurrentFile(adapter, repo) {
    try {
      const res = await fetch(adapter.rawFileUrl(repo, repo.path), { credentials: 'omit' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const blob = await res.blob();
      utils.downloadBlob(blob, utils.baseName(repo.path));
      toast(t('toast.downloaded', { name: utils.baseName(repo.path) }));
    } catch (e) {
      utils.warn(e);
      toast(t('toast.downloadFail'), 'error');
    }
  }

  function cycleTheme(adapter, cfg, repo) {
    const order = ['auto', 'light', 'dark'];
    const next = order[(order.indexOf(cfg.style.codeTheme) + 1) % order.length];
    config.set({ style: Object.assign({}, cfg.style, { codeTheme: next }) }).then((c) => {
      Core.cfg = c;
      applyCodeEnhance(adapter, c, repo);
      toast(t('toast.theme', { theme: t('theme.' + next) }));
    });
  }

  function adjustFontSize(cfg, delta) {
    const size = Math.max(10, Math.min(24, cfg.style.codeFontSize + delta));
    config.set({ style: Object.assign({}, cfg.style, { codeFontSize: size }) }).then((c) => {
      Core.cfg = c;
      document.documentElement.style.setProperty('--ch-code-size', c.style.codeFontSize + 'px');
    });
  }

  function toggleWhitespace(cfg, adapter, repo) {
    const on = !cfg.style.showWhitespace;
    config.set({ style: Object.assign({}, cfg.style, { showWhitespace: on }) }).then((c) => {
      Core.cfg = c;
      renderWhitespace(c.style.showWhitespace);
      toast(on ? t('toast.whitespaceOn') : t('toast.whitespaceOff'));
    });
  }

  function mountRepoInfoCard(adapter, repo, info) {
    if (document.getElementById('codehub-repo-info')) return;
    const card = document.createElement('div');
    card.id = 'codehub-repo-info';
    card.className = 'codehub-root ch-panel ch-pop-in';
    card.style.cssText = 'position:fixed;top:12px;right:12px;z-index:2147482990;padding:10px 12px;font-size:12px;line-height:1.7;max-width:260px;';
    const theme = detectTheme(Core.cfg);
    card.setAttribute('data-codehub-theme', theme);
    const lines = [];
    if (info.repoSize != null) lines.push(t('info.repoSize', { size: utils.formatSize(info.repoSize) }));
    if (info.fileSize != null) lines.push(t('info.fileSize', { size: utils.formatSize(info.fileSize) }));
    if (info.updatedAt) lines.push(t('info.updated', { time: info.updatedAt }));
    card.innerHTML = lines.map((l) => `<div>${utils.escapeHtml(l)}</div>`).join('');
    if (!lines.length) { card.remove(); return; }
    document.body.appendChild(card);
  }

  /* ==================== 九、提交 / 仓库统计增强 ==================== */

  function initCommitStats(adapter, cfg, repo) {
    if (!cfg.features.commitStats) return;
    try {
      const heat = utils.qs(adapter.selectors.heatmap || '.js-calendar-graph, .contribution-calendar');
      if (heat) attachHeatmapHover(heat, adapter);
      highlightHeavyCommits(adapter);
      attachHoverCards(adapter, repo);
    } catch (e) {
      utils.warn('统计模块部分适配失败:', e);
    }
  }

  function attachHeatmapHover(heat) {
    const cells = utils.qsa('rect[data-date], td[data-date], td.contribution-cell', heat);
    cells.forEach((cell) => {
      cell.addEventListener('mouseenter', (e) => {
        const date = cell.getAttribute('data-date') || '';
        const count = cell.getAttribute('data-count') || cell.getAttribute('data-level') || '—';
        popover({
          x: e.clientX + 12, y: e.clientY + 12,
          title: date || t('stats.contribution'),
          desc: t('stats.count', { count }),
          meta: t('stats.note')
        });
      });
    });
  }

  function highlightHeavyCommits(adapter) {
    const commits = utils.qsa(adapter.selectors.commitList || '.commit, .commit-row, [data-testid="commit-row"]');
    commits.forEach((row) => {
      const stat = utils.qs('.diffstat, .commit-stat, [data-testid="commit-stat"]', row);
      if (!stat) return;
      const text = stat.textContent || '';
      const add = (text.match(/\+\d+/) || [])[0];
      const del = (text.match(/-\d+/) || [])[0];
      const n = (s) => s ? parseInt(s.slice(1), 10) : 0;
      if (n(add) + n(del) >= 200) row.classList.add('ch-commit-heavy');
    });
  }

  function attachHoverCards(adapter, repo) {
    // 用户名 / 仓库链接悬浮预览（最佳努力，公开接口）
    const links = utils.qsa(adapter.selectors.userLinks || 'a[href^="/"]');
    links.forEach((link) => {
      if (link.dataset.chBound) return;
      link.dataset.chBound = '1';
      link.addEventListener('mouseenter', utils.debounce(async (e) => {
        try {
          const info = await adapter.fetchHoverInfo(link.getAttribute('href') || '');
          if (!info) return;
          popover({ x: e.clientX + 12, y: e.clientY + 12, ...info });
        } catch (err) { /* 静默：取不到信息就不弹卡片 */ }
      }, 120));
    });
  }

  /* ==================== 十、模块编排与消息监听 ==================== */

  async function bootstrap(adapter) {
    const cfg = await config.get();
    Core.cfg = cfg;
    Core.lang = I18N.langOf(cfg);
    Core.repo = adapter.detectRepo();

    // 模块 1：侧边文件树
    if (cfg.features.fileTree) {
      const sidebar = new Sidebar(adapter, cfg);
      Core.sidebar = sidebar;
      try { await sidebar.init(); } catch (e) { utils.warn('文件树初始化失败:', e); }
    }

    // 模块 2：快捷操作
    if (cfg.features.quickActions) {
      if (Core.repo) {
        adapter.fetchRepoInfo(Core.repo).then((info) => {
          if (info) mountRepoInfoCard(adapter, Core.repo, info);
        }).catch((e) => utils.warn('仓库信息获取失败:', e));
        if (Core.repo.kind === 'blob') mountFileToolbar(adapter, cfg, Core.repo);
      }
    }

    // 模块 3：净化 + 代码美化
    applyPageClean(adapter, cfg);
    applyCodeEnhance(adapter, cfg, Core.repo);

    // 模块 4：统计增强
    initCommitStats(adapter, cfg, Core.repo);

    // 模块 5：OI 工具箱（由 oi-tool.js 注册 Core.oi）
    if (cfg.features.oiToolkit && Core.oi) {
      try { Core.oi.init(adapter, cfg, Core.repo); } catch (e) { utils.warn('OI 工具箱初始化失败:', e); }
    }

    // 快捷键消息（background 转发 Alt+Shift+P）
    chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
      if (msg && msg.type === 'CODEHUB_TOGGLE_SIDEBAR') {
        config.get().then((cur) => {
          if (!cur.features.fileTree) {
            toast(t('msg.fileTreeDisabled'), 'error');
            sendResponse({ ok: false, reason: 'disabled' });
            return;
          }
          if (!Core.sidebar) {
            Core.sidebar = new Sidebar(adapter, cur);
            Core.sidebar.init();
          }
          Core.sidebar.toggle();
          sendResponse({ ok: true, visible: Core.sidebar.visible });
        });
        return true; // 异步回复
      }
    });

    // 配置变化后刷新美化 / 净化
    chrome.storage.onChanged.addListener(async (changes) => {
      if (!changes.codehubConfig) return;
      Core.cfg = await config.get();
      Core.lang = I18N.langOf(Core.cfg);
      applyCodeEnhance(adapter, Core.cfg, Core.repo);
      applyPageClean(adapter, Core.cfg);
    });
  }

  // 对外暴露
  Core.config = config;
  Core.utils = utils;
  Core.icons = icons;
  Core.ui = ui;
  Core.Sidebar = Sidebar;
  Core.bootstrap = bootstrap;
  Core.detectTheme = detectTheme;
})();
