<script setup lang="ts">
// 导入VitePress团队组件和工具函数
import { VPTeamMembers } from 'vitepress/theme'
import Contributors from './Contributors.vue'
import { computed, shallowRef } from 'vue'
import { iconMap } from '../icon'  // 图标映射

// 导入贡献者数据
import contributorsData from '/public/contributors.json'

// 核心团队成员列表
const members = computed(() => [
  {
    avatar: 'https://github.com/Predidit.png',
    name: 'Predidit',
    title: ('作者'),  // 作者
    links: [
      { icon: 'github', link: 'https://github.com/Predidit' },
    ],
  },
  {
    avatar: 'https://github.com/ErBWs.png',
    name: 'ErBWs',
    title: ('鸿蒙版作者'),  // 鸿蒙版作者
    links: [
      { icon: 'github', link: 'https://github.com/ErBWs' },
      {icon: { svg: iconMap.bilibili }, link: 'https://space.bilibili.com/28325282'}  // B站链接
    ],
  }
])

// 从JSON文件获取贡献者数据
const contributors = computed(() => {
  // 验证数据格式
  if (contributorsData && contributorsData.contributors) {
    return contributorsData.contributors
  }
  // 数据缺失时返回空数组
  return []
})
</script>

<template>
  <!-- 核心团队展示 -->
  <div flex="~ col wrap" mt8 items-center>
    <h2 text="center gray xl" mt-11 mb-4 pb-2>
      Kazumi 开发自 ❤
    </h2>
    <VPTeamMembers size="small" :members />
  </div>
  
  <!-- 贡献者展示 -->
  <div flex="~ col wrap" mt8 items-center>
    <h2 text="center gray xl" mt-11 mb-4 pb-2>
      感谢以下贡献者
    </h2>
    <Contributors class="w-full px-4" :members="contributors" />
  </div>
</template>

<style></style>