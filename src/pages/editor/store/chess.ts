import type { Color, Move, Square } from "chess.js";
import { BLACK, Chess, QUEEN, WHITE } from "chess.js";
import { defineStore } from "pinia";
import { computed, ref, shallowRef } from "vue";

const files = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
const ranks = [8, 7, 6, 5, 4, 3, 2, 1] as const;

export const useChessStore = defineStore("chess", () => {
    const game = shallowRef(new Chess());
    const board = ref(createBoard());
    const history = ref<Array<Move>>([]);
    const currentMove = ref(0);
    const line = ref("");
    const isCheck = ref(false);
    const isCheckmate = ref(false);
    const isDraw = ref(false);
    const orientation = ref<Color>(WHITE);
    const turn = ref(game.value.turn());
    const canGoBackward = computed(() => currentMove.value > 0);
    const canGoForward = computed(() => currentMove.value < history.value.length);

    function createBoard() {
        return ranks.map((rank) => files.map((file) => {
            const square = `${ file }${ rank }` as Square;

            return {
                piece: game.value.get(square),
                square
            };
        }));
    }

    function syncPosition() {
        board.value = createBoard();
        isCheck.value = game.value.isCheck();
        isCheckmate.value = game.value.isCheckmate();
        isDraw.value = game.value.isDraw();
        turn.value = game.value.turn();
    }

    function replaceHistory() {
        history.value = game.value.history({ verbose: true });
        currentMove.value = history.value.length;
        line.value = game.value.pgn();
        syncPosition();
    }

    function getLegalMoves(square: Square): Array<Move> {
        return game.value.moves({ square, verbose: true });
    }

    function move(from: Square, to: Square): Move {
        const expectedMove = history.value[currentMove.value];
        const playedMove = game.value.move({
            from,
            promotion: QUEEN,
            to
        });

        if (movesMatch(expectedMove, playedMove)) {
            currentMove.value += 1;
            syncPosition();
        }
        else {
            replaceHistory();
        }

        return playedMove;
    }

    function undo(): Move | null {
        const undoneMove = game.value.undo();

        if (undoneMove) {
            replaceHistory();
        }

        return undoneMove;
    }

    function goToMove(moveCount: number) {
        while (currentMove.value > moveCount) {
            game.value.undo();
            currentMove.value -= 1;
        }

        while (currentMove.value < moveCount) {
            const move = history.value[currentMove.value];

            game.value.move({
                from: move.from,
                promotion: move.promotion,
                to: move.to
            });
            currentMove.value += 1;
        }

        syncPosition();
    }

    function goToStart() {
        goToMove(0);
    }

    function goBackward() {
        goToMove(currentMove.value - 1);
    }

    function goForward() {
        goToMove(currentMove.value + 1);
    }

    function goToEnd() {
        goToMove(history.value.length);
    }

    function loadLine(savedLine: string) {
        game.value = new Chess();
        game.value.loadPgn(savedLine);
        replaceHistory();
    }

    function setOrientation(color: Color) {
        orientation.value = color;
    }

    function turnBoard() {
        orientation.value = orientation.value === WHITE ? BLACK : WHITE;
    }

    function reset() {
        game.value = new Chess();
        replaceHistory();
    }

    return {
        board,
        canGoBackward,
        canGoForward,
        currentMove,
        game,
        getLegalMoves,
        goBackward,
        goForward,
        goToEnd,
        goToMove,
        goToStart,
        history,
        isCheck,
        isCheckmate,
        isDraw,
        line,
        loadLine,
        move,
        orientation,
        reset,
        setOrientation,
        turn,
        turnBoard,
        undo
    };
});

function movesMatch(expectedMove: Move | undefined, playedMove: Move): boolean {
    return Boolean(
        expectedMove &&
        expectedMove.from === playedMove.from &&
        expectedMove.to === playedMove.to &&
        expectedMove.promotion === playedMove.promotion
    );
}
