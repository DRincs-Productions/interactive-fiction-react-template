import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGameProps } from "@/lib/hooks/props-hooks";
import { useQueryInputValue } from "@/lib/query/narration-query";
import { TextDisplaySettings } from "@/lib/stores/text-display-settings-store";
import { narration } from "@drincs/pixi-vn";
import { useDebouncedValue } from "@tanstack/react-pacer";
import { useSelector } from "@tanstack/react-store";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * Inline input row for narration steps that ask the player for a value - sits
 * below the book text instead of interrupting it with a modal.
 */
export function NarrationInput() {
    const {
        data: { isRequired, type, currentValue } = { currentValue: undefined, isRequired: false },
    } = useQueryInputValue<string | number>();
    const isTyping = useSelector(TextDisplaySettings.store, (state) => state.inProgress);
    const [visible] = useDebouncedValue(!isTyping && isRequired, { wait: 50 });
    const [tempValue, setTempValue] = useState<string | number>();
    const gameProps = useGameProps();
    const { t } = useTranslation(["ui"]);

    useEffect(() => {
        setTempValue(currentValue);
    }, [currentValue]);

    const canConfirm = tempValue !== undefined && tempValue !== "";

    const submitInputValue = useCallback(() => {
        if (!canConfirm) {
            return;
        }
        narration.inputValue = tempValue || currentValue;
        setTempValue(undefined);
        gameProps.invalidateInterfaceData();
    }, [canConfirm, currentValue, gameProps, tempValue]);

    if (!visible) {
        return null;
    }

    return (
        <div className="mx-0 pb-2 sm:mx-10 md:mx-20 lg:mx-20">
            <div className="flex items-center gap-1.5 rounded-lg border p-[3px]">
                <Input
                    autoFocus
                    className="border-0 shadow-none focus-visible:ring-0"
                    value={tempValue ?? ""}
                    type={type}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && canConfirm) {
                            submitInputValue();
                        }
                    }}
                    onChange={(e) => {
                        switch (e.target.type) {
                            case "number":
                                setTempValue(e.target.valueAsNumber);
                                break;
                            default:
                                setTempValue(e.target.value);
                        }
                    }}
                />
                <Button size="sm" disabled={!canConfirm} onClick={submitInputValue}>
                    {t("confirm")}
                </Button>
            </div>
        </div>
    );
}
