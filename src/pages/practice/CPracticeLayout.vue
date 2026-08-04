<template>
    <main class="practice-page">
        <template v-if="activeFolder">
            <CPracticeHeader
                :folder="activeFolder"
                :has-confirmed-move="hasConfirmedMove"
                :outcome="outcome"
                :waiting-for-opponent="waitingForOpponent"
            />

            <div
                v-if="hasLines"
                class="practice-layout"
            >
                <CChessBoard
                    :arrows="suggestedArrows"
                    :confirmed-square="confirmedSquare"
                    :disabled="!canPlayerMove"
                    @move="handlePlayerMove"
                />
                <CPracticeGuide
                    :active-line-count="activeLineCount"
                    :has-confirmed-move="hasConfirmedMove"
                    :streak="streak"
                    :waiting-for-opponent="waitingForOpponent"
                />
            </div>

            <CPracticeEmptyState
                v-else
                description="Add at least one valid line to this folder in the editor first."
                icon="lucide:notebook-tabs"
                title="No lines to practise yet"
            >
                <UButton
                    icon="lucide:grid-3x3"
                    label="Open editor"
                    :to="{ name: 'editor' }"
                />
            </CPracticeEmptyState>
        </template>

        <CPracticeFolderPicker
            v-else
            :folders="folders"
            :presets="presets"
        />

        <CPracticeResult
            v-if="outcome && isResultOpen"
            :ended-streak="endedStreak"
            :outcome="outcome"
            :streak="streak"
            @close="isResultOpen = false"
            @continue="startPractice"
            @restart="restartPractice"
        />
    </main>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";

import { getOpeningFolder, getOpeningFolders, getOpeningPresets } from "@/lib/openingFolders.ts";
import CChessBoard from "@/pages/editor/components/CChessBoard.vue";
import CPracticeEmptyState from "@/pages/practice/components/CPracticeEmptyState.vue";
import CPracticeFolderPicker from "@/pages/practice/components/CPracticeFolderPicker.vue";
import CPracticeGuide from "@/pages/practice/components/CPracticeGuide.vue";
import CPracticeHeader from "@/pages/practice/components/CPracticeHeader.vue";
import CPracticeResult from "@/pages/practice/components/CPracticeResult.vue";
import { useOpeningPractice } from "@/pages/practice/composables/useOpeningPractice.ts";

const route = useRoute();
const isResultOpen = ref(false);
const folders = getOpeningFolders();
const presets = getOpeningPresets();
const activeFolder = computed(() => {
    const folderName = route.query.folder;

    if (typeof folderName !== "string") {
        return undefined;
    }

    return getOpeningFolder(folderName);
});
const {
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
} = useOpeningPractice(activeFolder);

watch(outcome, (value) => {
    isResultOpen.value = Boolean(value);
});
</script>

<style scoped>
.practice-page {
    width: min(100%, 1160px);
    margin: 0 auto;
    padding: var(--length-xxl) var(--length-m) var(--length-xxxl);

    .practice-layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(260px, 320px);
        gap: var(--length-l);
        align-items: start;
    }
}

@media (max-width: 820px) {
    .practice-page {
        padding-top: var(--length-xl);

        .practice-layout {
            grid-template-columns: 1fr;
        }
    }
}

@media (max-width: 560px) {
    .practice-page {
        padding-right: var(--length-xs);
        padding-left: var(--length-xs);
    }
}
</style>
