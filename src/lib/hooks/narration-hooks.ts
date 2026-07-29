import { SKIP_DELAY } from "@/constants";
import { useGameProps } from "@/lib/hooks/props-hooks";
import { AutoSettings } from "@/lib/stores/auto-settings-store";
import { GameStatus } from "@/lib/stores/game-status-store";
import { PendingLabelAction } from "@/lib/stores/pending-label-action-store";
import { SearchParams } from "@/lib/stores/search-param-store";
import { SkipSettings } from "@/lib/stores/skip-settings-store";
import { TextDisplaySettings } from "@/lib/stores/text-display-settings-store";
import { clearLinkContinueLock, isContinueLockedByLink } from "@/lib/utils/continue-lock-utility";
import { hasScrollableParent, isScrollableElement } from "@/lib/utils/scroll-utils";
import {
    Game,
    narration,
    stepHistory,
    type LabelAbstract,
    type LabelIdType,
    type StepLabelPropsType,
    type StoredIndexedChoiceInterface,
} from "@drincs/pixi-vn";
import { useDebouncer } from "@tanstack/react-pacer";
import { useSelector } from "@tanstack/react-store";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef } from "react";

/**
 * Functions meant to be triggered from UI (buttons, hotkeys, pointer handlers, etc.).
 * They must not be called from within a label's step: they manage UI-only concerns
 * (e.g. {@link GameStatus} loading state, blocking while a menu is open) that a step
 * running as part of the narration itself should not go through. Inside a label, use
 * `narration` directly (e.g. `narration.jump`, `narration.call`) instead of these.
 */
export function useNarrationFunctions() {
    const gameProps = useGameProps();
    const searchParams = useSelector(SearchParams.store, (state) => state);
    const hasOpenMenu = useMemo(
        () => Object.values(searchParams).some((value) => value !== undefined),
        [searchParams],
    );

    const goNext = useCallback(async () => {
        if (hasOpenMenu) return;
        TextDisplaySettings.resetForNext();
        GameStatus.setLoading(true);
        try {
            const pendingLabelAction = PendingLabelAction.consume();
            // isContinueLockedByLink is template-only (not a pixi-vn concept): a label step
            // called requireLinkClickToContinue and the player hasn't followed the required
            // MarkdownLink yet, so "continue" stays blocked even though narration.canContinue
            // is true.
            if (!pendingLabelAction && (!narration.canContinue || isContinueLockedByLink())) {
                GameStatus.setLoading(false);
                return;
            }
            if (pendingLabelAction) {
                await pendingLabelAction();
            }
            // Keep advancing within the current label - a paragraph at a time -
            // until either the player must act (choice/input) or a new label is about to
            // start/close (deferred by PendingLabelAction, resumed on the next goNext).
            let revealedFirstStep = false;
            while (
                !PendingLabelAction.has() &&
                narration.canContinue &&
                !isContinueLockedByLink()
            ) {
                await narration.continue(gameProps);
                if (!revealedFirstStep) {
                    // Reveal the very first step immediately so the typewriter starts
                    // right away, instead of waiting for the whole batch of steps below
                    // (label transitions, sound cues, etc.) to finish processing first.
                    // The rest keeps advancing in the background while it plays.
                    revealedFirstStep = true;
                    gameProps.invalidateInterfaceData();
                }
            }
            if (revealedFirstStep) {
                await TextDisplaySettings.waitUntilIdle();
            }
            gameProps.invalidateInterfaceData();
            GameStatus.setLoading(false);
        } catch (e) {
            GameStatus.setLoading(false);
            console.error(e);
        }
    }, [gameProps, hasOpenMenu]);

    const goBack = useCallback(async () => {
        if (hasOpenMenu) return;
        GameStatus.setLoading(true);
        return stepHistory
            .back(gameProps)
            .then(() => {
                GameStatus.setLoading(false);
                gameProps.invalidateInterfaceData();
            })
            .catch((e) => {
                GameStatus.setLoading(false);
                console.error(e);
            });
    }, [gameProps, hasOpenMenu]);

    const selectChoice = useCallback(
        async (item: StoredIndexedChoiceInterface) => {
            if (hasOpenMenu) return;
            GameStatus.setLoading(true);
            try {
                await narration.selectChoice(item, gameProps);
            } catch (e) {
                GameStatus.setLoading(false);
                console.error(e);
                return;
            }
            // Selecting a choice that jumps/calls into a new label only defers the label
            // start (see PendingLabelAction) - goNext is what actually consumes it and
            // advances the narration to the next paragraph.
            await goNext();
        },
        [gameProps, goNext, hasOpenMenu],
    );

    const startNewGame = useCallback(
        async <T extends {}>(label: LabelAbstract<any, T> | LabelIdType, props?: T) => {
            GameStatus.setLoading(true);
            return Game.start(label, { ...gameProps, ...props } as StepLabelPropsType<T>)
                .then(() => goNext())
                .catch((e) => {
                    GameStatus.setLoading(false);
                    console.error(e);
                });
        },
        [gameProps, goNext],
    );

    const jump = useCallback(
        async <T extends {}>(label: LabelAbstract<any, T> | LabelIdType, props?: T) => {
            if (hasOpenMenu) return;
            GameStatus.setLoading(true);
            clearLinkContinueLock();
            return narration
                .jump(label, { ...gameProps, ...props } as StepLabelPropsType<T>)
                .then((result) => goNext().then(() => result))
                .catch((e) => {
                    GameStatus.setLoading(false);
                    console.error(e);
                });
        },
        [gameProps, goNext, hasOpenMenu],
    );

    const call = useCallback(
        async <T extends {}>(label: LabelAbstract<any, T> | LabelIdType, props?: T) => {
            if (hasOpenMenu) return;
            GameStatus.setLoading(true);
            clearLinkContinueLock();
            return narration
                .call(label, { ...gameProps, ...props } as StepLabelPropsType<T>)
                .then((result) => goNext().then(() => result))
                .catch((e) => {
                    GameStatus.setLoading(false);
                    console.error(e);
                });
        },
        [gameProps, goNext, hasOpenMenu],
    );

    return {
        goNext,
        goBack,
        selectChoice,
        startNewGame,
        jump,
        call,
    };
}

