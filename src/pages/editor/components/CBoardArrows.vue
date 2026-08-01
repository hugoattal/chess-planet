<template>
    <section
        @contextmenu.prevent
        @pointercancel="cancelDrawing"
        @pointerdown="startDrawing"
        @pointermove="continueDrawing"
        @pointerup="finishDrawing"
    >
        <slot />

        <svg
            aria-hidden="true"
            class="arrow-layer"
            viewBox="0 0 8 8"
        >
            <g
                v-for="arrow in renderedArrows"
                :key="arrow.key"
                :class="{ preview: arrow.preview }"
            >
                <line
                    class="arrow-shaft"
                    :x1="arrow.start.x"
                    :x2="arrow.end.x"
                    :y1="arrow.start.y"
                    :y2="arrow.end.y"
                />
                <polygon
                    class="arrow-head"
                    :points="arrow.head"
                />
            </g>
        </svg>
    </section>
</template>

<script setup lang="ts">
import type { Square } from "chess.js";
import { computed, ref } from "vue";

import type { TBoardArrow } from "@/pages/editor/lib/boardArrows.ts";

type TPoint = {
    x: number;
    y: number;
};

type TRenderedArrow = {
    end: TPoint;
    head: string;
    key: string;
    preview: boolean;
    start: TPoint;
};

const props = withDefaults(defineProps<{
    arrows?: Array<TBoardArrow>;
    flipped: boolean;
}>(), {
    arrows: () => []
});

const drawnArrows = ref<Array<TBoardArrow>>([]);
const drawing = ref<TBoardArrow>();
const drawingPointer = ref<number>();
const renderedArrows = computed<Array<TRenderedArrow>>(() => {
    const providedArrows = props.arrows.map((arrow) => renderArrow(arrow, false, "provided"));
    const committedArrows = drawnArrows.value.map((arrow) => renderArrow(arrow, false, "drawn"));
    const savedArrows = [...providedArrows, ...committedArrows];

    if (!drawing.value || drawing.value.from === drawing.value.to) {
        return savedArrows;
    }

    return [...savedArrows, renderArrow(drawing.value, true, "preview")];
});

function startDrawing(event: PointerEvent) {
    if (event.button !== 2) {
        if (event.button === 0) {
            drawnArrows.value = [];
        }

        return;
    }

    const square = getEventSquare(event);

    if (!square) {
        return;
    }

    event.preventDefault();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    drawing.value = { from: square, to: square };
    drawingPointer.value = event.pointerId;
}

function continueDrawing(event: PointerEvent) {
    if (drawingPointer.value !== event.pointerId || !drawing.value) {
        return;
    }

    const square = getEventSquare(event);

    if (square) {
        drawing.value = { ...drawing.value, to: square };
    }
}

function finishDrawing(event: PointerEvent) {
    if (drawingPointer.value !== event.pointerId || !drawing.value) {
        return;
    }

    const targetSquare = getEventSquare(event);

    if (targetSquare && drawing.value.from !== targetSquare) {
        toggleArrow({ from: drawing.value.from, to: targetSquare });
    }

    (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
    cancelDrawing();
}

function cancelDrawing() {
    drawing.value = undefined;
    drawingPointer.value = undefined;
}

function toggleArrow(arrow: TBoardArrow) {
    const existingIndex = drawnArrows.value.findIndex(({ from, to }) => from === arrow.from && to === arrow.to);

    if (existingIndex === -1) {
        drawnArrows.value.push(arrow);
        return;
    }

    drawnArrows.value.splice(existingIndex, 1);
}

function getEventSquare(event: PointerEvent): Square | undefined {
    const board = event.currentTarget as HTMLElement;
    const bounds = board.getBoundingClientRect();
    const x = (event.clientX - bounds.left - board.clientLeft) / board.clientWidth;
    const y = (event.clientY - bounds.top - board.clientTop) / board.clientHeight;

    if (x < 0 || x >= 1 || y < 0 || y >= 1) {
        return;
    }

    const displayedFile = Math.floor(x * 8);
    const displayedRank = Math.floor(y * 8);
    const file = props.flipped ? 7 - displayedFile : displayedFile;
    const rank = props.flipped ? displayedRank + 1 : 8 - displayedRank;

    return `${ String.fromCharCode(97 + file) }${ rank }` as Square;
}

function renderArrow(arrow: TBoardArrow, preview: boolean, source: string): TRenderedArrow {
    const start = getSquareCenter(arrow.from);
    const target = getSquareCenter(arrow.to);
    const directionX = target.x - start.x;
    const directionY = target.y - start.y;
    const length = Math.hypot(directionX, directionY);
    const unitX = directionX / length * 0.6;
    const unitY = directionY / length * 0.6;
    const end = {
        x: target.x - unitX * 0.2,
        y: target.y - unitY * 0.2
    };
    const tip = {
        x: target.x + unitX * 0.34,
        y: target.y + unitY * 0.34
    };
    const base = {
        x: target.x - unitX * 0.34,
        y: target.y - unitY * 0.34
    };
    const wingOffset = 0.5;
    const left = {
        x: base.x - unitY * wingOffset,
        y: base.y + unitX * wingOffset
    };
    const right = {
        x: base.x + unitY * wingOffset,
        y: base.y - unitX * wingOffset
    };

    return {
        end,
        head: `${ tip.x },${ tip.y } ${ left.x },${ left.y } ${ right.x },${ right.y }`,
        key: `${ arrow.from }-${ arrow.to }-${ source }`,
        preview,
        start
    };
}

function getSquareCenter(square: Square): TPoint {
    const file = square.charCodeAt(0) - 97;
    const rank = Number(square[1]);

    return {
        x: (props.flipped ? 7 - file : file) + 0.5,
        y: (props.flipped ? rank - 1 : 8 - rank) + 0.5
    };
}
</script>

<style scoped>
.arrow-layer {
    height: 100%;
    inset: 0;
    overflow: visible;
    pointer-events: none;
    position: absolute;
    width: 100%;
    z-index: 2;

    g {
        opacity: 0.82;

        &.preview {
            opacity: 0.58;
        }

        .arrow-shaft {
            stroke: var(--board-arrow);
            stroke-linecap: round;
            stroke-width: 0.18;
        }

        .arrow-head {
            fill: var(--board-arrow);
        }
    }
}
</style>
