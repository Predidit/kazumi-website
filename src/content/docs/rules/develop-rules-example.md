---
title: "XPath 规则示例"
description: "Kazumi XPath 规则开发的实际示例，展示完整的规则配置和选择器写法。"
section: "规则指南"
icon: "snippet_folder"
order: 3
authors:
  - Predidit
  - azxcvn
---

# XPath 规则示例

上一篇教程使用 `https://www.dm539.com/` 分析 XPath，其完整规则如下。各行依次对应规则名称、版本、基础地址、搜索地址以及五个 XPath 字段：

```text
樱花动漫
1.0
https://www.dm539.com/
https://www.dm539.com/search/-------------.html?wd=@keyword&submit=
//div[1]/div/div[1]/div/div/div[2]/ul//li
//div[2]/h4/a
//div[2]/p[5]/a[2]
//div[2]/div[3]/div[1]/div[1]/div/div[2]//div
//ul/li/a
```

## 搜索结果没有独立详情按钮

`https://www.akianime.cc/` 的搜索结果没有独立详情按钮，但作品名称可以点击。此时 `SearchResult` 必须选择能够进入下一页面的实际链接，不能机械套用上一示例中的元素位置。

可用规则如下：

```text
akianime
1.3
https://www.akianime.cc/
https://www.akianime.cc/bgmsearch/-------------.html?wd=@keyword
//div[@class='vod-detail style-detail cor4 search-list']
//div/div[2]/a/h3
//div/div[2]/div[5]/div[1]/a
//ul[@class='anthology-list-play size']
//li/a
```

该规则有两处需要特别注意：

- `SearchList` 必须准确选择每个搜索结果的外层容器，否则无法稳定提取名称和链接。
- `SearchResult` 指向可进入播放页面的实际入口，后续 `ChapterRoads` 和 `ChapterResult` 均按照该播放页面的结构编写。

下面的配置展示了直接套用常规路径时可能出现的问题。它可以定位页面元素，但 `SearchResult` 指向的页面与选集 XPath 所依据的页面不一致，因此点击搜索结果后无法得到有效选集：

```text
错误示例
1.0
https://www.akianime.cc/
https://www.akianime.cc/bgmsearch/-------------.html?wd=@keyword
//div[5]/div//div
//div/div[2]/a/h3
//div/div[2]/a/h3
//div[7]/div[2]/div[2]//div
//div/ul/li/a
```

编写规则时，应以实际页面跳转和 HTML 层级为准。部分网站的结构可能缺少稳定的 `id` 或 `class`，例如 `https://anime1.me/`；对于此类站点，需要优先寻找具有稳定语义的父容器，并通过规则测试确认结果数量和顺序。
