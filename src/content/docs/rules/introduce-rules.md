---
title: "规则介绍"
description: "了解 Kazumi 的 XPath 与 API 规则、适用场景以及对应的开发教程。"
section: "规则指南"
icon: "description"
order: 1
authors:
  - Predidit
---

# 介绍

> [!TIP]
> 本文档面向想要编写或贡献 Kazumi 规则的用户。你不需要掌握 JavaScript，但应先了解 Kazumi 的基本使用方式，并根据规则类型准备 XPath 或 HTTP、JSON 方面的基础知识。

Kazumi 规则负责完成两件事：根据关键词返回作品列表，再根据选中的作品返回播放线路和剧集页面。视频资源的启发式获取属于 Kazumi 的内部实现，你只需要帮助 Kazumi 找到最终播放页面。

目前可以分别为搜索和选集选择以下规则类型：

- **XPath 规则**：请求网页 HTML，再通过 XPath 定位搜索结果、播放线路和剧集链接。适合服务端已经输出完整 HTML 的传统网站。请从 [XPath 规则开发](/docs/rules/develop-rules) 开始，并参考 [XPath 规则示例](/docs/rules/develop-rules-example)。
- **API 规则**：直接请求网站的 JSON 接口，再通过 JSONPath 提取作品、线路和剧集信息。适合由前端调用接口加载内容的网站。请阅读 [API 规则开发](/docs/rules/develop-api-rules)。

搜索和选集类型可以独立选择，因此同一规则也可以组合使用 XPath 搜索与 API 选集，或 API 搜索与 XPath 选集。初次开发时建议先选择一种类型完成整条数据链路，再根据网站实际结构混合配置。
