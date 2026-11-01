# Chapters, and the save/load menu

This page covers two things:

1. `src/lib/utils/chapter-utility.ts` - a **template-only** helper (not part of pixi-vn
   itself) for tracking "which chapter is the player in", so it can be shown per save slot.
2. Why the save/load menu only has 6 slots (1 quick save + 5 manual saves), and how a
   slot decides what to display.

## Tracking the current chapter

`src/lib/utils/chapter-utility.ts` exposes two pieces of state, backed by pixi-vn's
persistent `storage` (so they're included in every save and restored with it, just like
any other story variable):

- a **chapter counter** - how many chapters have been set so far;
- a **chapter name** - a translation key for the current chapter's display name.

```ts
import { setChapter } from "@/lib/utils/chapter-utility";

() => {
    setChapter("chapter_the_keep"); // a key in the "narration" i18n namespace
    narration.dialogue = `...`;
},
```

`setChapter(name)` increments the counter and records `name`. **Pass a translation key,
not already-translated text** - it's resolved with `t()` (using the `"narration"`
namespace) only where it's displayed, so it stays correct if the player switches
language mid-playthrough.

To read the current values during play (e.g. for a chapter-select UI, or a HUD element):

```ts
import { getChapterCounter, getChapterName } from "@/lib/utils/chapter-utility";

getChapterCounter(); // number, starts at 0
getChapterName(); // translation key | undefined
```

### Reading a chapter out of a save file

Because the counter/name live in pixi-vn's storage, they're captured in
`Game.exportGameState()` like any other variable - which means each save slot can show
the chapter that was active *at the time that save was made*, without restoring it first.
`readChapterFromSave(state)` does exactly that:

```ts
import { readChapterFromSave } from "@/lib/utils/chapter-utility";

const { counter, name } = readChapterFromSave(saveData.saveData);
```

This is how `SaveSlot` (`src/components/menus/save-menu/save-slots.tsx`) builds each
slot's title.

## Why only 6 save slots

The save/load menu (`src/components/menus/save-menu/`) intentionally does **not** offer
an unbounded, paginated list of save files. Slots are meant to behave like bookmarks:

- **1 quick-save slot** (`QUICK_SAVE_ID` in `src/lib/utils/save-utility.ts`) - written by
  the quick-save hotkeys (`F5` / `Ctrl+S`) and always overwritten, no rotation between
  multiple quick slots.
- **5 manual slots** (`MANUAL_SAVE_SLOTS`, ids `0`-`4`, from `getManualSaveIds()`) - fixed,
  not auto-incrementing, so the list never grows and never needs pagination.

This is also why slots don't show a canvas screenshot: `GameSaveData` has no `image`
field, and none is captured on save. Since there's no thumbnail to justify a large card,
each slot renders as a single compact row (an `Item` from `src/components/ui/item.tsx`)
inside a normal, non-fullscreen dialog, showing:

- the save's custom name, or else the chapter name from `readChapterFromSave`, or else a
  generic slot label (`getSaveSlotLabel`);
- the save's date/time;
- an excerpt - the last `EXCERPT_LENGTH` characters (see `getExcerpt` in
  `save-utility.ts`) of the most recent dialogue line in that save's history
  (`getLastDialogueRawText`).
