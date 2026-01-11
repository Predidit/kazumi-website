<script setup lang="ts">
import ContributorItem from './ContributorsItem.vue'

interface Props {
    members: {
        avatar: string
        name: string
        link: string
    }[]
}

const { members } = defineProps<Props>()


</script>

<template>
    <div class="Contributors">
        <div class="container">
            <div v-for="member in members" :key="member.name" class="item">
                <ContributorItem :member="member" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.Contributors .container {
    grid-template-columns: repeat(auto-fit, minmax(164px, 1fr));
}

.Contributors.count-1 .container {
    max-width: 184px;
}

.Contributors.count-2 .container {
    max-width: calc(184px * 2 + 24px);
}

.Contributors.count-3 .container {
    max-width: calc(184px * 3 + 24px * 2);
}

.container {
    display: grid;
    gap: 24px;
    margin: 0 auto;
    max-width: 1152px;
}
</style>