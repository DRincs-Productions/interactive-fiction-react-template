import { PendingComponent } from "@/components/loading";
import { SettingsDialogue } from "@/components/menus/settings";
import { OfflineAllert } from "@/components/modals/error-allerts";
import { RootProvider } from "@/components/providers/root-provider";
import { INTERFACE_DATA_USE_QUERY_KEY } from "@/constants";
import { useConfirmBackNavigation } from "@/lib/hooks/navigation-hooks";
import { useAutoSaveOnPageClose } from "@/lib/hooks/save-hooks";
import { useI18n } from "@/lib/i18n";
import { SearchParams } from "@/lib/stores/search-param-store";
import { defineAssets } from "@/lib/utils/assets-utility";
import { initializeIndexedDB } from "@/lib/utils/db-utility";
import { loadRefreshSave } from "@/lib/utils/save-utility";
import type { RouterContext } from "@/router";
import { narration } from "@drincs/pixi-vn";
import { setupPixivnViteData } from "@drincs/pixi-vn/vite-listener";
import { createRootRouteWithContext, ErrorComponent, Outlet } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const DevDevtools = import.meta.env.DEV ? lazy(() => import("@/components/dev-devtools")) : null;

export const Route = createRootRouteWithContext<RouterContext>()({
    validateSearch: (search) => SearchParams.setMany(search),
    component: RootComponent,
    pendingComponent: PendingComponent,
    loader: async ({ context, location }) => {
        // Game.onNavigate(async (to) => redirect({ to }));
        await Promise.all([import("@/content"), initializeIndexedDB(), defineAssets(), useI18n()]);
        await setupPixivnViteData();
        if (location.pathname !== "/" && narration.stepCounter === 0) {
            const isRefreshSaveExist = await loadRefreshSave();
            if (isRefreshSaveExist) {
                await context.queryClient.invalidateQueries({
                    queryKey: [INTERFACE_DATA_USE_QUERY_KEY],
                });
            }
        }
    },
    errorComponent: (props) => (
        <div className="bg-background pointer-events-auto hover:text-foreground">
            <ErrorComponent {...props} />
        </div>
    ),
});

function RootComponent() {
    useAutoSaveOnPageClose();
    useConfirmBackNavigation();

    return (
        <>
            <RootProvider>
                <SettingsDialogue />
                <OfflineAllert />
                {/* Book page – full width only on mobile, narrows to a centered wiki-style column with visible side borders from sm up. Every route renders inside it, so this is the one place the reading width needs to change. The outer div is left transparent so the dark backdrop set on html/body shows through in the side gutters; only the page itself uses the theme background. */}
                <div className="flex h-full w-full flex-col items-center">
                    <div className="relative flex h-full w-full flex-1 flex-col bg-background px-6 text-foreground sm:max-w-3xl sm:border-x sm:border-border sm:px-10">
                        <Outlet />
                    </div>
                </div>
            </RootProvider>

            {DevDevtools && (
                <Suspense>
                    <DevDevtools />
                </Suspense>
            )}
        </>
    );
}
