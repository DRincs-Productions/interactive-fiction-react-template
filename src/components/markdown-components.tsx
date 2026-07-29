import { Image } from "@/components/ui/image";
import { useNarrationFunctions } from "@/lib/hooks/narration-hooks";
import { RegisteredLabels, type LabelIdType } from "@drincs/pixi-vn";
import { motion } from "motion/react";
import type React from "react";
import { useCallback } from "react";
import type { Components } from "react-markdown";

/**
 * Same shape as react-markdown-typewriter's own per-character variants. Neither
 * MarkdownImage nor MarkdownLink's characters set their own `initial`/`animate`, so
 * inside `MarkdownTypewriterHooks` they inherit the ancestor's "hidden"/"visible" state
 * (and its stagger) through motion's variant propagation and pop in on the same beat as
 * the surrounding typed text; outside a typewriter ancestor (past paragraphs, already-
 * typed text) there's no context driving them, so they just render visible immediately.
 */
const typewriterVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { opacity: { duration: 0 } } },
};

/**
 * Renders a markdown image, e.g. `![The keep](background_main_menu)`.
 * `Image` (see components/ui/image.tsx) already resolves a pixi-vn asset alias to its real
 * url via `useImageSrc`/`getPixiJSAsset` - a plain url is passed through unchanged - so this
 * is a thin adapter from react-markdown's `img` props to that existing component.
 */
export const MarkdownImage: Components["img"] = ({ src, alt }) => {
    if (!src) {
        return null;
    }
    return (
        <motion.span variants={typewriterVariants} className="block">
            <Image src={src} alt={alt ?? ""} layout="fullWidth" className="rounded-md" />
        </motion.span>
    );
};

/** Splits markdown-link children into per-character spans so link text types out like
 * the rest of the narration instead of popping in all at once (see `typewriterVariants`). */
function splitForTypewriter(node: React.ReactNode, keyPrefix: string): React.ReactNode {
    if (typeof node === "string") {
        return Array.from(node).map((char, index) => (
            <motion.span key={`${keyPrefix}-${index}`} variants={typewriterVariants}>
                {char}
            </motion.span>
        ));
    }
    if (Array.isArray(node)) {
        return node.map((child, index) => splitForTypewriter(child, `${keyPrefix}-${index}`));
    }
    return node;
}

/**
 * Renders a markdown link, e.g. `[Read the notice](notice_board)`.
 * If the link's target is the id of a registered label, clicking it jumps there
 * (see `useNarrationFunctions.jumpToLabel`) instead of navigating as a normal link -
 * and automatically clears any lock set by `requireLinkClickToContinue`. Any other
 * href is rendered as a regular external link.
 */
export const MarkdownLink: Components["a"] = ({ href, children }) => {
    const { jumpToLabel } = useNarrationFunctions();
    const isLabelLink = typeof href === "string" && RegisteredLabels.has(href);
    const animatedChildren = splitForTypewriter(children, "link-char");

    // Links live inside narration text that also listens for taps/clicks to advance the
    // story (see useNarrationPointerHandlers) - without stopping propagation here, following
    // the link would also trigger goNext on the ancestor ScrollArea/NarrationClickOverlay.
    const stopPropagation = useCallback((e: React.SyntheticEvent) => e.stopPropagation(), []);

    const handleClick = useCallback(
        (e: React.MouseEvent<HTMLAnchorElement>) => {
            e.preventDefault();
            e.stopPropagation();
            if (isLabelLink) {
                void jumpToLabel(href as LabelIdType);
            }
        },
        [href, isLabelLink, jumpToLabel],
    );

    if (!isLabelLink) {
        return (
            <a href={href} target="_blank" rel="noreferrer">
                {animatedChildren}
            </a>
        );
    }

    return (
        <a
            href={href}
            className="cursor-pointer underline"
            onClick={handleClick}
            onPointerDown={stopPropagation}
            onPointerUp={stopPropagation}
        >
            {animatedChildren}
        </a>
    );
};

export const markdownComponents: Components = {
    img: MarkdownImage,
    a: MarkdownLink,
};
