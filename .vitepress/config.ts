import { defineConfig } from 'vitepress'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'
import { docsSidebar } from "../src/docs/sidebar";
import footnotePlugin from 'markdown-it-footnote'

export default defineConfig({
  srcDir: "./src",
  title: "Kazumi",
  head: [
    ["link", { rel: "icon", href: "/favicon.ico" }],
    ["style", {}, `
      /* 页脚原有样式（保持紧凑和居中） */
      .VPFooter {
        padding: 15px 0 !important;
      }
      
      .VPFooter .container {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        flex-wrap: wrap;
        gap: 16px;
      }
      
      .VPFooter .message,
      .VPFooter .copyright {
        line-height: 1.2;
        font-size: 14px;
        margin: 0;
      }
      
      @media (max-width: 768px) {
        .VPFooter .container {
          flex-direction: column;
          gap: 4px;
          text-align: center;
        }
      }

      /* 链接动画样式 */
      .VPFooter .message a,
      .VPFooter .copyright a {
        position: relative;
        display: inline-block;
        text-decoration: none !important;
        color: inherit;
        padding: 2px 0;
        transition: transform 0.3s ease, color 0.3s ease, text-shadow 0.3s ease;
      }
      
      .VPFooter .message a:hover,
      .VPFooter .copyright a:hover {
        transform: translateY(-6px);
        color: #34d399;
        text-shadow: 0 1px 2px rgba(0,0,0,0.1);
      }
      
      .VPFooter a::after {
        content: '';
        position: absolute;
        width: 0;
        height: 1.5px;
        bottom: 0;
        left: 0;
        background-color: #34d399;
        transition: width 0.3s ease;
      }
      
      .VPFooter a:hover::after { width: 100%; }
    `]
  ],

  markdown: {
    lineNumbers: true,
    image: { lazyLoading: true },
    config: (md) => {
      md.use(footnotePlugin)
      md.use(groupIconMdPlugin)
    }
  },

  vite: { plugins: [groupIconVitePlugin()] },

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
          { text: '参与贡献', link: 'https://github.com/Predidit/Kazumi/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22good%20first%20issue%22' }
        ]
      }
    ],
    sidebar: { '/docs/': docsSidebar() },
    editLink: {
      pattern: 'https://github.com/Predidit/kazumi-website/edit/main/src/:path',
      text: '帮助我们改进本页面内容'
    },
    outline: { level: [2, 3], label: '页面导航' },
    docFooter: { prev: '上一篇', next: '下一篇' },
    search: { provider: "local" },
    notFound: { quote: '吔？页面不见了', linkText: '回首页' },
    darkModeSwitchLabel: '主题',
    lastUpdated: { text: "上次更新" },
    socialLinks: [{ icon: 'github', link: 'https://github.com/Predidit/Kazumi' }],
    footer: {
      message: 'Released under the <a href="https://www.gnu.org/licenses/gpl-3.0.html" target="_blank" rel="noopener noreferrer">GPL-3.0 License</a>.',
      copyright: 'Copyright © 2024-2025 <a href="https://github.com/Predidit" target="_blank" rel="noopener noreferrer">Predidit</a>. All rights reserved.'
    }
  }
})
