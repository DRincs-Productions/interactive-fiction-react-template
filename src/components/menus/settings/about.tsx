import packageJson from "@/../package.json";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InfoIcon } from "lucide-react";
import { useState } from "react";
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
 * Small corner button that opens the About info in its own dialog, instead of
 * taking up a whole section of the main settings screen.
 */
export function AboutButton() {
    const [open, setOpen] = useState(false);
    const { t } = useTranslation(["ui"]);

    return (
        <>
            <Button
                variant="ghost"
                size="icon-sm"
                className="absolute right-3 bottom-3"
                aria-label={t("about")}
                onClick={() => setOpen(true)}
            >
                <InfoIcon />
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("about")}</DialogTitle>
                    </DialogHeader>
                    <About />
                </DialogContent>
            </Dialog>
        </>
    );
}
