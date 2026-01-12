// 导入VitePress默认主题
import DefaultTheme from "vitepress/theme";
// 图标样式
import 'virtual:group-icons.css'
import { useRoute } from 'vitepress';
import { onMounted, watch, nextTick } from 'vue';
// 图片缩放
import mediumZoom from 'medium-zoom';
import type { EnhanceAppContext } from 'vitepress';

// 自定义样式
import "./styles/style.css";
import "./styles/custom-block.css";
import "./styles/code-block.css";
import "./styles/layout-components.css"

// 自定义组件
import GitHubReleaseDownload from './components/download.vue'
import Contributors from './components/ContributorsCards/card.vue'

export default {
  ...DefaultTheme,
  // 注册全局组件
  enhanceApp({ app }: EnhanceAppContext) {
    app.component('GitHubReleaseDownload', GitHubReleaseDownload)
    app.component('Contributors', Contributors)
  },
  setup() {
    const route = useRoute();

    // 图片缩放初始化
    const initZoom = (): void => {
      mediumZoom('.main img', { background: 'var(--vp-c-bg)' });
    };

    onMounted(() => {
      initZoom();
    });

    // 路由变化时重新初始化
    watch(
      () => route.path,
      () => nextTick(() => initZoom())
    );
  },
};