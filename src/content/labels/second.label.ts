import { BGM_CHANNEL_NAME } from "@/constants";
import { mc, steward } from "@/content/characters";
import { narration, newLabel, sound } from "@drincs/pixi-vn";

export const secondPart = newLabel("second_part", [
    () => {
        narration.dialogue = {
            character: steward,
            text: `"The old watchtower past the orchard. Something's been moving lights up there after dark. Go take a look, and don't let your torch go out."`,
        };
    },
    async (props) => {
        narration.dialogue = { character: mc, text: `"That's it? Look at some lights?"` };
        await narration.call("second_part_omen", props);
    },
    () => {
        narration.dialogue = `${steward.name}'s smile doesn't reach his eyes.`;
    },
    () => {
        narration.dialogue = { character: steward, text: `"That's it. For tonight."` };
    },
    (props) => {
        narration.dialogGlue = true;
        narration.dialogue = `You take the torch he offers, and step back out into the rain.`;
        return narration.jump("second_part_end", props);
    },
]);

newLabel("second_part_omen", [
    () => {
        narration.dialogue = `Older hands in the hall go quiet at the mention of the tower, exchanging a look you're not meant to see.`;
    },
    () => {
        narration.dialogGlue = true;
        narration.dialogue = `Whatever ${steward.name} isn't telling you, you have a feeling you're about to find out.`;
    },
]);

newLabel("second_part_end", [
    () => {
        sound.stop("bgm_medieval_hall");
        sound.play("sfx_rain_ambience", { channel: BGM_CHANNEL_NAME, loop: true });
        narration.dialogue = `The orchard is a black tangle in the dark, and beyond it, the watchtower waits - one narrow window burning with a light no torch ever made.`;
    },
    () => {
        narration.dialogue = undefined;
        narration.dialogGlue = true;
    },
    async () => {
        await sound.play("sfx_torch_crackle");
        narration.dialogGlue = true;
        narration.dialogue = `End of Chapter Two.`;
    },
]);
