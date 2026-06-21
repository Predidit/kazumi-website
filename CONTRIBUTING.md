# 贡献指南

感谢你对 Kazumi Website 项目的关注！这个仓库是 [Kazumi](https://github.com/Predidit/Kazumi) 的官方网站，基于 AnalogJS + Angular 22 + Vite 构建。

## 开发环境

### 前置要求

- **Node.js** >= 20.19.1
- **[Bun](https://bun.sh)** 作为包管理器和运行时

项目使用 `bun.lock` 作为锁文件，请不要混用 pnpm、npm 或 yarn 生成新的锁文件。

### 安装与启动

```shell
git clone https://github.com/Predidit/kazumi-website.git
cd kazumi-website
bun install
bun run dev
```

开发服务器默认运行在 `http://localhost:5173`。

### 常用命令

| 命令 | 说明 |
| --- | --- |
| `bun install` | 安装依赖 |
| `bun run dev` | 启动开发服务器 |
| `bun run build` | 生产构建，构建前会生成文档更新时间和站点地图 |
| `bun run test` | 运行 Vitest |
| `bun run lint` | 运行 Biome 检查 |
| `bun run format` | 使用 Biome 自动修复可修复问题 |
| `bun run preview` | 本地预览生产构建 |

## 项目结构

```text
kazumi-website/
├── public/
│   ├── docs/                    # 文档图片
│   ├── contributors.json        # 贡献者数据
│   ├── releases.json            # 版本数据
│   └── logo.png
├── scripts/
│   ├── generate-doc-updates.ts  # 从 git log 生成文档更新时间
│   └── generate-sitemap.ts      # 生成 sitemap
├── src/
│   ├── app/
│   │   ├── app.ts
│   │   ├── app.config.ts
│   │   ├── app.config.server.ts
│   │   ├── features/
│   │   │   ├── docs/            # 文档导航、TOC、页脚、代码块
│   │   │   ├── home/            # 首页模块
│   │   │   ├── layout/          # Header、Footer、主题
│   │   │   └── seo/             # SEO 配置与服务
│   │   └── pages/               # AnalogJS 文件路由
│   ├── content/
│   │   └── docs/                # Markdown 文档内容
│   ├── main.ts
│   └── main.server.ts
├── vite.config.ts               # Vite + AnalogJS + prerender 配置
├── biome.json
└── package.json
```

## 路由与文档

- `src/app/pages/` 下的 `*.page.ts` 文件会注册为路由，页面组件必须默认导出。
- 嵌套目录对应嵌套路由，例如 `src/app/pages/about/icon.page.ts` 对应 `/about/icon`。
- 文档内容位于 `src/content/docs/`，由 `@analogjs/content` 读取 Markdown 并渲染。
- 文档侧边栏导航维护在 `src/app/features/docs/docs-nav.ts`。
- 新增文档时需要同时确认：
  - Markdown 文件放在正确的 `src/content/docs/` 子目录。
  - `docs-nav.ts` 中加入对应导航项。
  - `vite.config.ts` 的 prerender 配置能够覆盖该文档路径。
  - 文档图片放在 `public/docs/assets/` 下，并使用 `/docs/assets/...` 引用。

## 代码规范

项目使用 Biome 2.5 进行格式和 lint 检查。

- 缩进使用 Tab。
- 字符串使用双引号。
- 使用 standalone components，不使用 NgModule。
- 使用 Angular 22 `@if` / `@for` 控制流语法。
- 状态优先使用 signals。
- 组件使用内联 `template` 和 `styles`。
- 样式使用 SCSS 和 Material 3 的 `var(--mat-sys-*)` 变量。
- 除非确有必要，不在代码中添加注释。

提交前请至少运行：

```shell
bun run lint
bun run build
```

## CI 与 Pull Request

PR 会通过 `.github/workflows/pr-test.yml` 运行 CI，当前检查包括：

- `bun install`
- `bun run lint`
- `bun run build`

贡献流程：

1. Fork 仓库并创建你的开发分支。
2. 使用 Conventional Commits 风格编写提交信息。
3. 确认本地检查通过。
4. 提交 PR，并说明变更内容、原因和验证方式。
