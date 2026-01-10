import DefaultTheme from "vitepress/theme";
import 'virtual:group-icons.css'
import { useRoute } from 'vitepress';
import { onMounted, watch, nextTick } from 'vue';
import mediumZoom from 'medium-zoom';
import type { EnhanceAppContext } from 'vitepress';

import "./styles/style.css";
import "./styles/kbd.css";
import "./styles/overall.css";
import "./styles/custom-block.css";
import "./styles/font.css";
import "./styles/medium-zoom.css";
import "./styles/code-block.css";
import "./styles/footer.css"

// 导入自定义组件
import GitHubReleaseDownload from './components/download.vue'

export default {
  ...DefaultTheme,
  // 注册全局组件
  enhanceApp({ app }: EnhanceAppContext) {
    app.component('GitHubReleaseDownload', GitHubReleaseDownload)
  },
  setup() {
    const route = useRoute();

    const initZoom = (): void => {
      mediumZoom('.main img', { background: 'var(--vp-c-bg)' });
    };

    onMounted(() => {
      initZoom();
    });

    watch(
      () => route.path,
      () => nextTick(() => initZoom())
    );
  },
};
