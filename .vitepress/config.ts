import { defineConfig } from 'vitepress'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'
import { docsSidebar } from "../src/docs/sidebar";
import footnotePlugin from 'markdown-it-footnote'

export default defineConfig({
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

  lastUpdated: true, // 显示最后更新时间

  // 主题配置
  themeConfig: {
    logo: '/logo.png', // 导航栏 Logo
    nav: [ // 导航菜单
      { text: '主页', link: '/' },
      { text: '文档', link: '/docs/intro/what-is-kazumi' },
      { text: '下载', link: '/download'},
      {
        text: '关于',
        items: [
          { text: '图标', link: '/about/icon' },
          { text: 'Issue', link: 'https://github.com/Predidit/Kazumi/issues' },
          { text: '参与贡献', link: 'https://github.com/Predidit/Kazumi/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22good%20first%20issue%22' }
        ]
      }
    ],
    sidebar: { '/docs/': docsSidebar() }, // 文档侧边栏
    editLink: { // 编辑链接
      pattern: 'https://github.com/Predidit/kazumi-website/edit/main/src/:path',
      text: '帮助我们改进本页面内容'
    },
    outline: { level: [2, 3], label: '页面导航' }, // 大纲目录
    docFooter: { prev: '上一篇', next: '下一篇' }, // 文档翻页
    search: { provider: "local" }, // 本地搜索
    notFound: { quote: '吔？页面不见了', linkText: '回首页' }, // 404 页面
    darkModeSwitchLabel: '主题', // 主题切换标签
    lastUpdated: { text: "上次更新" }, // 最后更新时间文本
    socialLinks: [{ icon: 'github', link: 'https://github.com/Predidit/Kazumi' }], // 社交链接
    footer: { // 页脚
      message: '用❤发电',
      copyright: '<a href="https://www.gnu.org/licenses/gpl-3.0.html">GPL-3.0</a> license © 2024-PRESENT <a href="https://github.com/Predidit">Predidit</a>'
    }
  }
})