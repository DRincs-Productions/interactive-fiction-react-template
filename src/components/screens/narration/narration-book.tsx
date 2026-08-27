import { DelayedAnimatedDots, NextStepLoadingDots } from "@/components/loading";
import { markdownComponents } from "@/components/markdown-components";
import { ChoiceMenu } from "@/components/menus/choice-menus";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNarrationPointerHandlers } from "@/lib/hooks/narration-hooks";
import { useQueryNarrationParagraphs } from "@/lib/query/narration-query";
import { TextDisplaySettings } from "@/lib/stores/text-display-settings-store";
import { useSelector } from "@tanstack/react-store";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
    type RefObject,
    memo,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import Markdown from "react-markdown";
import { MarkdownTypewriterHooks } from "react-markdown-typewriter";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

/** Rough initial guess for an unmeasured paragraph's height; the virtualizer corrects
 * this against the real rendered height as soon as each item mounts. */
const ESTIMATED_PARAGRAPH_HEIGHT_PX = 88;

/**
 * The narration is read like a book: every paragraph already read sits statically
 * on the page, only the newest one is typed out. Past paragraphs are virtualized - for
 * a long scene, mounting hundreds of them as real DOM nodes forever would keep growing
 * both render and layout cost even with PastParagraph memoized.
 */
