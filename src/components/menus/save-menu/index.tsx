import { SaveSlot } from "@/components/menus/save-menu/save-slots";
import { ItemGroup, ItemSeparator } from "@/components/ui/item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getManualSaveIds, QUICK_SAVE_ID } from "@/lib/utils/save-utility";

const MANUAL_SAVE_IDS = getManualSaveIds();

/** The save/load menu: a single quick-save slot followed by the fixed manual save slots - meant to be browsed like a short list of bookmarks, not a paginated library. */
export function GameSaveMenu() {
    return (
        <ScrollArea className="max-h-[60vh] min-h-0">
            <ItemGroup className="gap-2 p-1">
                <SaveSlot saveId={QUICK_SAVE_ID} isQuickSave />
                <ItemSeparator className="my-0" />
                {MANUAL_SAVE_IDS.map((id) => (
                    <SaveSlot key={`SaveFile${id}`} saveId={id} />
                ))}
            </ItemGroup>
        </ScrollArea>
    );
}
