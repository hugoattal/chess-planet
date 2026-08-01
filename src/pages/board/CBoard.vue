<template>
    <main class="board-page">
        <header class="page-heading">
            <div>
                <p class="eyebrow">
                    Local game
                </p>
                <h1>Chess board</h1>
            </div>

            <UBadge
                color="primary"
                size="lg"
                variant="subtle"
            >
                {{ gameStatus }}
            </UBadge>
        </header>

        <div class="board-layout">
            <CChessBoard />
            <CMoveHistory />
        </div>
    </main>
</template>

<script setup lang="ts">
import { WHITE } from "chess.js";
import { computed } from "vue";

import CChessBoard from "@/pages/board/components/CChessBoard.vue";
import CMoveHistory from "@/pages/board/components/CMoveHistory.vue";
import { useChessStore } from "@/pages/board/store/chess.ts";

const chessStore = useChessStore();
const gameStatus = computed(() => {
    const player = chessStore.turn === WHITE ? "White" : "Black";

    if (chessStore.isCheckmate) {
        return `${ player } is checkmated`;
    }

    if (chessStore.isDraw) {
        return "Draw";
    }

    if (chessStore.isCheck) {
        return `${ player } is in check`;
    }

    return `${ player } to move`;
});
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

    .page-heading {
        display: flex;
        gap: var(--length-l);
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: var(--length-l);

        h1 {
            margin: var(--length-xxs) 0;
            font-size: clamp(1.8rem, 4vw, 2.5rem);
            font-weight: 700;
            line-height: 1.1;
        }
    }

    .eyebrow {
        color: var(--color-primary);
        font-size: var(--font-size-xs);
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
    }

    .board-layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(270px, 320px);
        gap: var(--length-l);
        align-items: start;
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
