<template>
    <section
        aria-label="Chess board"
        class="chess-board"
    >
        <template
            v-for="(rank, rankIndex) in chessStore.board"
            :key="rankIndex"
        >
            <button
                v-for="(boardSquare, fileIndex) in rank"
                :key="boardSquare.square"
                :aria-label="getSquareLabel(boardSquare.square, boardSquare.piece?.color, boardSquare.piece?.type)"
                :class="getSquareClasses(boardSquare.square, rankIndex, fileIndex, Boolean(boardSquare.piece))"
                type="button"
                @click="selectSquare(boardSquare.square)"
                @dragover="allowDrop(boardSquare.square, $event)"
                @drop.prevent="dropPiece(boardSquare.square)"
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

                <span
                    v-if="boardSquare.piece"
                    :aria-grabbed="draggedSquare === boardSquare.square"
                    :class="[
                        'piece',
                        `${boardSquare.piece.color === WHITE ? 'white' : 'black'}`,
                        { 'dragging': draggedSquare === boardSquare.square }
                    ]"
                    :draggable="boardSquare.piece.color === chessStore.turn"
                    @dragend="clearSelection"
                    @dragstart="startDragging(boardSquare.square, $event)"
                >
                    <UIcon
                        aria-hidden="true"
                        class="piece-icon"
                        :name="pieces[boardSquare.piece.type]"
                    />
                </span>
            </button>
        </template>
    </section>
</template>

<script setup lang="ts">
import type { Color, PieceSymbol, Square } from "chess.js";
import { WHITE } from "chess.js";

import { useChessInteraction } from "@/pages/board/composables/useChessInteraction.ts";
import { pieces } from "@/pages/board/lib/pieces.ts";
import { useChessStore } from "@/pages/board/store/chess.ts";

const chessStore = useChessStore();
const {
    allowDrop,
    clearSelection,
    draggedSquare,
    dropPiece,
    legalMoveSquares,
    selectedSquare,
    selectSquare,
    startDragging
} = useChessInteraction();

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
.chess-board {
    border: var(--length-xxxs) solid color-mix(in oklab, var(--color-primary) 54%, var(--ui-border));
    border-radius: var(--radius-m);
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    overflow: hidden;
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

        .piece {
            color: inherit;
            cursor: grab;
            display: grid;
            font-size: clamp(1.8rem, 6.5vw, 4.6rem);
            place-items: center;
            position: relative;
            z-index: 1;

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

@media (max-width: 520px) {
    .chess-board {
        .chess-square {
            .piece {
                font-size: clamp(1.55rem, 10vw, 3rem);
            }
        }
    }
}
</style>
