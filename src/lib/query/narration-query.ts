import { NARRATION_DATA_USE_QUERY_KEY } from "@/constants";
import { isContinueLockedByLink } from "@/lib/utils/continue-lock-utility";
import { narration, stepHistory } from "@drincs/pixi-vn";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

const CAN_GO_BACK_USE_QUERY_KEY = "can_go_back_use_query_key";
export function useQueryCanGoBack() {
    return useQuery({
        queryKey: [NARRATION_DATA_USE_QUERY_KEY, CAN_GO_BACK_USE_QUERY_KEY],
        queryFn: async () => stepHistory.canGoBack,
    });
}

const CHOICE_MENU_OPTIONS_USE_QUERY_KEY = "choice_menu_options_use_query_key";
export function useQueryChoiceMenuOptions() {
    const { t } = useTranslation(["narration"]);
    return useQuery({
        queryKey: [NARRATION_DATA_USE_QUERY_KEY, CHOICE_MENU_OPTIONS_USE_QUERY_KEY],
        queryFn: async () =>
            narration.choices.list?.map((option) => ({
                ...option,
                text:
                    typeof option.text === "string"
                        ? t(option.text)
                        : option.text.map((text) => t(text)).join(" "),
            })) || [],
    });
}

const INPUT_VALUE_USE_QUERY_KEY = "input_value_use_query_key";
export function useQueryInputValue<T>() {
    return useQuery({
        queryKey: [NARRATION_DATA_USE_QUERY_KEY, INPUT_VALUE_USE_QUERY_KEY],
        queryFn: async () => ({
            isRequired: narration.input.isRequired,
            type: narration.input.type,
            currentValue: narration.input.value as T | undefined,
        }),
        placeholderData: keepPreviousData,
    });
}

const NARRATION_PARAGRAPHS_USE_QUERY_KEY = "narration_paragraphs_use_query_key";
/**
 * Reads `stepHistory.currentPageParagraphs` (an array of paragraphs, each an array of steps)
 * and turns it into an array of prose strings, one per paragraph - only steps with a
 * `dialogue` are considered. Within a paragraph, each dialogue's text is resolved and,
 * when it has a character, tagged novel-style (e.g. `Osric said: ...`), then all of a
 * paragraph's dialogues are joined into that paragraph's single string.
 */
export function useQueryNarrationParagraphs() {
    const { t } = useTranslation(["narration"]);
    const { t: tUi } = useTranslation(["ui"]);

    return useQuery({
        queryKey: [NARRATION_DATA_USE_QUERY_KEY, NARRATION_PARAGRAPHS_USE_QUERY_KEY],
        queryFn: async () =>
            stepHistory.currentPageParagraphs.map((paragraph) => ({
                // A paragraph's step indexes never change once written, so the first step's
                // index is a stable React key across re-renders - unlike the array position,
                // it doesn't shift when going back/forward reshapes the accumulated list.
                key: paragraph[0]?.stepIndex ?? 0,
                text: paragraph
                    .map((step) => {
                        const dialogue = step.dialogue;
                        if (!dialogue) return undefined;

                        const text = Array.isArray(dialogue.text)
                            ? dialogue.text.map((line) => t(line)).join(" ")
                            : t(dialogue.text);

                        const character = dialogue.character;
                        const characterName =
                            typeof character === "string"
                                ? t(character)
                                : character?.name
                                  ? character.name +
                                    (character.surname ? ` ${character.surname}` : "")
                                  : undefined;

                        return characterName
                            ? tUi("character_said", { character: characterName, text })
                            : text;
                    })
                    .filter((text): text is string => text !== undefined)
                    // A plain " " here sits right on the boundary the typewriter's
                    // static/animated text split re-parses as markdown; CommonMark trims
                    // leading whitespace from that fragment, silently eating the space.
                    // "&nbsp;" is decoded to a space only after that trimming step, so it survives.
                    .join("&nbsp;"),
            })),
        placeholderData: keepPreviousData,
    });
}

const CAN_GO_NEXT_USE_QUERY_KEY = "can_go_next_use_query_key";
export function useQueryCanGoNext() {
    return useQuery({
        queryKey: [NARRATION_DATA_USE_QUERY_KEY, CAN_GO_NEXT_USE_QUERY_KEY],
        queryFn: async () =>
            narration.canContinue && !narration.input.isRequired && !isContinueLockedByLink(),
    });
}
