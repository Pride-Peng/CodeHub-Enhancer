/* ============================================================
 * CodeHub Enhancer — background.js
 * Manifest V3 Service Worker：
 * 监听全局快捷键 Alt+Shift+P，向当前标签页的 content 脚本转发切换消息。
 * 不做任何数据上报、不连接自建后端。
 * ============================================================ */
'use strict';

const TOGGLE_COMMAND = 'toggle-sidebar-panel';

chrome.commands.onCommand.addListener((command) => {
  if (command !== TOGGLE_COMMAND) return;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs && tabs[0];
    if (!tab || tab.id == null) return;
    // 非支持站点没有 content 脚本，sendMessage 会报“接收端不存在”，这里静默吞掉
    chrome.tabs.sendMessage(tab.id, { type: 'CODEHUB_TOGGLE_SIDEBAR' }).catch(() => {});
  });
});

// 安装 / 更新仅记录本地日志，不做任何上报
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[CodeHub Enhancer] 已安装 / 更新：', details.reason);
});
