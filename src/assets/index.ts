import generatedManifestJson from "@/assets/manifest.gen.json";
import { AUDIO_BUNDLE_NAME } from "@/constants";
import type { FileRouteTypes } from "@/routeTree.gen";
import type { AssetsManifest } from "@drincs/pixi-vn";

/**
 * Manifest for the assets used in the game.
 * You can read more about the manifest here: https://pixijs.com/8.x/guides/components/assets#loading-multiple-assets
 *
 * The "audio" bundle (bgm_medieval_hall, sfx_gate_creak, sfx_torch_crackle, sfx_rain_ambience)
 * comes from src/assets/audio via generatedManifestJson - see .assetpack.ts.
 */
export const manifest: AssetsManifest = {
    bundles: [
        ...generatedManifestJson.bundles,
        {
            name: AUDIO_BUNDLE_NAME,
            assets: [
                {
                    alias: "bgm_medieval_hall",
                    src: "https://pub-72ff059a2c6642fb9eab15df80fb3b45.r2.dev/interactive_fiction/audio/bgm_medieval_hall.wav",
                },
                {
                    alias: "sfx_gate_creak",
                    src: "https://pub-72ff059a2c6642fb9eab15df80fb3b45.r2.dev/interactive_fiction/audio/sfx_gate_creak.wav",
                },
                {
                    alias: "sfx_rain_ambience",
                    src: "https://pub-72ff059a2c6642fb9eab15df80fb3b45.r2.dev/interactive_fiction/audio/sfx_rain_ambience.wav",
                },
                {
                    alias: "sfx_torch_crackle",
                    src: "https://pub-72ff059a2c6642fb9eab15df80fb3b45.r2.dev/interactive_fiction/audio/sfx_torch_crackle.wav",
                },
            ],
        },
        // screens
        {
            name: "/" as FileRouteTypes["fullPaths"],
            assets: [
                {
                    alias: "background_main_menu",
                    src: "https://pub-72ff059a2c6642fb9eab15df80fb3b45.r2.dev/main-menu.png",
                },
            ],
        },
    ],
};
