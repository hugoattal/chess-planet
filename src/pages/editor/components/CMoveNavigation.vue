<template>
    <div class="move-navigation">
        <UButton
            aria-label="Go to the start"
            color="neutral"
            :disabled="!chessStore.canGoBackward"
            icon="lucide:chevrons-left"
            size="xl"
            variant="soft"
            @click="chessStore.goToStart"
        />
        <UButton
            aria-label="Go to the previous move"
            color="neutral"
            :disabled="!chessStore.canGoBackward"
            icon="lucide:chevron-left"
            size="xl"
            variant="soft"
            @click="chessStore.goBackward"
        />
        <UButton
            aria-label="Go to the next move"
            color="neutral"
            :disabled="!chessStore.canGoForward"
            icon="lucide:chevron-right"
            size="xl"
            variant="soft"
            @click="chessStore.goForward"
        />
        <UButton
            aria-label="Go to the end"
            color="neutral"
            :disabled="!chessStore.canGoForward"
            icon="lucide:chevrons-right"
            size="xl"
            variant="soft"
            @click="chessStore.goToEnd"
        />
    </div>
</template>

<script setup lang="ts">
import { useChessStore } from "@/pages/editor/store/chess.ts";

const chessStore = useChessStore();
</script>

<style scoped>
.move-navigation {
    display: grid;
    gap: var(--length-xs);
    grid-template-columns: repeat(4, minmax(0, 1fr));
    width: 100%;

    > * {
        justify-content: center;
    }
}
</style>
