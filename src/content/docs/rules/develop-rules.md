---
title: "XPath 规则开发"
description: "Kazumi XPath 规则开发详细教程，从准备工作到选择器配置和高级选项的完整指南。"
section: "规则指南"
icon: "code"
order: 2
authors:
  - Predidit
  - azxcvn
  - ChouChiu
---

# XPath 规则开发

XPath 规则通过请求网页 HTML，定位搜索结果、作品链接、播放线路和剧集入口。本教程以 `https://www.dm539.com/` 为例，说明如何从网页结构中得到一套完整规则。

## 准备工作

1. 准备一台可以使用浏览器开发者工具的设备。推荐使用 Windows、macOS 或 Linux 桌面系统，以及最新版 Edge、Chrome 或其他 Chromium 浏览器。
2. 安装最新版 Kazumi，依次进入 `我的` → `规则管理` → 右上角 `+` → `新建规则`。
3. 在目标网站中使用任意作品名称执行搜索，确认网站能够直接返回结果。若搜索前必须登录、完成验证码或经过复杂的人机验证，需要额外配置 Cookie 或反爬虫验证，不属于本教程的基础流程。

> [!NOTE]
> 本文重点说明每个字段的获取方法。完成后的配置汇总在下一篇 [XPath 规则示例](/docs/rules/develop-rules-example) 中。

## 规则编辑器界面

新建规则后，可以看到以下编辑界面：

![](/docs/assets/rules-images/rules-doc-main.png)

下文按照编辑器字段顺序进行说明。高级选项将在文末单独介绍。

### `Name`

规则名称用于在 Kazumi 中识别来源。建议填写网站名称或域名，例如 `樱花动漫`。

### `Version`

规则版本用于标识配置更新。自用规则没有强制格式；准备提交到规则仓库时，建议从 `1.0` 开始，并在规则发生变化时递增版本号。

### `BaseURL`

基础地址是网站可以正常访问的根地址。本例填写：

```text
https://www.dm539.com/
```

一般可以直接从浏览器地址栏复制网站根地址：

![](/docs/assets/rules-images/rules-doc-website.png)

### `SearchURL`

搜索地址是 Kazumi 执行关键词检索时请求的 URL。先在目标网站中搜索“紫罗兰永恒花园”，再观察搜索完成后的浏览器地址：

![](/docs/assets/rules-images/rules-doc-searchurl.png)

将完整地址复制到规则编辑器：

![](/docs/assets/rules-images/rules-doc-searchurl-2.png)

浏览器可能会把中文关键词显示为 URL 编码。无论地址中显示原文还是编码，都需要将关键词对应的部分替换为 `@keyword`。Kazumi 会在执行搜索时对用户输入的关键词进行编码并替换该变量。

本例最终填写：

```text
https://www.dm539.com/search/-------------.html?wd=@keyword&submit=
```

> [!NOTE]
> 本例使用 `GET` 搜索。对于通过 `POST` 表单提交关键词的网站，请参考文末的“POST 搜索”部分。

### `SearchList`

`SearchList` 用于选中搜索结果中的每一个作品条目。从该字段开始，需要借助浏览器开发者工具分析 HTML。

执行搜索后，页面应显示作品列表：

![](/docs/assets/rules-images/rules-doc-searchlist.png)

按 `F12` 打开开发者工具并进入“元素”面板，点击元素选择器：

![](/docs/assets/rules-images/list01.png)

在页面中选择任意作品名称。开发者工具会定位到对应的 HTML 元素：

![](/docs/assets/rules-images/list02.png)
![](/docs/assets/rules-images/list03.png)

从当前元素逐级向上移动鼠标，观察页面中的高亮范围。当高亮区域覆盖单个搜索结果的全部内容，包括名称和图片时，折叠对应的父元素：

![](/docs/assets/rules-images/list04.png)

折叠后可以看到多个结构相同的 `<li>` 元素。元素数量通常与页面中的搜索结果数量一致：

![](/docs/assets/rules-images/list05.png)

