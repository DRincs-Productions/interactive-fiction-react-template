import { type LabelIdType, type StepLabelResultType, storage } from "@drincs/pixi-vn";

const STORAGE_KEY = "_pendingLabelStart";

interface PendingLabelStartInfo {
    labelId: LabelIdType;
    options: {
        choiceMade?: number;
        closeCurrentLabel?: boolean;
        type: string;
    };
}

/**
 * Holds a label start postponed by `Game.onLabelStarting` so it can be resumed on a later
 * `goNext` instead of starting immediately. `labelId`/`options` are recorded in the game
 * storage; `start` (the `defaultStart` closure) can't be serialized, so it only lives in
 * memory for the current session.
 */
export namespace PendingLabelStart {
    let start: (() => Promise<StepLabelResultType>) | undefined;

    export function set(
        labelId: PendingLabelStartInfo["labelId"],
        options: PendingLabelStartInfo["options"],
        defaultStart: () => Promise<StepLabelResultType>,
    ) {
        storage.set(STORAGE_KEY, { labelId, options });
        start = defaultStart;
    }

    /** Whether a label start is currently postponed, without consuming it. */
    export function has(): boolean {
        return storage.get<PendingLabelStartInfo>(STORAGE_KEY) !== undefined;
    }

    /** Returns the postponed label's start function, clearing the pending state. */
    export function consume(): (() => Promise<StepLabelResultType>) | undefined {
        if (!storage.get<PendingLabelStartInfo>(STORAGE_KEY)) return undefined;
        storage.remove(STORAGE_KEY);
        const defaultStart = start;
        start = undefined;
        return defaultStart;
    }
}
