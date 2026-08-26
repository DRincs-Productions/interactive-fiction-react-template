import packageJson from "@/../package.json";
import { MainMenuBackground } from "@/components/backgrounds/texture-background";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useNarrationFunctions } from "@/lib/hooks/narration-hooks";
import { useSetSearchParamState } from "@/lib/hooks/navigation-hooks";
import { useGameProps } from "@/lib/hooks/props-hooks";
import { useQueryLastSave } from "@/lib/query/save-query";
import { GameStatus } from "@/lib/stores/game-status-store";
import { loadAutoExitSave, loadSave } from "@/lib/utils/save-utility";
import { useHotkeys } from "@tanstack/react-hotkeys";
import { useQueryClient } from "@tanstack/react-query";
import { useSelector } from "@tanstack/react-store";
import { AlertCircle, CirclePlay, Play, Save, Settings } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const menuButtonClass =
    "w-full justify-center sm:w-auto sm:min-w-36 hover:scale-105 focus-visible:scale-105 transition-transform duration-150 ease-out";

export function MainMenu() {
    const gameProps = useGameProps();
    const { uiTransition: t, navigate } = gameProps;
    const setSettings = useSetSearchParamState<boolean>("settings");
    const setSaves = useSetSearchParamState<boolean>("saves");
    const { startNewGame } = useNarrationFunctions();
    const loading = useSelector(GameStatus.store, (state) => state.loading);
    const menuRef = useRef<HTMLDivElement>(null);

    /** Returns all enabled menuitem buttons inside the menu container. */
    function getMenuItems(): HTMLButtonElement[] {
        if (!menuRef.current) return [];
        return Array.from(
            menuRef.current.querySelectorAll<HTMLButtonElement>(
                "button[role='menuitem']:not(:disabled)",
            ),
        );
    }

    /** Arrow-key navigation between menu items. */
    function focusMenuItem(direction: "up" | "down" | "home" | "end") {
        const items = getMenuItems();
        if (!items.length) return;

        const active = document.activeElement as HTMLElement;
        const currentIndex = items.indexOf(active as HTMLButtonElement);

        let next = -1;
        if (direction === "down") {
            next = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        } else if (direction === "up") {
            next = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        } else if (direction === "home") {
            next = 0;
        } else if (direction === "end") {
            next = items.length - 1;
        }
        if (next !== -1) {
            items[next].focus();
        }
    }

    useHotkeys([
        {
            hotkey: "ArrowDown",
            callback: () => focusMenuItem("down"),
            options: {
                preventDefault: true,
                meta: {
                    name: t("menu_navigation"),
                    description: t("menu_navigation_down_description"),
                },
            },
        },
        {
            hotkey: "ArrowUp",
            callback: () => focusMenuItem("up"),
            options: {
                preventDefault: true,
                meta: {
                    name: t("menu_navigation"),
                    description: t("menu_navigation_up_description"),
                },
            },
        },
        {
            hotkey: "Home",
            callback: () => focusMenuItem("home"),
            options: {
                preventDefault: true,
                meta: {
                    name: t("menu_navigation"),
                    description: t("menu_navigation_home_description"),
                },
            },
        },
        {
            hotkey: "End",
            callback: () => focusMenuItem("end"),
            options: {
                preventDefault: true,
                meta: {
                    name: t("menu_navigation"),
                    description: t("menu_navigation_end_description"),
                },
            },
        },
    ]);

    useEffect(() => {
        // Auto-focus the first enabled button so arrow-key navigation works immediately.
        // preventScroll avoids the browser scrolling the menu's own overflow container
        // (buttons sit near its bottom) to reveal the newly-focused button on mount.
        const firstItem = menuRef.current?.querySelector<HTMLButtonElement>(
            "button[role='menuitem']:not(:disabled)",
        );
        firstItem?.focus();
    }, []);

    return (
        <div className="relative isolate flex h-full w-full flex-1 flex-col items-center">
            <MainMenuBackground />
            {/* Settings – icon button in the top-right corner, intentionally left out of arrow-key menu navigation */}
            <div className="absolute top-3 right-3 z-20 sm:top-4 sm:right-4 md:top-6 md:right-6">
                <Tooltip>
                    <TooltipTrigger
                        render={
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label={t("settings")}
                                onClick={() => setSettings(true)}
                                disabled={loading}
                            >
                                <Settings className="size-4" />
                            </Button>
                        }
                    />
                    <TooltipContent>{t("settings")}</TooltipContent>
                </Tooltip>
            </div>

            {/* Cover – title sits a little below the top edge, description right under it */}
            <div className="flex flex-col items-center gap-3 pt-20 text-center sm:pt-28">
                <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
                    {packageJson.name}
                </h1>
                <p className="max-w-md text-sm text-muted-foreground sm:text-base">
                    {packageJson.description}
                </p>
            </div>

            <div className="flex-1" />

            {/* Continue / Start / Load – centered at the bottom, no card around them */}
            <div
                ref={menuRef}
                role="menu"
                className="flex w-full flex-col items-center gap-2 pb-4 sm:w-auto sm:flex-row sm:gap-3"
            >
                <ContinueMenuButton disabled={loading} onLoadingChange={GameStatus.setLoading} />

                <Button
                    role="menuitem"
                    size="lg"
                    onClick={async () => {
                        GameStatus.setLoading(true);
                        await navigate({ to: "/game/narration" });
                        startNewGame("start");
                    }}
                    disabled={loading}
                    className={menuButtonClass}
                >
                    <Play className="size-4" />
                    {t("start")}
                </Button>

                <Button
                    role="menuitem"
                    size="lg"
                    onClick={() => setSaves(true)}
                    disabled={loading}
                    variant="outline"
                    className={menuButtonClass}
                >
                    <Save className="size-4" />
                    {t("load")}
                </Button>
            </div>

            {loading ? (
                <div
                    className="flex items-center justify-center pb-10 text-muted-foreground sm:pb-14"
                    aria-live="polite"
                >
                    <Spinner />
                    <span className="sr-only">Loading</span>
                </div>
            ) : (
                <div className="pb-10 sm:pb-14" />
            )}

            {/* Game name + version – bottom right, theme-colored */}
            <div className="pointer-events-none absolute right-3 bottom-2 z-0 text-right text-muted-foreground sm:right-4 sm:bottom-3">
                <p className="text-[0.65rem]">v{packageJson.version}</p>
            </div>
        </div>
    );
}

