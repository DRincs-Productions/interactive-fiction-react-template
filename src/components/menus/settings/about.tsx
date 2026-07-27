import packageJson from "@/../package.json";
import { useAlertDialog } from "@/components/providers/alert-dialog-provider";
import { Button } from "@/components/ui/button";
import { InfoIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

export function About() {
    const { t } = useTranslation(["ui"]);

    return (
        <div className="flex flex-col gap-1 text-sm">
            <div className="flex justify-between gap-2">
                <span className="font-medium text-muted-foreground">{t("name")}:</span>
                <span className="font-medium text-muted-foreground">{packageJson.name}</span>
            </div>
            <div className="flex justify-between gap-2">
                <span className="font-medium text-muted-foreground">{t("version")}:</span>
                <span className="font-medium text-muted-foreground">v{packageJson.version}</span>
            </div>
            <div className="flex justify-between gap-2">
                <span className="font-medium text-muted-foreground">{t("engine")}:</span>
                <span className="font-medium text-muted-foreground">
                    {t("powered_by")}{" "}
                    <a
                        href="https://pixi-vn.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-foreground"
                    >
                        Pixi&apos;VN
                    </a>
                </span>
            </div>
        </div>
    );
}

/**
 * Header toolbar button that opens the About info in an alert dialog, instead of
 * taking up a whole section of the main settings screen.
 */
export function AboutButton() {
    const { t } = useTranslation(["ui"]);
    const { openAlertDialog } = useAlertDialog();

    return (
        <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("about")}
            onClick={() => openAlertDialog({ head: t("about"), content: <About /> })}
        >
            <InfoIcon />
        </Button>
    );
}
