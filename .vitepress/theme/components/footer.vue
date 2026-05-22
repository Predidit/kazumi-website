<script setup lang="ts">
import type { FooterData } from "@theojs/lumen";
import { Footer } from "@theojs/lumen";

const footerData: FooterData = {
  group: [
    {
      title: "项目",
      icon: { icon: "mdi:code-tags", color: "var(--vp-c-brand-1)" },
      links: [
        {
          name: "GitHub",
          link: "https://github.com/Predidit/Kazumi",
          icon: "mdi:github",
        },

        { name: "下载", link: "/download", icon: "mdi:download" },
      ],
    },
    {
      title: "文档",
      icon: { icon: "mdi:book-open-page-variant", color: "#4a9eff" },
      links: [
        {
          name: "快速开始",
          link: "/docs/intro/what-is-kazumi",
          icon: "mdi:rocket-launch",
        },
        { name: "关于图标", link: "/about/icon", icon: "mdi:palette" },
      ],
    },
    {
      title: "社区",
      icon: { icon: "mdi:account-group", color: "#ff6e6e" },
      links: [
        {
          name: "Issues",
          link: "https://github.com/Predidit/Kazumi/issues",
          icon: "mdi:bug-outline",
        },
        {
          name: "Telegram",
          link: "https://t.me/kazumi_app",
          icon: "mdi:telegram",
        },
      ],
    },
  ],
  author: {
    name: "Predidit",
    startYear: 2024,
    link: "https://github.com/Predidit",
    icon: { icon: "ri:copyright-line" },
    text: "MIT licensed",
  },
};
</script>

<template>
  <Footer :Footer_Data="footerData" />
</template>
