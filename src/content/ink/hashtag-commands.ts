import {
    clearLinkContinueLock,
    requireLinkClickToContinue,
} from "@/lib/utils/continue-lock-utility";
import { narration, RegisteredLabels } from "@drincs/pixi-vn";
import { assetAliasIds, bundleIds, characterIdsEnum } from "@/pixi-vn.keys.gen";
import { addBaseHashtagCommands, HashtagCommands } from "@drincs/pixi-vn-ink";
import { RegisteredCharacters } from "@drincs/pixi-vn/characters";
import { achievements } from "@drincs/roves-api/achievements";
import zod from "zod";

addBaseHashtagCommands({ bundleIds, assetAliasIds });

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
        await achievements.unlock(script[2]);
        return true;
    },
    {
        name: "achievement",
        description: `Unlocks an achievement on the active platform (e.g. Steam) via Roves.

\`\`\`ink
# unlock achievement <achievementId>
\`\`\``,
        validation: zod.tuple([zod.literal("unlock"), zod.literal("achievement"), zod.string()]),
    },
);

// Escape caption delimiters so captions cannot introduce extra Markdown elements.
function markdownCaption(value: string) {
    return value.replace(/[\\[\]_*`]/g, "\\$&");
}

HashtagCommands.add(
    (script) => {
        if (!assetAliasIds.some((alias) => alias === script[1])) {
            throw new Error(`Unknown vignette asset: ${script[1]}`);
        }
        narration.dialogue = `![${markdownCaption(script[2])}](${script[1]})`;
        return "pause";
    },
    {
        name: "vignette",
        description:
            'Shows an inline book illustration. # vignette <assetAlias> "<alt text>". Use a dedicated step; captions are literal text.',
        validation: zod.tuple([zod.literal("vignette"), zod.string().min(1), zod.string()]),
    },
);

HashtagCommands.add(
    (script) => {
        if (!RegisteredLabels.has(script[1])) {
            throw new Error(`Unknown story link target: ${script[1]}`);
        }
        if (script[3] === "required") {
            requireLinkClickToContinue();
        } else {
            clearLinkContinueLock();
        }
        narration.dialogue = `[${markdownCaption(script[2])}](${script[1]})`;
        return "pause";
    },
    {
        name: "link",
        description:
            'Shows an internal story link. # link <labelId> "<text>" [required]. Use a dedicated step. Required links block continue until clicked.',
        validation: zod.union([
            zod.tuple([
                zod.literal("link"),
                zod.string().regex(/^[a-zA-Z_][\w.-]*$/),
                zod.string(),
            ]),
            zod.tuple([
                zod.literal("link"),
                zod.string().regex(/^[a-zA-Z_][\w.-]*$/),
                zod.string(),
                zod.literal("required"),
            ]),
        ]),
    },
);
