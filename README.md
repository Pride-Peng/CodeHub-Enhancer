# CodeHub Enhancer

> A Liquid Glass–styled browser extension that enhances code browsing on GitHub, Gitee, and GitLab. Manifest V3, MIT licensed, fully free.

\[!\[License: MIT]([https://img.shields.io/badge/License-MIT-blue.svg](https://img.shields.io/badge/License-MIT-blue.svg))](LICENSE)
\[!\[Chrome]([https://img.shields.io/badge/Chrome-102+-success.svg](https://img.shields.io/badge/Chrome-102+-success.svg))](#compatibility)
\[!\[Edge]([https://img.shields.io/badge/Edge-102+-success.svg](https://img.shields.io/badge/Edge-102+-success.svg))](#compatibility)

***

## Overview

CodeHub Enhancer gives developers, open-source enthusiasts, and competitive-programming students (GESP / 蓝桥杯 / CSP / NOIP) a unified browsing experience across the three major code-hosting platforms: a sidebar file tree, one-click single-file download, clean copy, page cleanup, code-reading beautification, and an **OI (Olympiad in Informatics) toolkit** that few other tools cover.

The project is **local-first, minimal-permission, and fully open source**: there is no backend server, and no account information, browsing history, or repository content is ever collected or uploaded. All settings live only in your browser's `chrome.storage.local`.

The interface is available in **Chinese and English**. By default it uses Chinese; open the settings panel and click the language button in the top-right corner to switch everything to English.

## Features

### 1. Sidebar file tree (core)

- Works on GitHub / Gitee / GitLab, in a draggable, Liquid Glass panel.
- Fold / expand folders, with per-extension SVG icons.
- Live file search in the header for fast navigation in large repositories.
- Each file entry offers **copy code** and **download file** actions.
- Automatically reloads the tree when you switch branch / tag.
- Press **Alt + Shift + P** to toggle the panel.

### 2. Quick file actions

- Download a single file (no need to download the whole repository zip); the filename stays intact.
- Clean copy: strips line numbers, extra whitespace, and irrelevant DOM characters so you can paste straight into an editor or an online-judge submission box.
- Repository info card: total repo size, current file size, last-updated time.
- One-click jump to an online IDE (github1s / gitee1s).

### 3. Page cleanup and reading beautification

- Hide recommended repositories, activity feeds, and other clutter, each toggleable.
- Light / dark code theme, independent of the platform and system theme.
- Custom code font (Consolas, JetBrains Mono, etc.) and font-size zoom.
- Whitespace visualization: spaces render as `·` and tabs as `→` to help you spot indentation issues.

### 4. Commit and repository stats enhancement

- Contribution heatmap hover cards.
- User / repository hover preview cards (bio, stars, and more).
- Highlight large commits to quickly locate major changes.

### 5. OI toolkit (differentiator)

- Automatically detects `.cpp / .py / .h` code files and shows a Liquid Glass toolkit bar.
- Extracts sample input / output from comments and text for one-click copying.
- Built-in templates: C++ fast I/O, universal header, sort, binary search, DFS.
- Select an algorithm keyword to jump to the matching OI-Wiki page.
- Detects Luogu / Codeforces / AtCoder problem IDs and jumps to the corresponding online judge.

### 6. Popup settings panel

- Tabs: Features / Appearance / Shortcuts / About.
- Each module can be toggled independently; adjust blur strength and dark-mode following.
- Settings persist locally; reset to defaults with one click.
- Language toggle (Chinese / English).

## Screenshots

> Screenshots and demo GIFs go here.

**📷 Add image here:** 
<img width="317" height="792" alt="image" src="https://github.com/user-attachments/assets/fbb7e55a-216b-47a5-ab01-15f342e63e26" />


**📷 Add image here:** the popup settings panel
<img width="380" height="502" alt="image" src="https://github.com/user-attachments/assets/ee2b6c43-d9cc-4ef6-ad50-d93591bb2bd4" />


## Installation (load unpacked)

1. Download this repository's source and extract it to a local folder (keep the full directory structure).
2. Open Chrome / Edge and go to `chrome://extensions/` (Edge: `edge://extensions/`).
3. Turn on **Developer mode** in the top-right corner.
4. Click **Load unpacked** and select the project root (the folder that contains `manifest.json`).
5. Open any GitHub / Gitee / GitLab repository page and press **Alt + Shift + P** to show the file tree.

> This project is currently distributed as a locally loaded extension, not a packaged `.crx`; stable releases will provide a zip and store submission later.

## Usage

| Action | Description |
| --- | --- |
| Alt + Shift + P | Open / collapse the sidebar file tree |
| Click a file name | Jump to that file's page |
| Hover a file entry | Reveal the copy / download buttons |
| Top-right extension icon | Open the settings panel to toggle modules and switch language |

## Privacy

- This extension **does not collect** any personal information, account information, or browsing history; code content and copy records are never uploaded.
- All settings and temporary data are kept only in your browser's `chrome.storage.local`, with no self-hosted backend.
- Injected scripts are limited to [`github.com`](http://github.com), [`gitee.com`](http://gitee.com), and [`gitlab.com`](http://gitlab.com). To read public files / public repository info, it additionally requests the GitHub public API and raw-file domains ([`api.github.com`](http://api.github.com), [`raw.githubusercontent.com`](http://raw.githubusercontent.com)); it does not read other sites.
- The source code is fully open for anyone to audit: no telemetry, no tracking, no ads, no cookie scraping.

## Comparison

| Project | Platforms | OI Toolkit | UI style | Open Source | Paid |
| --- | --- | --- | --- | --- | --- |
| Octotree | GitHub | ❌ | Traditional | Closed source | Paid for advanced |
| Refined GitHub | GitHub | ❌ | Minimal | Open source | Free |
| **CodeHub Enhancer** | GitHub + Gitee + GitLab | ✅ | iOS 26 Liquid Glass | MIT | All free |

## Project structure

```
CodeHub-Enhancer/
├─ manifest.json                # Manifest V3 manifest, shortcut, hosts and permissions
├─ README.md                    # Project documentation
├─ LICENSE                      # MIT license
├─ .gitignore
├─ .github/ISSUE_TEMPLATE/      # Bug report / feature request templates
└─ src/
   ├─ i18n/
   │  └─ messages.js            # Chinese / English dictionary
   ├─ content/
   │  ├─ github.js              # GitHub adapter
   │  ├─ gitee.js               # Gitee adapter
   │  ├─ gitlab.js              # GitLab adapter
   │  ├─ common-core.js         # Shared core: config, utils, glass UI, file tree, orchestration
   │  └─ oi-tool.js             # OI toolkit
   ├─ service-worker/
   │  └─ background.js          # Shortcut forwarding, local lifecycle
   ├─ popup/
   │  ├─ popup.html             # Popup settings panel
   │  ├─ popup.css
   │  └─ popup.js
   ├─ styles/
   │  ├─ liquid-glass.css       # Global Liquid Glass variables and components
   │  ├─ sidebar.css            # Sidebar file tree layout
   │  └─ code-enhance.css       # Code beautification and whitespace markers
   └─ assets/icons/
      ├─ icon16.png
      ├─ icon48.png
      └─ icon128.png
```

## Compatibility

- Browsers: Chrome 102+, Edge 102+, and other Chromium-based browsers.
- **Not natively supported on Firefox** (MV3 loading and some APIs differ; not yet adapted).
- When a platform changes its page DOM, individual modules silently disable themselves and surface a friendly hint in the console / toast, without affecting other features.

## Roadmap

- **v0.1.0** (current): full directory layout, Liquid Glass UI system, Alt+Shift+P shortcut, sidebar file tree, single-file download, clean copy, basic OI sample extraction, popup settings panel, Chinese / English language toggle — the core MVP.
- **v0.2.0**: improve DOM adaptation, whitespace visualization, hover preview cards.
- **v0.3.0**: expand the OI template library and OI-Wiki jump coverage.
- **v1.0.0**: stable release, fix compatibility issues, prepare for the Chrome Web Store.

## Contributing

1. Fork this repository and create a branch: `feat/your-feature` or `fix/your-bug`.
2. Follow the existing directory split and naming conventions; do not introduce a large build toolchain.
3. Before submitting, load the extension in Chrome as "unpacked" and verify every module runs without errors.
4. In your pull request, describe the motivation and testing in the issue template.

Bug reports and feature suggestions are welcome (see `.github/ISSUE_TEMPLATE/`).

## Boundaries

This extension does not and will not implement anything that bypasses platform permissions to read private repositories / private files, auto-star / auto-like, batch-automate accounts, scrape cookies / traffic, run ad redirection, or report data. It only reads content that is already publicly visible to the current user on the current page.

## License

[MIT License](LICENSE) © 2026 CodeHub Enhancer Contributors
