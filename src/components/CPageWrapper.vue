<template>
    <div class="page-wrapper">
        <CHeader />
        <UMain>
            <slot />
        </UMain>
        <USeparator icon="lucide:save" />
        <CFooter />
    </div>
</template>

<script setup lang="ts">
import CFooter from "@/components/CFooter.vue";
import CHeader from "@/components/CHeader.vue";
</script>

<style scoped>
</style>
