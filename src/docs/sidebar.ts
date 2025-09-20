import { DefaultTheme } from "vitepress";

export function docsSidebar(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: '简介',
      items: [
        { text: 'Kazumi 是什么？', link: '/docs/intro/what-is-kazumi' },
        { text: '如何下载', link: '/docs/intro/how-to-download' },
        { text: '软件界面', link: '/docs/intro/screenshots' },
      ]
    },
    {
      text: '架构',
      items: [
        { text: '实现原理', link: '/docs/architecture/implementation-details' }
      ]
    },
    {
      items: [
        { text: '常见问题', link: '/docs/qa' },
      ]
    },
  ]
}
