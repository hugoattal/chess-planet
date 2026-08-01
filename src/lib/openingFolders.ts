import { useLocalStorage } from "@vueuse/core";

export type TOpeningColor = "black" | "white";

export type TOpeningFolder = {
    color: TOpeningColor;
    lines: Array<string>;
    name: string;
};

const storageKey = "chess-planet-opening-folders";
const storedFolders = useLocalStorage<Array<TOpeningFolder>>(storageKey, []);

export function getOpeningFolders(): Array<TOpeningFolder> {
    return storedFolders.value;
}

export function createOpeningFolder(name: string, color: TOpeningColor): boolean {
    const folders = getOpeningFolders();
    const normalizedName = name.trim();
    const folderExists = folders.some((folder) => folder.name.toLowerCase() === normalizedName.toLowerCase());

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
    const folderExists = folders.some((currentFolder) => (
        currentFolder !== folder && currentFolder.name.toLowerCase() === normalizedName.toLowerCase()
    ));

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
        const folderIndex = folders.findIndex((folder) => folder.name.toLowerCase() === importedFolder.name.toLowerCase());

        if (folderIndex === -1) {
            folders.push(importedFolder);
        }
        else {
            folders[folderIndex] = importedFolder;
        }
    }

    return importedFolders.length;
}
