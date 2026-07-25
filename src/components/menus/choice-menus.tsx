import { Button } from "@/components/ui/button";
import { useChoiceMenuHotkeys } from "@/lib/hooks/hotkeys-hooks";
import { useNarrationFunctions } from "@/lib/hooks/narration-hooks";
import { useQueryChoiceMenuOptions } from "@/lib/query/narration-query";
import { GameStatus } from "@/lib/stores/game-status-store";
import { TextDisplaySettings } from "@/lib/stores/text-display-settings-store";
import { useDebouncedValue } from "@tanstack/react-pacer";
import { useSelector } from "@tanstack/react-store";
import { CornerDownLeft } from "lucide-react";

const choiceButtonClass =
    "w-full justify-center sm:w-auto sm:min-w-56 hover:scale-105 focus-visible:scale-105 transition-transform duration-150 ease-out";

export function ChoiceMenu() {
    const loading = useSelector(GameStatus.store, (state) => state.loading);
    const { data: menu = [] } = useQueryChoiceMenuOptions();
    const isTyping = useSelector(TextDisplaySettings.store, (state) => state.inProgress);
    const { selectChoice } = useNarrationFunctions();
    const [debouncedMenu] = useDebouncedValue(isTyping ? [] : menu, { wait: 50 });
    const { menuRef } = useChoiceMenuHotkeys(debouncedMenu.length);

    return (
        <div ref={menuRef} className="flex w-full flex-col items-center gap-2 py-4" role="menu">
            {debouncedMenu.map((item, index) => (
                <div
                    key={`choice-${item.choiceIndex}`}
                    className={
                        "w-full animate-in fade-in-0 slide-in-from-bottom-[10%] fill-mode-backwards sm:w-auto"
                    }
                    style={{ animationDelay: `${index * 150}ms` }}
                >
                    <Button
                        role="menuitem"
                        disabled={loading}
                        onClick={() => selectChoice(item)}
                        size="lg"
                        variant="secondary"
                        className={choiceButtonClass}
                    >
                        {item.type === "close" && <CornerDownLeft />}
                        {item.text}
                    </Button>
                </div>
            ))}
        </div>
    );
}
