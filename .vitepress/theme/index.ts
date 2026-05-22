// https://vitepress.dev/guide/custom-theme
import type { EnhanceAppContext } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { useRoute } from 'vitepress'
import { h, onMounted, watch, nextTick } from 'vue'

// 图标样式
import 'virtual:group-icons.css'

// Lumen 全量样式
import '@theojs/lumen/style'

// 自定义样式
import './styles/style.css'
import './styles/code-block.css'
import './styles/layout-components.css'

// Lumen 组件（按需导入）
import { BoxCube, Card, CopyText, Links, Pill } from '@theojs/lumen'

// 图片缩放
import mediumZoom from 'medium-zoom'

// 自定义组件
import GitHubReleaseDownload from './components/download.vue'
import Contributors from './components/ContributorsCards/card.vue'
import Layout from './components/layout.vue'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }: EnhanceAppContext) {
    // Lumen 组件（可在 markdown 中使用）
    app.component('BoxCube', BoxCube)
    app.component('Card', Card)
    app.component('Copy', CopyText)
    app.component('Links', Links)
    app.component('Pill', Pill)
    // 自定义组件
    app.component('GitHubReleaseDownload', GitHubReleaseDownload)
    app.component('Contributors', Contributors)
  },
  setup() {
    const route = useRoute()

    const initZoom = (): void => {
      mediumZoom('.main img', { background: 'var(--vp-c-bg)' })
    }

    onMounted(() => { initZoom() })
    watch(() => route.path, () => nextTick(() => initZoom()))
  }
}