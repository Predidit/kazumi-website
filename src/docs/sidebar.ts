import { DefaultTheme } from "vitepress";

export function docsSidebar(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: '简介',
      items: [
        { text: 'Kazumi 是什么？', link: '/docs/intro/what-is-kazumi' },
        { text: '如何下载', link: '/docs/intro/how-to-download' },
        { text: '软件界面', link: '/docs/intro/screenshots' },
        { text: '功能模块', link: '/docs/intro/module_details' },
      ]
    },
    {
      text: '规则指南',
      items: [
        { text: '规则介绍', link: '/docs/rules/introduce-rules' },
        { text: '规则开发', link: '/docs/rules/develop-rules' },
        { text: '规则示例', link: '/docs/rules/develop-rules-example' },
      ]
    },
    {
      text: '架构',
      items: [
        { text: '视频嗅探', link: '/docs/architecture/video-parser' },
        { text: 'BBCode 解析', link: '/docs/architecture/bbcode' },
      ]
    },
    {
      items: [
        { text: '常见问题', link: '/docs/qa' },
      ]
    },
  ]
}