export function ContinueMenuButton({
    disabled = false,
    onLoadingChange,
}: {
    /** Disables the button when another action is in progress. */
    disabled?: boolean;
    /** Called when the continue action starts or finishes loading. */
    onLoadingChange?: (loading: boolean) => void;
}) {
    const { data: lastSave = null, isLoading } = useQueryLastSave();
    const { t } = useTranslation(["ui"]);
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);
    const hasAutoExitSave = lastSave?.id === -1;

    const handleClick = useCallback(() => {
        if (!lastSave) return;
        setLoading(true);
        onLoadingChange?.(true);
        (hasAutoExitSave ? loadAutoExitSave() : loadSave(lastSave))
            .then(() => queryClient.invalidateQueries())
            .catch((e) => {
                toast.error(t("fail_load"));
                console.error(e);
            })
            .finally(() => {
                setLoading(false);
                onLoadingChange?.(false);
            });
    }, [lastSave, hasAutoExitSave, queryClient, t, onLoadingChange]);

    const isDisabled = (!isLoading && !lastSave) || loading || disabled;

    const buttonContent = (
        <>
            {isLoading || loading ? (
                <Spinner className="size-4" />
            ) : (
                <CirclePlay className="size-4" />
            )}
            {t("continue")}
            {hasAutoExitSave ? (
                <AlertCircle aria-hidden="true" className="ml-1 size-4 text-orange-500" />
            ) : null}
        </>
    );

    if (hasAutoExitSave) {
        return (
            <Tooltip>
                <TooltipTrigger
                    render={
                        <Button
                            role="menuitem"
                            size="lg"
                            onClick={handleClick}
                            disabled={isDisabled}
                            className={menuButtonClass}
                        >
                            {buttonContent}
                        </Button>
                    }
                />
                <TooltipContent>{t("continue_auto_exit_save_tooltip")}</TooltipContent>
            </Tooltip>
        );
    }

    return (
        <Button
            role="menuitem"
            size="lg"
            onClick={handleClick}
            disabled={isDisabled}
            className={menuButtonClass}
        >
            {buttonContent}
        </Button>
    );
}
