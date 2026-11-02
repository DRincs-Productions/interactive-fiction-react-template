import { steam } from "@/lib/steam";
import { getChapterCounter, getChapterName, setChapter } from "@/lib/utils/chapter-utility";
import { requireLinkClickToContinue } from "@/lib/utils/continue-lock-utility";
import { assetAliasIds, bundleIds, characterIdsEnum } from "@/pixi-vn.keys.gen";
import { addBaseHashtagCommands, HashtagCommands, VariableGetter } from "@drincs/pixi-vn-ink";
import { RegisteredCharacters } from "@drincs/pixi-vn/characters";
import zod from "zod";

addBaseHashtagCommands({
    bundleIds,
    assetAliasIds,
    sections: { canvas: false },
});

HashtagCommands.add(
    async (script, { navigate }) => {
        await navigate({ to: script[1] });
        return true;
    },
    {
        name: "navigate",
        description: `Navigates to a specified route within the game.

\`\`\`ink
# navigate <route>
\`\`\``,
        validation: zod.tuple([zod.literal("navigate"), zod.string()]),
    },
);

HashtagCommands.add(
    async (script) => {
        const character = RegisteredCharacters.get(script[1]);
        if (character) {
            character.name = script[2];
        }
        return true;
    },
    {
        name: "character rename",
        description: `Renames a character in the game.

\`\`\`ink
# rename <characterId> <newName>
\`\`\``,
        validation: zod.tuple([zod.literal("rename"), zod.enum(characterIdsEnum), zod.string()]),
    },
);

HashtagCommands.add(
    async (script) => {
        await steam.unlockAchievement(script[2]);
        return true;
    },
    {
        name: "achievement",
        description: `Unlocks a Steam achievement.

\`\`\`ink
# unlock achievement <achievementId>
\`\`\``,
        validation: zod.tuple([zod.literal("unlock"), zod.literal("achievement"), zod.string()]),
    },
);

HashtagCommands.add(
    (script) => {
        setChapter(script[1]);
        return true;
    },
    {
        name: "chapter",
        description: `Starts a new chapter: increments the chapter counter and records its name. Pass a translation key (namespace "narration"), not translated text.

\`\`\`ink
# chapter <translationKey>
\`\`\`

Read it back in Ink with the variables \`chapter_counter\` and \`chapter_name\`.`,
        validation: zod.tuple([zod.literal("chapter"), zod.string().min(1)]),
    },
);

HashtagCommands.add(
    () => {
        requireLinkClickToContinue();
        return true;
    },
    {
        name: "require link",
        description: `Blocks continue until the player follows a Markdown story link. Use it in the same step as the link.

\`\`\`ink
# require link
[Read the notice](notice_board)
\`\`\``,
        validation: zod.tuple([zod.literal("require"), zod.literal("link")]),
    },
);

// Ink reads of these variables are served by the chapter utility instead of plain storage.
VariableGetter.add((value, next) => {
    const logic = value as { type?: string; storageOperationType?: string; key?: unknown };
    if (logic?.type === "value" && logic.storageOperationType === "get") {
        if (logic.key === "chapter_counter") return getChapterCounter() as typeof value;
        if (logic.key === "chapter_name") return getChapterName() as typeof value;
    }
    return next(value);
});
