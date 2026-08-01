<template>
    <section class="folder-lines">
        <form
            class="folder-editor"
            @submit.prevent="saveFolderChanges"
        >
            <label>
                Folder name
                <input
                    v-model="editFolderName"
                    autocomplete="off"
                    type="text"
                >
            </label>
            <label>
                Plays
                <select v-model="editFolderColor">
                    <option value="white">White</option>
                    <option value="black">Black</option>
                </select>
            </label>
            <UButton
                icon="lucide:save"
                label="Save changes"
                type="submit"
            />
            <p
                v-if="editFolderError"
                class="folder-error"
            >
                {{ editFolderError }}
            </p>
        </form>

        <h3>{{ folder.name }} lines</h3>

        <div
            v-if="folder.lines.length"
            class="line-list"
        >
            <div
                v-for="(line, index) in folder.lines"
                :key="line"
                class="line-card"
            >
                <RouterLink
                    class="line-link"
                    :to="{ name: 'editor', query: { color: folder.color, line } }"
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
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

import type { TOpeningColor, TOpeningFolder } from "@/lib/openingFolders.ts";
import { deleteOpeningLine, updateOpeningFolder } from "@/lib/openingFolders.ts";

const props = defineProps<{
    folder: TOpeningFolder;
}>();

const emit = defineEmits<{
    changed: [];
    renamed: [folderName: string];
}>();

const editFolderName = ref(props.folder.name);
const editFolderColor = ref<TOpeningColor>(props.folder.color);
const editFolderError = ref("");

watch(() => props.folder, setEditorValues);

function setEditorValues(folder: TOpeningFolder) {
    editFolderName.value = folder.name;
    editFolderColor.value = folder.color;
    editFolderError.value = "";
}

function saveFolderChanges() {
    const folderName = editFolderName.value.trim();

    if (!folderName) {
        editFolderError.value = "Enter a folder name.";
        return;
    }

    if (!updateOpeningFolder(props.folder.name, folderName, editFolderColor.value)) {
        editFolderError.value = "A folder with that name already exists.";
        return;
    }

    emit("renamed", folderName);
}

function removeLine(line: string) {
    if (!window.confirm("Delete this line?")) {
        return;
    }

    deleteOpeningLine(props.folder.name, line);
    emit("changed");
}
</script>

<style scoped>
.folder-lines {
    border-top: var(--length-xxxxs) solid var(--ui-border);
    padding-top: var(--length-l);

    .folder-editor {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto auto;
        gap: var(--length-xs);
        align-items: end;
        margin-bottom: var(--length-l);

        label {
            display: grid;
            gap: var(--length-xxs);
            font-size: var(--font-size-s);
            font-weight: 700;
        }

        input,
        select {
            background: var(--color-background-soft);
            border: var(--length-xxxxs) solid var(--ui-border);
            border-radius: var(--radius-s);
            color: var(--color-text);
            padding: var(--length-xs) var(--length-s);
        }

        .folder-error {
            color: var(--ui-error);
            font-size: var(--font-size-s);
            grid-column: 1 / -1;
        }
    }

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

@media (max-width: 700px) {
    .folder-lines {
        .folder-editor {
            grid-template-columns: 1fr auto;

            > label:first-child {
                grid-column: 1 / -1;
            }
        }
    }
}

@media (max-width: 460px) {
    .folder-lines {
        .folder-editor {
            grid-template-columns: 1fr;

            > label:first-child {
                grid-column: auto;
            }
        }

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
</style>
