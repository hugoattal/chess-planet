<template>
    <main class="landing-page">
        <section class="introduction">
            <p class="eyebrow">
                Opening practice
            </p>
            <h1>Learn chess openings by repetition.</h1>
            <p>
                Chess Planet lets you practise openings repeatedly against randomized registered lines.
            </p>
        </section>

        <section
            aria-labelledby="folders-title"
            class="folders-section"
        >
            <header class="folders-heading">
                <div>
                    <p class="eyebrow">
                        Your library
                    </p>
                    <h2 id="folders-title">Opening folders</h2>
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

            <div
                v-if="folders.length"
                class="folder-grid"
            >
                <article
                    v-for="folder in folders"
                    :key="folder.name"
                    :class="{ selected: selectedFolderName === folder.name }"
                    class="folder-card"
                >
                    <button
                        class="folder-select"
                        type="button"
                        @click="selectedFolderName = folder.name"
                    >
                        <UIcon
                            aria-hidden="true"
                            class="folder-icon"
                            name="lucide:folder"
                        />
                        <strong>{{ folder.name }}</strong>
                        <span>{{ folder.lines.length }} {{ folder.lines.length === 1 ? "line" : "lines" }}</span>
                    </button>
                    <UButton
                        :aria-label="`Delete ${ folder.name } folder`"
                        class="delete-folder"
                        color="error"
                        icon="lucide:trash-2"
                        size="sm"
                        variant="ghost"
                        @click="removeFolder(folder.name)"
                    />
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

            <section
                v-if="selectedFolder"
                class="folder-lines"
            >
                <h3>{{ selectedFolder.name }}</h3>

                <div
                    v-if="selectedFolder.lines.length"
                    class="line-list"
                >
                    <div
                        v-for="(line, index) in selectedFolder.lines"
                        :key="line"
                        class="line-card"
                    >
                        <RouterLink
                            class="line-link"
                            :to="{ name: 'board', query: { line } }"
                        >
                            <span>Line {{ index + 1 }}</span>
                            <code>{{ line }}</code>
                            <UIcon
                                aria-hidden="true"
                                name="lucide:arrow-right"
                            />
                        </RouterLink>
                        <UButton
                            :aria-label="`Delete line ${ index + 1 }`"
                            color="error"
                            icon="lucide:trash-2"
                            size="sm"
                            variant="ghost"
                            @click="removeLine(line)"
                        />
                    </div>
                </div>

                <p
                    v-else
                    class="empty-lines"
                >
                    This folder is empty. Play a line on the board, then save it here.
                </p>
            </section>
        </section>
    </main>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

import {
    createOpeningFolder,
    deleteOpeningFolder,
    deleteOpeningLine,
    getOpeningFolders
} from "@/lib/openingFolders.ts";

const folders = ref(getOpeningFolders());
const newFolderName = ref("");
const folderError = ref("");
const selectedFolderName = ref("");
const selectedFolder = computed(() => folders.value.find(folder => folder.name === selectedFolderName.value));

function addFolder() {
    const folderName = newFolderName.value.trim();

    if (!folderName) {
        folderError.value = "Enter a folder name.";
        return;
    }

    if (!createOpeningFolder(folderName)) {
        folderError.value = "A folder with that name already exists.";
        return;
    }

    folders.value = getOpeningFolders();
    selectedFolderName.value = folderName;
    newFolderName.value = "";
    folderError.value = "";
}

function removeFolder(folderName: string) {
    if (!window.confirm(`Delete ${ folderName } and all its lines?`)) {
        return;
    }

    deleteOpeningFolder(folderName);
    folders.value = getOpeningFolders();

    if (selectedFolderName.value === folderName) {
        selectedFolderName.value = "";
    }
}

function removeLine(line: string) {
    if (!selectedFolder.value || !window.confirm("Delete this line?")) {
        return;
    }

    deleteOpeningLine(selectedFolder.value.name, line);
    folders.value = getOpeningFolders();
}
</script>

<style scoped>
.landing-page {
    width: min(100%, 1040px);
    margin: 0 auto;
    padding: var(--length-xxl) var(--length-m) var(--length-xxxl);

    .eyebrow {
        color: var(--color-primary);
        font-size: var(--font-size-xs);
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
    }

    .introduction {
        max-width: 660px;
        margin-bottom: var(--length-xxl);

        h1 {
            margin: var(--length-xs) 0 var(--length-s);
            font-size: clamp(2rem, 5vw, 3.5rem);
            font-weight: 700;
            line-height: 1.05;
        }

        > p:last-child {
            color: var(--color-text-softer);
            font-size: var(--font-size-l);
        }
    }

    .folders-section {
        display: grid;
        gap: var(--length-l);

        .folders-heading {
            display: flex;
            gap: var(--length-l);
            align-items: end;
            justify-content: space-between;

            h2 {
                margin-top: var(--length-xxs);
                font-size: var(--font-size-xxl);
                font-weight: 700;
            }
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
                grid-template-columns: minmax(0, 1fr) auto;
                gap: var(--length-xs);

                input {
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

                .delete-folder {
                    position: absolute;
                    right: var(--length-xs);
                    top: var(--length-xs);
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

        .folder-lines {
            border-top: var(--length-xxxxs) solid var(--ui-border);
            padding-top: var(--length-l);

            h3 {
                margin-bottom: var(--length-m);
                font-size: var(--font-size-xl);
                font-weight: 700;
            }

            .line-list {
                display: grid;
                gap: var(--length-xs);

                .line-card {
                    background: var(--color-background-soft);
                    border-radius: var(--radius-s);
                    color: var(--color-text);
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) auto;
                    align-items: center;
                    padding-right: var(--length-xs);

                    &:hover {
                        background: var(--color-primary-softest);
                    }

                    .line-link {
                        color: inherit;
                        display: grid;
                        grid-template-columns: auto minmax(0, 1fr) auto;
                        gap: var(--length-m);
                        align-items: center;
                        padding: var(--length-m);
                        text-decoration: none;

                        span {
                            color: var(--color-primary);
                            font-weight: 700;
                        }

                        code {
                            overflow-wrap: anywhere;
                        }
                    }
                }
            }

            .empty-lines {
                color: var(--color-text-softer);
            }
        }
    }
}

@media (max-width: 700px) {
    .landing-page {
        padding-top: var(--length-xl);

        .folders-section {
            .folders-heading {
                align-items: stretch;
                flex-direction: column;
            }

            .create-folder {
                width: 100%;
            }
        }
    }
}

@media (max-width: 460px) {
    .landing-page {
        .folders-section {
            .folder-lines {
                .line-list {
                    .line-link {
                        grid-template-columns: 1fr auto;

                        code {
                            grid-column: 1 / -1;
                            grid-row: 2;
                        }
                    }
                }
            }
        }
    }
}
</style>
