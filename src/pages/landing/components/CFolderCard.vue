<template>
    <article
        ref="folderCard"
        class="folder-card"
        :class="{ selected }"
    >
        <div
            v-if="preset"
            class="folder-select preset-folder"
        >
            <UIcon
                aria-hidden="true"
                class="folder-icon"
                name="lucide:folder"
            />
            <strong>{{ folder.name }}</strong>
            <span>Plays {{ folder.color }}</span>
            <span>{{ folder.lines.length }} {{ folder.lines.length === 1 ? "line" : "lines" }}</span>
        </div>
        <button
            v-else
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
                v-if="preset"
                :aria-label="`Duplicate ${ folder.name } preset`"
                color="neutral"
                icon="lucide:copy-plus"
                size="sm"
                variant="soft"
                @click="emit('duplicate', folder.name)"
            />
            <template v-else>
                <UButton
                    :aria-label="`Export ${ folder.name } folder`"
                    color="neutral"
                    icon="lucide:download"
                    size="sm"
                    variant="soft"
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
            </template>
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
</template>

<script setup lang="ts">
import { onClickOutside } from "@vueuse/core";
import { ref } from "vue";

import type { TOpeningFolder } from "@/lib/openingFolders.ts";

const props = withDefaults(defineProps<{
    folder: TOpeningFolder;
    preset?: boolean;
    selected?: boolean;
}>(), {
    preset: false,
    selected: false
});

const emit = defineEmits<{
    delete: [folderName: string];
    duplicate: [folderName: string];
    export: [folder: TOpeningFolder];
    select: [folderName: string];
    unselect: [folderName: string];
}>();

const folderCard = ref<HTMLElement>();

onClickOutside(folderCard, unselectFolder, { ignore: [".folder-lines"] });

function unselectFolder() {
    if (!props.selected) {
        return;
    }

    emit("unselect", props.folder.name);
}
</script>

<style scoped>
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

        &.preset-folder {
            cursor: default;
        }

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
</style>
