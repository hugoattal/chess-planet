import type { Color, PieceSymbol, Square } from "chess.js";
import { BLACK } from "chess.js";
import { computed, ref, watch } from "vue";

import { useChessStore } from "@/pages/editor/store/chess.ts";

type TBoardPiece = {
    color: Color;
    square: Square;
    type: PieceSymbol;
};

type TAnimatedBoardPiece = TBoardPiece & {
    id: number;
};

export function useAnimatedBoardPieces() {
    const chessStore = useChessStore();
    const isBlackOrientation = computed(() => chessStore.orientation === BLACK);
    let nextPieceId = 0;
    let displayedMove = chessStore.currentMove;
    const animatedPieces = ref(createAnimatedPieces());

    watch(() => chessStore.board, updateAnimatedPieces);

    function getBoardPieces(): Array<TBoardPiece> {
        return chessStore.board.flatMap((rank) => rank.flatMap(({ piece, square }) => piece ? [{ ...piece, square }] : []
        ));
    }

    function createAnimatedPieces(): Array<TAnimatedBoardPiece> {
        return getBoardPieces().map((piece) => ({
            ...piece,
            id: nextPieceId++
        }));
    }

    function updateAnimatedPieces() {
        const boardPieces = getBoardPieces();
        const previousBySquare = new Map(animatedPieces.value.map((piece) => [piece.square, piece]));
        const boardBySquare = new Map(boardPieces.map((piece) => [piece.square, piece]));
        const changedSquares = new Set([...previousBySquare.keys(), ...boardBySquare.keys()]);

        for (const square of changedSquares) {
            if (piecesMatch(previousBySquare.get(square), boardBySquare.get(square))) {
                changedSquares.delete(square);
            }
        }

        const isSingleMove = Math.abs(chessStore.currentMove - displayedMove) === 1 && changedSquares.size <= 4;

        displayedMove = chessStore.currentMove;

        if (!isSingleMove) {
            animatedPieces.value = createAnimatedPieces();
            return;
        }

        const assignedIds = new Set<number>();
        const unchangedPieces = new Map<Square, TAnimatedBoardPiece>();

        for (const piece of boardPieces) {
            const previousPiece = previousBySquare.get(piece.square);

            if (previousPiece && piecesMatch(previousPiece, piece)) {
                assignedIds.add(previousPiece.id);
                unchangedPieces.set(piece.square, previousPiece);
            }
        }

        animatedPieces.value = boardPieces.map((piece) => {
            const unchangedPiece = unchangedPieces.get(piece.square);

            if (unchangedPiece) {
                return unchangedPiece;
            }

            const movedPiece = animatedPieces.value.find((previousPiece) => (
                !assignedIds.has(previousPiece.id) && piecesMatch(previousPiece, piece)
            ));

            if (!movedPiece) {
                return { ...piece, id: nextPieceId++ };
            }

            assignedIds.add(movedPiece.id);

            return { ...movedPiece, square: piece.square };
        });
    }

    function getPiecePosition(square: Square) {
        const file = square.charCodeAt(0) - 97;
        const rank = Number(square[1]);
        const displayedFile = isBlackOrientation.value ? 7 - file : file;
        const displayedRank = isBlackOrientation.value ? rank - 1 : 8 - rank;

        return {
            left: `${ displayedFile * 12.5 }%`,
            top: `${ displayedRank * 12.5 }%`
        };
    }

    return {
        animatedPieces,
        getPiecePosition
    };
}

function piecesMatch(first?: TBoardPiece, second?: TBoardPiece) {
    return first?.color === second?.color && first?.type === second?.type;
}
