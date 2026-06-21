# 贡献指南

感谢你对 Kazumi Website 项目的关注！以下是参与贡献的说明。

## 开发环境搭建

### 前置要求

- **Node.js** >= 20.19.1
- **[bun](https://bun.sh)**（包管理器和运行时）

### 安装与启动

```shell
# 克隆仓库
git clone https://github.com/Predidit/kazumi-website.git
cd kazumi-website

# 安装依赖
bun install

# 启动开发服务器
bun run dev
```

### 常用命令

| 命令 | 说明 |
|------|------|
| `bun run dev` | 启动开发服务器 |
| `bun run build` | 构建生产版本 |
| `bun run test` | 运行测试（Vitest） |
| `bun run lint` | 代码检查（Biome） |
| `bun run format` | 自动格式化代码 |

## 项目结构说明

```
kazumi-website/
├── public/                      # 静态资源
│   ├── docs/                    # 文档图片
│   ├── contributors.json        # 贡献者数据
│   ├── releases.json            # 版本数据
│   └── logo.png
├── src/
│   ├── app/
│   │   ├── app.ts               # 根组件
│   │   ├── app.config.ts        # 客户端 Provider 配置
│   │   ├── app.config.server.ts # 服务端 Provider 配置
│   │   ├── components/          # 共享组件
│   │   │   ├── header.ts
│   │   │   ├── footer.ts
│   │   │   └── toc.ts
│   │   ├── pages/               # 路由页面（*.page.ts 自动注册路由）
│   │   │   ├── index.page.ts    # 首页
│   │   │   ├── about.page.ts    # 关于页
│   │   │   ├── download.page.ts # 下载页
│   │   │   ├── docs.page.ts     # 文档页
│   │   │   ├── home/            # 首页子组件
│   │   │   └── about/           # 关于子路由
│   │   └── models/              # 数据模型
│   ├── content/
│   │   └── docs/                # Markdown 文档
│   │       ├── intro/           # 介绍
│   │       ├── rules/           # 规则
│   │       ├── architecture/    # 架构
│   │       ├── misc/            # 其他
│   │       └── sidebar.ts       # 侧边栏导航配置
│   ├── main.ts                  # 客户端入口
│   └── main.server.ts           # SSR 入口
├── vite.config.ts               # Vite + AnalogJS 配置（含 prerender 路由）
├── biome.json                   # Biome 代码规范配置
└── package.json
```

### 路由

项目使用 AnalogJS 基于文件系统的路由：

- `src/app/pages/` 下的 `*.page.ts` 文件自动注册为路由
- 页面组件必须 **默认导出**
- 嵌套目录 = 嵌套路由（如 `pages/about/icon.page.ts` → `/about/icon`）

### 内容管理

- Markdown 文档放在 `src/content/docs/` 目录下
- 使用 frontmatter 配置页面元数据
- **新文档必须添加到 `vite.config.ts` 的 prerender 路由列表中**，否则不会被构建

## 代码规范

项目使用 [Biome](https://biomejs.dev/) 进行代码检查和格式化，提交前请运行 `bun run lint`。

### 核心规则

- **缩进**: Tab
- **引号**: 双引号 `"`
- **组件**: 使用 standalone 组件（不使用 NgModule）
- **控制流**: 使用 Angular 22 的 `@if` / `@for` 语法（不使用 `*ngIf` / `*ngFor`）
- **状态管理**: 使用 signals（`signal()`），不使用 BehaviorSubject
- **样式**: SCSS，使用 `var(--mat-sys-*)` Material 3 CSS 自定义属性
- **模板**: 组件使用内联 `template` + `styles`（不使用单独的模板文件）
- **注释**: 除非明确要求，不添加注释

### 自动修复

```shell
bun run format
```

## 提交规范

### Commit Message

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范。

### Pull Request 流程

1. Fork 仓库并创建你的分支
2. 确保 `bun run lint` 通过
3. 确保 `bun run test` 通过
4. 提交 PR，说明变更内容和原因

> 项目目前没有 CI 工作流，请在本地完成检查后再提交。
