<template>
    <div class="result-backdrop">
        <section
            aria-labelledby="result-title"
            aria-modal="true"
            class="result-popup"
            role="dialog"
        >
            <UIcon
                aria-hidden="true"
                :class="['result-icon', outcome]"
                :name="outcome === 'win' ? 'lucide:trophy' : 'lucide:x'"
            />
            <p class="eyebrow">
                {{ outcome === "win" ? "Line complete" : "Outside the repertoire" }}
            </p>
            <h2 id="result-title">
                {{ outcome === "win" ? "You won!" : "Not this time" }}
            </h2>
            <p>{{ message }}</p>
            <UButton
                v-if="outcome === 'win'"
                block
                icon="lucide:flame"
                :label="`Continue streak · ${ streak } ${ streak === 1 ? 'win' : 'wins' }`"
                size="lg"
                @click="emit('continue')"
            />
            <UButton
                v-else
                block
                icon="lucide:refresh-cw"
                label="Restart"
                size="lg"
                @click="emit('restart')"
            />
            <UButton
                v-if="outcome === 'loss'"
                block
                color="neutral"
                icon="lucide:eye"
                label="Inspect board"
                size="lg"
                variant="soft"
                @click="emit('close')"
            />
        </section>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

import type { TPracticeOutcome } from "@/pages/practice/composables/useOpeningPractice.ts";

const props = defineProps<{
    endedStreak: number;
    outcome: TPracticeOutcome;
    streak: number;
}>();

const emit = defineEmits<{
    close: [];
    continue: [];
    restart: [];
}>();

const message = computed(() => {
    if (props.outcome === "win") {
        return `You have completed ${ props.streak } ${ props.streak === 1 ? "line" : "lines" } in a row.`;
    }

    if (props.endedStreak) {
        return `That move is not in this folder. Your ${ props.endedStreak }-win streak has ended.`;
    }

    return "That move is not in this folder. Restart and try another continuation.";
});
</script>

<style scoped>
.result-backdrop {
    background: color-mix(in oklab, var(--color-black) 66%, transparent);
    display: grid;
    inset: 0;
    padding: var(--length-m);
    place-items: center;
    position: fixed;
    z-index: 20;

    .result-popup {
        background: var(--color-background);
        border: var(--length-xxxxs) solid var(--ui-border);
        border-radius: var(--radius-m);
        box-shadow: var(--ui-shadow-xl);
        display: grid;
        gap: var(--length-s);
        justify-items: center;
        max-width: 400px;
        padding: var(--length-xl);
        text-align: center;
        width: 100%;

        .result-icon {
            background: var(--color-primary-softest);
            border-radius: 50%;
            color: var(--color-primary);
            font-size: var(--font-icon-xl);
            padding: var(--length-s);

            &.loss {
                background: color-mix(in oklab, var(--ui-error) 12%, transparent);
                color: var(--ui-error);
            }
        }

        .eyebrow {
            color: var(--color-primary);
            font-size: var(--font-size-xs);
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
        }

        h2 {
            font-size: var(--font-size-xxxl);
            font-weight: 800;
        }

        > p:not(.eyebrow) {
            color: var(--color-text-softer);
            margin-bottom: var(--length-xs);
        }
    }
}
</style>
