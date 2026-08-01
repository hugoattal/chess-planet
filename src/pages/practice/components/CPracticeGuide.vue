<template>
    <aside class="practice-guide">
        <UIcon
            aria-hidden="true"
            :class="['guide-icon', { thinking: waitingForOpponent }]"
            :name="waitingForOpponent ? 'lucide:loader-circle' : 'lucide:crosshair'"
        />
        <div>
            <h2>{{ title }}</h2>
            <p>{{ description }}</p>
        </div>
        <dl>
            <div>
                <dt>Streak</dt>
                <dd>{{ streak }}</dd>
            </div>
            <div>
                <dt>Matching lines</dt>
                <dd>{{ activeLineCount }}</dd>
            </div>
        </dl>
    </aside>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
    activeLineCount: number;
    hasConfirmedMove: boolean;
    streak: number;
    waitingForOpponent: boolean;
}>();

const title = computed(() => {
    if (!props.waitingForOpponent) {
        return "Your turn";
    }

    return props.hasConfirmedMove ? "Correct move" : "Opponent starts";
});
const description = computed(() => {
    if (!props.waitingForOpponent) {
        return "Play any move that continues at least one line in this folder.";
    }

    return props.hasConfirmedMove
        ? "The check marks your move while a reply is selected from the matching lines."
        : "A first move is being selected from this folder's saved lines.";
});
</script>

<style scoped>
.practice-guide {
    background: var(--color-background-soft);
    border: var(--length-xxxxs) solid var(--ui-border);
    border-radius: var(--radius-m);
    display: grid;
    gap: var(--length-m);
    padding: var(--length-l);

    .guide-icon {
        color: var(--color-primary);
        font-size: var(--font-icon-xl);

        &.thinking {
            animation: spin 1s linear infinite;
        }
    }

    h2 {
        font-size: var(--font-size-xl);
        font-weight: 700;
        margin-bottom: var(--length-xxs);
    }

    p {
        color: var(--color-text-softer);
        font-size: var(--font-size-s);
    }

    dl {
        border-top: var(--length-xxxxs) solid var(--ui-border);
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--length-m);
        padding-top: var(--length-m);

        div {
            display: grid;
            gap: var(--length-xxs);

            dt {
                color: var(--color-text-softer);
                font-size: var(--font-size-xs);
                text-transform: uppercase;
            }

            dd {
                color: var(--color-primary);
                font-size: var(--font-size-xxl);
                font-weight: 800;
            }
        }
    }
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>
