import { defineConfig } from 'vitepress'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'
import { docsSidebar } from "../src/docs/sidebar";

// https://blog.csdn.net/ashtyukjhf/article/details/129657613
import footnote_plugin from 'markdown-it-footnote'

export default defineConfig({
  srcDir: "./src",
  title: "Kazumi",
  head: [
    ["link", { rel: "icon", href: "/favicon.ico" }],
    // 添加自定义样式
    ["style", {}, `
      .VPFooter .container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        flex-wrap: wrap;
      }
      .VPFooter .message {
        order: 1;
      }
      .VPFooter .copyright {
        order: 2;
      }
      @media (max-width: 768px) {
        .VPFooter .container {
          flex-direction: column;
          gap: 8px;
        }
        .VPFooter .message, .VPFooter .copyright {
          order: unset;
        }
      }
    `]
  ],

  markdown: {
    lineNumbers: true,
    image: {
      lazyLoading: true,
    },
    config: (md) => {
      md.use(footnote_plugin)
      md.use(groupIconMdPlugin)
    }
  },

  vite: {
    plugins: [
      groupIconVitePlugin()
    ],
  },

  lastUpdated: true,

  themeConfig: {
    logo: '/logo.png',

    nav: [
      { text: '主页', link: '/' },
      { text: '文档', link: '/docs/intro/what-is-kazumi' },
      {
        text: '关于',
        items: [
          { text: '图标', link: '/about/icon' },
          { text: 'Issue', link: 'https://github.com/Predidit/Kazumi/issues' },
          {
            text: '参与贡献',
            link: 'https://github.com/Predidit/Kazumi/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22good%20first%20issue%22'
          },
        ]
      }
    ],

    sidebar: {
      '/docs/': docsSidebar()
    },

    editLink: {
      pattern: 'https://github.com/Predidit/kazumi-website/edit/main/src/:path',
      text: '帮助我们改进本页面内容'
    },

    outline: {
      level: [2, 3],
      label: '页面导航'
    },

    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    },

    search: {
      provider: "local",
    },

    notFound: {
      quote: '吔？页面不见了',
      linkText: '回首页'
    },

    darkModeSwitchLabel: '主题',

    lastUpdated: {
      text: "上次更新",
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Predidit/Kazumi' },
    ],

    footer: {
      message: 'Released under the <a href="https://www.gnu.org/licenses/gpl-3.0.html" target="_blank" rel="noopener noreferrer">GPL-3.0 License</a>.',
      copyright: 'Copyright © 2024-2025 Predidit. All rights reserved.'
    }
  }
})
