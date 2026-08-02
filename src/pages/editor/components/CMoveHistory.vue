<template>
    <aside class="history-panel">
        <header class="history-heading">
            <div>
                <p class="eyebrow">
                    {{ gameStatus }}
                </p>
                <h2>Move history</h2>
            </div>

            <UButton
                aria-label="Undo the last move"
                color="neutral"
                :disabled="chessStore.currentMove === 0"
                icon="lucide:undo-2"
                label="Take back"
                size="sm"
                variant="soft"
                @click="undoMove"
            />
        </header>

        <div
            v-if="movePairs.length"
            class="move-list"
        >
            <div
                v-for="movePair in movePairs"
                :key="movePair.number"
                class="move-row"
            >
                <span class="move-number">{{ movePair.number }}.</span>
                <button
                    :aria-label="`Go to move ${ movePair.number }, ${ movePair.white.san }`"
                    class="move"
                    type="button"
                    @click="chessStore.goToMove(movePair.white.moveCount)"
                >
                    {{ movePair.white.san }}
                </button>
                <button
                    v-if="movePair.black"
                    :aria-label="`Go to move ${ movePair.number }, ${ movePair.black.san }`"
                    class="move"
                    type="button"
                    @click="chessStore.goToMove(movePair.black.moveCount)"
                >
                    {{ movePair.black.san }}
                </button>
            </div>
        </div>

        <div
            v-else
            class="empty-history"
        >
            <UIcon
                aria-hidden="true"
                class="empty-history-icon"
                name="lucide:list-ordered"
            />
            <p>Your moves will appear here.</p>
        </div>

        <form
            v-if="showSaveLine && folders.length"
            class="save-line"
            @submit.prevent="saveLine"
        >
            <label for="target-folder">Save this line</label>
            <div class="save-controls">
                <select
                    id="target-folder"
                    v-model="selectedFolderName"
                >
                    <option
                        v-for="folder in folders"
                        :key="folder.name"
                        :value="folder.name"
                    >
                        {{ folder.name }}
                    </option>
                </select>
                <UButton
                    :disabled="!chessStore.line"
                    icon="lucide:save"
                    label="Save"
                    type="submit"
                />
            </div>
            <p
                v-if="saveMessage"
                class="save-message"
            >
                {{ saveMessage }}
            </p>
        </form>

        <div
            v-else-if="showSaveLine"
            class="create-folder-prompt"
        >
            <p>Create a folder before saving a line.</p>
            <UButton
                color="neutral"
                label="Create folder"
                size="sm"
                to="/"
                variant="soft"
            />
        </div>
    </aside>
</template>

<script setup lang="ts">
import { WHITE } from "chess.js";
import { computed, ref, watch } from "vue";

import { addOpeningLine, getOpeningFolders } from "@/lib/openingFolders.ts";
import { useChessSounds } from "@/pages/editor/composables/useChessSounds.ts";
import { useChessStore } from "@/pages/editor/store/chess.ts";

withDefaults(defineProps<{
    showSaveLine?: boolean;
}>(), {
    showSaveLine: true
});

type TMovePair = {
    black?: TMoveHistoryEntry;
    number: number;
    white: TMoveHistoryEntry;
};

type TMoveHistoryEntry = {
    moveCount: number;
    san: string;
};

const chessStore = useChessStore();
const { playUndoSound } = useChessSounds();
const folders = getOpeningFolders();
const selectedFolderName = ref(folders[0]?.name ?? "");
const saveMessage = ref("");
const movePairs = computed<Array<TMovePair>>(() => {
    const pairs: Array<TMovePair> = [];

    for (let index = 0; index < chessStore.history.length; index += 2) {
        pairs.push({
            black: chessStore.history[index + 1] ? {
                moveCount: index + 2,
                san: chessStore.history[index + 1].san
            } : undefined,
            number: index / 2 + 1,
            white: {
                moveCount: index + 1,
                san: chessStore.history[index].san
            }
        });
    }

    return pairs;
});