/** Maximum pointer displacement (px) between pointerdown and pointerup that is still considered a tap/click. */
const DRAG_THRESHOLD_PX = 5;
const LONG_PRESS_SKIP_DELAY_MS = 700;
const isDragGesture = (dx: number, dy: number) =>
    dx * dx + dy * dy > DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX;

export function useNarrationPointerHandlers() {
    const { goNext } = useNarrationFunctions();
    const skipEnabled = useSelector(SkipSettings.store, (state) => state.enabled);
    const typewriterInProgress = useSelector(
        TextDisplaySettings.store,
        (state) => state.inProgress,
    );
    const pointerDownPos = useRef<{ x: number; y: number } | null>(null);
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const longPressTriggered = useRef(false);

    const clearLongPressTimer = useCallback(() => {
        if (!longPressTimer.current) return;
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
    }, []);

    const handlePointerDown = useCallback(
        (e: React.PointerEvent) => {
            if (e.button !== 0) return;
            if (hasScrollableParent(e.target)) return;

            longPressTriggered.current = false;
            pointerDownPos.current = { x: e.clientX, y: e.clientY };
            clearLongPressTimer();
            longPressTimer.current = setTimeout(() => {
                if (!pointerDownPos.current) return;
                longPressTriggered.current = true;
                SkipSettings.setEnabled(true);
            }, LONG_PRESS_SKIP_DELAY_MS);
        },
        [clearLongPressTimer],
    );

    /**
     * Clear the pending gesture on cancel.
     * react-resizable-panels calls setPointerCapture() on the separator element in its
     * pointermove handler (NOT in pointerdown), so the overlay never receives a native
     * pointercancel when the separator takes over the drag. This handler ensures the ref
     * is cleaned up in the cases where the browser itself cancels the gesture.
     */
    const handlePointerCancel = useCallback(() => {
        clearLongPressTimer();
        pointerDownPos.current = null;
        if (longPressTriggered.current) {
            SkipSettings.setEnabled(false);
            longPressTriggered.current = false;
        }
    }, [clearLongPressTimer]);

    const handlePointerUp = useCallback(
        (e: React.PointerEvent) => {
            // Only fire if a matching pointerdown was recorded on this element.
            // If pointerdown started on a higher-z element (e.g. a resize handle),
            // the ref will be null and we must not advance the narration.
            if (!pointerDownPos.current) return;

            const dx = e.clientX - pointerDownPos.current.x;
            const dy = e.clientY - pointerDownPos.current.y;
            clearLongPressTimer();
            pointerDownPos.current = null;

            // If the pointer moved significantly it was a drag (e.g. resize), not a tap.
            if (isDragGesture(dx, dy)) return;

            // Let resize handles manage their own drag behaviour
            if ((e.target as HTMLElement).closest('[data-slot="resizable-handle"]')) return;
            // Let native scrollbar interactions through
            if (isScrollableElement(e.target as HTMLElement)) return;

            if (longPressTriggered.current) {
                SkipSettings.setEnabled(false);
                longPressTriggered.current = false;
                return;
            }

            if (skipEnabled) {
                SkipSettings.setEnabled(false);
            }
            if (typewriterInProgress && !narration.dialogGlue) {
                TextDisplaySettings.complete();
                return;
            }
            goNext();
        },
        [clearLongPressTimer, goNext, skipEnabled, typewriterInProgress],
    );

    const handlePointerMove = useCallback(
        (e: React.PointerEvent) => {
            if (!pointerDownPos.current) return;
            const dx = e.clientX - pointerDownPos.current.x;
            const dy = e.clientY - pointerDownPos.current.y;
            if (!isDragGesture(dx, dy)) return;
            clearLongPressTimer();
            pointerDownPos.current = null;
            if (longPressTriggered.current) {
                SkipSettings.setEnabled(false);
                longPressTriggered.current = false;
            }
        },
        [clearLongPressTimer],
    );

    useEffect(
        () => () => {
            clearLongPressTimer();
        },
        [clearLongPressTimer],
    );

    return { handlePointerDown, handlePointerCancel, handlePointerMove, handlePointerUp };
}

