<template>
    <div class="folder-controls">
        <label class="folder-search">
            <span>Search folders</span>
            <input
                autocomplete="off"
                placeholder="Search by name"
                :value="searchQuery"
                type="search"
                @input="updateSearchQuery"
            >
        </label>

        <form
            class="create-folder"
            @submit.prevent="addFolder"
        >
            <label for="folder-name">Create a folder</label>
            <div class="create-folder-controls">
                <input
                    id="folder-name"
                    v-model="newFolderName"
                    autocomplete="off"
                    placeholder="e.g. Sicilian Defense"
                    type="text"
                >
                <select
                    v-model="newFolderColor"
                    aria-label="Color played in this folder"
                >
                    <option value="white">
                        White
                    </option>
                    <option value="black">
                        Black
                    </option>
                </select>
                <UButton
                    icon="lucide:folder-plus"
                    label="Create"
                    type="submit"
                />
            </div>
            <p
                v-if="folderError"
                class="folder-error"
            >
                {{ folderError }}
            </p>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import type { TOpeningColor } from "@/lib/openingFolders.ts";
import { createOpeningFolder } from "@/lib/openingFolders.ts";

defineProps<{
    searchQuery: string;
}>();

const emit = defineEmits<{
    created: [folderName: string];
    "update:searchQuery": [searchQuery: string];
}>();

const newFolderName = ref("");
const newFolderColor = ref<TOpeningColor>("white");
const folderError = ref("");

function updateSearchQuery(event: Event) {
    emit("update:searchQuery", (event.target as HTMLInputElement).value);
}

function addFolder() {
    const folderName = newFolderName.value.trim();

    if (!folderName) {
        folderError.value = "Enter a folder name.";
        return;
    }

    if (!createOpeningFolder(folderName, newFolderColor.value)) {
        folderError.value = "A folder with that name already exists.";
        return;
    }

    emit("created", folderName);
    newFolderName.value = "";
    folderError.value = "";
}
</script>

<style scoped>
.folder-controls {
    display: grid;
    grid-template-columns: minmax(220px, 0.75fr) minmax(0, 1.25fr);
    gap: var(--length-l);
    align-items: start;
    margin-bottom: var(--length-xxl);

    .folder-search,
    .create-folder {
        display: grid;
        gap: var(--length-xxs);

        > label,
        > span {
            font-size: var(--font-size-s);
            font-weight: 700;
        }
    }

    input,
    select {
        background: var(--color-background-soft);
        border: var(--length-xxxxs) solid var(--ui-border);
        border-radius: var(--radius-s);
        color: var(--color-text);
        min-width: 0;
        padding: var(--length-xs) var(--length-s);
    }

    .folder-search {
        input {
            width: 100%;
        }
    }

    .create-folder {
        .create-folder-controls {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto auto;
            gap: var(--length-xs);
        }

        .folder-error {
            color: var(--ui-error);
            font-size: var(--font-size-s);
        }
    }
}

@media (max-width: 700px) {
    .folder-controls {
        grid-template-columns: 1fr;

        .create-folder {
            .create-folder-controls {
                grid-template-columns: minmax(0, 1fr) auto;

                button {
                    grid-column: 1 / -1;
                }
            }
        }
    }
}
</style>
