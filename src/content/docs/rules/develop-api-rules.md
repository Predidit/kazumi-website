---
title: "API 规则开发"
description: "以 TvTFun 为例学习 Kazumi API 规则，包括接口定位、JSONPath、请求模板和播放页构造。"
section: "规则指南"
icon: "api"
order: 4
---

# API 规则开发

API 规则不解析网页 HTML，而是直接请求网站提供的 JSON 接口。相比 XPath 规则，它通常不受页面布局变化影响，也更容易准确地获取作品、线路和剧集信息。

本教程以 [TvTFun](https://www.tvtfun.net/) 为例，完成一条 API 搜索、API 选集、播放页构造的规则。第三方站点可能随时调整接口，教程中的字段以编写本文时的实际响应为准。

> [!NOTE]
> API 规则需要 Kazumi API level 8 或更高版本。请使用支持在规则编辑器中选择“API”搜索和选集类型的新版客户端。

## API 规则的数据流

一条完整的 TvTFun API 规则会依次完成以下操作：

```text
@keyword
  → 搜索接口返回作品列表
  → 提取作品 name 和内部 id
  → 将 id 作为 @source 请求详情接口
  → 提取播放线路、剧集和 slug
  → 使用 slug、线路序号、剧集序号构造播放页
```

Kazumi 目前支持 `GET` 和 `POST` 请求。每个请求都可以分别配置 URL、请求头、查询参数和请求体：

- 请求头和查询参数填写 JSON 对象。
- `POST` 请求体可选择“JSON”或“表单”；`GET` 请求通常选择“无”。
- 搜索请求可使用 `@keyword`，Kazumi 会替换为用户输入的关键词。
- 选集请求可使用 `@source`，Kazumi 会替换为搜索结果中提取的来源值。
- 播放页还可使用响应变量，以及从 0 开始的 `@roadIndex`、`@episodeIndex` 和从 1 开始的 `@roadNumber`、`@episodeNumber`。

## 准备工作

在 Kazumi 中依次进入 `我的` → `规则管理` → 右上角 `+` → `新建规则`，填写以下基础信息：

| 字段 | 值 |
| --- | --- |
| 规则名称 | `TvTFun` |
| 规则版本 | `1.0` |
| 基础地址 | `https://www.tvtfun.net/` |
| 搜索规则类型 | `API` |
| 选集规则类型 | `API` |

接口分析通常通过浏览器开发者工具的“网络”面板完成。打开面板后选择 `Fetch/XHR`，执行一次搜索，再查看新增请求的 URL、查询参数和响应 JSON。

### TvTFun 无法打开开发者工具时

TvTFun 会拦截页面中的 `F12`、`Ctrl+Shift+I`、右键菜单，并可能在检测到停靠式开发者工具后跳转。可以先在空白标签页中通过浏览器菜单打开开发者工具，将其切换为独立窗口，再访问 TvTFun。

如果仍然发生跳转，可以直接在终端复现本教程需要的请求。开发者工具只用于发现接口，不是 Kazumi 运行规则的必要条件。

```shell
curl --get "https://www.tvtfun.net/api/videos/search" --data-urlencode "q=紫罗兰永恒花园" --data "pageSize=20"
```

从搜索响应复制第一项的 `id` 后，可以继续查看详情响应：

```shell
curl "https://www.tvtfun.net/api/videos/cmp2xb96k27h2i9m8eucbwit2"
```

该站点的这两个接口无需登录、Cookie 或特殊请求头。

## Kazumi 支持的 JSONPath

JSONPath 的作用类似于 JSON 数据中的“地址”。Kazumi 使用一个受限子集，以 `$` 表示当前数据的根节点。

| 写法 | 含义 | 是否支持 |
| --- | --- | --- |
| `$.data.videos` | 依次读取对象字段 | 支持 |
| `$.data.videos[*]` | 读取数组中的所有元素 | 支持 |
| `$.data.videos[0]` | 读取指定数组元素 | 支持 |
| `$['play-sources']` | 读取需要引号表示的字段名 | 支持 |
| `$..videos` | 递归查找 | 不支持 |
| `$.videos[?(@.enabled)]` | 条件过滤 | 不支持 |
| `$.videos[0:2]` | 数组切片 | 不支持 |
| `$.videos.length()` | 函数或表达式 | 不支持 |

“相对条目”“相对线路”和“相对剧集”表示 `$` 会分别指向当前作品、当前线路或当前剧集，而不是整个接口响应。不要在这些字段中重复外层路径。

## 配置搜索接口

在 TvTFun 的搜索框中输入“紫罗兰永恒花园”时，可以在网络面板中发现相同搜索接口。网页自身使用 `pageSize=5`，规则可以将它调整为 `20`，以便一次返回更多结果：

```text
GET https://www.tvtfun.net/api/videos/search?q=紫罗兰永恒花园&pageSize=20
```

响应结构精简后如下：

```json
{
  "data": {
    "videos": [
      {
        "id": "cmp2xb96k27h2i9m8eucbwit2",
        "name": "紫罗兰永恒花园",
        "slug": "183878"
      }
    ],
    "total": 2
  }
}
```

在“搜索规则类型”下填写：

| 字段 | 值 |
| --- | --- |
| 搜索请求方法 | `GET` |
| 搜索请求地址 | `https://www.tvtfun.net/api/videos/search` |
| 搜索请求头 | 留空 |
| 搜索查询参数 | `{"q":"@keyword","pageSize":20}` |
| 搜索请求体类型 | `无` |
| 搜索结果列表路径 | `$.data.videos[*]` |
| 条目名称路径 | `$.name` |
| 条目来源路径 | `$.id` |

`$.data.videos[*]` 先得到每一个作品对象。随后 Kazumi 以每个作品为新的根节点，通过 `$.name` 读取显示名称，通过 `$.id` 读取下一步需要的内部 ID。

> [!WARNING]
> 不要在“条目来源路径”中使用 `$.slug`。TvTFun 的详情接口接收内部 `id`，而 `slug` 只用于最后构造网页播放地址。

## 配置选集接口

将搜索结果中的内部 ID 放入详情接口，可以得到作品信息、播放线路和剧集：

```text
GET https://www.tvtfun.net/api/videos/cmp2xb96k27h2i9m8eucbwit2
```

响应结构精简后如下：

```json
{
  "data": {
    "id": "cmp2xb96k27h2i9m8eucbwit2",
    "slug": "183878",
    "playSources": [
      {
        "name": "线路B",
        "episodes": [
          { "name": "第1集", "url": "protected", "sort": 0 },
          { "name": "第2集", "url": "protected", "sort": 1 }
        ]
      },
      {
        "name": "线路C",
        "episodes": [
          { "name": "第01集", "url": "protected", "sort": 0 }
        ]
      }
    ]
  }
}
```

在“选集规则类型”下填写：

| 字段 | 值 |
| --- | --- |
| 选集请求方法 | `GET` |
| 选集请求地址 | `https://www.tvtfun.net/api/videos/@source` |
| 选集请求头 | 留空 |
| 选集查询参数 | 留空 |
| 选集请求体类型 | `无` |
| 选集响应格式 | `嵌套 JSON` |
| 播放线路列表路径 | `$.data.playSources[*]` |
| 线路名称路径 | `$.name` |
| 剧集列表路径 | `$.episodes[*]` |
| 剧集名称路径 | `$.name` |
| 播放入口地址路径 | 留空 |
| 响应变量 | `{"slug":"$.data.slug"}` |
| 播放页地址模板 | `https://www.tvtfun.net/video/@slug/play` |
| 播放页查询参数 | `{"source":"@roadIndex","episode":"@episodeIndex"}` |

### 为什么播放入口地址路径必须留空

详情响应中的 `url` 固定为 `protected`，它不是可以访问的媒体地址或网页地址。如果把播放入口地址路径填写为 `$.url`，Kazumi 最终只会尝试访问类似 `https://www.tvtfun.net/protected` 的无效地址。

TvTFun 真正的播放入口由作品 `slug`、线路序号和剧集序号组成。例如第二集会被构造为：

```text
https://www.tvtfun.net/video/183878/play?source=0&episode=1
```

因此需要先通过响应变量保存 `$.data.slug`，再在播放页模板中使用 `@slug`。`source` 和 `episode` 都从 0 开始，恰好对应 `@roadIndex` 和 `@episodeIndex`。

## 测试规则

保存前点击规则编辑器右下角的测试按钮，并按以下顺序检查：

1. 搜索“紫罗兰永恒花园”，确认结果中出现同名作品。
2. 打开该结果，确认能解析出“线路B”“线路C”等播放线路及对应集数。
3. 检查第一条线路的第二集，最终地址应为 `https://www.tvtfun.net/video/183878/play?source=0&episode=1`。
4. 选择剧集并确认 Kazumi 能进入播放页进行视频资源嗅探。

接口解析成功只表示规则配置正确。第三方站点的视频源仍可能因为资源失效、地区限制或临时防护而无法播放。

## 完整规则

下面是本教程对应的完整 JSON。旧 XPath 字段在 API 模式下保留为空字符串。

```json
{
  "api": "8",
  "type": "anime",
  "name": "TvTFun",
  "version": "1.0",
  "muliSources": true,
  "useWebview": true,
  "useNativePlayer": true,
  "usePost": false,
  "useLegacyParser": false,
  "adBlocker": false,
  "userAgent": "",
  "baseURL": "https://www.tvtfun.net/",
  "searchURL": "",
  "searchList": "",
  "searchName": "",
  "searchResult": "",
  "chapterRoads": "",
  "chapterResult": "",
  "referer": "",
  "searchMode": "api",
  "chapterMode": "api",
  "searchApiConfig": {
    "request": {
      "method": "GET",
      "url": "https://www.tvtfun.net/api/videos/search",
      "query": {
        "q": "@keyword",
        "pageSize": 20
      }
    },
    "listPath": "$.data.videos[*]",
    "namePath": "$.name",
    "sourcePath": "$.id"
  },
  "chapterApiConfig": {
    "request": {
      "method": "GET",
      "url": "https://www.tvtfun.net/api/videos/@source"
    },
    "format": "nested",
    "roadsPath": "$.data.playSources[*]",
    "roadNamePath": "$.name",
    "episodesPath": "$.episodes[*]",
    "episodeNamePath": "$.name",
    "episodeUrlPath": "",
    "variables": {
      "slug": "$.data.slug"
    },
    "episodePage": {
      "url": "https://www.tvtfun.net/video/@slug/play",
      "query": {
        "source": "@roadIndex",
        "episode": "@episodeIndex"
      }
    }
  },
  "antiCrawlerConfig": {
    "enabled": false,
    "captchaType": 1,
    "captchaImage": "",
    "captchaInput": "",
    "captchaButton": "",
    "captchaDetectType": 1,
    "captchaDetectValue": "",
    "captchaScript": ""
  }
}
```

## 常见错误

### 搜索接口有数据，但 Kazumi 没有结果

确认列表路径包含数组通配符 `[*]`，即 `$.data.videos[*]`。名称和来源路径应相对于单个作品填写为 `$.name`、`$.id`，不要重复 `$.data.videos[*]`。

### 提示 JSONPath 不受支持

移除递归查找、过滤器、切片或函数调用，只使用字段、数组下标、通配符和带引号字段名。所有 JSONPath 都必须以 `$` 开头。

### 选集请求返回“视频不存在”

确认条目来源路径使用的是 `$.id`，而不是 `$.slug`。选集 URL 中的 `@source` 应被替换为形如 `cmp2xb96k27h2i9m8eucbwit2` 的内部 ID。

### 剧集地址变成了 `/protected`

清空播放入口地址路径，并检查响应变量、播放页地址模板和播放页查询参数是否完整填写。`protected` 只是接口隐藏真实资源时使用的占位文本。

### 线路或剧集错位

TvTFun 的 `source` 和 `episode` 参数从 0 开始，应使用 `@roadIndex` 和 `@episodeIndex`。`@roadNumber` 和 `@episodeNumber` 从 1 开始，不适用于本例。

### JSON 配置无法保存

请求头、查询参数、响应变量和播放页查询参数都必须是合法 JSON 对象。键名和字符串使用双引号，末尾不要添加多余逗号。
