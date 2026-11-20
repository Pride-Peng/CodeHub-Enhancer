/* ============================================================
 * CodeHub Enhancer — github.js
 * GitHub 平台适配：仓库 / 分支识别、公开 API 文件树、原始文件地址、
 * 仓库信息、悬浮卡片。通用逻辑全部复用 common-core.js。
 * ============================================================ */
(function () {
  'use strict';
  const Core = window.CodeHubCore;
  if (!Core) return;
  const { utils } = Core;
  const t = Core.t;

  const adapter = {
    name: 'github',

    /* 解析当前仓库 / 分支 / 文件路径 */
    detectRepo() {
      const m = location.pathname.match(
        /^\/([^/]+)\/([^/]+)(\/(tree|blob)\/([^/]+)(\/(.*))?)?/
      );
      if (!m) return null;
      const owner = decodeURIComponent(m[1]);
      const repo = decodeURIComponent(m[2]);
      const kind = m[4] === 'blob' ? 'blob' : (m[4] === 'tree' ? 'tree' : 'repo');
      const branch = decodeURIComponent(m[6] || 'HEAD');
      const path = m[8] ? decodeURIComponent(m[8]) : '';
      return { owner, repo, branch, path, kind };
    },

    /* 递归文件树（GitHub 公开 Git Trees API） */
    async fetchTree(repo) {
      const url = `https://api.github.com/repos/${repo.owner}/${repo.repo}/git/trees/${encodeURIComponent(repo.branch)}?recursive=1`;
      const data = await utils.fetchJson(url);
      return (data.tree || [])
        .filter((n) => n.type === 'blob' || n.type === 'tree')
        .map((n) => ({ path: n.path, type: n.type, size: n.size }));
    },

    rawFileUrl(repo, path) {
      return `https://raw.githubusercontent.com/${repo.owner}/${repo.repo}/${repo.branch}/${path}`;
    },

    filePageUrl(repo, path) {
      return `https://github.com/${repo.owner}/${repo.repo}/blob/${repo.branch}/${path}`;
    },

    onlineIdeUrl(repo) {
      return `https://github1s.com/${repo.owner}/${repo.repo}/tree/${repo.branch}`;
    },

    /* 仓库信息（公开仓库对象） */
    async fetchRepoInfo(repo) {
      const d = await utils.fetchJson(`https://api.github.com/repos/${repo.owner}/${repo.repo}`);
      return {
        repoSize: d.size ? d.size * 1024 : null, // GitHub size 字段单位为 KB
        fileSize: null,
        updatedAt: d.updated_at ? new Date(d.updated_at).toLocaleString() : null
      };
    },

    /* 悬浮卡片：仓库 / 用户 */
    async fetchHoverInfo(href) {
      const parts = href.replace(/^\//, '').split('?')[0].split('/');
      if (parts.length === 2) {
        const d = await utils.fetchJson(`https://api.github.com/repos/${parts[0]}/${parts[1]}`);
        return {
          title: `${parts[0]}/${parts[1]}`,
          desc: d.description || t('hover.noRepoDesc'),
          meta: `Star ${d.stargazers_count != null ? d.stargazers_count : '—'}`
        };
      }
      if (parts.length === 1 && parts[0]) {
        const d = await utils.fetchJson(`https://api.github.com/users/${parts[0]}`);
        return {
          title: d.name || parts[0],
          desc: d.bio || t('hover.noBio'),
          meta: t('hover.followers', { followers: d.followers != null ? d.followers : '—', repos: d.public_repos != null ? d.public_repos : '—' })
        };
      }
      return null;
    },

    selectors: {
      codeBlocks: ['article pre', '.blob-wrapper pre', 'pre code'],
      cleanables: ['.js-recommendation', '[data-testid="recommendations"]', '.repo-list'],
      heatmap: '.js-calendar-graph, .react-calendar-graph',
      commitList: '.commit-list .commit, [data-testid="commit-row"]',
      userLinks: 'a[href^="/"]'
    }
  };

  Core.bootstrap(adapter);
})();
