<template>
    <div
        v-if="folders.length"
        class="folder-grid"
    >
        <article
            v-for="folder in folders"
            :key="folder.name"
            class="folder-card"
            :class="{ selected: selectedFolderName === folder.name }"
        >
            <button
                class="folder-select"
                type="button"
                @click="emit('select', folder.name)"
            >
                <UIcon
                    aria-hidden="true"
                    class="folder-icon"
                    name="lucide:folder"
                />
                <strong>{{ folder.name }}</strong>
                <span>Plays {{ folder.color }}</span>
                <span>{{ folder.lines.length }} {{ folder.lines.length === 1 ? "line" : "lines" }}</span>
            </button>
            <div class="folder-actions">
                <UButton
                    :aria-label="`Export ${ folder.name } folder`"
                    color="neutral"
                    icon="lucide:download"
                    size="sm"
                    variant="ghost"
                    @click="emit('export', folder)"
                />
                <UButton
                    :aria-label="`Delete ${ folder.name } folder`"
                    color="error"
                    icon="lucide:trash-2"
                    size="sm"
                    variant="ghost"
                    @click="emit('delete', folder.name)"
                />
            </div>
            <div class="folder-buttons">
                <UButton
                    block
                    icon="lucide:graduation-cap"
                    label="Learn"
                    :to="{ name: 'learn', query: { folder: folder.name } }"
                />
                <UButton
                    block
                    color="neutral"
                    icon="lucide:gamepad-2"
                    label="Practice"
                    :to="{ name: 'practice', query: { folder: folder.name } }"
                    variant="soft"
                />
            </div>
        </article>
    </div>

    <div
        v-else
        class="empty-folders"
    >
        <UIcon
            aria-hidden="true"
            class="empty-folders-icon"
            name="lucide:folder-open"
        />
        <p>Create your first folder to start collecting opening lines.</p>
    </div>
</template>

<script setup lang="ts">
import type { TOpeningFolder } from "@/lib/openingFolders.ts";

defineProps<{
    folders: Array<TOpeningFolder>;
    selectedFolderName: string;
}>();

const emit = defineEmits<{
    delete: [folderName: string];
    export: [folder: TOpeningFolder];
    select: [folderName: string];
}>();
</script>

<style scoped>
.folder-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
    gap: var(--length-m);

    .folder-card {
        background: var(--color-background-soft);
        border: var(--length-xxxxs) solid var(--ui-border);
        border-radius: var(--radius-m);
        color: var(--color-text);
        position: relative;
        transition: border-color var(--transition-default), transform var(--transition-default);

        &:hover,
        &.selected {
            border-color: var(--color-primary);
            transform: translateY(calc(var(--length-xxxs) * -1));
        }

        .folder-select {
            background: transparent;
            border: 0;
            color: inherit;
            cursor: pointer;
            display: grid;
            gap: var(--length-xs);
            justify-items: start;
            padding: var(--length-l);
            text-align: left;
            width: 100%;

            .folder-icon {
                color: var(--color-primary);
                font-size: var(--font-icon-l);
            }

            strong {
                font-size: var(--font-size-l);
            }

            span {
                color: var(--color-text-softer);
                font-size: var(--font-size-s);
            }
        }

        .folder-actions {
            display: flex;
            position: absolute;
            right: var(--length-xs);
            top: var(--length-xs);
        }

        .folder-buttons {
            display: grid;
            gap: var(--length-xs);
            grid-template-columns: 1fr 1fr;
            margin: 0 var(--length-m) var(--length-m);
        }
    }
}

.empty-folders {
    background: var(--color-background-soft);
    border: var(--length-xxxxs) dashed var(--ui-border);
    border-radius: var(--radius-m);
    color: var(--color-text-softer);
    display: grid;
    gap: var(--length-xs);
    justify-items: center;
    padding: var(--length-xxl);
    text-align: center;

    .empty-folders-icon {
        color: var(--color-primary);
        font-size: var(--font-icon-xl);
    }
}
</style>
