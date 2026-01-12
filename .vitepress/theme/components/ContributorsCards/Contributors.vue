<script setup lang="ts">
import ContributorItem from './ContributorsItem.vue'  // 单个贡献者组件

// 定义组件属性接口
interface Props {
    members: {
        avatar: string
        name: string
        link: string
    }[]
}

// 接收贡献者数据
const { members } = defineProps<Props>()

</script>

<template>
    <div class="Contributors">
        <!-- 使用CSS Grid布局展示贡献者 -->
        <div class="container">
            <div v-for="member in members" :key="member.name" class="item">
                <ContributorItem :member="member" />
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 响应式网格布局 */
.Contributors .container {
    grid-template-columns: repeat(auto-fit, minmax(164px, 1fr));
}

/* 不同数量贡献者的容器宽度优化 */
.Contributors.count-1 .container {
    max-width: 184px;
}

.Contributors.count-2 .container {
    max-width: calc(184px * 2 + 24px);
}

.Contributors.count-3 .container {
    max-width: calc(184px * 3 + 24px * 2);
}

/* 基础网格样式 */
.container {
    display: grid;
    gap: 24px;  /* 网格间距 */
    margin: 0 auto;
    max-width: 1152px;  /* 最大宽度 */
}
</style>