import { Button } from "@/components/ui/button";
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
} from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import { readChapterFromSave } from "@/lib/utils/chapter-utility";
import { useSaveActions } from "@/lib/hooks/save-hooks";
import { useQuerySaves } from "@/lib/query/save-query";
import {
    downloadGameSave,
    getExcerpt,
    getLastDialogueRawText,
    getSaveSlotLabel,
    isQuickSaveId,
} from "@/lib/utils/save-utility";
import type { FileRouteTypes } from "@/routeTree.gen";
import { useLocation } from "@tanstack/react-router";
import { Bookmark, Download, Save, SquarePen, Trash2, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

export function SaveSlot({
    saveId,
    isQuickSave = false,
}: {
    saveId: number;
    isQuickSave?: boolean;
}) {
    const { t } = useTranslation(["ui"]);
    const { t: tNarration } = useTranslation(["narration"]);
    const { isLoading, data: saveData, isError } = useQuerySaves({ id: saveId });
    const location = useLocation();
    const { handleLoad, handleDelete, handleSave, handleOverwriteSave } = useSaveActions();

    const isHome = (location.pathname as FileRouteTypes["fullPaths"]) === "/";
    const icon = isQuickSave ? <Zap className="size-4" /> : <Bookmark className="size-4" />;

    if (isLoading) {
        return (
            <Item size="sm">
                <Skeleton className="h-9 w-full" />
            </Item>
        );
    }

    if (!saveData || isError) {
        return (
            <Item
                variant="outline"
                size="sm"
                render={<button type="button" disabled={isHome} />}
                onClick={() => handleSave(saveId)}
            >
                <ItemMedia variant="icon" className="text-muted-foreground">
                    {icon}
                </ItemMedia>
                <ItemContent>
                    <ItemTitle className="text-muted-foreground">
                        {isQuickSaveId(saveId) ? t("quick_save") : t("empty_save_slot")}
                    </ItemTitle>
                </ItemContent>
                <ItemActions>
                    <Save className="size-4 text-muted-foreground" />
                </ItemActions>
            </Item>
        );
    }

    const rawDialogue = getLastDialogueRawText(saveData.saveData);
    const dialogueText = Array.isArray(rawDialogue)
        ? rawDialogue.map((line) => tNarration(line)).join(" ")
        : rawDialogue
          ? tNarration(rawDialogue)
          : undefined;
    const chapterName = readChapterFromSave(saveData.saveData).name;
    const title =
        saveData.name || (chapterName && tNarration(chapterName)) || getSaveSlotLabel(saveId, t);

    return (
        <Item
            variant="outline"
            size="sm"
            render={<button type="button" />}
            onClick={() => handleLoad({ ...saveData, id: saveId })}
        >
            <ItemMedia variant="icon">{icon}</ItemMedia>
            <ItemContent>
                <ItemTitle className="w-full justify-between">
                    <span className="truncate">{title}</span>
                    <span className="shrink-0 text-xs font-normal text-muted-foreground">
                        {saveData.date.toLocaleDateString()} {saveData.date.toLocaleTimeString()}
                    </span>
                </ItemTitle>
                {dialogueText && <ItemDescription>{getExcerpt(dialogueText)}</ItemDescription>}
            </ItemContent>
            <ItemActions>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        downloadGameSave(saveData);
                    }}
                    aria-label={t("save_to_file")}
                >
                    <Download />
                </Button>
                {!isHome && (
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleOverwriteSave(saveId, saveData.name);
                        }}
                        aria-label={t("save")}
                    >
                        <SquarePen />
                    </Button>
                )}
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(saveId);
                    }}
                    aria-label={t("delete")}
                >
                    <Trash2 />
                </Button>
            </ItemActions>
        </Item>
    );
}