export function NarrationBook() {
    const { data: paragraphs = [] } = useQueryNarrationParagraphs();
    const nonEmptyParagraphs = useMemo(
        () => paragraphs.filter((paragraph) => paragraph.text),
        [paragraphs],
    );
    const bookRef = useRef<HTMLDivElement>(null);
    const [viewportEl, setViewportEl] = useState<HTMLElement | null>(null);
    const { handlePointerDown, handlePointerCancel, handlePointerUp } =
        useNarrationPointerHandlers();

    useLayoutEffect(() => {
        setViewportEl(
            bookRef.current?.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]') ??
                null,
        );
    }, []);

    const pastParagraphs = nonEmptyParagraphs.slice(0, -1);
    const lastParagraph = nonEmptyParagraphs[nonEmptyParagraphs.length - 1];

    const virtualizer = useVirtualizer({
        count: pastParagraphs.length,
        getScrollElement: () => viewportEl,
        estimateSize: () => ESTIMATED_PARAGRAPH_HEIGHT_PX,
        overscan: 6,
        getItemKey: (index) => pastParagraphs[index]?.key ?? index,
    });

    if (nonEmptyParagraphs.length === 0) {
        return null;
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <ScrollArea
                ref={bookRef}
                className="h-full"
                onPointerDown={handlePointerDown}
                onPointerCancel={handlePointerCancel}
                onPointerUp={handlePointerUp}
            >
                <div className="prose dark:prose-invert max-w-full px-1.5 py-4 sm:px-3">
                    {viewportEl && pastParagraphs.length > 0 && (
                        <div
                            style={{
                                position: "relative",
                                width: "100%",
                                height: virtualizer.getTotalSize(),
                            }}
                        >
                            {virtualizer.getVirtualItems().map((virtualItem) => (
                                <div
                                    key={virtualItem.key}
                                    data-index={virtualItem.index}
                                    ref={virtualizer.measureElement}
                                    className="absolute top-0 left-0 w-full pb-4"
                                    style={{ transform: `translateY(${virtualItem.start}px)` }}
                                >
                                    <PastParagraph text={pastParagraphs[virtualItem.index].text} />
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="pb-4">
                        <LastParagraph text={lastParagraph.text} containerRef={bookRef} />
                    </div>
                    <ChoiceMenu />
                </div>
            </ScrollArea>
        </div>
    );
}

/**
 * Every already-read paragraph is rendered once and never changes again, but without this
 * memo react-markdown rebuilds its whole unified() pipeline and re-parses every one of them
 * from scratch on every NarrationBook re-render (i.e. on every subsequent step) - O(n) work
 * per step that keeps growing the longer a page/scene runs.
 */
const PastParagraph = memo(function PastParagraph({ text }: { text: string }) {
    return (
        <Markdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={markdownComponents}
        >
            {text}
        </Markdown>
    );
});

/**
 * Tracks how much of `text` has already been fully typed out, so that only the
 * newly appended tail is animated when the paragraph grows (or, on skip, none of it).
 * Going back or forward to a *different* paragraph always re-types it from scratch,
 * even if it was already read before - the player wants to see the animation again.
 */
function useAnimatedText(text: string) {
    const shownRef = useRef("");
    const forceComplete = useSelector(TextDisplaySettings.store, (state) => state.forceComplete);

    let staticText: string;
    let animatedText: string;
    if (forceComplete) {
        staticText = text;
        animatedText = "";
    } else if (text.startsWith(shownRef.current)) {
        staticText = shownRef.current;
        animatedText = text.slice(shownRef.current.length);
    } else {
        staticText = "";
        animatedText = text;
    }

    const finalize = useCallback(() => {
        shownRef.current = text;
    }, [text]);

    useEffect(() => {
        if (forceComplete) finalize();
    }, [forceComplete, finalize]);

    return { staticText, animatedText, finalize };
}

const LastParagraph = memo(function LastParagraph({
    text,
    containerRef,
}: {
    text: string;
    containerRef: RefObject<HTMLDivElement | null>;
}) {
    const typewriterDelay = useSelector(TextDisplaySettings.store, (state) => state.delay);
    const { staticText, animatedText, finalize } = useAnimatedText(text);

    const handleCharacterAnimationComplete = useCallback(
        (ref: { current: HTMLSpanElement | null }) => {
            const container = containerRef.current?.querySelector<HTMLElement>(
                '[data-slot="scroll-area-viewport"]',
            );
            const char = ref.current;
            if (container && char) {
                const containerRect = container.getBoundingClientRect();
                const charRect = char.getBoundingClientRect();
                const charOffsetInContainer =
                    charRect.top - containerRect.top + container.scrollTop;
                const scrollTop = charOffsetInContainer - container.clientHeight / 2;
                container.scrollTo({
                    top: scrollTop,
                    behavior: "smooth",
                });
            }
        },
        [containerRef],
    );

    const lastParagraphComponents = useMemo(
        () => ({ ...markdownComponents, p: (props: object) => <span {...props} /> }),
        [],
    );

    const motionProps = useMemo(
        () => ({
            onAnimationStart: TextDisplaySettings.start,
            onAnimationComplete: (definition: "visible" | "hidden") => {
                if (definition === "visible") {
                    finalize();
                    TextDisplaySettings.end();
                }
            },
            onCharacterAnimationComplete: handleCharacterAnimationComplete,
        }),
        [finalize, handleCharacterAnimationComplete],
    );

    const specialCharacters = useMemo(
        () => ({
            ".": { delayAfter: typewriterDelay + 300 },
            "!": { delayAfter: typewriterDelay + 300 },
            "?": { delayAfter: typewriterDelay + 300 },
            ",": { delayAfter: typewriterDelay + 75 },
            ":": { delay: typewriterDelay + 50, delayAfter: typewriterDelay + 150 },
        }),
        [typewriterDelay],
    );

    return (
        <p className="prose dark:prose-invert m-0 max-w-full p-0">
            {staticText && (
                <span>
                    <Markdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={lastParagraphComponents}
                    >
                        {staticText}
                    </Markdown>
                </span>
            )}
            <span>
                <MarkdownTypewriterHooks
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={markdownComponents}
                    delay={typewriterDelay}
                    motionProps={motionProps}
                    fallback={<DelayedAnimatedDots />}
                    specialCharacters={specialCharacters}
                >
                    {animatedText}
                </MarkdownTypewriterHooks>
            </span>
            <NextStepLoadingDots />
        </p>
    );
});
