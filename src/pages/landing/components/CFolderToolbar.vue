<template>
    <header class="folders-heading">
        <div>
            <p class="eyebrow">
                Your library
            </p>
            <h2 id="folders-title">
                Opening folders
            </h2>
        </div>

        <form
            class="create-folder"
            @submit.prevent="addFolder"
        >
            <label for="folder-name">Folder name</label>
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
    </header>

    <div class="folder-transfer">
        <UButton
            color="neutral"
            icon="lucide:upload"
            label="Import folder(s)"
            variant="soft"
            @click="importInput?.click()"
        />
        <UButton
            color="neutral"
            :disabled="folders.length === 0"
            icon="lucide:download"
            label="Export all"
            variant="soft"
            @click="emit('export-all')"
        />
        <input
            ref="importInput"
            accept="application/json,.json"
            class="import-input"
            type="file"
            @change="importFolderFile"
        >
        <p
            v-if="transferMessage"
            class="transfer-message"
        >
            {{ transferMessage }}
        </p>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import type { TOpeningColor, TOpeningFolder } from "@/lib/openingFolders.ts";
import { createOpeningFolder, importOpeningFolders } from "@/lib/openingFolders.ts";

defineProps<{
    folders: Array<TOpeningFolder>;
}>();

const emit = defineEmits<{
    created: [folderName: string];
    "export-all": [];
    imported: [];
}>();

const newFolderName = ref("");
const newFolderColor = ref<TOpeningColor>("white");
const folderError = ref("");
const transferMessage = ref("");
const importInput = ref<HTMLInputElement>();

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

async function importFolderFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
        return;
    }

    try {
        const importedCount = importOpeningFolders(await file.text());

        transferMessage.value = `Imported ${ importedCount } ${ importedCount === 1 ? "folder" : "folders" }.`;
        emit("imported");
    }
    catch (error) {
        transferMessage.value = error instanceof Error ? error.message : "The folder import failed.";
    }
    finally {
        input.value = "";
    }
}
</script>

<style scoped>
.folders-heading {
    display: flex;
    gap: var(--length-l);
    align-items: end;
    justify-content: space-between;

    .eyebrow {
        color: var(--color-primary);
        font-size: var(--font-size-xs);
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
    }

    h2 {
        margin-top: var(--length-xxs);
        font-size: var(--font-size-xxl);
        font-weight: 700;
    }

    .create-folder {
        display: grid;
        gap: var(--length-xxs);
        width: min(100%, 430px);

        label {
            font-size: var(--font-size-s);
            font-weight: 700;
        }

        .create-folder-controls {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto auto;
            gap: var(--length-xs);

            input,
            select {
                background: var(--color-background-soft);
                border: var(--length-xxxxs) solid var(--ui-border);
                border-radius: var(--radius-s);
                color: var(--color-text);
                min-width: 0;
                padding: var(--length-xs) var(--length-s);
            }
        }

        .folder-error {
            color: var(--ui-error);
            font-size: var(--font-size-s);
        }
    }
}

.folder-transfer {
    display: flex;
    flex-wrap: wrap;
    gap: var(--length-xs);
    align-items: center;

    .import-input {
        display: none;
    }

    .transfer-message {
        color: var(--color-text-softer);
        font-size: var(--font-size-s);
    }
}

@media (max-width: 700px) {
    .folders-heading {
        align-items: stretch;
        flex-direction: column;

        .create-folder {
            width: 100%;

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
