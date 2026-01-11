<script setup lang="ts">
import { VPTeamMembers } from 'vitepress/theme'
import Contributors from './Contributors.vue'
import { computed, shallowRef } from 'vue'
import { iconMap } from '../icon'

// 导入贡献者数据
import contributorsData from '/public/contributors.json'

const members = computed(() => [
  {
    avatar: 'https://github.com/Predidit.png',
    name: 'Predidit',
    title: ('作者'),
    links: [
      { icon: 'github', link: 'https://github.com/Predidit' },
    ],
  },
  {
    avatar: 'https://github.com/ErBWs.png',
    name: 'ErBWs',
    title: ('鸿蒙版作者'),
    links: [
      { icon: 'github', link: 'https://github.com/ErBWs' },
      {icon: { svg: iconMap.bilibili }, link: 'https://space.bilibili.com/28325282'}
    ],
  }
])

// 使用从 JSON 文件导入的贡献者数据
const contributors = computed(() => {
  // 确保数据格式正确
  if (contributorsData && contributorsData.contributors) {
    return contributorsData.contributors
  }
  // 如果导入失败，返回空数组
  return []
})
</script>

<template>
  <div flex="~ col wrap" mt8 items-center>
    <h2 text="center gray xl" mt-11 mb-4 pb-2>
      Kazumi 开发自 ❤
    </h2>
    <VPTeamMembers size="small" :members />
  </div>
  <div flex="~ col wrap" mt8 items-center>
    <h2 text="center gray xl" mt-11 mb-4 pb-2>
      感谢以下贡献者
    </h2>
    <Contributors class="w-full px-4" :members="contributors" />
  </div>
</template>

<style></style>