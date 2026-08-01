<template>
    <UApp
        :locale="en"
        :tooltip="{ delayDuration: 0 }"
    >
        <MPageWrapper>
            <RouterView />
        </MPageWrapper>
    </UApp>
</template>

<script setup lang="ts">
import { en } from "@nuxt/ui/locale";

import MPageWrapper from "@/components/CPageWrapper.vue";
</script>

<style scoped>
</style>
