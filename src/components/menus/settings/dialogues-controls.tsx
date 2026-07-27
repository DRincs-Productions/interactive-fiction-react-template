import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { AutoSettings } from "@/lib/stores/auto-settings-store";
import { TextDisplaySettings } from "@/lib/stores/text-display-settings-store";
import { useSelector } from "@tanstack/react-store";
import { useTranslation } from "react-i18next";

export function DialoguesControls() {
    const typewriterDelay = useSelector(TextDisplaySettings.store, (state) => state.delay);
    const { t } = useTranslation(["ui"]);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
                <div>
                    <p className="text-sm font-medium leading-none">{t("text_speed")}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Slider
                        min={0}
                        max={200}
                        step={10}
                        value={[typewriterDelay]}
                        onValueChange={(v) =>
                            typeof v === "number" && TextDisplaySettings.setDelay(v)
                        }
                        className="flex-1"
                    />
                    <span className="w-14 text-right text-xs tabular-nums">
                        {typewriterDelay === 0 ? t("off") : `${typewriterDelay}ms`}
                    </span>
                </div>
                <div className="flex justify-between px-1 text-xs text-muted-foreground">
                    <span>{t("off")}</span>
                    <span>200ms</span>
                </div>
            </div>

            <AutoForwardToggle />
        </div>
    );
}

export function AutoForwardToggle() {
    const { t } = useTranslation(["ui"]);
    const autoEnabled = useSelector(AutoSettings.store, (state) => state.enabled);
    const autoTime = useSelector(AutoSettings.store, (state) => state.time);

    return (
        <div className="flex flex-col gap-2 rounded-md border p-3">
            <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                    <p className="text-sm font-medium leading-none">
                        {t("auto_forward_time_restricted")}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {t("auto_forward_time_description")}
                    </p>
                </div>
                <Switch checked={autoEnabled} onCheckedChange={AutoSettings.toggleEnabled} />
            </div>

            <div className="flex items-center gap-2">
                <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={[autoTime]}
                    onValueChange={(v) => typeof v === "number" && AutoSettings.setTime(v)}
                    disabled={!autoEnabled}
                    className="flex-1"
                />
                <span className="w-8 text-right text-xs tabular-nums">{autoTime}s</span>
            </div>
            <div className="flex justify-between px-1 text-xs text-muted-foreground">
                <span>1s</span>
                <span>10s</span>
            </div>
        </div>
    );
}
