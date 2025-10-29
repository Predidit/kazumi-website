import DefaultTheme from "vitepress/theme";
import 'virtual:group-icons.css'
import { useRoute } from 'vitepress';
import { onMounted, watch, nextTick } from 'vue';
import mediumZoom from 'medium-zoom';
import MyLayout from './Layout.vue'

import "./style.css";
import "./kbd.css";
import "./overall.css";
import "./custom-block.css";
import "./font.css";
import "./medium-zoom.css";
import "./code-block.css";
import "./footer.css"

export default {
  ...DefaultTheme,
  Layout: MyLayout,
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
