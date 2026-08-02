<template>
    <div class="board-panel">
        <CBoardArrows
            aria-label="Chess board"
            :arrows="arrows"
            class="chess-board"
            :flipped="isBlackOrientation"
        >
            <template
                v-for="(rank, rankIndex) in displayedBoard"
                :key="rankIndex"
            >
                <button
                    v-for="(boardSquare, fileIndex) in rank"
                    :key="boardSquare.square"
                    :aria-label="getSquareLabel(boardSquare.square, boardSquare.piece?.color, boardSquare.piece?.type)"
                    :class="getSquareClasses(boardSquare.square, rankIndex, fileIndex, Boolean(boardSquare.piece))"
                    :disabled="isDisabled"
                    type="button"
                    @click="selectBoardSquare(boardSquare.square)"
                    @dragover="allowPieceDrop(boardSquare.square, $event)"
                    @drop.prevent="dropBoardPiece(boardSquare.square)"
                >
                    <span
                        v-if="fileIndex === 0"
                        class="coordinate rank"
                    >
                        {{ boardSquare.square[1] }}
                    </span>
                    <span
                        v-if="rankIndex === 7"
                        class="coordinate file"
                    >
                        {{ boardSquare.square[0] }}
                    </span>
                </button>
            </template>

            <CBoardPieces
                :confirmed-square="confirmedSquare"
                :disabled="isDisabled"
                :dragged-square="draggedSquare"
                @dragend="clearSelection"
                @dragover="allowPieceDrop"
                @dragstart="startDraggingPiece"
                @drop="dropBoardPiece"
                @select="selectBoardSquare"
            />
        </CBoardArrows>
    </div>
</template>

<script setup lang="ts">
import type { Color, Move, PieceSymbol, Square } from "chess.js";
import { BLACK, WHITE } from "chess.js";
import { computed } from "vue";

import CBoardArrows from "@/pages/editor/components/CBoardArrows.vue";
import CBoardPieces from "@/pages/editor/components/CBoardPieces.vue";
import { useChessInteraction } from "@/pages/editor/composables/useChessInteraction.ts";
import type { TBoardArrow } from "@/pages/editor/lib/boardArrows.ts";
import { useChessStore } from "@/pages/editor/store/chess.ts";

const props = defineProps<{
    arrows?: Array<TBoardArrow>;
    confirmedSquare?: Square;
    disabled?: boolean;
}>();

const emit = defineEmits<{
    move: [move: Move];
}>();

const chessStore = useChessStore();
const arrows = computed(() => props.arrows);
const confirmedSquare = computed(() => props.confirmedSquare);
const isDisabled = computed(() => Boolean(props.disabled));
const isBlackOrientation = computed(() => chessStore.orientation === BLACK);
const displayedBoard = computed(() => {
    if (!isBlackOrientation.value) {
        return chessStore.board;
    }

    return [...chessStore.board].reverse().map((rank) => [...rank].reverse());
});

const {
    allowDrop,
    clearSelection,
    draggedSquare,
    dropPiece,
    legalMoveSquares,
    selectedSquare,
    selectSquare,
    startDragging
} = useChessInteraction((move) => emit("move", move));

function selectBoardSquare(square: Square) {
    if (!isDisabled.value) {
        selectSquare(square);
    }
}

function startDraggingPiece(square: Square, event: DragEvent) {
    if (isDisabled.value) {
        event.preventDefault();
        return;
    }

    startDragging(square, event);
}

function allowPieceDrop(square: Square, event: DragEvent) {
    if (!isDisabled.value) {
        allowDrop(square, event);
    }
}

function dropBoardPiece(square: Square) {
    if (!isDisabled.value) {
        dropPiece(square);
    }
}

function getSquareClasses(square: Square, rankIndex: number, fileIndex: number, hasPiece: boolean) {
    return {
        "capture": hasPiece && legalMoveSquares.value.has(square),
        "chess-square": true,
        "dark": (rankIndex + fileIndex) % 2 === 1,
        "legal": legalMoveSquares.value.has(square),
        "light": (rankIndex + fileIndex) % 2 === 0,
        "selected": selectedSquare.value === square
    };
}

function getSquareLabel(square: Square, color?: Color, piece?: PieceSymbol) {
    if (!color || !piece) {
        return `${ square }, empty`;
    }

    return `${ square }, ${ color === WHITE ? "white" : "black" } ${ piece }`;
}
</script>

<style scoped>
.board-panel {
    --board-light-square: color-mix(in oklab, var(--color-primary) 100%, var(--color-black));
    --board-dark-square: color-mix(in oklab, var(--color-primary) 75%, var(--color-black));
    --board-highlight: color-mix(in oklab, var(--color-primary) 64%, var(--color-white));
    --board-arrow: color-mix(in oklab, var(--color-primary) 62%, var(--color-white));

    display: grid;
    gap: var(--length-xs);
}

.chess-board {
    border: var(--length-xxs) solid var(--board-dark-square);
    border-radius: var(--radius-m);
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    overflow: hidden;
    position: relative;
    aspect-ratio: 1;

    .chess-square {
        border: 0;
        color: var(--color-text);
        cursor: pointer;
        display: grid;
        place-items: center;
        position: relative;
        aspect-ratio: 1;
        transition: filter var(--transition-default);

        &::after {
            border-radius: 50%;
            content: "";
            pointer-events: none;
            position: absolute;
        }

        &:hover {
            filter: brightness(1.25);
        }

        &:disabled {
            cursor: default;

            &:hover {
                filter: none;
            }
        }

        &:focus-visible {
            outline: var(--length-xxs) solid var(--board-highlight);
            outline-offset: calc(var(--length-xxs) * -1);
            z-index: 1;
        }

        &.light {
            background: var(--board-light-square);
        }

        &.dark {
            background: var(--board-dark-square);
        }

        &.selected {
            box-shadow: inset 0 0 0 var(--length-xxs) var(--board-highlight);
        }

        &.legal::after {
            background: color-mix(in oklab, var(--board-highlight) 82%, transparent);
            width: 22%;
            aspect-ratio: 1;
        }

        &.capture::after {
            background: transparent;
            border: var(--length-xxs) solid color-mix(in oklab, var(--board-highlight) 88%, transparent);
            inset: 8%;
            width: auto;
        }

        .coordinate {
            font-size: var(--font-size-s);
            text-transform: uppercase;
            font-weight: 700;
            line-height: 1;
            opacity: 0.74;
            pointer-events: none;
            position: absolute;

            &.rank {
                left: var(--length-xxs);
                top: var(--length-xxs);
            }

            &.file {
                bottom: var(--length-xxs);
                right: var(--length-xxs);
            }
        }
    }
}
</style>
