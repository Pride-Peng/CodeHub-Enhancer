/* ============================================================
 * CodeHub Enhancer — gitee.js
 * Gitee 平台适配：仓库 / 分支识别、公开 API 文件树、原始文件地址、
 * 仓库信息、悬浮卡片。通用逻辑全部复用 common-core.js。
 * ============================================================ */
(function () {
  'use strict';
  const Core = window.CodeHubCore;
  if (!Core) return;
  const { utils } = Core;
  const t = Core.t;

  const adapter = {
    name: 'gitee',

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

    /* Gitee 公开 Git Trees API（兼容数组 / 对象两种返回形态） */
    async fetchTree(repo) {
      const url = `https://gitee.com/api/v5/repos/${repo.owner}/${repo.repo}/git/trees/${encodeURIComponent(repo.branch)}?recursive=1`;
      const data = await utils.fetchJson(url);
      const arr = Array.isArray(data) ? data : (data.tree || []);
      return arr
        .filter((n) => n.type === 'blob' || n.type === 'tree')
        .map((n) => ({ path: n.path, type: n.type, size: n.size }));
    },

    rawFileUrl(repo, path) {
      return `https://gitee.com/${repo.owner}/${repo.repo}/raw/${repo.branch}/${path}`;
    },

    filePageUrl(repo, path) {
      return `https://gitee.com/${repo.owner}/${repo.repo}/blob/${repo.branch}/${path}`;
    },

    onlineIdeUrl(repo) {
      return `https://gitee1s.com/${repo.owner}/${repo.repo}/tree/${repo.branch}`;
    },

    async fetchRepoInfo(repo) {
      const d = await utils.fetchJson(`https://gitee.com/api/v5/repos/${repo.owner}/${repo.repo}`);
      return {
        repoSize: d.size != null ? d.size * 1024 : null,
        fileSize: null,
        updatedAt: d.updated_at ? new Date(d.updated_at).toLocaleString() : null
      };
    },

    async fetchHoverInfo(href) {
      const parts = href.replace(/^\//, '').split('?')[0].split('/');
      if (parts.length === 2) {
        const d = await utils.fetchJson(`https://gitee.com/api/v5/repos/${parts[0]}/${parts[1]}`);
        return {
          title: `${parts[0]}/${parts[1]}`,
          desc: d.description || t('hover.noRepoDesc'),
          meta: `Star ${d.stargazers_count != null ? d.stargazers_count : '—'}`
        };
      }
      if (parts.length === 1 && parts[0]) {
        const d = await utils.fetchJson(`https://gitee.com/api/v5/users/${parts[0]}`);
        return {
          title: d.name || parts[0],
          desc: d.bio || t('hover.noBio'),
          meta: t('hover.followers', { followers: d.followers != null ? d.followers : '—', repos: d.public_repos != null ? d.public_repos : '—' })
        };
      }
      return null;
    },

    selectors: {
      codeBlocks: ['.file-content pre', 'article pre', 'pre code'],
      cleanables: ['.recommend-list', '.news-feed', '.repo-recommend'],
      heatmap: '.contrib-calendar, .js-calendar-graph',
      commitList: '.commit-item, .commit-row',
      userLinks: 'a[href^="/"]'
    }
  };

  Core.bootstrap(adapter);
})();
