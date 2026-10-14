---
title: "认识 Kazumi"
description: "了解 Kazumi：一款基于 Flutter 开发的跨平台番剧采集与在线观看程序，支持自定义规则、弹幕、实时超分辨率和多平台使用。"
section: "开始使用"
icon: "info"
order: 1
authors:
  - ErBWs
---

# 认识 Kazumi

Kazumi 是一款基于自定义规则的跨平台番剧采集与在线观看应用。应用本身不内置任何番剧源或默认规则，你可以按需导入、管理规则，在熟悉的设备上搜索和观看番剧。

## 第一次使用，从这里开始

1. [下载 Kazumi](/download)，选择适合设备的版本。iOS 和 HarmonyOS 用户可以先阅读对应的安装指南。
2. 完成首次启动引导：确认免责声明，配置访问加速与更新来源，并在引导最后一步从规则仓库**添加至少一条规则**（没有规则时无法搜索和播放番剧，也可稍后在 `我的` → `规则管理` 中添加）。
3. [认识规则](/docs/rules/introduce-rules)，了解如何导入、管理与分享内容来源。
4. [探索功能](/docs/intro/module-details)，按自己的习惯设置播放器、弹幕、网络加速与同步备份。

遇到安装或播放问题时，可以先查看[常见问题](/docs/misc/qa)。

## 让观看更合心意

Kazumi 支持基于 Anime4K 的实时超分辨率、多源弹幕（含简繁转换与屏蔽词同步）、截图连拍挑选、一起看、DLNA 投屏与硬件加速。你可以在[软件界面](/docs/intro/screenshots)中预览各功能模块的实际外观。

## 想要自己写一条规则？

Kazumi 支持分别为搜索和选集选择 **XPath** 或 **API** 规则，也可以将两者混合搭配：

- 若目标网站直接返回完整 HTML，可从 [XPath 规则开发](/docs/rules/develop-rules) 开始，并结合 [XPath 规则示例](/docs/rules/develop-rules-example) 动手实践。
- 若目标网站提供 JSON 接口，或需要用 API 搜索出的裸 ID 拼接详情页地址，请阅读 [API 规则开发](/docs/rules/develop-api-rules)。
