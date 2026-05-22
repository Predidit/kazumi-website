import { defineConfig } from 'vitepress'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'
import { docsSidebar } from "../src/docs/sidebar";
import footnotePlugin from 'markdown-it-footnote'

export default defineConfig({
  cleanUrls: true, // 去除 .html 后缀
  srcDir: "./src", // 源文件目录
  title: "Kazumi", // 网站标题

  head: [
    ["link", { rel: "icon", href: "/favicon.ico" }], // 网站图标
  ],

  // Markdown 配置
  markdown: {
    lineNumbers: true, // 代码行号
    image: { lazyLoading: true }, // 图片懒加载
    config: (md) => {
      md.use(footnotePlugin) // 脚注插件
      md.use(groupIconMdPlugin) // 图标分组插件
    }
  },

  vite: { plugins: [groupIconVitePlugin()] }, // Vite 插件

  // 支持 iconify-icon Web Component
  vue: {
    template: {
      compilerOptions: { isCustomElement: (tag) => tag === 'iconify-icon' }
    }
  },

  lastUpdated: true, // 显示最后更新时间

  // 主题配置
  themeConfig: {
    logo: '/logo.png', // 导航栏 Logo
    nav: [ // 导航菜单
      { text: '<iconify-icon icon="mdi:home" style="color:var(--vp-c-brand-1)" class="i-mr"></iconify-icon>主页', link: '/' },
      { text: '<iconify-icon icon="mdi:file-document" style="color:#4a9eff" class="i-mr"></iconify-icon>文档', link: '/docs/intro/what-is-kazumi' },
      { text: '<iconify-icon icon="mdi:download" style="color:#ff9500" class="i-mr"></iconify-icon>下载', link: '/download' },
      {
        text: '<iconify-icon icon="mdi:information" style="color:#a371f7" class="i-mr"></iconify-icon>关于',
        items: [
          { text: '<iconify-icon icon="mdi:palette" style="color:#e879f9" class="i-mr"></iconify-icon>图标', link: '/about/icon' },
          { text: '<iconify-icon icon="mdi:github" style="color:#8b949e" class="i-mr"></iconify-icon>Issue', link: 'https://github.com/Predidit/Kazumi/issues' },
          { text: '<iconify-icon icon="mdi:hand-heart" style="color:#f43f5e" class="i-mr"></iconify-icon>参与贡献', link: 'https://github.com/Predidit/Kazumi/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22good%20first%20issue%22' }
        ]
      }
    ],
    sidebar: { '/docs/': docsSidebar() }, // 文档侧边栏
    editLink: { // 编辑链接
      pattern: 'https://github.com/Predidit/kazumi-website/edit/main/src/:path',
      text: '帮助我们改进本页面内容'
    },
    outline: { level: [1, 4], label: '页面导航' }, // 大纲目录
    docFooter: { prev: '上一篇', next: '下一篇' }, // 文档翻页
    search: { provider: "local" }, // 本地搜索
    notFound: { quote: '吔？页面不见了', linkText: '回首页' }, // 404 页面
    darkModeSwitchLabel: '主题', // 主题切换标签
    lastUpdated: { text: "上次更新" }, // 最后更新时间文本
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Predidit/Kazumi' },
      { icon: { svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.05-.2s-.16-.05-.23-.03c-.1.02-1.64 1.04-4.63 3.06-.44.3-.84.45-1.19.44-.39-.01-1.14-.22-1.7-.4-.68-.22-1.23-.34-1.18-.72.02-.2.3-.4.82-.6 3.22-1.4 5.37-2.33 6.44-2.77 3.07-1.28 3.71-1.5 4.12-1.51.09 0 .3.02.43.13.11.09.14.21.15.3.01.06.01.23 0 .37z"/></svg>' }, link: 'https://t.me/kazumi_app' }
    ] // 社交链接
  }
})