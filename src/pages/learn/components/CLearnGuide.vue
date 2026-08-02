<template>
    <aside class="learn-guide">
        <h2>Follow the arrows</h2>

        <template v-if="isOutsideLines">
            <p>This position is outside every saved line in {{ folderName }}.</p>
            <UButton
                v-if="canAddLine"
                block
                icon="lucide:file-plus-2"
                label="Add this line"
                @click="emit('add-line')"
            />
            <p v-else>Duplicate this preset into your library to add your own lines.</p>
        </template>
        <p v-else-if="arrowCount">
            {{ arrowCount }} saved {{ arrowCount === 1 ? "move is" : "moves are" }} available. Play either side to explore the folder.
        </p>
        <p v-else-if="moveCount">
            You reached the end of a saved line. Keep playing to extend it.
        </p>
        <p v-else>
            Play any highlighted move. Every registered continuation for this turn is shown.
        </p>

        <p
            v-if="saveMessage"
            class="save-message"
        >
            {{ saveMessage }}
        </p>
    </aside>
</template>

<script setup lang="ts">
defineProps<{
    arrowCount: number;
    canAddLine: boolean;
    folderName: string;
    isOutsideLines: boolean;
    moveCount: number;
    saveMessage: string;
    turnLabel: string;
}>();

const emit = defineEmits<{
    "add-line": [];
}>();
</script>

<style scoped>
.learn-guide {
    background: var(--color-background-soft);
    border: var(--length-xxxxs) solid var(--ui-border);
    border-radius: var(--radius-m);
    display: grid;
    gap: var(--length-s);
    padding: var(--length-m);

    .eyebrow {
        color: var(--color-primary);
        font-size: var(--font-size-xs);
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
    }

    h2 {
        font-size: var(--font-size-xl);
        font-weight: 700;
    }

    p:not(.eyebrow) {
        color: var(--color-text-softer);
    }

    .save-message {
        font-size: var(--font-size-s);
    }
}
</style>
