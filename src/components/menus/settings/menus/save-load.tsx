import { GameSaveMenu } from "@/components/menus/save-menu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSearchParamState, useSetSearchParamState } from "@/lib/hooks/navigation-hooks";
import { useGameProps } from "@/lib/hooks/props-hooks";
import { save } from "@/lib/utils/save-utility";
import type { FileRouteTypes } from "@/routeTree.gen";
import { useLocation } from "@tanstack/react-router";
import { Download, FolderOpen, Zap } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function SaveLoadSettingsPage() {
    const { t } = useTranslation(["ui"]);
    const gameProps = useGameProps();
    const location = useLocation();
    const [showQuickSaves, setShowQuickSaves] = useState(false);

    const toolbar = (
        <TooltipProvider>
            <div className="flex items-center gap-1">
                <Tooltip>
                    <TooltipTrigger render={<span />}>
                        <Button
                            variant={showQuickSaves ? "secondary" : "ghost"}
                            size="icon-sm"
                            onClick={() => setShowQuickSaves((v) => !v)}
                            aria-pressed={showQuickSaves}
                            aria-label={t("quick_saves")}
                        >
                            <Zap />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t("quick_saves")}</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger render={<span />}>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() =>
                                save.loadFromFile((err) => {
                                    if (err) {
                                        toast.error(t("allert_error_occurred"));
                                        return;
                                    }
                                    gameProps.invalidateInterfaceData();
                                    toast.success(t("success_load"));
                                })
                            }
                            aria-label={t("load_from_file")}
                        >
                            <FolderOpen />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t("load_from_file")}</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger render={<span />}>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => save.download()}
                            disabled={(location.pathname as FileRouteTypes["fullPaths"]) === "/"}
                            aria-label={t("save_to_file")}
                        >
                            <Download />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t("save_to_file")}</TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    );

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-2">
            <div className="flex justify-end">{toolbar}</div>
            <GameSaveMenu quickSaves={showQuickSaves} />
        </div>
    );
}

export function SaveLoadDialog() {
    const open = useSearchParamState<boolean>("saves");
    const setOpen = useSetSearchParamState<boolean>("saves");
    const { t } = useTranslation(["ui"]);

    return (
        <Dialog open={open ?? false} onOpenChange={(isOpen) => setOpen(isOpen || undefined)}>
            <DialogContent className="flex max-h-[85vh] w-full flex-col gap-3 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{`${t("save")}/${t("load")}`}</DialogTitle>
                </DialogHeader>
                {/* Only mount while actually open - avoids querying the save list in the
                background for a dialog nobody is looking at. */}
                {open && <SaveLoadSettingsPage />}
            </DialogContent>
        </Dialog>
    );
}
