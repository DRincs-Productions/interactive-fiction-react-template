import { BGM_CHANNEL_NAME } from "@/constants";
import { mara, mc, steward } from "@/content/characters";
import { setChapter } from "@/lib/utils/chapter-utility";
import { narration, newChoiceOption, newLabel, sound } from "@drincs/pixi-vn";

export const secondPart = newLabel("second_part", [
    () => {
        setChapter("chapter_the_watchtower");
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
        narration.dialogue = `An old woman mending a net near the fire mutters a word you don't catch and touches two fingers to her collarbone, the way people do here to ward off bad luck. Nobody offers to explain, and nobody meets your eye when you ask.`;
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
        narration.dialogue = `The orchard is a black tangle in the dark, and beyond it, the watchtower waits - one narrow window burning with a light no torch ever made: ![The watchtower at night](watchtower)`;
    },
    () => {
        narration.dialogGlue = true;
        narration.dialogue = `The wind through the dead branches sounds almost like breathing. Your own torch gutters once, twice, and steadies only when you cup a hand around the flame and keep walking.`;
    },
    async (props) => {
        await sound.play("sfx_torch_crackle");
        narration.dialogGlue = true;
        narration.dialogue = `Whatever is waiting behind that light, it isn't going to come down and meet you halfway. You push open the tower's low door and start up the stairs.`;
        return narration.jump("watchtower_reveal", props);
    },
]);

newLabel("watchtower_reveal", [
    () => {
        narration.dialogue = `The stairs are narrow and slick with damp, and the light above grows steadier the higher you climb - not a torch's flicker, but something held deliberately still.`;
    },
    () => {
        narration.dialogGlue = true;
        narration.dialogue = `At the top, a woman crouches by the narrow window, a shuttered lantern in her hands and a coil of rope at her feet. She goes rigid at the sound of your boots on the last step.`;
    },
    () => {
        narration.dialogue = {
            character: mara,
            text: `"Don't shout. Please. Just - give me a moment before you shout."`,
        };
    },
    () => {
        narration.dialogue = { character: mc, text: `"Who are you? What are you doing up here?"` };
    },
    () => {
        narration.dialogue = {
            character: mara,
            text: `"Signalling a boat. There's a village past the point the toll roads have cut off since the lord raised the bridge tax - no grain in or out for two months. My brother's crew runs what they can past the watch, and this tower's the only light the river pilot can find in the dark."`,
        };
    },
    () => {
        narration.dialogGlue = true;
        narration.dialogue = `She says it fast, like she's rehearsed the version that might save her. You think of the empty larder back home, and the eleven days it took to outwalk your own hunger.`;
    },
    () => {
        narration.dialogGlue = true;
        narration.dialogue = `You could turn around right now and tell ${steward.name} exactly what's burning in his watchtower. Or you could walk back down those stairs and say you saw nothing at all.`;
        narration.choices = [
            newChoiceOption(
                "Tell Osric what you found",
                "watchtower_end_report",
                {},
                { type: "jump" },
            ),
            newChoiceOption("Say you saw nothing", "watchtower_end_mercy", {}, { type: "jump" }),
        ];
    },
]);

newLabel("watchtower_end_report", [
    () => {
        narration.dialogue = `You climb back down without another word to her, and cross the black orchard at a near-run, your torch guttering with every stride.`;
    },
    () => {
        narration.dialogue = {
            character: mc,
            text: `"There's a woman in the tower, signalling a smuggler's boat," you tell ${steward.name}, breathless. "She's still up there."`,
        };
    },
    () => {
        narration.dialogue = `${steward.name}'s face doesn't change, but he's already reaching for the horn that hangs by the door.`;
    },
    () => {
        narration.dialogGlue = true;
        narration.dialogue = `By the time the watch reaches the tower, the light is out and the river is empty. Whether she got away or not, nobody tells you, and you don't ask twice.`;
    },
    () => {
        narration.dialogGlue = true;
        narration.dialogue = `${steward.name} pays you fairly, and says you've a good eye for trouble. It doesn't feel like the compliment he means it to be.`;
    },
    () => {
        narration.dialogGlue = true;
        narration.dialogue = `— The End —`;
    },
]);

newLabel("watchtower_end_mercy", [
    () => {
        narration.dialogue = {
            character: mc,
            text: `"I didn't see anything up here worth mentioning. Finish quickly."`,
        };
    },
    () => {
        narration.dialogue = `${mara.name} stares at you a long moment, then nods once and turns back to the window, working the lantern's shutter in a slow, practiced rhythm.`;
    },
    () => {
        narration.dialogGlue = true;
        narration.dialogue = `You wait with her in the dark until a shape on the river answers, a single lamp blinking back. Only then does she let the shutter close for good.`;
    },
    () => {
        narration.dialogue = { character: mara, text: `"Thank you. I mean it."` };
    },
    () => {
        narration.dialogGlue = true;
        narration.dialogue = `She's down the stairs and into the orchard before you've found anything to say back.`;
    },
    () => {
        narration.dialogGlue = true;
        narration.dialogue = `${steward.name} accepts your report of "nothing but roosting owls" without much interest, and pays you regardless. You sleep well that night - the first time in eleven days.`;
    },
    () => {
        narration.dialogGlue = true;
        narration.dialogue = `— The End —`;
    },
]);
