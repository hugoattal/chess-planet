import { useLocalStorage } from "@vueuse/core";

export type TOpeningColor = "black" | "white";

export type TOpeningFolder = {
    color: TOpeningColor;
    lines: Array<string>;
    name: string;
};

const storageKey = "chessplanet-opening-folders";
const presetsSeparatedKey = "chessplanet-opening-presets-separated";
const presetFolderFiles = import.meta.glob<Array<TOpeningFolder>>("../database/*.json", {
    eager: true,
    import: "default"
});
const presetFolders = Object.values(presetFolderFiles).flat();
const storedFolders = useLocalStorage<Array<TOpeningFolder>>(storageKey, []);
const presetsSeparated = useLocalStorage(presetsSeparatedKey, false);

if (!presetsSeparated.value) {
    storedFolders.value = migrateStoredFolders(storedFolders.value);
    presetsSeparated.value = true;
}

export function getOpeningFolders(): Array<TOpeningFolder> {
    return storedFolders.value;
}

export function getOpeningPresets(): Array<TOpeningFolder> {
    return presetFolders;
}

export function getOpeningFolder(folderName: string): TOpeningFolder | undefined {
    return getOpeningFolders().find((folder) => folder.name === folderName)
        ?? getOpeningPresets().find((folder) => folder.name === folderName);
}

export function isOpeningPreset(folderName: string): boolean {
    return getOpeningPresets().some((folder) => folder.name === folderName);
}

export function createOpeningFolder(name: string, color: TOpeningColor): boolean {
    const folders = getOpeningFolders();
    const normalizedName = name.trim();
    const folderExists = openingFolderNameExists(normalizedName);

    if (!normalizedName || folderExists) {
        return false;
    }

    folders.push({
        color,
        lines: [],
        name: normalizedName
    });

    return true;
}

export function updateOpeningFolder(currentName: string, name: string, color: TOpeningColor): boolean {
    const folders = getOpeningFolders();
    const folder = folders.find((currentFolder) => currentFolder.name === currentName);
    const normalizedName = name.trim();
    const folderExists = getOpeningPresets().some((preset) => namesMatch(preset.name, normalizedName))
        || folders.some((currentFolder) => currentFolder !== folder && namesMatch(currentFolder.name, normalizedName));

    if (!folder || !normalizedName || folderExists) {
        return false;
    }

    folder.color = color;
    folder.name = normalizedName;

    return true;
}

export function addOpeningLine(folderName: string, line: string): boolean {
    const folders = getOpeningFolders();
    const folder = folders.find((currentFolder) => currentFolder.name === folderName);

    if (!folder || !line || folder.lines.includes(line)) {
        return false;
    }

    folder.lines.push(line);

    return true;
}

export function deleteOpeningFolder(folderName: string) {
    const folders = getOpeningFolders();
    const folderIndex = folders.findIndex((folder) => folder.name === folderName);

    if (folderIndex === -1) {
        return;
    }

    folders.splice(folderIndex, 1);
}

export function deleteOpeningLine(folderName: string, line: string) {
    const folders = getOpeningFolders();
    const folder = folders.find((currentFolder) => currentFolder.name === folderName);

    if (!folder) {
        return;
    }

    folder.lines = folder.lines.filter((savedLine) => savedLine !== line);
}

export function duplicateOpeningPreset(presetName: string): string | undefined {
    const preset = getOpeningPresets().find((folder) => folder.name === presetName);

    if (!preset) {
        return undefined;
    }

    const folderName = getAvailableFolderName(`${ preset.name } copy`);

    getOpeningFolders().push({
        ...preset,
        lines: [...preset.lines],
        name: folderName
    });

    return folderName;
}

export function clearOpeningFolders() {
    storedFolders.value = [];
}

export function serializeOpeningFolders(folders: Array<TOpeningFolder>): string {
    return JSON.stringify(folders, null, 4);
}

export function importOpeningFolders(serializedFolders: string): number {
    const importedFolders = JSON.parse(serializedFolders) as Array<TOpeningFolder>;

    if (!Array.isArray(importedFolders)) {
        throw new Error("This file does not contain opening folders.");
    }

    const folders = getOpeningFolders();

    for (const importedFolder of importedFolders) {
        const folderIndex = folders.findIndex((folder) => namesMatch(folder.name, importedFolder.name));

        if (folderIndex === -1) {
            const folderName = isOpeningPreset(importedFolder.name)
                ? getAvailableFolderName(`${ importedFolder.name } copy`)
                : importedFolder.name;

            folders.push({
                ...importedFolder,
                lines: [...importedFolder.lines],
                name: folderName
            });
        }
        else {
            folders[folderIndex] = {
                ...importedFolder,
                lines: [...importedFolder.lines]
            };
        }
    }

    return importedFolders.length;
}

function migrateStoredFolders(folders: Array<TOpeningFolder>): Array<TOpeningFolder> {
    const migratedFolders: Array<TOpeningFolder> = [];

    for (const folder of folders) {
        const preset = presetFolders.find((currentPreset) => namesMatch(currentPreset.name, folder.name));

        if (preset && foldersMatch(folder, preset)) {
            continue;
        }

        migratedFolders.push({
            ...folder,
            lines: [...folder.lines],
            name: preset ? getAvailableFolderName(`${ folder.name } copy`, migratedFolders) : folder.name
        });
    }

    return migratedFolders;
}

function foldersMatch(firstFolder: TOpeningFolder, secondFolder: TOpeningFolder): boolean {
    return firstFolder.color === secondFolder.color
        && firstFolder.lines.length === secondFolder.lines.length
        && firstFolder.lines.every((line, index) => line === secondFolder.lines[index]);
}

function openingFolderNameExists(folderName: string, folders = getOpeningFolders()): boolean {
    return getOpeningPresets().some((folder) => namesMatch(folder.name, folderName))
        || folders.some((folder) => namesMatch(folder.name, folderName));
}

function getAvailableFolderName(folderName: string, folders = getOpeningFolders()): string {
    let availableName = folderName;
    let copyNumber = 2;

    while (openingFolderNameExists(availableName, folders)) {
        availableName = `${ folderName } ${ copyNumber }`;
        copyNumber++;
    }

    return availableName;
}

function namesMatch(firstName: string, secondName: string): boolean {
    return firstName.toLowerCase() === secondName.toLowerCase();
}
