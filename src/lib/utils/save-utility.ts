import {
    deleteRowFromIndexDB,
    getListFromIndexDB,
    getRowFromIndexDB,
    INDEXED_DB_SAVE_TABLE,
    putRowIntoIndexDB,
} from "@/lib/utils/db-utility";
import type GameSaveData from "@/models/GameSaveData";
import { Game } from "@drincs/pixi-vn";

const SAVE_FILE_EXTENSION = "json";
const AUTO_EXIT_SAVE_LOCAL_STORAGE_KEY = "auto_exit_save";

/**
 * The single quick-save slot's id. It's a fixed negative id so it never collides with
 * the ids used by manual saves (`0`-`{@link MANUAL_SAVE_SLOTS} - 1`) or with the `-1` id
 * reserved for the "auto exit save" (see {@link getLastSaveFromIndexDB}).
 */
export const QUICK_SAVE_ID = -2;

/**
 * Number of manual save slots. Kept small on purpose: slots behave like bookmarks
 * rather than a save library, and since the canvas isn't captured into a thumbnail
 * there's no benefit to a large, paginated list.
 */
export const MANUAL_SAVE_SLOTS = 5;

/** The ids of the manual save slots, `0` to `{@link MANUAL_SAVE_SLOTS} - 1`. */
export function getManualSaveIds(): number[] {
    return Array.from({ length: MANUAL_SAVE_SLOTS }, (_, index) => index);
}

export function isQuickSaveId(id: number): boolean {
    return id === QUICK_SAVE_ID;
}

/** Human-readable label for a save slot, e.g. "File 01" or "Quick Save". */
export function getSaveSlotLabel(id: number, t: (key: string) => string): string {
    if (isQuickSaveId(id)) {
        return t("quick_save");
    }
    return `${t("save_slot")} ${String(id + 1).padStart(2, "0")}`;
}

/** Number of trailing characters of the last dialogue line shown as a save's excerpt. */
const EXCERPT_LENGTH = 80;

/**
 * The (untranslated) text of the most recent dialogue in a save's history, if any -
 * resolve it with `t()` (using the "narration" namespace) before display.
 */
export function getLastDialogueRawText(
    state: GameSaveData["saveData"],
): string | string[] | undefined {
    const steps = state.historyData.stepsHistory;
    for (let index = steps.length - 1; index >= 0; index--) {
        const text = steps[index].dialogue?.text;
        if (text) {
            return text;
        }
    }
    return undefined;
}

/** Truncates `text` to its last {@link EXCERPT_LENGTH} characters, prefixed with an ellipsis when cut. */
export function getExcerpt(text: string): string {
    return text.length > EXCERPT_LENGTH ? `…${text.slice(-EXCERPT_LENGTH)}` : text;
}

export function createGameSave(options?: { name?: string }): GameSaveData {
    const { name = "" } = options || {};
    return {
        saveData: Game.exportGameState(),
        gameVersion: __APP_VERSION__,
        date: new Date(),
        name: name,
    };
}

export async function loadSave(saveData: GameSaveData) {
    await Game.restoreGameState(saveData.saveData);
}

/** Saves into the given slot id (a manual slot from {@link getManualSaveIds} or {@link QUICK_SAVE_ID}), overwriting whatever was there before. */
export async function saveGameToIndexDB(
    info: Partial<GameSaveData> & { id: number },
    data = createGameSave(),
): Promise<GameSaveData & { id: number }> {
    const item = { ...data, ...info } as GameSaveData & { id: number };
    await putRowIntoIndexDB(INDEXED_DB_SAVE_TABLE, item);
    return item;
}

/** Saves into the single quick-save slot (see {@link QUICK_SAVE_ID}), always overwriting whatever was there before. */
export async function quickSaveGameToIndexDB(): Promise<GameSaveData & { id: number }> {
    return saveGameToIndexDB({ id: QUICK_SAVE_ID });
}

export async function getSaveFromIndexDB(
    id: number,
): Promise<(GameSaveData & { id: number }) | null> {
    return await getRowFromIndexDB(INDEXED_DB_SAVE_TABLE, id);
}

export async function getLastSaveFromIndexDB(): Promise<(GameSaveData & { id: number }) | null> {
    const list = await getListFromIndexDB<GameSaveData & { id: number }>(INDEXED_DB_SAVE_TABLE, {
        pagination: { limit: 1, offset: 0 },
        order: { field: "date", direction: "prev" },
    });
    const indexedDbSave = list.length > 0 ? list[0] : null;

    const autoExitJsonString = localStorage.getItem(AUTO_EXIT_SAVE_LOCAL_STORAGE_KEY);
    if (autoExitJsonString) {
        const autoExitSave: GameSaveData & { id: number } = {
            ...(JSON.parse(autoExitJsonString) as GameSaveData),
            id: -1,
        };
        if (!indexedDbSave || new Date(autoExitSave.date) > new Date(indexedDbSave.date)) {
            return autoExitSave;
        }
    }

    return indexedDbSave;
}

export async function deleteSaveFromIndexDB(id: number): Promise<void> {
    return await deleteRowFromIndexDB(INDEXED_DB_SAVE_TABLE, id);
}

export function downloadGameSave(data: GameSaveData = createGameSave()) {
    const jsonString = JSON.stringify(data);
    // download the save data as a JSON file
    const blob = new Blob([jsonString], { type: "application/json" });
    // download the file
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${__APP_NAME__}-${__APP_VERSION__}-${data.name} ${data.date.toISOString()}.${SAVE_FILE_EXTENSION}`;
    a.click();
}

export function loadGameSaveFromFile(afterLoad?: (error?: Error) => void) {
    // load the save data from a JSON file
    const input = document.createElement("input");
    input.type = "file";
    input.accept = `application/${SAVE_FILE_EXTENSION}`;
    input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const jsonString = e.target?.result as string;
                const data: GameSaveData = JSON.parse(jsonString);
                // load the save data from the JSON string
                loadSave(data)
                    .then(() => {
                        afterLoad?.();
                    })
                    .catch((err) => {
                        afterLoad?.(err);
                    });
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

export async function addAutoExitSave() {
    const data = createGameSave();
    const jsonString = JSON.stringify(data);
    if (jsonString) {
        localStorage.setItem(AUTO_EXIT_SAVE_LOCAL_STORAGE_KEY, jsonString);
    }
}

export async function loadAutoExitSave(): Promise<boolean> {
    const jsonString = localStorage.getItem(AUTO_EXIT_SAVE_LOCAL_STORAGE_KEY);
    if (jsonString) {
        const data: GameSaveData = JSON.parse(jsonString);

        return loadSave(data)
            .then(() => {
                localStorage.removeItem(AUTO_EXIT_SAVE_LOCAL_STORAGE_KEY);
                return true;
            })
            .catch(() => {
                Game.clear();
                return false;
            });
    } else {
        return false;
    }
}
