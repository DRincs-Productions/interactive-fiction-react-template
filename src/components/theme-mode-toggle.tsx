import { useTheme } from "@/components/providers/theme-provider";
import { ButtonGroup } from "@/components/ui/button-group";
import { Toggle } from "@/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

const THEME_MODES = [
    { value: "light", label: "Light Mode", Icon: SunIcon },
    { value: "system", label: "System Mode", Icon: MonitorIcon },
    { value: "dark", label: "Dark Mode", Icon: MoonIcon },
] as const;

/** Compact light / system / dark switch, shown in the narration menubar. */
export function ThemeModeToggle({ className }: { className?: string }) {
    const { setTheme, theme } = useTheme();
    const { t } = useTranslation(["ui"]);

    return (
        <ButtonGroup aria-label={t("theme_mode")} className={cn("shrink-0", className)}>
            <TooltipProvider>
                {THEME_MODES.map(({ value, label, Icon }) => (
                    <Tooltip key={value}>
                        <TooltipTrigger render={<span />}>
                            <Toggle
                                size="sm"
                                className="h-6 min-w-6 px-1.5"
                                pressed={theme === value}
                                onPressedChange={() => setTheme(value)}
                                aria-label={label}
                            >
                                <Icon />
                            </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>{label}</TooltipContent>
                    </Tooltip>
                ))}
            </TooltipProvider>
        </ButtonGroup>
    );
}