继续向上查找这些 `<li>` 的公共父元素，直到高亮区域覆盖全部搜索结果。右键该父元素，选择复制完整 XPath：

![](/docs/assets/rules-images/list06.png)
![](/docs/assets/rules-images/list07.png)

浏览器复制出的 XPath 为：

```text
/html/body/div[1]/div/div[1]/div/div/div[2]/ul
```

Kazumi 的 XPath 选择器需要以 `//` 开头，因此删除 `/html/body`，得到：

```text
//div[1]/div/div[1]/div/div/div[2]/ul
```

该表达式只定位到列表容器 `<ul>`。每一个搜索结果都是容器内的 `<li>`，因此在末尾追加 `//li`：

```text
//div[1]/div/div[1]/div/div/div[2]/ul//li
```

这就是本例的 `SearchList`。

不同网站可能使用 `<div>`、`<article>` 或其他元素表示搜索结果，应根据实际 HTML 结构调整末尾的元素名称。

如果元素具有稳定且唯一的属性，可以使用更简洁的选择器。本例的条目结构为 `<li class="clearfix">`，因此也可以写成：

```text
//li[@class='clearfix']
```

表达式 `//li[@class='clearfix']` 表示选择所有 `class` 属性等于 `clearfix` 的 `<li>` 元素。对于 `<div class="clearfix" id="playlist">`，可以使用稳定性更高的 `id`：

```text
//div[@id='playlist']
```

### `SearchName`

`SearchName` 用于从每个 `SearchList` 条目中提取作品名称。该选择器以单个搜索结果为起点，因此只填写条目内部的相对路径。

使用元素选择器定位第一个作品名称，并复制完整 XPath：

![](/docs/assets/rules-images/name01.png)
![](/docs/assets/rules-images/name02.png)

复制结果为：

```text
/html/body/div[1]/div/div[1]/div/div/div[2]/ul/li[1]/div[2]/h4/a
```

先按照前文方法移除 `/html/body`：

```text
//div[1]/div/div[1]/div/div/div[2]/ul/li[1]/div[2]/h4/a
```

将它与 `SearchList` 对比：

```text
//div[1]/div/div[1]/div/div/div[2]/ul//li
//div[1]/div/div[1]/div/div/div[2]/ul/li[1]/div[2]/h4/a
```

`SearchList` 已经把解析起点限定为每一个 `<li>`，因此需要删除到 `li[1]` 为止的公共路径，只保留条目内部的名称路径：

```text
//div[2]/h4/a
```

### `SearchResult`

`SearchResult` 用于从每个搜索结果中提取下一步访问的页面链接。按照下图定位详情入口，并选择“复制”→“复制完整的 XPath”：

![](/docs/assets/rules-images/result01.png)

复制结果为：

```text
/html/body/div[1]/div/div[1]/div/div/div[2]/ul/li[1]/div[2]/p[5]/a[2]
```

与 `SearchName` 相同，删除搜索条目的公共路径，得到：

```text
//div[2]/p[5]/a[2]
```

> [!IMPORTANT]
> `SearchResult` 决定 Kazumi 随后访问哪个页面，`ChapterRoads` 和 `ChapterResult` 必须按照该页面的 HTML 结构编写。

如果 `SearchResult` 指向详情页，Kazumi 将在详情页中解析线路和剧集：

![](/docs/assets/rules-images/result02.png)

如果它指向“立即播放”入口，Kazumi 将在播放页中解析线路和剧集：

![](/docs/assets/rules-images/result03.png)

两个页面的 HTML 结构通常不同，不能共用同一组选集 XPath。若搜索结果没有独立的详情按钮，但作品名称可以进入详情页或播放页，可以让 `SearchResult` 使用与 `SearchName` 相同的链接元素。

### `ChapterRoads`

`ChapterRoads` 用于选中目标页面中的每一个播放线路。打开 `SearchResult` 指向的页面，并按照与 `SearchList` 相同的方法定位线路区域：

![](/docs/assets/rules-images/roads01.png)

从任意剧集元素逐级向上查找。当高亮区域覆盖一条线路的全部剧集时，折叠对应元素。页面有多少条线路，通常就会出现多少个结构相同的容器：

