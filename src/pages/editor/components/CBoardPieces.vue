<template>
    <TransitionGroup
        :key="chessStore.orientation"
        class="piece-layer"
        name="board-piece"
        tag="div"
    >
        <span
            v-for="boardPiece in animatedPieces"
            :key="boardPiece.id"
            :aria-grabbed="props.draggedSquare === boardPiece.square"
            :class="[
                'piece',
                `${boardPiece.color === WHITE ? 'white' : 'black'}`,
                { 'dragging': props.draggedSquare === boardPiece.square }
            ]"
            :draggable="!props.disabled && boardPiece.color === chessStore.turn"
            :style="getPiecePosition(boardPiece.square)"
            @click="emit('select', boardPiece.square)"
            @dragend="emit('dragend')"
            @dragover="emit('dragover', boardPiece.square, $event)"
            @dragstart="emit('dragstart', boardPiece.square, $event)"
            @drop.prevent="emit('drop', boardPiece.square)"
        >
            <UIcon
                aria-hidden="true"
                class="piece-icon"
                :name="pieces[boardPiece.type]"
            />
            <UIcon
                v-if="props.confirmedSquare === boardPiece.square"
                aria-label="Correct move"
                class="correct-move"
                name="lucide:check"
            />
        </span>
    </TransitionGroup>
</template>

<script setup lang="ts">
import type { Square } from "chess.js";
import { WHITE } from "chess.js";

import { useAnimatedBoardPieces } from "@/pages/editor/composables/useAnimatedBoardPieces.ts";
import { pieces } from "@/pages/editor/lib/pieces.ts";
import { useChessStore } from "@/pages/editor/store/chess.ts";

const props = defineProps<{
    confirmedSquare?: Square;
    disabled: boolean;
    draggedSquare?: Square;
}>();

const emit = defineEmits<{
    dragend: [];
    dragover: [square: Square, event: DragEvent];
    dragstart: [square: Square, event: DragEvent];
    drop: [square: Square];
    select: [square: Square];
}>();

const chessStore = useChessStore();
const { animatedPieces, getPiecePosition } = useAnimatedBoardPieces();
</script>

<style scoped>
.piece-layer {
    --board-white-piece: var(--color-white);
    --board-black-piece: var(--color-neutral-950);
    --board-piece-transition: 120ms ease-out;

    inset: 0;
    pointer-events: none;
    position: absolute;
    z-index: 1;

    .piece {
        color: inherit;
        cursor: grab;
        display: grid;
        font-size: clamp(1.8rem, 6.5vw, 4.6rem);
        height: 12.5%;
        place-items: center;
        pointer-events: auto;
        position: absolute;
        width: 12.5%;

        &:active {
            cursor: grabbing;
        }

        &.dragging {
            opacity: 0.4;
        }

        &.white {
            color: var(--board-white-piece);

            filter: drop-shadow(1px 1px 0 var(--board-dark-square))
            drop-shadow(-1px 1px 0 var(--board-dark-square))
            drop-shadow(1px -1px 0 var(--board-dark-square))
            drop-shadow(-1px -1px 0 var(--board-dark-square));
        }

        &.black {
            color: var(--board-black-piece);

            filter: drop-shadow(1px 1px 0 var(--board-light-square))
            drop-shadow(-1px 1px 0 var(--board-light-square))
            drop-shadow(1px -1px 0 var(--board-light-square))
            drop-shadow(-1px -1px 0 var(--board-light-square));
        }

        .piece-icon {
            font-size: inherit;
        }

        .correct-move {
            background: var(--ui-success);
            border: var(--length-xxxs) solid var(--color-white);
            border-radius: 50%;
            bottom: 0;
            color: var(--color-white);
            font-size: var(--font-icon-l);
            padding: var(--length-xxxs);
            position: absolute;
            right: calc(var(--length-xs) * -1);
        }
    }

    .board-piece-move {
        transition: transform var(--board-piece-transition);
    }

    .board-piece-enter-active,
    .board-piece-leave-active {
        transition:
            opacity var(--board-piece-transition),
            transform var(--board-piece-transition);
    }

    .board-piece-enter-from,
    .board-piece-leave-to {
        opacity: 0;
        transform: scale(0.85);
    }
}

@media (max-width: 520px) {
    .piece-layer {
        .piece {
            font-size: clamp(1.55rem, 10vw, 3rem);
        }
    }
}
</style>
