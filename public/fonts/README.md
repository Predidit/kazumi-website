# 首页字体资源

保留原有 Manrope、Noto Sans SC、Material Icons 和 Material Design Icons 字形，以及 400、500、600、700、800 的字重匹配。字体文件随网站一起部署，首页无需访问 Google Fonts 或 jsDelivr。

- `manrope-*.woff2`：Google Fonts Manrope v20 的原始 Unicode 分片。
- `noto-sans-sc-home.woff2`：Google Fonts Noto Sans SC v40（字体版本 2.004）的子集，包含基本拉丁字符和首页、页头、页脚、跳转链接使用的非 ASCII 字符。异步加载的 `noto-sans-sc-fallback.css` 保留完整字体的远程 Unicode 分片作为其他字符的回退，因此新增文案仍能显示原字体。本地与远程字符范围不重叠，避免浏览器额外请求重复分片。禁用 JavaScript 时通过 `noscript` 加载回退样式。
- `material-icons.woff2`：Google Fonts Material Icons v145 原字体，保留完整图标集合，支持文档 frontmatter 中的图标名称。
- `material-icons-home.woff2`：首页、导航、页脚和主题菜单使用的 Material Icons 子集，通过局部字体样式加载，其他区域继续使用完整图标集。
- `mdi-subset.woff2`：Material Design Icons 7.4.47 的子集，扫描应用组件和指南 Markdown 中的 MDI 图标，并包含首页平台图标。生成脚本保留原始边界框，并验证子集的字形轮廓和度量与原字体完全一致。

对应的许可文本保存在本目录。MDI 的 Apache 2.0 完整许可与 `MaterialIcons-LICENSE.txt` 相同。

## 更新资源

图片、字体子集、回退样式和 `src/_fonts.scss` 均由 `scripts/optimize_home_assets.py` 生成。PR 检查和部署流程通过 `.github/actions/prepare-assets/action.yml` 在构建前自动重新生成并运行资源回归测试，使用当前提交的文案、图标和角色原图。Markdown 修改也会触发这些流程，不依赖手动维护字符清单。生成失败会阻止后续构建和部署。

指南正文使用完整 Noto Sans SC 字符范围回退，frontmatter 的 Material Icons 图标使用完整本地字库。因此新增指南字符或文档图标不需要扩充首页子集，也不会随文档增长增加首页字体下载量。回退字体分片仍从 Google Fonts 按需加载；网络不可用时使用系统字体。首页及共享导航、页脚的新增文案会自动进入首页子集。

仓库保留生成资源，供普通本地开发和构建直接使用。CI 使用重新生成的文件检查和部署，不会自动回写提交。修改首页文案、图标或角色原图时，建议本地重新生成并提交，方便审查与预览。

MDI 图标在组件数据或 Markdown 中使用完整类名（例如 `mdi-android`），生成器按该前缀扫描，不依赖组件字段名或数组位置。Material Icons 继续使用其图标名称（例如 `download`）。

从仓库根目录运行：

```sh
python -m pip install -r scripts/home-assets-requirements.txt
bun run assets:generate
bun run assets:test
bun run format
bun run build
```

资源生成需要网络、Python 3.10+、FontTools/Brotli 和 Pillow；CI 自动配置 Python 3.13 并缓存 Python 依赖。普通 `bun run dev` 和 `bun run build` 不要求 Python。Google Fonts 可能更新上游字体，重新生成后应检查字形和页面截图，并按需更新许可文本。

字体样式保留离散字重声明，同一 Unicode 分片的五个字重相邻输出，以改善 gzip 压缩。不要改成连续字重区间，否则已有 `font-weight: 650` 等文字的外观会改变。

首页 WebP 有 480、768、1024、1254 四个尺寸，质量为 88。原始 PNG 继续用于不支持 WebP 的浏览器和社交分享；48 像素 favicon 来自同一原图。

上游来源：[Google Fonts Manrope](https://github.com/google/fonts/tree/main/ofl/manrope)、[Google Fonts Noto Sans SC](https://github.com/google/fonts/tree/main/ofl/notosanssc)、[Material Icons](https://github.com/google/material-design-icons)、[Material Design Icons 7.4.47](https://www.npmjs.com/package/@mdi/font/v/7.4.47)。
