import { Image } from "@/components/ui/image";
import { useNarrationFunctions } from "@/lib/hooks/narration-hooks";
import { RegisteredLabels, type LabelIdType } from "@drincs/pixi-vn";
import { motion } from "motion/react";
import { VIGNETTE_MIN_WRAP_TEXT_WIDTH_PX } from "@/constants";
import { cn } from "@/lib/utils";
import { getVignetteWidthPx, parseVignetteLayout } from "@/lib/utils/vignette-utility";
import type React from "react";
import {
    type CSSProperties,
    type RefObject,
    useCallback,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";

/**
 * MarkdownImage and MarkdownLink don't set their own `initial`/`animate` variants, so
 * inside `MarkdownTypewriter` they inherit the ancestor's "hidden"/"visible" state
 * (and its stagger) through motion's variant propagation and pop in on the same beat as
 * the surrounding typed text; outside a typewriter ancestor (past paragraphs, already-
 * typed text) there's no context driving them, so they just render visible immediately.
 */
const typewriterVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { opacity: { duration: 0 } } },
};

/** Nearest ancestor that lays out as a block (the paragraph's text column), skipping inline wrappers. */
function findBlockContainer(element: HTMLElement): HTMLElement | null {
    let el = element.parentElement;
    while (el) {
        const display = window.getComputedStyle(el).display;
        if (display !== "inline" && display !== "contents") return el;
        el = el.parentElement;
    }
    return null;
}

/** Tracks the content width (px) of the block that contains `ref`, or `undefined` until measured. */
function useContainerWidth(ref: RefObject<HTMLElement | null>, enabled: boolean) {
    const [width, setWidth] = useState<number>();
    useLayoutEffect(() => {
        if (!enabled || !ref.current) return;
        const container = findBlockContainer(ref.current);
        if (!container) return;
        const update = () => {
            const style = window.getComputedStyle(container);
            setWidth(
                container.clientWidth -
                    Number.parseFloat(style.paddingLeft) -
                    Number.parseFloat(style.paddingRight),
            );
        };
        update();
        const observer = new ResizeObserver(update);
        observer.observe(container);
        return () => observer.disconnect();
    }, [ref, enabled]);
    return width;
}

/**
 * Renders a markdown image (vignette), e.g. `![The keep](background_main_menu)`.
 * `Image` (see components/ui/image.tsx) already resolves a pixi-vn asset alias to its real
 * url via `useImageSrc`/`getPixiJSAsset` - a plain url is passed through unchanged - so this
 * adapts markdown-typewriter's `img` props to that existing component.
 *
 * The optional markdown title sets size and alignment (see `parseVignetteLayout`), e.g.
 * `![The keep](keep_hall "40% right")`. A narrower-than-full-width vignette aligned left or
 * right floats so the text wraps around it, but only while the free space beside it is at
 * least `VIGNETTE_MIN_WRAP_TEXT_WIDTH_PX`; otherwise it sits on its own row, still aligned.
 */
export const MarkdownImage = ({
    src,
    alt,
    title,
}: {
    src?: string;
    alt?: string;
    title?: string;
}) => {
    const ref = useRef<HTMLSpanElement>(null);
    const layout = useMemo(() => parseVignetteLayout(title), [title]);
    const { width, align } = layout;
    const canWrap = width !== undefined && align !== "center";
    const containerWidth = useContainerWidth(ref, canWrap);

    if (!src) {
        return null;
    }

    const wrap =
        canWrap &&
        containerWidth !== undefined &&
        containerWidth - getVignetteWidthPx(width, containerWidth) >=
            VIGNETTE_MIN_WRAP_TEXT_WIDTH_PX;

    const style: CSSProperties = width
        ? { width: `${width.value}${width.unit}`, maxWidth: "100%" }
        : {};

    return (
        <motion.span
            ref={ref}
            variants={typewriterVariants}
            style={style}
            data-vignette-align={align}
            data-vignette-wrap={wrap || undefined}
            className={cn(
                "block",
                width && !wrap && align === "center" && "mx-auto",
                width && !wrap && align === "right" && "ml-auto",
                wrap && align === "left" && "float-left mt-1 mr-4 mb-2",
                wrap && align === "right" && "float-right mt-1 mb-2 ml-4",
            )}
        >
            <Image
                src={src}
                alt={alt ?? ""}
                layout="fullWidth"
                className={cn("rounded-md", wrap && "my-0!")}
            />
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
export const MarkdownLink = ({ href, children }: { href?: string; children?: React.ReactNode }) => {
    const { jump } = useNarrationFunctions();
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
                void jump(href as LabelIdType);
            }
        },
        [href, isLabelLink, jump],
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

export const markdownComponents = {
    img: MarkdownImage,
    a: MarkdownLink,
};