![](/docs/assets/rules-images/roads02.png)
![](/docs/assets/rules-images/roads03.png)

选择所有线路容器的公共父元素，并复制完整 XPath：

![](/docs/assets/rules-images/roads04.png)

复制结果为：

```text
/html/body/div[2]/div[3]/div[1]/div[1]/div/div[2]
```

移除 `/html/body` 后得到：

```text
//div[2]/div[3]/div[1]/div[1]/div/div[2]
```

该表达式定位到线路列表的父容器。每一条线路是其下级 `<div>`，因此追加 `//div`：

```text
//div[2]/div[3]/div[1]/div[1]/div/div[2]//div
```

### `ChapterResult`

`ChapterResult` 用于从每条线路中选中全部剧集链接。使用元素选择器定位任意一集，并复制完整 XPath：

![](/docs/assets/rules-images/cp-rs.png)

以下示例定位到第 12 集：

```text
/html/body/div[2]/div[3]/div[1]/div[1]/div/div[2]/div[1]/ul/li[12]/a
```

删除 `ChapterRoads` 已经覆盖的公共路径后得到：

```text
//ul/li[12]/a
```

`li[12]` 只会选中第 12 个元素。规则需要返回全部剧集，因此删除位置限制 `[12]`：

```text
//ul/li/a
```

至此，搜索、详情入口、播放线路和剧集链接均已配置完成。保存前应使用规则测试功能检查搜索结果数量、线路数量和剧集顺序。

## 常见问题

### 高级选项

![](/docs/assets/rules-QA/Advanced-Options.png)

- **简易解析**：使用兼容性解析器代替现代解析器。默认保持关闭；仅在现代解析器无法从播放页获取资源时尝试启用。
- **广告过滤**：对 HLS 播放列表启用广告片段过滤。仅在确认来源包含可识别的 HLS 广告时启用。
- **User-Agent**：覆盖播放器和下载器请求中的浏览器身份标识。一般留空；只有来源校验特定 User-Agent 时才需要填写。
- **Referer**：覆盖播放器和下载器请求中的来源页面。若媒体服务器校验来源，可以填写规则的基础地址或实际要求的页面地址。
- **反反爬虫**：用于 XPath 搜索响应被验证页替代的情况。应根据网站实际验证方式配置检测条件和交互步骤。

### POST 搜索

部分网站通过 `POST` 表单提交关键词，搜索完成后地址栏不会包含完整参数。以下以 `https://www.mengdao.tv/` 为例。

先在网站中执行一次搜索：

![](/docs/assets/rules-QA/POST01.png)

打开开发者工具的“网络”面板并重新执行搜索或刷新页面：

![](/docs/assets/rules-QA/POST02.png)

选择负责搜索的 `search.php` 请求，在“负载”或“Payload”中确认表单字段名：

![](/docs/assets/rules-QA/POST03.png)

本例的关键词字段为 `searchword`：

![](/docs/assets/rules-QA/POST04.png)

在 Kazumi 中将搜索请求方法设为 `POST`，并把字段及占位变量写入 `SearchURL`：

```text
https://www.mengdao.tv/search.php?searchword=@keyword
```

执行规则时，Kazumi 会移除 URL 查询部分，并将 `searchword` 作为表单字段提交。

### 网站阻止打开开发者工具

如果网站拦截快捷键或检测停靠式开发者工具，可以依次尝试：

1. 在空白标签页中通过浏览器菜单打开开发者工具，再访问目标网站。
2. 将开发者工具切换为独立窗口，避免网页尺寸变化触发检测。
3. 使用单独的浏览器配置文件进行分析，避免影响日常浏览数据。
4. 如需安装用于解除限制的扩展或用户脚本，应核对来源和权限，不要在包含账号或敏感 Cookie 的浏览器配置中运行未经审查的脚本。

若网站仍持续跳转或返回验证页，应优先选择结构更稳定、无需复杂验证的来源，或改用其公开 JSON 接口编写 API 规则。
