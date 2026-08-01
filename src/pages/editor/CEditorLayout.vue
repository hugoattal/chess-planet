<template>
    <main class="board-page">
        <div class="board-layout">
            <CChessBoard />
            <div class="side">
                <div class="actions">
                    <UButton
                        color="neutral"
                        icon="lucide:refresh-cw"
                        :label="isBlackOrientation ? 'Play as white' : 'Play as black'"
                        size="sm"
                        variant="soft"
                        @click="chessStore.turnBoard"
                    />
                </div>
                <CMoveHistory />
            </div>
        </div>
    </main>
</template>

<script setup lang="ts">
import { BLACK, WHITE } from "chess.js";
import { computed, watch } from "vue";
import { useRoute } from "vue-router";

import CChessBoard from "@/pages/editor/components/CChessBoard.vue";
import CMoveHistory from "@/pages/editor/components/CMoveHistory.vue";
import { useChessStore } from "@/pages/editor/store/chess.ts";

const chessStore = useChessStore();
const route = useRoute();

const isBlackOrientation = computed(() => chessStore.orientation === BLACK);

watch(() => [route.query.line, route.query.color], ([line, color]) => {
    chessStore.setOrientation(color === "black" ? BLACK : WHITE);

    if (typeof line === "string") {
        chessStore.loadLine(line);
        return;
    }

    chessStore.reset();
}, { immediate: true });
</script>

<style scoped>
.board-page {
    --board-light-square: color-mix(in oklab, var(--color-primary) 100%, var(--color-black));
    --board-dark-square: color-mix(in oklab, var(--color-primary) 75%, var(--color-black));
    --board-highlight: color-mix(in oklab, var(--color-primary) 64%, var(--color-white));
    --board-white-piece: var(--color-white);
    --board-black-piece: var(--color-neutral-950);

    width: min(100%, 1160px);
    margin: 0 auto;
    padding: var(--length-xxl) var(--length-m) var(--length-xxxl);

    .board-layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(270px, 320px);
        gap: var(--length-l);
        align-items: start;

        .side {
            display: flex;
            flex-direction: column;
            gap: var(--length-xs);
            height: 100%;

            .actions {
                display: flex;
                gap: var(--length-xs);
            }
        }
    }
}

@media (max-width: 820px) {
    .board-page {
        padding-top: var(--length-xl);

        .board-layout {
            grid-template-columns: 1fr;
        }
    }
}

@media (max-width: 520px) {
    .board-page {
        padding-right: var(--length-xs);
        padding-left: var(--length-xs);

        .page-heading {
            align-items: flex-start;
            flex-direction: column;
            gap: var(--length-s);
        }
    }
}
</style>
