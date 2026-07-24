import { DelayedAnimatedDots } from "@/components/loading";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNarrationPointerHandlers } from "@/lib/hooks/narration-hooks";
import { useQueryNarrationParagraphs } from "@/lib/query/narration-query";
import { TextDisplaySettings } from "@/lib/stores/text-display-settings-store";
import { useSelector } from "@tanstack/react-store";
import { type RefObject, memo, useCallback, useEffect, useMemo, useRef } from "react";
import Markdown from "react-markdown";
import { MarkdownTypewriterHooks } from "react-markdown-typewriter";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

/**
 * The narration is read like a book: every paragraph already read sits statically
 * on the page, only the newest one is typed out.
 */
export function NarrationBook() {
    const { data: paragraphs = [] } = useQueryNarrationParagraphs();
    const nonEmptyParagraphs = useMemo(() => paragraphs.filter(Boolean), [paragraphs]);
    const bookRef = useRef<HTMLDivElement>(null);
    const { handlePointerDown, handlePointerCancel, handlePointerUp } =
        useNarrationPointerHandlers();

    if (nonEmptyParagraphs.length === 0) {
        return null;
    }

    const pastParagraphs = nonEmptyParagraphs.slice(0, -1);
    const lastParagraph = nonEmptyParagraphs[nonEmptyParagraphs.length - 1];

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <ScrollArea
                ref={bookRef}
                className="h-full"
                onPointerDown={handlePointerDown}
                onPointerCancel={handlePointerCancel}
                onPointerUp={handlePointerUp}
            >
                <div className="prose dark:prose-invert max-w-full space-y-4 px-1.5 py-4 sm:px-3">
                    {pastParagraphs.map((text, index) => (
                        <Markdown
                            key={index}
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                        >
                            {text}
                        </Markdown>
                    ))}
                    <LastParagraph text={lastParagraph} containerRef={bookRef} />
                </div>
            </ScrollArea>
        </div>
    );
}

/**
 * Tracks how much of `text` has already been fully typed out, so that only the
 * newly appended tail is animated when the paragraph grows (or, on skip, none of it).
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
    } else if (shownRef.current.startsWith(text)) {
        // Navigated back to text that was already fully read - show it instantly.
        staticText = text;
        animatedText = "";
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

    const markdownComponents = useMemo(() => ({ p: (props: object) => <span {...props} /> }), []);

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
                        components={markdownComponents}
                    >
                        {staticText}
                    </Markdown>
                </span>
            )}
            <span>
                <MarkdownTypewriterHooks
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    delay={typewriterDelay}
                    motionProps={motionProps}
                    fallback={<DelayedAnimatedDots />}
                    specialCharacters={specialCharacters}
                >
                    {animatedText}
                </MarkdownTypewriterHooks>
            </span>
        </p>
    );
});
