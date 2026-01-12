<script setup lang="ts">
// 定义组件属性接口
interface Props {
    member: {
        avatar: string
        name: string
        link: string
    }
}

// 接收单个贡献者数据
const { member } = defineProps<Props>()
</script>

<template>
    <article class="ContributorsItem">
        <!-- 点击跳转到贡献者GitHub主页 -->
        <a class="profile" :href="member.link" target="_blank" rel="noopener noreferrer">
            <figure class="avatar">
                <img class="avatar-img" :src="member.avatar" :alt="member.name" />
            </figure>
            <div class="data">
                <h1 class="name">
                    {{ member.name }}
                </h1>
            </div>
        </a>
    </article>
</template>

<style scoped>
/* 贡献者卡片基础样式 */
.ContributorsItem {
    display: flex;
    flex-direction: column;
    gap: 2px;
    border-radius: 12px;  /* 圆角 */
    width: 100%;
    height: 100%;
    overflow: hidden;
    transition: transform 0.3s;  /* 悬停动画 */
}

/* 悬停效果 */
.ContributorsItem:hover {
    transform: translateY(-5px);  /* 向上移动 */
}

/* 卡片内容区域 */
.ContributorsItem .profile {
    padding: 32px;
}

.ContributorsItem .data {
    padding-top: 20px;
}

/* 头像样式 */
.ContributorsItem .avatar {
    width: 64px;
    height: 64px;
}

/* 姓名样式 */
.ContributorsItem .name {
    line-height: 24px;
    font-size: 16px;
}

/* 描述样式 */
.ContributorsItem .desc {
    padding-top: 12px;
    line-height: 20px;
    font-size: 14px;
}

/* 链接样式 */
.ContributorsItem .links {
    margin: 0 -16px -20px;
    padding: 10px 0 0;
}

/* 背景色 */
.profile {
    flex-grow: 1;
    background-color: var(--vp-c-bg-soft);  /* 使用主题软背景色 */
}

/* 文本居中 */
.data {
    text-align: center;
}

/* 圆形头像 */
.avatar {
    position: relative;
    flex-shrink: 0;
    margin: 0 auto;
    border-radius: 50%;  /* 圆形 */
    box-shadow: var(--vp-shadow-3);  /* 阴影 */
}

/* 头像图片样式 */
.avatar-img {
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    border-radius: 50%;
    object-fit: cover;  /* 保持比例 */
}

/* 姓名标题 */
.name {
    margin: 0;
    font-weight: 600;  /* 加粗 */
}
</style>