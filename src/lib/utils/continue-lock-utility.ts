import { storage } from "@drincs/pixi-vn";

const CONTINUE_LOCKED_BY_LINK_FLAG = "_continueLockedByLink";

/**
 * Blocks the player's ability to "continue" (tap/click, Space/Enter, the skip loop, ...)
 * until a markdown label-link (see `MarkdownLink` in `markdown-components.tsx`) is clicked.
 * Call this from a label step whose dialogue contains a `[text](labelId)` link the player
 * must follow before the story can move on. This mechanism is specific to this template -
 * it isn't part of pixi-vn itself, see `useNarrationFunctions.goNext` and `useQueryCanGoNext`.
 */
export function requireLinkClickToContinue() {
    storage.flags.set(CONTINUE_LOCKED_BY_LINK_FLAG, true);
}

/** Whether "continue" is currently blocked by `requireLinkClickToContinue`. */
export function isContinueLockedByLink() {
    return storage.flags.get(CONTINUE_LOCKED_BY_LINK_FLAG);
}

/** Clears the lock set by `requireLinkClickToContinue`. Called automatically by `MarkdownLink`. */
export function clearLinkContinueLock() {
    storage.flags.set(CONTINUE_LOCKED_BY_LINK_FLAG, false);
}
