# 贡献指南

感谢你对 Kazumi Website 项目的关注！这个仓库是 [Kazumi](https://github.com/Predidit/Kazumi) 的官方网站，基于 [AnalogJS](https://analogjs.org/)（Angular 全栈框架）+ Angular 22 + Vite 构建。本指南帮助你搭建开发环境、了解项目结构，并完成第一次贡献。

## 开发环境

### 前置要求

- **Node.js** >= 22
- **[Bun](https://bun.sh)** 作为包管理器和运行时

项目使用 `bun.lock` 作为锁文件，不要混用 pnpm、npm 或 yarn 生成新的锁文件。

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

## 文档贡献

### Frontmatter 配置参考

每个文档文件必须以 YAML frontmatter 开头：

```yaml
---
title: "页面标题"          # 必填，页面标题，显示在浏览器标签和导航中
description: "页面描述"    # 必填，用于 SEO meta description
section: "所属分区"        # 必填，对应 docs-nav.ts 中的分区标题
icon: "material_icon"     # 必填，Material Icons 名称，用于导航图标
order: 1                  # 可选，排序权重，数字越小越靠前
slug: "custom-slug"       # 可选，自定义 URL 路径，默认使用文件名
---
```

**可用 icon 值示例：** `info`、`download`、`code`、`description`、`widgets`、`help`、`settings`。完整列表参考 [Material Icons](https://fonts.google.com/icons)。

**分区（section）对应关系：**

| section 值 | 对应导航分区 |
| --- | --- |
| `简介` | intro |
| `规则指南` | rules |
| `架构` | architecture |
| `其他` | misc |

### 文档内容贡献流程

1. **创建 Markdown 文件**

   在 `src/content/docs/` 对应子目录创建 `.md` 文件：
   - `intro/` - 简介类文档
   - `rules/` - 规则相关文档
   - `architecture/` - 架构相关文档
   - `misc/` - 其他文档

2. **添加 frontmatter**

   按照上述配置添加 frontmatter，确保必填字段完整。

3. **更新导航配置**

   编辑 `src/app/features/docs/docs-nav.ts`，在对应分区的 `pages` 数组中添加导航项：

   ```typescript
   {
     route: "/docs/your-section/your-doc",
     title: "文档标题",
     icon: "icon_name",
   }
   ```

4. **验证构建**

   运行以下命令确保文档正确生成：

   ```shell
   bun run build
   ```

5. **添加文档图片（如有）**

   将图片放在 `public/docs/assets/` 下，在 Markdown 中使用 `/docs/assets/...` 引用。

## 代码规范

项目使用 Biome 进行格式和 lint 检查。

- 缩进使用 Tab。
- 字符串使用双引号。
- 使用 standalone components（无需 NgModule 注册的独立组件），不使用 NgModule。
- 使用 Angular 22 `@if` / `@for` 控制流语法，不使用 `*ngIf` / `*ngFor`。
- 状态优先使用 signals（Angular 响应式原语）。
- 组件使用内联 `template` 和 `styles`。
- 样式使用 SCSS 和 Material 3 的 `var(--mat-sys-*)` 变量。
- 除非确有必要，不在代码中添加注释。

### 提交前检查

提交前至少运行以下命令：

```shell
bun run lint
bun run build
```

## 组件开发

### 新组件开发流程

1. 确定组件所属模块，放在 `src/app/features/` 对应子目录：
   - `features/docs/` - 文档相关组件
   - `features/home/` - 首页相关组件
   - `features/layout/` - 布局组件（Header、Footer）
   - `features/seo/` - SEO 相关服务

2. 创建组件文件，使用 kebab-case 命名（如 `my-component.ts`）。

3. 组件必须是 standalone component，使用内联 `template` 和 `styles`：

   ```typescript
   import { Component } from "@angular/core";

   @Component({
     selector: "app-my-component",
     template: `
       <div class="my-component">
         <!-- 内容 -->
       </div>
     `,
     styles: `
       .my-component {
         padding: 16px;
         background-color: var(--mat-sys-surface);
       }
     `,
   })
   export class MyComponent {}
   ```

4. 类名使用 PascalCase，与文件名对应（如 `my-component.ts` → `MyComponent`）。

5. 如需在其他组件中使用，直接导入即可（standalone component 无需在 NgModule 中注册）。

### 现有组件复用

项目中已有的可复用组件：

| 组件 | 路径 | 用途 |
| --- | --- | --- |
| `CodeBlockComponent` | `features/docs/code-block.ts` | 代码块展示，支持复制 |
| `TocComponent` | `features/docs/toc.ts` | 文档目录导航 |
| `DocFooterComponent` | `features/docs/doc-footer.ts` | 文档页脚（上一篇/下一篇） |
| `HeroComponent` | `features/home/hero.ts` | 首页英雄区 |
| `ContributorsComponent` | `features/home/contributors.ts` | 贡献者展示 |
| `HeaderComponent` | `features/layout/header.ts` | 页面头部导航 |
| `FooterComponent` | `features/layout/footer.ts` | 页面底部 |

使用示例：

```typescript
import { Component } from "@angular/core";
import { CodeBlockComponent } from "../features/docs/code-block";

@Component({
  selector: "app-example",
  imports: [CodeBlockComponent],
  template: `
    <app-code-block [code]="code" [language]="'typescript'" />
  `,
})
export class ExampleComponent {
  code = 'console.log("Hello");';
}
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
