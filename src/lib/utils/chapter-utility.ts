import type { GameState } from "@drincs/pixi-vn";
import { storage } from "@drincs/pixi-vn";

const CHAPTER_COUNTER_KEY = "_chapterCounter";
const CHAPTER_NAME_KEY = "_chapterName";

/**
 * Advances the story to a new chapter: increments the chapter counter and records the
 * chapter's name. `name` should be a translation key - resolve it with `t()` (using the
 * "narration" namespace) wherever the chapter is displayed, e.g. in the save/load menu
 * (see {@link readChapterFromSave}).
 *
 * Both values are stored via pixi-vn's persistent `storage`, so they are included in
 * every save and restored with it - each save slot can therefore show the chapter that
 * was active at the time it was made.
 */
export function setChapter(name: string) {
    storage.set(CHAPTER_COUNTER_KEY, getChapterCounter() + 1);
    storage.set(CHAPTER_NAME_KEY, name);
}

/** The number of chapters set so far during the current playthrough. */
export function getChapterCounter(): number {
    return storage.get<number>(CHAPTER_COUNTER_KEY) ?? 0;
}

/** The translation key of the current chapter's name, if {@link setChapter} was ever called. */
export function getChapterName(): string | undefined {
    return storage.get<string>(CHAPTER_NAME_KEY);
}

/**
 * Reads the chapter counter/name out of an exported {@link GameState} (e.g. a save file)
 * without restoring it - used to show, per save slot, which chapter was active at the
 * time that save was made.
 */
export function readChapterFromSave(state: GameState): { counter: number; name?: string } {
    const counter = state.storageData.main.find((item) => item.key === CHAPTER_COUNTER_KEY);
    const name = state.storageData.main.find((item) => item.key === CHAPTER_NAME_KEY);
    return {
        counter: (counter?.value as number) ?? 0,
        name: name?.value as string | undefined,
    };
}
