<template>
    <div
        v-if="folders.length"
        class="folder-grid"
    >
        <CFolderCard
            v-for="folder in folders"
            :key="folder.name"
            :folder="folder"
            :preset="preset"
            :selected="!preset && selectedFolderName === folder.name"
            @delete="emit('delete', $event)"
            @duplicate="emit('duplicate', $event)"
            @export="emit('export', $event)"
            @select="emit('select', $event)"
            @unselect="emit('unselect', $event)"
        />
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
        <p>{{ emptyMessage }}</p>
    </div>
</template>

<script setup lang="ts">
import type { TOpeningFolder } from "@/lib/openingFolders.ts";
import CFolderCard from "@/pages/landing/components/CFolderCard.vue";

withDefaults(defineProps<{
    emptyMessage?: string;
    folders: Array<TOpeningFolder>;
    preset?: boolean;
    selectedFolderName?: string;
}>(), {
    emptyMessage: "Create your first folder to save your own opening lines.",
    preset: false,
    selectedFolderName: ""
});

const emit = defineEmits<{
    delete: [folderName: string];
    duplicate: [folderName: string];
    export: [folder: TOpeningFolder];
    select: [folderName: string];
    unselect: [folderName: string];
}>();
</script>

<style scoped>
.folder-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
    gap: var(--length-m);
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
