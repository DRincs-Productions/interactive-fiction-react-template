import { Store } from "@tanstack/store";

type TextDisplayStorage = {
    /**
     * The delay in milliseconds between each character
     */
    delay: number;
    /**
     * Whether the typewriter effect is in progress
     */
    inProgress: boolean;
    /**
     * Whether the typewriter effect should be force-completed instantly
     */
    forceComplete: boolean;
    /**
     * The font size in percent (100 = default)
     */
    fontSize: number;
};

export namespace TextDisplaySettings {
    const initialFontSize = Number(localStorage.getItem("text_display_font_size") ?? 100);
    document.documentElement.style.fontSize = `${initialFontSize}%`;

    export const store = new Store<TextDisplayStorage>({
        delay: Number(localStorage.getItem("typewriter_delay_millisecond") ?? 10),
        inProgress: false,
        forceComplete: false,
        fontSize: initialFontSize,
    });

    /**
     * Set the delay in milliseconds between each character
     */
    export function setDelay(value: number) {
        if (typeof value === "number") {
            localStorage.setItem("typewriter_delay_millisecond", value.toString());
            store.setState((state) => ({ ...state, delay: value }));
        }
    }

    /**
     * Set the font size in percent
     */
    export function setFontSize(value: number) {
        if (typeof value === "number") {
            localStorage.setItem("text_display_font_size", value.toString());
            store.setState((state) => ({ ...state, fontSize: value }));
            document.documentElement.style.fontSize = `${value}%`;
        }
    }

    /**
     * Start the typewriter effect
     */
    export function start() {
        store.setState((state) => ({ ...state, inProgress: true }));
    }

    /**
     * End the typewriter effect
     */
    export function end() {
        store.setState((state) => ({ ...state, inProgress: false, forceComplete: false }));
    }

    /**
     * Force the typewriter effect to complete instantly
     */
    export function complete() {
        store.setState((state) => ({ ...state, forceComplete: true, inProgress: false }));
    }

    /**
     * Clear the forceComplete flag before advancing to the next step
     */
    export function resetForNext() {
        store.setState((state) => ({ ...state, forceComplete: false }));
    }

    /**
     * Resolves once the typewriter has finished animating the paragraph it is about to
     * (or already started to) show. Used to hold off revealing a batch of further-advanced
     * steps until the just-started animation has actually played, instead of cutting it off.
     *
     * If the animation hasn't started within `startTimeoutMs` (e.g. the paragraph had no
     * text to animate), resolves anyway so callers never hang.
     */
    export function waitUntilIdle(startTimeoutMs = 300): Promise<void> {
        return new Promise((resolve) => {
            let hasStarted = store.state.inProgress;
            let startTimeout: ReturnType<typeof setTimeout> | undefined;

            const finish = () => {
                if (startTimeout !== undefined) clearTimeout(startTimeout);
                subscription.unsubscribe();
                resolve();
            };

            const subscription = store.subscribe((state) => {
                if (state.inProgress) {
                    hasStarted = true;
                    return;
                }
                if (hasStarted) finish();
            });

            if (!hasStarted) {
                startTimeout = setTimeout(() => {
                    if (!hasStarted) finish();
                }, startTimeoutMs);
            }
        });
    }
}
