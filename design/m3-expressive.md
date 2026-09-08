# Kazumi 网站设计说明

## 信息结构

- 发现 `/`：产品价值、设备入口、功能与下载入口。
- 下载 `/download`：设备选择、当前发布版本、安装说明与镜像设置。
- 指南 `/docs`：按用户任务设置起点，提供标题搜索与主题目录。
- 共创 `/about`：开发、反馈、社区入口与贡献者。
- 图标与授权 `/about/icon`：形象来源、网站插画说明与原作授权。

文档分组由 Markdown frontmatter 驱动，依次为开始使用、安装与排错、规则开发、原理与实现。

## 视觉与交互

使用 Material 3 的语义色彩角色与 Angular Material 主题接口。森林绿承载主要操作，浅绿建立重点区域，奶油黄用于品牌插画与提示，桃色用于观看体验与社区内容。明暗主题共用角色，各自提供对应色值。

Manrope 与 Noto Sans SC 组成字体系统。展示页使用强调型大标题；文档采用适于阅读的正文、明确的标题节奏和克制的侧栏。圆角按容器与控件层级使用 8、16、20、24、28、32、40、48 像素及全圆角。

连接按钮组与导航在选中、悬停和按压时改变形状，主要操作提供触摸与键盘反馈。`prefers-reduced-motion` 下关闭非必要动画。移动端采用常驻底部主导航和可展开的文档目录。

设计依据：[Google 的 M3 Expressive 研究与设计原则](https://design.google/library/expressive-material-design-google-research)、[Material 3 Expressive](https://m3.material.io/blog/building-with-m3-expressive)。

## 网站插画

- 输出：`public/kazumi-expressive.png`
- 生成方式：内置 ImageGen，风格转换。
- 输入参考：项目原有 `public/logo.png`，仅作为角色身份参考，不直接显示在新网页中。
- 原项目图标作者：[Yuquanaaa](https://www.pixiv.net/users/66219277)，[原作](https://www.pixiv.net/artworks/116666979)。
- 页头采用纯文字 Kazumi 标识。生成插画用于首页、授权说明页、站点图标与分享图。
- 网站插画为 AI 风格化演绎，不将该生成结果表述为原作者创作的新作品。

### 最终生成提示词

Use case: style-transfer. Asset type: production website hero illustration and branding artwork for Kazumi, a Chinese open-source anime viewing app being redesigned in Material 3 Expressive. Input image is the OLD mascot reference, NOT the desired rendering quality. The user explicitly dislikes the crude old logo and requests a completely professional stylized redesign. Retain only the friendly green-haired character identity, golden eyes, and cream clothing. Reimagine it as a gorgeous premium 3D soft vinyl collectible mascot: carefully sculpted flowing matcha-green hair with large smooth geometric locks, tasteful tiny golden eyes, a calm friendly expression, oversized ivory hoodie with subtle forest-green seams, simple hands held together. Entire full seated figure, perfectly resolved anatomy, expertly designed proportions, smooth softly rounded silhouette and refined tactile matte ceramic material, restrained realistic micro-texture, high-quality soft studio ambient occlusion and lighting. Art direction: playful and warm but sophisticated, Material 3 Expressive color-and-shape language, forest green #285c43, sage #a5c58e, ivory #fafbf6, muted butter yellow. Center composition, mascot occupying 78 percent of square image. A completely uniform pale butter background exactly #f3efbd, very subtle grounded shadow, no scenery, no pedestal, no white circle, no sticker border. No lettering, no logos, no text, no watermark, no hand-drawn rough strokes, no flat traced old image, no anime line-art. High quality finished 1024x1024 or larger square raster asset. The result must look like a newly art-directed premium sculptural illustration, not the original low-quality avatar.
