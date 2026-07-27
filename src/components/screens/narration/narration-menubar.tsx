import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarTrigger,
} from "@/components/ui/menubar";
import { useNarrationFunctions } from "@/lib/hooks/narration-hooks";
import { useSetSearchParamState } from "@/lib/hooks/navigation-hooks";
import { useQueryCanGoBack } from "@/lib/query/narration-query";
import { GameStatus } from "@/lib/stores/game-status-store";
import { useSelector } from "@tanstack/react-store";
import { useTranslation } from "react-i18next";

/**
 * Top bar for the narration screen. Content is a starting scaffold - it will
 * be filled in further as the reading experience is fleshed out.
 */
export function NarrationMenubar() {
    const { t } = useTranslation(["ui"]);
    const { data: canGoBack = false } = useQueryCanGoBack();
    const loading = useSelector(GameStatus.store, (state) => state.loading);
    const { goBack } = useNarrationFunctions();
    const setHistory = useSetSearchParamState<boolean>("history");
    const setSaves = useSetSearchParamState<boolean>("saves");
    const setSettings = useSetSearchParamState<boolean>("settings");

    return (
        <div className="mx-0 pt-2 sm:mx-10 sm:pt-3 md:mx-20 lg:mx-20">
            <Menubar>
                <MenubarMenu>
                    <MenubarTrigger>Menu</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem disabled={!canGoBack || loading} onClick={() => goBack()}>
                            {t("back")}
                        </MenubarItem>
                        <MenubarItem onClick={() => setHistory(true)}>{t("history")}</MenubarItem>
                        <MenubarSeparator />
                        <MenubarItem onClick={() => setSaves(true)}>
                            {t("save")}/{t("load")}
                        </MenubarItem>
                        <MenubarItem onClick={() => setSettings(true)}>{t("settings")}</MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
            </Menubar>
        </div>
    );
}
