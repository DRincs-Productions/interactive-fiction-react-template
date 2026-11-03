export type VignetteAlign = "left" | "right" | "center";

export type VignetteWidth = { value: number; unit: "%" | "px" };

export type VignetteLayout = {
    /** `undefined` means full width (the default). */
    width?: VignetteWidth;
    align: VignetteAlign;
};

const ALIGNS: readonly string[] = ["left", "right", "center"];
const WIDTH_REGEX = /^(?:w(?:idth)?=)?(\d+(?:\.\d+)?)(%|px)?$/i;
const ALIGN_REGEX = /^(?:a(?:lign)?=)?(left|right|center)$/i;

/**
 * Parses the layout options of a markdown vignette from the image title, e.g.
 * `![alt](src "50% right")`, `![alt](src "width=320px align=left")`.
 * Tokens are space separated and may appear in any order:
 * - width: `50%`, `320px` or `320` (px), optionally prefixed by `w=` / `width=`;
 * - alignment: `left`, `right` or `center`, optionally prefixed by `a=` / `align=`.
 * Unknown tokens are ignored. Without a width the image is full width; without an
 * alignment it is centered.
 */
export function parseVignetteLayout(title?: string | null): VignetteLayout {
    const layout: VignetteLayout = { align: "center" };
    if (!title) return layout;
    for (const token of title.trim().split(/\s+/)) {
        const alignMatch = ALIGN_REGEX.exec(token);
        if (alignMatch && ALIGNS.includes(alignMatch[1].toLowerCase())) {
            layout.align = alignMatch[1].toLowerCase() as VignetteAlign;
            continue;
        }
        const widthMatch = WIDTH_REGEX.exec(token);
        if (widthMatch) {
            const value = Number(widthMatch[1]);
            const unit = (widthMatch[2]?.toLowerCase() ?? "px") as VignetteWidth["unit"];
            if (value > 0 && !(unit === "%" && value >= 100)) {
                layout.width = { value, unit };
            }
        }
    }
    return layout;
}

/** Width in px the vignette takes inside a container of `containerWidth` px. */
export function getVignetteWidthPx(width: VignetteWidth, containerWidth: number): number {
    const px = width.unit === "%" ? (containerWidth * width.value) / 100 : width.value;
    return Math.min(px, containerWidth);
}
