<script setup lang="ts">
import { VPTeamMembers } from "vitepress/theme";
import { computed } from "vue";
import contributorsData from "/public/contributors.json";
import { iconMap } from "./icon";

// 核心团队成员列表
const members = computed(() => [
  {
    avatar: "https://github.com/Predidit.png?size=80",
    name: "Predidit",
    title: "作者",
    links: [{ icon: "github", link: "https://github.com/Predidit" }],
  },
  {
    avatar: "https://github.com/ErBWs.png?size=80",
    name: "ErBWs",
    title: "鸿蒙版作者",
    links: [
      { icon: "github", link: "https://github.com/ErBWs" },
      {
        icon: { svg: iconMap.bilibili },
        link: "https://space.bilibili.com/28325282",
      },
    ],
  },
]);

// 从 JSON 文件获取贡献者数据
const contributors = computed(() => {
  if (contributorsData?.contributors) {
    return contributorsData.contributors.map((c) => ({
      avatar: `${c.avatar}?size=80`,
      name: c.name,
      link: c.link,
    }));
  }
  return [];
});
</script>

<template>
  <section class="contributors-section">
    <!-- 核心团队展示 -->
    <div class="authors-wrapper">
      <h2 class="section-title">Kazumi 开发自 ❤</h2>
      <VPTeamMembers size="small" :members="members" />
    </div>

    <!-- 贡献者展示 -->
    <div v-if="contributors.length > 0" class="contributors-wrapper">
      <h2 class="section-title">感谢以下贡献者</h2>
      <div class="contributors-grid">
        <a
          v-for="c in contributors"
          :key="c.name"
          :href="c.link"
          target="_blank"
          rel="noopener noreferrer"
          class="contributor-card"
        >
          <img :src="c.avatar" :alt="c.name" class="avatar" />
          <span class="name">{{ c.name }}</span>
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contributors-section {
  margin-top: 48px;
  padding: 0 24px;
}

.section-title {
  text-align: center;
  color: var(--vp-c-text-2);
  font-size: 1.25rem;
  font-weight: 500;
  margin: 48px 0 24px;
}

.authors-wrapper,
.contributors-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.authors-wrapper :deep(.VPTeamMembers) {
  width: 100%;
}

.authors-wrapper :deep(.VPTeamMembers.small .container) {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  width: 100%;
}

.authors-wrapper :deep(.VPTeamMembers.small .item) {
  width: 100%;
}

.contributors-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  width: 100%;
  max-width: 1152px;
}

.contributor-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  padding: 16px;
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  text-decoration: none;
  transition: transform 0.25s, box-shadow 0.25s;
}

.contributor-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--vp-shadow-2);
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  box-shadow: var(--vp-shadow-1);
}

.name {
  margin-top: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

@media (max-width: 768px) {
  .contributors-section {
    padding: 0 16px;
  }

  .section-title {
    margin: 32px 0 20px;
    font-size: 1.125rem;
  }

  .contributors-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .contributors-section {
    margin-top: 32px;
    padding: 0 12px;
  }

  .section-title {
    margin: 24px 0 16px;
    font-size: 1rem;
  }

  .authors-wrapper :deep(.VPTeamMembers.small .container) {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .contributors-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .contributor-card {
    padding: 12px;
  }

  .avatar {
    width: 40px;
    height: 40px;
  }
}
</style>