const gameStatus = computed(() => {
    const player = chessStore.turn === WHITE ? "White" : "Black";

    if (chessStore.isCheckmate) {
        return `${ player } is checkmated`;
    }

    if (chessStore.isDraw) {
        return "Draw";
    }

    if (chessStore.isCheck) {
        return `${ player } is in check`;
    }

    return `${ player } to move`;
});

watch(() => chessStore.line, () => {
    saveMessage.value = "";
});

function undoMove() {
    chessStore.goBackward();
    playUndoSound();
}

function saveLine() {
    if (!chessStore.line) {
        return;
    }

    const line = chessStore.line.replaceAll(/\[.+]/g, "").trim();
    const lineAdded = addOpeningLine(selectedFolderName.value, line);

    saveMessage.value = lineAdded ? `Saved to ${ selectedFolderName.value }.` : "This line is already in that folder.";
}
</script>

<style scoped>
.history-panel {
    background: var(--color-background-soft);
    border-radius: var(--radius-m);
    display: flex;
    flex-direction: column;
    min-height: 420px;
    height: 100%;
    flex: 1 1 0;
    overflow: hidden;

    .history-heading {
        border-bottom: var(--length-xxxxs) solid var(--ui-border);
        display: flex;
        gap: var(--length-m);
        align-items: center;
        justify-content: space-between;
        padding: var(--length-m);

        h2 {
            font-size: var(--font-size-xl);
            font-weight: 700;
        }
    }

    .eyebrow {
        color: var(--color-primary);
        font-size: var(--font-size-xs);
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
    }

    .move-list {
        overflow-y: auto;
        padding: var(--length-xs) 0;

        .move-row {
            display: grid;
            grid-template-columns: 42px 1fr 1fr;
            min-height: 42px;
            align-items: center;
            padding: 0 var(--length-m);

            &:nth-child(even) {
                background: color-mix(in oklab, var(--color-primary) 6%, transparent);
            }

            .move-number {
                color: var(--color-text-softest);
                font-variant-numeric: tabular-nums;
            }

            .move {
                background: transparent;
                border: 0;
                border-radius: var(--radius-s);
                color: inherit;
                cursor: pointer;
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                font-weight: 600;
                padding: var(--length-xxs) var(--length-xs);
                text-align: left;

                &:hover,
                &:focus-visible {
                    background: var(--color-primary-softest);
                }
            }
        }
    }

    .empty-history {
        color: var(--color-text-softer);
        display: grid;
        flex: 1;
        gap: var(--length-xs);
        place-content: center;
        justify-items: center;
        padding: var(--length-l);
        text-align: center;

        .empty-history-icon {
            color: var(--color-primary);
            font-size: var(--font-icon-xl);
        }
    }

    .save-line,
    .create-folder-prompt {
        border-top: var(--length-xxxxs) solid var(--ui-border);
        margin-top: auto;
        padding: var(--length-m);
    }

    .save-line {
        display: grid;
        gap: var(--length-xs);

        label {
            font-size: var(--font-size-s);
            font-weight: 700;
        }

        .save-controls {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            gap: var(--length-xs);

            select {
                background: var(--color-background);
                border: var(--length-xxxxs) solid var(--ui-border);
                border-radius: var(--radius-s);
                color: var(--color-text);
                min-width: 0;
                padding: var(--length-xs) var(--length-s);
            }
        }

        .save-message {
            color: var(--color-text-softer);
            font-size: var(--font-size-s);
        }
    }

    .create-folder-prompt {
        display: flex;
        gap: var(--length-s);
        align-items: center;
        justify-content: space-between;

        p {
            color: var(--color-text-softer);
            font-size: var(--font-size-s);
        }
    }
}

@media (max-width: 820px) {
    .history-panel {
        min-height: 260px;
    }
}
</style>
