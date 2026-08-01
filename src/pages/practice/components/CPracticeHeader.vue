<template>
    <header class="practice-heading">
        <div>
            <p class="eyebrow">
                Playing as {{ folder.color }}
            </p>
            <h1>{{ folder.name }}</h1>
            <p>{{ status }}</p>
        </div>
        <UButton
            color="neutral"
            icon="lucide:folders"
            label="Choose another folder"
            :to="{ name: 'practice' }"
            variant="soft"
        />
    </header>
</template>

<script setup lang="ts">
import { computed } from "vue";

import type { TOpeningFolder } from "@/lib/openingFolders.ts";
import type { TPracticeOutcome } from "@/pages/practice/composables/useOpeningPractice.ts";

const props = defineProps<{
    folder: TOpeningFolder;
    hasConfirmedMove: boolean;
    outcome?: TPracticeOutcome;
    waitingForOpponent: boolean;
}>();

const status = computed(() => {
    if (props.outcome) {
        return "This round is complete.";
    }

    if (!props.waitingForOpponent) {
        return "Find a move from one of the saved lines.";
    }

    return props.hasConfirmedMove
        ? "Your move matched. The opponent will reply in two seconds."
        : "The opponent will play the opening move in two seconds.";
});
</script>

<style scoped>
.practice-heading {
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
}

@media (max-width: 560px) {
    .practice-heading {
        align-items: flex-start;
        flex-direction: column;
    }
}
</style>
