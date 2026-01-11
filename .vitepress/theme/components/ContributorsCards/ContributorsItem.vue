<script setup lang="ts">

interface Props {
    member: {
        avatar: string
        name: string
        link: string
    }
}

const { member } = defineProps<Props>()
</script>

<template>
    <article class="ContributorsItem">
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
.ContributorsItem {
    display: flex;
    flex-direction: column;
    gap: 2px;
    border-radius: 12px;
    width: 100%;
    height: 100%;
    overflow: hidden;
    transition: transform 0.3s;
}

.ContributorsItem:hover {
    transform: translateY(-5px);
}

.ContributorsItem .profile {
    padding: 32px;
}

.ContributorsItem .data {
    padding-top: 20px;
}

.ContributorsItem .avatar {
    width: 64px;
    height: 64px;
}

.ContributorsItem .name {
    line-height: 24px;
    font-size: 16px;
}

.ContributorsItem .desc {
    padding-top: 12px;
    line-height: 20px;
    font-size: 14px;
}

.ContributorsItem .links {
    margin: 0 -16px -20px;
    padding: 10px 0 0;
}

.profile {
    flex-grow: 1;
    background-color: var(--vp-c-bg-soft);
}

.data {
    text-align: center;
}

.avatar {
    position: relative;
    flex-shrink: 0;
    margin: 0 auto;
    border-radius: 50%;
    box-shadow: var(--vp-shadow-3);
}

.avatar-img {
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    border-radius: 50%;
    object-fit: cover;
}

.name {
    margin: 0;
    font-weight: 600;
}
</style>