/* ============================================================
 * CodeHub Enhancer — gitlab.js
 * GitLab 平台适配：支持分组嵌套路径 /-/tree、/-/blob，公开 API 文件树、
 * 原始文件地址、仓库信息、悬浮卡片。通用逻辑复用 common-core.js。
 * ============================================================ */
(function () {
  'use strict';
  const Core = window.CodeHubCore;
  if (!Core) return;
  const { utils } = Core;
  const t = Core.t;

  function projectPathFromParts(parts) {
    return parts.join('/');
  }

  const adapter = {
    name: 'gitlab',

    detectRepo() {
      const path = location.pathname;
      const m = path.match(/^\/(.+?)\/-\/(tree|blob)\/([^/]+)(\/(.*))?/);
      if (m) {
        const fullPath = decodeURIComponent(m[1]);
        const kind = m[2] === 'blob' ? 'blob' : 'tree';
        const branch = decodeURIComponent(m[3]);
        const subPath = m[5] ? decodeURIComponent(m[5]) : '';
        const seg = fullPath.split('/');
        return {
          fullPath,
          owner: seg[0],
          repo: seg[seg.length - 1],
          branch,
          path: subPath,
          kind
        };
      }
      // 裸项目页：/group/sub/repo
      const bare = path.match(/^\/([^/]+(?:\/[^/]+)+)$/);
      if (bare) {
        const fullPath = decodeURIComponent(bare[1]);
        const seg = fullPath.split('/');
        return {
          fullPath,
          owner: seg[0],
          repo: seg[seg.length - 1],
          branch: 'HEAD',
          path: '',
          kind: 'repo'
        };
      }
      return null;
    },

    /* GitLab 公开 Repository Tree API（分组路径需 URL 编码） */
    async fetchTree(repo) {
      const enc = encodeURIComponent(repo.fullPath);
      const url = `https://gitlab.com/api/v4/projects/${enc}/repository/tree?ref=${encodeURIComponent(repo.branch)}&recursive=true&per_page=100`;
      const arr = await utils.fetchJson(url);
      return (Array.isArray(arr) ? arr : [])
        .filter((n) => n.type === 'tree' || n.type === 'blob')
        .map((n) => ({ path: n.path, type: n.type, size: n.size }));
    },

    rawFileUrl(repo, path) {
      return `https://gitlab.com/${repo.fullPath}/-/raw/${repo.branch}/${path}`;
    },

    filePageUrl(repo, path) {
      return `https://gitlab.com/${repo.fullPath}/-/blob/${repo.branch}/${path}`;
    },

    /* GitLab 无广泛可用的 1s 在线 IDE 服务，此处不提供跳转按钮 */
    onlineIdeUrl() {
      return null;
    },

    async fetchRepoInfo(repo) {
      const enc = encodeURIComponent(repo.fullPath);
      const d = await utils.fetchJson(`https://gitlab.com/api/v4/projects/${enc}`);
      const size = d.statistics ? d.statistics.repository_size : null;
      return {
        repoSize: size,
        fileSize: null,
        updatedAt: d.updated_at || d.last_activity_at
          ? new Date(d.updated_at || d.last_activity_at).toLocaleString() : null
      };
    },

    async fetchHoverInfo(href) {
      const clean = href.replace(/^\//, '').split('?')[0];
      // 项目链接通常是 /group/sub/repo
      if (clean && !clean.startsWith('users/')) {
        const enc = encodeURIComponent(clean);
        try {
          const d = await utils.fetchJson(`https://gitlab.com/api/v4/projects/${enc}`);
          return {
            title: d.path_with_namespace || clean,
            desc: d.description || t('hover.noRepoDesc'),
            meta: `Star ${d.star_count != null ? d.star_count : '—'}`
          };
        } catch (e) { return null; }
      }
      const user = clean.replace(/^users\//, '');
      if (user) {
        const arr = await utils.fetchJson(`https://gitlab.com/api/v4/users?username=${encodeURIComponent(user)}`);
        const d = Array.isArray(arr) && arr[0] ? arr[0] : null;
        if (!d) return null;
        return {
          title: d.name || d.username || user,
          desc: d.bio || t('hover.noBio'),
          meta: t('hover.profile')
        };
      }
      return null;
    },

    selectors: {
      codeBlocks: ['.blob-content pre', 'article pre', 'pre code'],
      cleanables: ['.recommendation-container', '.issues-list aside'],
      heatmap: '.js-contribution-calendar, .contrib-calendar',
      commitList: '.commit-row, [data-testid="commit-row-item"]',
      userLinks: 'a[href^="/"]'
    }
  };

  Core.bootstrap(adapter);
})();