export function useSkipAutoDetector() {
    const skipEnabled = useSelector(SkipSettings.store, (state) => state.enabled);
    const autoEnabled = useSelector(AutoSettings.store, (state) => state.enabled);
    const autoTime = useSelector(AutoSettings.store, (state) => state.time);
    const typewriterInProgress = useSelector(
        TextDisplaySettings.store,
        (state) => state.inProgress,
    );
    const searchParams = useSelector(SearchParams.store, (state) => state);
    const hasOpenMenu = useMemo(
        () => Object.values(searchParams).some((value) => value !== undefined),
        [searchParams],
    );
    const { goNext } = useNarrationFunctions();

    const savedGoNext = useRef(goNext);
    useEffect(() => {
        savedGoNext.current = goNext;
    }, [goNext]);
    useEffect(() => {
        if (skipEnabled && !hasOpenMenu) {
            const id = setInterval(() => savedGoNext.current(), SKIP_DELAY);
            return () => clearInterval(id);
        }
    }, [skipEnabled, hasOpenMenu]);

    const autoDebouncer = useDebouncer(
        (_trigger: {
            autoEnabled: boolean;
            skipEnabled: boolean;
            typewriterInProgress: boolean;
            autoTime: number;
            hasOpenMenu: boolean;
        }) => {
            goNext();
        },
        {
            wait: autoTime * 1000,
            enabled: autoEnabled && !skipEnabled && !typewriterInProgress && !hasOpenMenu,
        },
    );

    const { maybeExecute } = autoDebouncer;

    useEffect(() => {
        maybeExecute({ autoEnabled, skipEnabled, typewriterInProgress, autoTime, hasOpenMenu });
    }, [maybeExecute, autoEnabled, skipEnabled, typewriterInProgress, autoTime, hasOpenMenu]);

    return null;
}
