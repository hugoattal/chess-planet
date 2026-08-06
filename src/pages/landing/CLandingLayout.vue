<template>
    <main class="landing-page">
        <CLandingIntroduction />

        <CFolderControls
            v-model:search-query="searchQuery"
            @created="handleFolderCreated"
        />

        <section
            aria-labelledby="folders-title"
            class="folders-section"
        >
            <CFolderToolbar
                :folders="folders"
                @clear-all="clearAllFolders"
                @export-all="exportAllFolders"
                @imported="refreshFolders"
            />
            <CFolderGrid
                :empty-message="emptyLibraryMessage"
                :folders="filteredFolders"
                :selected-folder-name="selectedFolderName"
                @delete="removeFolder"
                @export="exportFolder"
                @select="selectFolder"
                @unselect="unselectFolder"
            />
            <CFolderEditor
                v-if="selectedFolder"
                :folder="selectedFolder"
                @changed="refreshFolders"
                @renamed="handleFolderRenamed"
            />
        </section>

        <section
            aria-labelledby="presets-title"
            class="folders-section"
        >
            <header class="category-heading">
                <p class="eyebrow">
                    Ready to use
                </p>
                <h2 id="presets-title">
                    Presets
                </h2>
                <p>Presets always stay available. Duplicate one to customize it in your library.</p>
            </header>
            <CFolderGrid
                empty-message="No presets match your search."
                :folders="filteredPresets"
                preset
                @duplicate="duplicatePreset"
            />
        </section>
    </main>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

import type { TOpeningFolder } from "@/lib/openingFolders.ts";
import {
    clearOpeningFolders,
    deleteOpeningFolder,
    duplicateOpeningPreset,
    getOpeningFolders,
    getOpeningPresets,
    serializeOpeningFolders
} from "@/lib/openingFolders.ts";
import CFolderControls from "@/pages/landing/components/CFolderControls.vue";
import CFolderEditor from "@/pages/landing/components/CFolderEditor.vue";
import CFolderGrid from "@/pages/landing/components/CFolderGrid.vue";
import CFolderToolbar from "@/pages/landing/components/CFolderToolbar.vue";
import CLandingIntroduction from "@/pages/landing/components/CLandingIntroduction.vue";

const folders = ref(getOpeningFolders());
const presets = getOpeningPresets();
const searchQuery = ref("");
const normalizedSearch = computed(() => searchQuery.value.trim().toLowerCase());
const filteredFolders = computed(() => folders.value.filter((folder) => (
    folder.name.toLowerCase().includes(normalizedSearch.value)
)));
const filteredPresets = computed(() => presets.filter((folder) => (
    folder.name.toLowerCase().includes(normalizedSearch.value)
)));
const emptyLibraryMessage = computed(() => folders.value.length ? "No folders match your search." : "Create your first folder to save your own opening lines.");
const selectedFolderName = ref("");
const selectedFolder = computed(() => folders.value.find((folder) => folder.name === selectedFolderName.value));

watch(searchQuery, clearFolderSelection);

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

function unselectFolder(folderName: string) {
    if (selectedFolderName.value !== folderName) {
        return;
    }

    clearFolderSelection();
}

function clearFolderSelection() {
    selectedFolderName.value = "";
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

function clearAllFolders() {
    if (!window.confirm("Delete all folders and their lines?")) {
        return;
    }

    clearOpeningFolders();
    selectedFolderName.value = "";
    refreshFolders();
}

function duplicatePreset(presetName: string) {
    const folderName = duplicateOpeningPreset(presetName);

    if (!folderName) {
        return;
    }

    refreshFolders();
    selectFolder(folderName);
}

function exportFolder(folder: TOpeningFolder) {
    downloadFolders([folder], `${ getExportFileName(folder.name) }.json`);
}

function exportAllFolders() {
    downloadFolders(folders.value, "chessplanet-folders.json");
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

        & + .folders-section {
            margin-top: var(--length-xxl);
        }

        .category-heading {
            .eyebrow {
                color: var(--color-primary);
                font-size: var(--font-size-xs);
                font-weight: 700;
                letter-spacing: 0.12em;
                text-transform: uppercase;
            }

            h2 {
                margin: var(--length-xxs) 0;
                font-size: var(--font-size-xxl);
                font-weight: 700;
            }

            p:last-child {
                color: var(--color-text-softer);
            }
        }
    }
}

@media (max-width: 700px) {
    .landing-page {
        padding-top: var(--length-xl);
    }
}
</style>
