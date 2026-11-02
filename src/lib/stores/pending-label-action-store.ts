import { type LabelIdType, type StepLabelResultType, storage } from "@drincs/pixi-vn";

const STORAGE_KEY = "_pendingLabelAction";

type PendingLabelActionInfo =
    | {
          type: "start";
          labelId: LabelIdType;
          options: { choiceMade?: number; closeCurrentLabel?: boolean; type: string };
      }
    | { type: "close"; labelId: LabelIdType };

/**
 * Holds a label start/close postponed by `Game.onLabelStarting` / `Game.onLabelClosing` so it can
 * be resumed on a later `goNext` instead of running immediately. At most one action can be pending
 * at a time - a start and a close are different points in the same single-threaded narration flow,
 * never simultaneous. The label id (and, for a start, its options) are recorded in game storage;
 * the `defaultStart`/`defaultClose` closure can't be serialized, so it only lives in memory for the
 * current session.
 */
export namespace PendingLabelAction {
    let run: (() => Promise<StepLabelResultType>) | undefined;

    export function setStart(
        labelId: LabelIdType,
        options: Extract<PendingLabelActionInfo, { type: "start" }>["options"],
        defaultStart: () => Promise<StepLabelResultType>,
    ) {
        storage.set(STORAGE_KEY, { type: "start", labelId, options } as PendingLabelActionInfo);
        run = defaultStart;
    }

    export function setClose(
        labelId: LabelIdType,
        defaultClose: () => Promise<StepLabelResultType>,
    ) {
        storage.set(STORAGE_KEY, { type: "close", labelId } as PendingLabelActionInfo);
        run = defaultClose;
    }

    /** Whether a label start/close is currently postponed, without consuming it. */
    export function has(): boolean {
        return storage.get<PendingLabelActionInfo>(STORAGE_KEY) !== undefined;
    }

    /** Returns the postponed action's function, clearing the pending state. */
    export function consume(): (() => Promise<StepLabelResultType>) | undefined {
        if (!storage.get<PendingLabelActionInfo>(STORAGE_KEY)) return undefined;
        storage.remove(STORAGE_KEY);
        const defaultAction = run;
        run = undefined;
        return defaultAction;
    }
}
