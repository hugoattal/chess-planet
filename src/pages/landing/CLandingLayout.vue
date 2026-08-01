<template>
    <main class="landing-page">
        <CLandingIntroduction />

        <section
            aria-labelledby="folders-title"
            class="folders-section"
        >
            <CFolderToolbar
                :folders="folders"
                @created="handleFolderCreated"
                @export-all="exportAllFolders"
                @imported="refreshFolders"
            />
            <CFolderGrid
                :folders="folders"
                :selected-folder-name="selectedFolderName"
                @delete="removeFolder"
                @export="exportFolder"
                @select="selectFolder"
            />
            <CFolderEditor
                v-if="selectedFolder"
                :folder="selectedFolder"
                @changed="refreshFolders"
                @renamed="handleFolderRenamed"
            />
        </section>
    </main>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

import type { TOpeningFolder } from "@/lib/openingFolders.ts";
import {
    deleteOpeningFolder,
    getOpeningFolders,
    serializeOpeningFolders
} from "@/lib/openingFolders.ts";
import CFolderEditor from "@/pages/landing/components/CFolderEditor.vue";
import CFolderGrid from "@/pages/landing/components/CFolderGrid.vue";
import CFolderToolbar from "@/pages/landing/components/CFolderToolbar.vue";
import CLandingIntroduction from "@/pages/landing/components/CLandingIntroduction.vue";

const folders = ref(getOpeningFolders());
const selectedFolderName = ref("");
const selectedFolder = computed(() => folders.value.find((folder) => folder.name === selectedFolderName.value));

function refreshFolders() {
    folders.value = getOpeningFolders();
}

function handleFolderCreated(folderName: string) {
    refreshFolders();
    selectFolder(folderName);
}

function handleFolderRenamed(folderName: string) {
    refreshFolders();
    selectFolder(folderName);
}

function selectFolder(folderName: string) {
    if (!folders.value.some((folder) => folder.name === folderName)) {
        return;
    }

    selectedFolderName.value = folderName;
}

function removeFolder(folderName: string) {
    if (!window.confirm(`Delete ${ folderName } and all its lines?`)) {
        return;
    }

    deleteOpeningFolder(folderName);
    refreshFolders();

    if (selectedFolderName.value === folderName) {
        selectedFolderName.value = "";
    }
}

function exportFolder(folder: TOpeningFolder) {
    downloadFolders([folder], `${ getExportFileName(folder.name) }.json`);
}

function exportAllFolders() {
    downloadFolders(folders.value, "chess-planet-folders.json");
}

function downloadFolders(exportedFolders: Array<TOpeningFolder>, fileName: string) {
    const blob = new Blob([serializeOpeningFolders(exportedFolders)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.download = fileName;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
}

function getExportFileName(folderName: string): string {
    return folderName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "opening-folder";
}
</script>

<style scoped>
.landing-page {
    width: min(100%, 1040px);
    margin: 0 auto;
    padding: var(--length-xxl) var(--length-m) var(--length-xxxl);

    .folders-section {
        display: grid;
        gap: var(--length-l);
    }
}

@media (max-width: 700px) {
    .landing-page {
        padding-top: var(--length-xl);
    }
}
</style>
