import type { Move, Square } from "chess.js";
import { Chess, QUEEN } from "chess.js";
import { defineStore } from "pinia";
import { ref, shallowRef } from "vue";

const files = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
const ranks = [8, 7, 6, 5, 4, 3, 2, 1] as const;

export const useChessStore = defineStore("chess", () => {
    const game = shallowRef(new Chess());
    const board = ref(createBoard());
    const history = ref<Array<Move>>([]);
    const isCheck = ref(false);
    const isCheckmate = ref(false);
    const isDraw = ref(false);
    const turn = ref(game.value.turn());

    function createBoard() {
        return ranks.map(rank => files.map(file => {
            const square = `${file}${rank}` as Square;

            return {
                piece: game.value.get(square),
                square
            };
        }));
    }

    function syncState() {
        board.value = createBoard();
        history.value = game.value.history({ verbose: true });
        isCheck.value = game.value.isCheck();
        isCheckmate.value = game.value.isCheckmate();
        isDraw.value = game.value.isDraw();
        turn.value = game.value.turn();
    }

    function getLegalMoves(square: Square): Array<Move> {
        return game.value.moves({ square, verbose: true });
    }

    function move(from: Square, to: Square): Move {
        const playedMove = game.value.move({
            from,
            promotion: QUEEN,
            to
        });

        syncState();

        return playedMove;
    }

    function undo(): Move | null {
        const undoneMove = game.value.undo();

        if (undoneMove) {
            syncState();
        }

        return undoneMove;
    }

    return {
        board,
        game,
        getLegalMoves,
        history,
        isCheck,
        isCheckmate,
        isDraw,
        move,
        turn,
        undo
    };
});
