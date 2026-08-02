import { BLACK, WHITE } from "chess.js";
import type { ComputedRef } from "vue";
import { computed, ref, watch } from "vue";

import type { TOpeningFolder } from "@/lib/openingFolders.ts";
import { addOpeningLine } from "@/lib/openingFolders.ts";
import { getMatchingLines, getSuggestedArrows, parseOpeningLines } from "@/lib/openingLines.ts";
import { useChessStore } from "@/pages/editor/store/chess.ts";

export function useOpeningLearn(activeFolder: ComputedRef<TOpeningFolder | undefined>) {
    const chessStore = useChessStore();
    const saveMessage = ref("");
    const lineMoves = computed(() => parseOpeningLines(activeFolder.value?.lines ?? []));
    const currentHistory = computed(() => chessStore.history.slice(0, chessStore.currentMove));
    const matchingLines = computed(() => (
        getMatchingLines(lineMoves.value, currentHistory.value)
    ));
    const suggestedArrows = computed(() => getSuggestedArrows(matchingLines.value, currentHistory.value));
    const hasLines = computed(() => lineMoves.value.length > 0);
    const isOutsideLines = computed(() => chessStore.currentMove > 0 && matchingLines.value.length === 0);

    watch(activeFolder, startLearning, { immediate: true });
    watch(() => chessStore.line, () => {
        saveMessage.value = "";
    });

    function startLearning() {
        saveMessage.value = "";
        chessStore.reset();
        chessStore.setOrientation(activeFolder.value?.color === "black" ? BLACK : WHITE);
    }

    function addCurrentLine() {
        if (!activeFolder.value || !chessStore.line) {
            return;
        }

        const line = chessStore.line.replaceAll(/\[.+]/g, "").trim();
        const lineAdded = addOpeningLine(activeFolder.value.name, line);

        saveMessage.value = lineAdded
            ? `Added to ${ activeFolder.value.name }.`
            : "This line is already in the folder.";
    }

    return {
        addCurrentLine,
        hasLines,
        isOutsideLines,
        saveMessage,
        startLearning,
        suggestedArrows
    };
}
