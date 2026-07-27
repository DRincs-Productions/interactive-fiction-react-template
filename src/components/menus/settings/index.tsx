import { AboutButton } from "@/components/menus/settings/about";
import { DialoguesControls } from "@/components/menus/settings/dialogues-controls";
import { SoundControls } from "@/components/menus/settings/sound-controls";
import { SystemControls } from "@/components/menus/settings/system-controls";
import { useAlertDialog } from "@/components/providers/alert-dialog-provider";
import { Button } from "@/components/ui/button";
import { Dialog, FullscreenDialogContent } from "@/components/ui/fullscreen-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSearchParamState, useSetSearchParamState } from "@/lib/hooks/navigation-hooks";
import { Game } from "@drincs/pixi-vn";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { LogOutIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

function ReturnMainMenuButton() {
    const navigate = useNavigate();
    const { t } = useTranslation(["ui"]);
    const setOpenSettings = useSetSearchParamState<boolean>("settings");
    const { openAlertDialog } = useAlertDialog();

    return (
        <Button
            variant="destructive"
            onClick={() => {
                openAlertDialog({
                    head: t("attention"),
                    content: t("you_sure_to_return_main_menu"),
                    onConfirm: () => {
                        Game.clear();
                        navigate({ to: "/" });
                        setOpenSettings(false);
                        return true;
                    },
                });
            }}
        >
            <LogOutIcon />
            {t("return_main_menu")}
        </Button>
    );
}

export function Settings() {
    const { t } = useTranslation(["ui"]);
    const location = useLocation();
    const isInGame = location.pathname.startsWith("/game");

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <ScrollArea className="flex-1 min-h-0">
                <div className="flex flex-col gap-3 p-4">
                    <div>
                        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                            {t("system")}
                        </h3>
                        <SystemControls />
                    </div>

                    <div>
                        <SoundControls />
                    </div>

                    <div>
                        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                            {t("dialogues")}
                        </h3>
                        <DialoguesControls />
                    </div>

                    {isInGame && <ReturnMainMenuButton />}
                </div>
            </ScrollArea>
        </div>
    );
}

export function SettingsDialogue() {
    const open = useSearchParamState<boolean>("settings");
    const setOpen = useSetSearchParamState<boolean>("settings");
    const { t } = useTranslation(["ui"]);

    return (
        <Dialog open={open ?? false} onOpenChange={(isOpen) => setOpen(isOpen || undefined)}>
            <FullscreenDialogContent
                title={t("settings")}
                toolbar={<AboutButton />}
                centered
                centeredFrom="sm"
                className="sm:max-w-2xl"
            >
                <Settings />
            </FullscreenDialogContent>
        </Dialog>
    );
}
