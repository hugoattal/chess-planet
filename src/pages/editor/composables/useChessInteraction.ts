import type { Move, Square } from "chess.js";
import { computed, ref, watch } from "vue";

import { useChessSounds } from "@/pages/editor/composables/useChessSounds.ts";
import { useChessStore } from "@/pages/editor/store/chess.ts";

export function useChessInteraction(onMove?: (move: Move) => void) {
    const chessStore = useChessStore();
    const { playMoveSound } = useChessSounds();
    const draggedSquare = ref<Square>();
    const selectedSquare = ref<Square>();
    const legalMoves = ref<Array<Move>>([]);

    const legalMoveSquares = computed(() => new Set(legalMoves.value.map((move) => move.to)));

    watch(() => chessStore.history.length, clearSelection);

    function clearSelection() {
        draggedSquare.value = undefined;
        selectedSquare.value = undefined;
        legalMoves.value = [];
    }

    function selectSquare(square: Square) {
        if (selectedSquare.value && legalMoveSquares.value.has(square)) {
            movePiece(selectedSquare.value, square);
            return;
        }

        selectPiece(square);
    }

    function selectPiece(square: Square) {
        const boardSquare = chessStore.board.flat().find((item) => item.square === square);

        if (!boardSquare?.piece || boardSquare.piece.color !== chessStore.turn) {
            clearSelection();
            return;
        }

        selectedSquare.value = square;
        legalMoves.value = chessStore.getLegalMoves(square);
    }

    function movePiece(from: Square, to: Square) {
        const playedMove = chessStore.move(from, to);

        clearSelection();
        playMoveSound(playedMove, chessStore.isCheck);
        onMove?.(playedMove);
    }

    function startDragging(square: Square, event: DragEvent) {
        selectPiece(square);

        if (selectedSquare.value !== square) {
            event.preventDefault();
            return;
        }

        draggedSquare.value = square;

        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", square);
        }
    }

    function allowDrop(square: Square, event: DragEvent) {
        if (!legalMoveSquares.value.has(square)) {
            return;
        }

        event.preventDefault();

        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = "move";
        }
    }

    function dropPiece(square: Square) {
        if (!draggedSquare.value || !legalMoveSquares.value.has(square)) {
            return;
        }

        movePiece(draggedSquare.value, square);
    }

    return {
        allowDrop,
        clearSelection,
        draggedSquare,
        dropPiece,
        legalMoveSquares,
        selectedSquare,
        selectSquare,
        startDragging
    };
}
