<template>
    <header class="folder-heading">
        <p class="eyebrow">
            Opening practice
        </p>
        <h1>Choose a folder</h1>
        <p>Practice by playing the right move on random configurations.</p>
    </header>

    <div
        v-if="folderGroups.length"
        class="folder-groups"
    >
        <section
            v-for="group in folderGroups"
            :key="group.title"
            class="folder-group"
        >
            <h2>{{ group.title }}</h2>
            <div class="practice-folders">
                <article
                    v-for="folder in group.folders"
                    :key="folder.name"
                    class="practice-folder"
                >
                    <UIcon
                        aria-hidden="true"
                        class="folder-icon"
                        name="lucide:folder"
                    />
                    <h3>{{ folder.name }}</h3>
                    <p>Play as {{ folder.color }} · {{ folder.lines.length }} {{ folder.lines.length === 1 ? "line" : "lines" }}</p>
                    <UButton
                        block
                        icon="lucide:gamepad-2"
                        label="Practice"
                        :to="{ name: 'practice', query: { folder: folder.name } }"
                    />
                </article>
            </div>
        </section>
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
import { computed } from "vue";

import type { TOpeningFolder } from "@/lib/openingFolders.ts";
import CPracticeEmptyState from "@/pages/practice/components/CPracticeEmptyState.vue";

type TFolderGroup = {
    folders: Array<TOpeningFolder>;
    title: string;
};

const props = defineProps<{
    folders: Array<TOpeningFolder>;
    presets: Array<TOpeningFolder>;
}>();

const folderGroups = computed<Array<TFolderGroup>>(() => [
    { folders: props.folders, title: "Your library" },
    { folders: props.presets, title: "Presets" }
].filter((group) => group.folders.length));
</script>

<style scoped>
.folder-heading {
    margin-bottom: var(--length-xl);

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

.folder-groups {
    display: grid;
    gap: var(--length-xl);

    .folder-group {
        display: grid;
        gap: var(--length-m);

        > h2 {
            font-size: var(--font-size-xl);
            font-weight: 700;
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

                h3 {
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
    }
}
</style>
