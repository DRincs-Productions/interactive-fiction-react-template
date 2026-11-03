export const CANVAS_UI_LAYER_NAME = "ui";
export const CANVAS_MINIGAME_LAYER_NAME = "minigame";
export const HTML_UI_LAYER_NAME = "ui";
export const HTML_CANVAS_LAYER_NAME = "canvas";

export const AUDIO_BUNDLE_NAME = "audio";
export const BGM_CHANNEL_NAME = "bgm";
export const SFX_CHANNEL_NAME = "sfx";

export const SKIP_DELAY = 100;

export const CHOICE_INPUT_REVEAL_DELAY_MS = 200;

export const INTERFACE_DATA_USE_QUERY_KEY = "INTERFACE_DATA_USE_QUERY_KEY";
export const NARRATION_DATA_USE_QUERY_KEY = "NARRATION_DATA_USE_QUERY_KEY";

/** Text-shadow that outlines text with black so it remains legible over any image or canvas background. */
export const overlayTextShadowClass = "[text-shadow:0_0_3px_black,0_0_6px_black]";

/**
 * Minimum free horizontal space (px) beside a narrower-than-100% markdown vignette for the
 * text to wrap around it. If the space left beside the image is smaller, the image is shown
 * on its own row instead, keeping the requested alignment. See `MarkdownImage`.
 */
export const VIGNETTE_MIN_WRAP_TEXT_WIDTH_PX = 160;
