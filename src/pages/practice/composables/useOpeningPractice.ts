import confetti from "canvas-confetti";
import type { Color, Move, Square } from "chess.js";
import { BLACK, WHITE } from "chess.js";
import type { ComputedRef } from "vue";
import { computed, onBeforeUnmount, ref, watch } from "vue";

import type { TOpeningFolder } from "@/lib/openingFolders.ts";
import {
    getContinuingMoves,
    getMatchingLines,
    getSuggestedArrows,
    movesMatch,
    parseOpeningLines
} from "@/lib/openingLines.ts";
import { sleep } from "@/lib/utils.ts";
import { useChessSounds } from "@/pages/editor/composables/useChessSounds.ts";
import type { TBoardArrow } from "@/pages/editor/lib/boardArrows.ts";
import { useChessStore } from "@/pages/editor/store/chess.ts";

export type TPracticeOutcome = "loss" | "win";

const opponentDelay = 1000;
const mistakeUndoDelay = 1000;
const mistakeResultDelay = 2000;
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
    let practiceSeed = createRandomSeed();
    let random = createSeededRandom(practiceSeed);

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
        practiceSeed = createRandomSeed();
        resetPractice();
    }

    function restartPractice() {
        resetPractice();
    }

    function resetPractice() {
        cancelPendingAction();
        random = createSeededRandom(practiceSeed);
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

        lineMoves.value = parseOpeningLines(activeFolder.value.lines);
        activeLines.value = lineMoves.value;

        if (lineMoves.value.length && playerColor.value === BLACK) {
            void queueOpponentMove();
        }
    }

    function handlePlayerMove(move: Move) {
        const previousHistory = chessStore.history.slice(0, -1);
        const moveMatches = getContinuingMoves(lineMoves.value, previousHistory)
            .some((expectedMove) => movesMatch(expectedMove, move));

        if (!moveMatches) {
            void reviewMistake();
            return;
        }

        activeLines.value = getMatchingLines(lineMoves.value, chessStore.history);
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

    async function reviewMistake() {
        reviewingMistake.value = true;
        const actionId = ++pendingActionId;

        await sleep(mistakeUndoDelay);

        if (actionId !== pendingActionId) {
            return;
        }

        chessStore.undo();
        suggestedArrows.value = getSuggestedArrows(lineMoves.value, chessStore.history);

        await sleep(mistakeResultDelay);

        if (actionId === pendingActionId) {
            finishPractice("loss");
        }
    }

    function playOpponentMove() {
        confirmedSquare.value = undefined;

        const possibleMoves = new Map<string, Move>();

        for (const move of getContinuingMoves(lineMoves.value, chessStore.history)) {
            possibleMoves.set(getMoveKey(move), move);
        }

        if (!possibleMoves.size) {
            finishPractice("win");
            return;
        }

        const choices = [...possibleMoves.values()];
        const selectedMove = choices[Math.floor(random() * choices.length)];

        const playedMove = chessStore.move(selectedMove.from, selectedMove.to);
        playMoveSound(playedMove, chessStore.isCheck);
        activeLines.value = getMatchingLines(lineMoves.value, chessStore.history);

        if (!getContinuingMoves(lineMoves.value, chessStore.history).length) {
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
        restartPractice,
        startPractice,
        streak,
        suggestedArrows,
        waitingForOpponent
    };
}

function getMoveKey(move: Move): string {
    return `${ move.from }${ move.to }${ move.promotion ?? "" }`;
}

function createRandomSeed(): number {
    return crypto.getRandomValues(new Uint32Array(1))[0]!;
}

function createSeededRandom(seed: number): () => number {
    return function random() {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return seed / 0x100000000;
    };
}
