import confetti from "canvas-confetti";
import type { Color, Move, Square } from "chess.js";
import { BLACK, Chess, WHITE } from "chess.js";
import type { ComputedRef } from "vue";
import { computed, onBeforeUnmount, ref, watch } from "vue";

import type { TOpeningFolder } from "@/lib/openingFolders.ts";
import { sleep } from "@/lib/utils.ts";
import { useChessSounds } from "@/pages/editor/composables/useChessSounds.ts";
import type { TBoardArrow } from "@/pages/editor/lib/boardArrows.ts";
import { useChessStore } from "@/pages/editor/store/chess.ts";

export type TPracticeOutcome = "loss" | "win";

const opponentDelay = 2000;
const mistakeUndoDelay = 1000;
const mistakeResultDelay = 3000;
const confettiColors = ["#818cf8", "#6366f1", "#4338ca"];

export function useOpeningPractice(activeFolder: ComputedRef<TOpeningFolder | undefined>) {
    const chessStore = useChessStore();
    const { playMoveSound } = useChessSounds();
    const lineMoves = ref<Array<Array<Move>>>([]);
    const activeLines = ref<Array<Array<Move>>>([]);
    const confirmedSquare = ref<Square>();
    const suggestedArrows = ref<Array<TBoardArrow>>([]);
    const outcome = ref<TPracticeOutcome>();
    const streak = ref(0);
    const endedStreak = ref(0);
    const waitingForOpponent = ref(false);
    const reviewingMistake = ref(false);
    let pendingActionId = 0;

    const playerColor = computed<Color>(() => activeFolder.value?.color === "black" ? BLACK : WHITE);
    const canPlayerMove = computed(() => (
        !outcome.value &&
        !reviewingMistake.value &&
        !waitingForOpponent.value &&
        chessStore.turn === playerColor.value
    ));
    const hasLines = computed(() => lineMoves.value.length > 0);
    const activeLineCount = computed(() => activeLines.value.length);
    const hasConfirmedMove = computed(() => Boolean(confirmedSquare.value));

    watch(activeFolder, () => {
        streak.value = 0;
        startPractice();
    }, { immediate: true });

    onBeforeUnmount(cancelPendingAction);

    function startPractice() {
        cancelPendingAction();
        confirmedSquare.value = undefined;
        suggestedArrows.value = [];
        outcome.value = undefined;
        reviewingMistake.value = false;
        waitingForOpponent.value = false;
        chessStore.reset();
        chessStore.setOrientation(playerColor.value);

        if (!activeFolder.value) {
            lineMoves.value = [];
            activeLines.value = [];
            return;
        }

        lineMoves.value = parseLines(activeFolder.value.lines);
        activeLines.value = lineMoves.value;

        if (lineMoves.value.length && playerColor.value === BLACK) {
            void queueOpponentMove();
        }
    }

    function handlePlayerMove(move: Move) {
        const moveIndex = chessStore.history.length - 1;
        const matchingLines = activeLines.value.filter((line) => movesMatch(line[moveIndex], move));

        if (!matchingLines.length) {
            void reviewMistake(moveIndex);
            return;
        }

        activeLines.value = matchingLines;
        confirmedSquare.value = move.to;
        void queueOpponentMove();
    }

    async function queueOpponentMove() {
        waitingForOpponent.value = true;
        const actionId = ++pendingActionId;

        await sleep(opponentDelay);

        if (actionId === pendingActionId) {
            playOpponentMove();
        }
    }

    async function reviewMistake(moveIndex: number) {
        reviewingMistake.value = true;
        const actionId = ++pendingActionId;

        await sleep(mistakeUndoDelay);

        if (actionId !== pendingActionId) {
            return;
        }

        chessStore.undo();
        suggestedArrows.value = getSuggestedArrows(activeLines.value, moveIndex);

        await sleep(mistakeResultDelay);

        if (actionId === pendingActionId) {
            finishPractice("loss");
        }
    }

    function playOpponentMove() {
        confirmedSquare.value = undefined;

        const moveIndex = chessStore.history.length;
        const possibleMoves = new Map<string, Move>();

        for (const line of activeLines.value) {
            const move = line[moveIndex];

            if (move) {
                possibleMoves.set(getMoveKey(move), move);
            }
        }

        if (!possibleMoves.size) {
            finishPractice("win");
            return;
        }

        const choices = [...possibleMoves.values()];
        const selectedMove = choices[Math.floor(Math.random() * choices.length)];

        activeLines.value = activeLines.value.filter((line) => movesMatch(line[moveIndex], selectedMove));

        const playedMove = chessStore.move(selectedMove.from, selectedMove.to);
        playMoveSound(playedMove, chessStore.isCheck);

        if (!activeLines.value.some((line) => line[chessStore.history.length])) {
            finishPractice("win");
            return;
        }

        waitingForOpponent.value = false;
    }

    function finishPractice(result: TPracticeOutcome) {
        cancelPendingAction();
        confirmedSquare.value = undefined;
        reviewingMistake.value = false;
        waitingForOpponent.value = false;
        outcome.value = result;

        if (result === "win") {
            streak.value += 1;
            void confetti({
                colors: confettiColors,
                origin: { y: 0.68 },
                particleCount: 90,
                spread: 72,
                startVelocity: 32
            });
            return;
        }

        endedStreak.value = streak.value;
        streak.value = 0;
    }

    function cancelPendingAction() {
        pendingActionId += 1;
    }

    return {
        activeLineCount,
        canPlayerMove,
        confirmedSquare,
        endedStreak,
        handlePlayerMove,
        hasConfirmedMove,
        hasLines,
        outcome,
        startPractice,
        streak,
        suggestedArrows,
        waitingForOpponent
    };
}

function parseLines(lines: Array<string>): Array<Array<Move>> {
    return lines.flatMap((line) => {
        const game = new Chess();

        try {
            game.loadPgn(line);
            return [game.history({ verbose: true })];
        }
        catch {
            return [];
        }
    }).filter((moves) => moves.length > 0);
}

function movesMatch(expectedMove: Move | undefined, playedMove: Move): boolean {
    return Boolean(expectedMove && getMoveKey(expectedMove) === getMoveKey(playedMove));
}

function getMoveKey(move: Move): string {
    return `${ move.from }${ move.to }${ move.promotion ?? "" }`;
}

function getSuggestedArrows(lines: Array<Array<Move>>, moveIndex: number): Array<TBoardArrow> {
    const arrows = new Map<string, TBoardArrow>();

    for (const line of lines) {
        const move = line[moveIndex];

        if (move) {
            arrows.set(`${ move.from }${ move.to }`, { from: move.from, to: move.to });
        }
    }

    return [...arrows.values()];
}
