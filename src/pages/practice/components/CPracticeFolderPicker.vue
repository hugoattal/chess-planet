<template>
    <header class="folder-heading">
        <p class="eyebrow">
            Opening practice
        </p>
        <h1>Choose a folder</h1>
        <p>Train its saved lines from the side you selected.</p>
    </header>

    <div
        v-if="folders.length"
        class="practice-folders"
    >
        <article
            v-for="folder in folders"
            :key="folder.name"
            class="practice-folder"
        >
            <UIcon
                aria-hidden="true"
                class="folder-icon"
                name="lucide:folder"
            />
            <h2>{{ folder.name }}</h2>
            <p>Play as {{ folder.color }} · {{ folder.lines.length }} {{ folder.lines.length === 1 ? "line" : "lines" }}</p>
            <UButton
                block
                icon="lucide:gamepad-2"
                label="Practice"
                :to="{ name: 'practice', query: { folder: folder.name } }"
            />
        </article>
    </div>

    <CPracticeEmptyState
        v-else
        description="Create a folder and save some opening lines before practising."
        icon="lucide:folder-plus"
        title="No folders yet"
    >
        <UButton
            icon="lucide:folder-plus"
            label="Create a folder"
            :to="{ name: 'landing' }"
        />
    </CPracticeEmptyState>
</template>

<script setup lang="ts">
import type { TOpeningFolder } from "@/lib/openingFolders.ts";
import CPracticeEmptyState from "@/pages/practice/components/CPracticeEmptyState.vue";

defineProps<{
    folders: Array<TOpeningFolder>;
}>();
</script>

<style scoped>
.folder-heading {
    margin-bottom: var(--length-xl);
    text-align: center;

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

.practice-folders {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: var(--length-m);

    .practice-folder {
        background: var(--color-background-soft);
        border: var(--length-xxxxs) solid var(--ui-border);
        border-radius: var(--radius-m);
        display: grid;
        gap: var(--length-s);
        padding: var(--length-l);

        .folder-icon {
            color: var(--color-primary);
            font-size: var(--font-icon-xl);
        }

        h2 {
            font-size: var(--font-size-xl);
            font-weight: 700;
        }

        p {
            color: var(--color-text-softer);
            font-size: var(--font-size-s);
            margin-bottom: var(--length-xs);
        }
    }
}
</style>
