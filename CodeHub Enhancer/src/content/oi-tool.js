/* ============================================================
 * CodeHub Enhancer — oi-tool.js
 * OI / 编程竞赛专属工具箱（差异化模块，可独立关闭）：
 * 样例提取、模板一键复制、OI-Wiki 知识点跳转、OJ 跳转。
 * 依赖 common-core.js 提供的 window.CodeHubCore。
 * ============================================================ */
(function () {
  'use strict';
  const Core = window.CodeHubCore;
  if (!Core || Core.oi) return;

  const OI = (Core.oi = {});
  const { utils, ui } = Core;
  const t = Core.t;

  const CODE_EXTS = ['cpp', 'cc', 'cxx', 'c', 'h', 'hpp', 'hxx', 'py'];

  /* ---------- 内置代码模板（一键复制） ---------- */
  const TEMPLATES = [
    {
      labelKey: 'oi.tpl.fastIO',
      lang: 'cpp',
      code: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    // TODO: 在这里写你的代码
    return 0;
}`
    },
    {
      labelKey: 'oi.tpl.header',
      lang: 'cpp',
      code: '#include <bits/stdc++.h>'
    },
    {
      labelKey: 'oi.tpl.sort',
      lang: 'cpp',
      code: `sort(a.begin(), a.end());
// 降序：sort(a.begin(), a.end(), greater<int>());`
    },
    {
      labelKey: 'oi.tpl.binarySearch',
      lang: 'cpp',
      code: `int l = 0, r = n - 1;
while (l <= r) {
    int mid = l + (r - l) / 2;
    if (check(mid)) l = mid + 1;
    else r = mid - 1;
}`
    },
    {
      labelKey: 'oi.tpl.dfs',
      lang: 'cpp',
      code: `void dfs(int u) {
    vis[u] = true;
    for (int v : g[u]) {
        if (!vis[v]) dfs(v);
    }
}`
    }
  ];

  /* ---------- OI-Wiki 知识点映射 ---------- */
  const OI_WIKI = 'https://oi-wiki.org/';
  const WIKI_MAP = {
    '单调栈': 'ds/monotonous-stack/',
    '单调队列': 'ds/monotonous-queue/',
    '动态规划': 'dp/basic/',
    'dp': 'dp/basic/',
    '背包': 'dp/knapsack/',
    '最短路': 'graph/shortest-path/',
    '二分': 'basic/binary-search/',
    '二分查找': 'basic/binary-search/',
    'dfs': 'search/dfs/',
    'bfs': 'search/bfs/',
    '并查集': 'ds/dsu/',
    '树状数组': 'ds/fenwick/',
    '线段树': 'ds/segment/',
    '快排': 'basic/sort/',
    '归并': 'basic/sort/',
    '拓扑排序': 'graph/topo/',
    '贪心': 'basic/greedy/',
    '字符串': 'string/',
    '图论': 'graph/',
    '搜索': 'search/'
  };

  /* ---------- 样例提取（启发式，从注释 / 文本中识别输入输出样例） ---------- */
  function extractSamples(code) {
    const lines = String(code || '').split('\n');
    const inputRe = /^\s*(?:\/\/|#)?\s*(输入(样例)?|Sample Input|输入[：:]?|in)\b/i;
    const outputRe = /^\s*(?:\/\/|#)?\s*(输出(样例)?|Sample Output|输出[：:]?|out)\b/i;

    let input = null, output = null;
    let mode = null; // 'input' | 'output'
    const buf = { input: [], output: [] };

    for (const line of lines) {
      if (inputRe.test(line)) { mode = 'input'; continue; }
      if (outputRe.test(line)) { mode = 'output'; continue; }
      if (!mode) continue;
      const trimmed = line.trim();
      if (!trimmed) continue;
      // 遇到下一个注释标题就停止当前块
      if (/^\s*(\/\/|#)\s*\S+[：:]/.test(line)) continue;
      buf[mode].push(line.replace(/^\s*(\/\/|#)\s*/, ''));
    }
    input = buf.input.length ? buf.input.join('\n') : null;
    output = buf.output.length ? buf.output.join('\n') : null;
    return { input, output };
  }

  /* ---------- OJ 题目识别 ---------- */
  function detectOJLinks(text) {
    const links = [];
    let m;
    const luogu = /(?:洛谷|Luogu|luogu)\s*(P\d+)/g;
    while ((m = luogu.exec(text))) {
      links.push({ label: '洛谷 ' + m[1], url: 'https://www.luogu.com.cn/problem/' + m[1] });
    }
    const cf = /(?:Codeforces|CF)\s*(\d{2,5}[A-Z]?)/g;
    while ((m = cf.exec(text))) {
      const id = m[1];
      const num = id.replace(/[A-Z]$/, '');
      const letter = id.slice(-1).toUpperCase();
      links.push({ label: 'CF ' + id, url: 'https://codeforces.com/problemset/problem/' + num + '/' + letter });
    }
    const at = /(?:AtCoder|AT)\s*((?:abc|arc|agc)\d{2,4})/gi;
    while ((m = at.exec(text))) {
      const c = m[1].toLowerCase();
      links.push({ label: 'AtCoder ' + c, url: 'https://atcoder.jp/contests/' + c + '/tasks/' + c + '_a' });
    }
    return links;
  }

  function getCodeText() {
    const selectors = ['article pre', '.blob-wrapper pre', '.react-code-view pre', 'pre code', 'pre'];
    for (const sel of selectors) {
      const el = utils.qs(sel);
      if (el && el.textContent.trim()) return el.textContent;
    }
    return '';
  }

  /* ---------- 工具箱挂载 ---------- */
  function isCodeFile(repo) {
    if (!repo || repo.kind !== 'blob') return false;
    return CODE_EXTS.includes(utils.ext(repo.path));
  }

  OI.init = function (adapter, cfg, repo) {
    if (!isCodeFile(repo)) return;
    if (document.getElementById('codehub-oi-bar')) return;

    const code = getCodeText();
    const samples = extractSamples(code);
    const ojLinks = detectOJLinks(code + '\n' + document.title);

    const bar = document.createElement('div');
    bar.id = 'codehub-oi-bar';
    bar.className = 'codehub-root ch-panel ch-pop-in';
    bar.style.cssText = 'position:fixed;top:64px;right:12px;z-index:2147482989;display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:10px 12px;max-width:360px;';
    ui.applyGlass(bar, cfg);

    const title = document.createElement('span');
    title.className = 'ch-muted';
    title.textContent = t('oi.title');
    bar.appendChild(title);

    // 样例复制
    if (samples.input) {
      const btn = document.createElement('button');
      btn.className = 'ch-btn';
      btn.textContent = t('oi.copyInput');
      btn.addEventListener('click', async () => {
        const ok = await utils.copyText(samples.input);
        ui.toast(ok ? t('oi.inputCopied') : t('toast.copyFail'), ok ? 'info' : 'error');
      });
      bar.appendChild(btn);
    }
    if (samples.output) {
      const btn = document.createElement('button');
      btn.className = 'ch-btn';
      btn.textContent = t('oi.copyOutput');
      btn.addEventListener('click', async () => {
        const ok = await utils.copyText(samples.output);
        ui.toast(ok ? t('oi.outputCopied') : t('toast.copyFail'), ok ? 'info' : 'error');
      });
      bar.appendChild(btn);
    }

    // 模板复制
    TEMPLATES.forEach((tpl) => {
      const label = t(tpl.labelKey);
      const btn = document.createElement('button');
      btn.className = 'ch-btn';
      btn.textContent = label;
      btn.addEventListener('click', async () => {
        const ok = await utils.copyText(tpl.code);
        ui.toast(ok ? t('oi.tplCopied', { label }) : t('toast.copyFail'), ok ? 'info' : 'error');
      });
      bar.appendChild(btn);
    });

    // OJ 跳转
    ojLinks.forEach((link) => {
      const btn = document.createElement('button');
      btn.className = 'ch-btn ch-btn--primary';
      btn.textContent = link.label;
      btn.addEventListener('click', () => window.open(link.url, '_blank'));
      bar.appendChild(btn);
    });

    document.body.appendChild(bar);

    // 选中关键词 → OI-Wiki 悬浮菜单
    bindWikiSelection();
  };

  function bindWikiSelection() {
    document.addEventListener('mouseup', (e) => {
      if (e.target.closest && e.target.closest('#codehub-oi-bar, #codehub-file-toolbar, .ch-popover, .ch-toast')) return;
      const sel = window.getSelection();
      const text = sel ? sel.toString().trim() : '';
      if (!text || text.length > 20) return;
      const key = Object.keys(WIKI_MAP).find((k) => k.toLowerCase() === text.toLowerCase());
      if (!key) return;
      const url = OI_WIKI + WIKI_MAP[key];
      let menu = document.getElementById('codehub-wiki-menu');
      if (!menu) {
        menu = document.createElement('div');
        menu.id = 'codehub-wiki-menu';
        menu.className = 'codehub-root ch-popover ch-pop-in';
        document.body.appendChild(menu);
      }
      menu.innerHTML = `<div class="ch-popover-title">${utils.escapeHtml(text)}</div>
        <div class="ch-popover-desc">${t('oi.wiki')}</div>`;
      menu.style.left = Math.min(e.clientX + 12, window.innerWidth - 310) + 'px';
      menu.style.top = Math.min(e.clientY + 12, window.innerHeight - 120) + 'px';
      menu.onclick = () => window.open(url, '_blank');
      setTimeout(() => menu.remove(), 3000);
    });
  }
})();
