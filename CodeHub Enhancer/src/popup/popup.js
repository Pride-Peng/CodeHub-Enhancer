/* ============================================================
 * CodeHub Enhancer — popup.js
 * 弹出设置面板：读取 / 写入 chrome.storage.local，功能开关、样式配置、
 * 标签页切换、恢复默认、语言切换。配置持久化，浏览器重启后不丢失。
 * ============================================================ */
'use strict';

const I18N = window.CodeHubI18N;

const DEFAULTS = {
  language: 'zh',
  features: {
    fileTree: true,
    quickActions: true,
    pageClean: true,
    codeEnhance: true,
    commitStats: true,
    oiToolkit: true
  },
  style: {
    blur: 20,
    followDarkMode: true,
    fontFamily: '',
    codeFontSize: 14,
    codeTheme: 'auto',
    showWhitespace: false
  }
};

const FEATURE_SPECS = [
  { key: 'fileTree', labelKey: 'feature.fileTree', descKey: 'feature.fileTree.desc' },
  { key: 'quickActions', labelKey: 'feature.quickActions', descKey: 'feature.quickActions.desc' },
  { key: 'pageClean', labelKey: 'feature.pageClean', descKey: 'feature.pageClean.desc' },
  { key: 'codeEnhance', labelKey: 'feature.codeEnhance', descKey: 'feature.codeEnhance.desc' },
  { key: 'commitStats', labelKey: 'feature.commitStats', descKey: 'feature.commitStats.desc' },
  { key: 'oiToolkit', labelKey: 'feature.oiToolkit', descKey: 'feature.oiToolkit.desc' }
];

let currentLang = 'zh';
let currentCfg = null;

function t(key, params) {
  return I18N.translate(key, currentLang, params);
}

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

async function loadConfig() {
  try {
    const raw = await chrome.storage.local.get('codehubConfig');
    return deepMerge(DEFAULTS, raw.codehubConfig || {});
  } catch (e) {
    return deepMerge(DEFAULTS, {});
  }
}

async function saveConfig(patch) {
  const cur = await loadConfig();
  const next = deepMerge(cur, patch);
  try { await chrome.storage.local.set({ codehubConfig: next }); } catch (e) {}
  return next;
}

function applyI18n() {
  document.documentElement.lang = currentLang === 'en' ? 'en' : 'zh-CN';
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  updateLangToggle();
}

function updateLangToggle() {
  const btn = document.getElementById('lang-toggle');
  const isEn = currentLang === 'en';
  btn.textContent = t(isEn ? 'lang.on' : 'lang.off');
  btn.classList.toggle('is-on', isEn);
  btn.setAttribute('aria-pressed', String(isEn));
}

function renderFeatures(cfg) {
  const list = document.getElementById('feature-list');
  list.innerHTML = '';
  FEATURE_SPECS.forEach((spec) => {
    const row = document.createElement('div');
    row.className = 'feature-item';
    row.innerHTML =
      `<div><div class="label">${t(spec.labelKey)}</div><div class="desc">${t(spec.descKey)}</div></div>`;

    const sw = document.createElement('label');
    sw.className = 'ch-switch';
    sw.innerHTML =
      `<input type="checkbox" data-path="features.${spec.key}" ${cfg.features[spec.key] ? 'checked' : ''} />` +
      `<span class="track"><span class="thumb"></span></span>`;

    const input = sw.querySelector('input');
    input.addEventListener('change', async () => {
      await saveConfig({ features: { [spec.key]: input.checked } });
    });

    row.appendChild(sw);
    list.appendChild(row);
  });
}

function bindControls(cfg) {
  document.querySelectorAll('[data-path]').forEach((el) => {
    if (el.closest('#feature-list')) return;
    const [group, key] = el.dataset.path.split('.');
    const val = cfg[group][key];

    if (el.type === 'checkbox') el.checked = !!val;
    else el.value = val;

    el.addEventListener('change', async () => {
      let v = el.type === 'checkbox' ? el.checked : el.value;
      if (el.type === 'range' || el.type === 'number') v = Number(v);
      await saveConfig({ [group]: { [key]: v } });
    });
  });
}

function bindTabs() {
  document.querySelectorAll('.ch-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ch-tab').forEach((b) => b.classList.remove('active'));
      document.querySelectorAll('.ch-tab-pane').forEach((p) => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
  });
}

function applyTheme() {
  const dark = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
  document.body.setAttribute('data-codehub-theme', dark ? 'dark' : 'light');
}

async function init() {
  applyTheme();
  const cfg = await loadConfig();
  currentCfg = cfg;
  currentLang = I18N.langOf(cfg);

  applyI18n();
  renderFeatures(cfg);
  bindControls(cfg);
  bindTabs();

  document.getElementById('lang-toggle').addEventListener('click', async () => {
    currentLang = currentLang === 'zh' ? 'en' : 'zh';
    await saveConfig({ language: currentLang });
    applyI18n();
    renderFeatures(currentCfg);
  });

  document.getElementById('reset-btn').addEventListener('click', async () => {
    try { await chrome.storage.local.set({ codehubConfig: DEFAULTS }); } catch (e) {}
    location.reload();
  });
}

document.addEventListener('DOMContentLoaded', init);
