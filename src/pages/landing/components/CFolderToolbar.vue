<template>
    <header class="folders-heading">
        <div>
            <h2 class="eyebrow">
                Your library
            </h2>
            <h2 id="folders-title">
                Your folders
            </h2>
            <p>Your folders are saved to your browser local storage.</p>
        </div>
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
        <UButton
            color="error"
            :disabled="folders.length === 0"
            icon="lucide:trash-2"
            label="Clear all"
            variant="soft"
            @click="emit('clear-all')"
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

import type { TOpeningFolder } from "@/lib/openingFolders.ts";
import { importOpeningFolders } from "@/lib/openingFolders.ts";

defineProps<{
    folders: Array<TOpeningFolder>;
}>();

const emit = defineEmits<{
    "clear-all": [];
    "export-all": [];
    "imported": [];
}>();

const transferMessage = ref("");
const importInput = ref<HTMLInputElement>();

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

    p:last-child {
        color: var(--color-text-softer);
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
</style>
