<template>
    <main class="learn-page">
        <template v-if="activeFolder">
            <header class="learn-heading">
                <div>
                    <p class="eyebrow">
                        Learn both sides
                    </p>
                    <h1>{{ activeFolder.name }}</h1>
                    <p>Arrows show every move registered at the current position.</p>
                </div>
                <div class="heading-actions">
                    <UButton
                        color="neutral"
                        icon="lucide:rotate-ccw"
                        label="Start again"
                        variant="soft"
                        @click="startLearning"
                    />
                    <UButton
                        color="neutral"
                        icon="lucide:folders"
                        label="Choose another folder"
                        :to="{ name: 'learn' }"
                        variant="soft"
                    />
                </div>
            </header>

            <div
                v-if="hasLines"
                class="learn-layout"
            >
                <CChessBoard
                    :arrows="suggestedArrows"
                />
                <div class="side">
                    <div class="board-actions">
                        <UButton
                            color="neutral"
                            icon="lucide:refresh-cw"
                            :label="isBlackOrientation ? 'View as white' : 'View as black'"
                            size="sm"
                            variant="soft"
                            @click="chessStore.turnBoard"
                        />
                    </div>
                    <CLearnGuide
                        :arrow-count="suggestedArrows.length"
                        :folder-name="activeFolder.name"
                        :is-outside-lines="isOutsideLines"
                        :move-count="chessStore.currentMove"
                        :save-message="saveMessage"
                        :turn-label="turnLabel"
                        @add-line="addCurrentLine"
                    />
                    <CMoveHistory :show-save-line="false" />
                    <CMoveNavigation />
                </div>
            </div>

            <CPracticeEmptyState
                v-else
                description="Add at least one valid line to this folder in the editor first."
                icon="lucide:notebook-tabs"
                title="No lines to learn yet"
            >
                <UButton
                    icon="lucide:grid-3x3"
                    label="Open editor"
                    :to="{ name: 'editor' }"
                />
            </CPracticeEmptyState>
        </template>

        <CLearnFolderPicker
            v-else
            :folders="folders"
        />
    </main>
</template>

<script setup lang="ts">
import { BLACK, WHITE } from "chess.js";
import { computed } from "vue";
import { useRoute } from "vue-router";

import { getOpeningFolders } from "@/lib/openingFolders.ts";
import CChessBoard from "@/pages/editor/components/CChessBoard.vue";
import CMoveHistory from "@/pages/editor/components/CMoveHistory.vue";
import CMoveNavigation from "@/pages/editor/components/CMoveNavigation.vue";
import { useChessStore } from "@/pages/editor/store/chess.ts";
import CLearnFolderPicker from "@/pages/learn/components/CLearnFolderPicker.vue";
import CLearnGuide from "@/pages/learn/components/CLearnGuide.vue";
import { useOpeningLearn } from "@/pages/learn/composables/useOpeningLearn.ts";
import CPracticeEmptyState from "@/pages/practice/components/CPracticeEmptyState.vue";

const route = useRoute();
const chessStore = useChessStore();
const folders = getOpeningFolders();
const activeFolder = computed(() => {
    const folderName = route.query.folder;

    if (typeof folderName !== "string") {
        return undefined;
    }

    return folders.find((folder) => folder.name === folderName);
});
const isBlackOrientation = computed(() => chessStore.orientation === BLACK);
const turnLabel = computed(() => chessStore.turn === WHITE ? "White" : "Black");
const {
    addCurrentLine,
    hasLines,
    isOutsideLines,
    saveMessage,
    startLearning,
    suggestedArrows
} = useOpeningLearn(activeFolder);
</script>

<style scoped>
.learn-page {
    width: min(100%, 1160px);
    margin: 0 auto;
    padding: var(--length-xxl) var(--length-m) var(--length-xxxl);

    .learn-heading {
        display: flex;
        gap: var(--length-l);
        align-items: end;
        justify-content: space-between;
        margin-bottom: var(--length-l);

        .eyebrow {
            color: var(--color-primary);
            font-size: var(--font-size-xs);
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
        }

        h1 {
            font-size: var(--font-size-xxxl);
            font-weight: 800;
            margin: var(--length-xxs) 0;
        }

        p:last-child {
            color: var(--color-text-softer);
        }

        .heading-actions {
            display: flex;
            flex-wrap: wrap;
            gap: var(--length-xs);
            justify-content: flex-end;
        }
    }

    .learn-layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(270px, 320px);
        gap: var(--length-l);
        align-items: start;

        .side {
            display: grid;
            gap: var(--length-xs);

            .board-actions {
                display: flex;
            }
        }
    }
}

@media (max-width: 820px) {
    .learn-page {
        padding-top: var(--length-xl);

        .learn-layout {
            grid-template-columns: 1fr;
        }
    }
}

@media (max-width: 560px) {
    .learn-page {
        padding-right: var(--length-xs);
        padding-left: var(--length-xs);

        .learn-heading {
            align-items: flex-start;
            flex-direction: column;

            .heading-actions {
                justify-content: flex-start;
            }
        }
    }
}
</style>
