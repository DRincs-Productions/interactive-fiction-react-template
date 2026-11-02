import { BGM_CHANNEL_NAME } from "@/constants";
import { gatekeeper, mc, steward } from "@/content/characters";
import { setChapter } from "@/lib/utils/chapter-utility";
import { requireLinkClickToContinue } from "@/lib/utils/continue-lock-utility";
import { narration, newChoiceOption, newLabel, sound } from "@drincs/pixi-vn";

export const startLabel = newLabel("start", [
    () => {
        setChapter("chapter_the_keep");
        sound.play("sfx_rain_ambience", { channel: BGM_CHANNEL_NAME, loop: true });
        narration.dialogue = `The road climbs toward the keep through mud that sucks at every step, under a sky the colour of an old bruise.`;
    },
    () => {
        narration.dialogGlue = true;
        narration.dialogue = `By the time the gate comes into view, the rain has soaked clean through your cloak.`;
    },
    () => {
        narration.dialogue = `A gatekeeper leans over the palisade, torchlight catching the rust on his pike.`;
    },
    () => {
        narration.dialogue = {
            character: gatekeeper,
            text: `"Nobody comes up this road for nothing. Who are you, and what's your business at the keep?"`,
        };
    },
    () => {
        narration.input.request({ type: "string" }, "Edmund");
        narration.dialogue = `He waits for your name.`;
    },
    async (props) => {
        mc.name = (narration.input.value as string) || mc.name;
        narration.dialogue = {
            character: mc,
            text: `"${mc.name}," you call back. "I was told the steward is hiring hands before winter."`,
        };
        await narration.call("start_memory", props);
    },
    async () => {
        await sound.play("sfx_gate_creak");
        narration.dialogue = `${gatekeeper.name} grunts, satisfied enough, and hauls the gate open.`;
    },
    (props) => {
        narration.dialogue = {
            character: gatekeeper,
            text: `"Go on, then. Great Hall's straight across the yard - can't miss it."`,
        };
        return narration.jump("start_hall", props);
    },
]);

newLabel("start_memory", [
    () => {
        narration.dialogue = `You think, not for the first time, of the empty larder back home, and the letter that brought you here: three lines, promising work to anyone willing to do it.`;
    },
    () => {
        narration.dialogGlue = true;
        narration.dialogue = `Your mother sold the last of the goats before you left, and it still wasn't enough - not with two more mouths at the table and the frost coming early this year. Nobody said it out loud, but everyone understood: one of you had to go, and you were the one who could be spared.`;
    },
    () => {
        narration.dialogGlue = true;
        narration.dialogue = `Eleven days you walked to answer three lines of ink, sleeping in ditches and church porches, trading chores for bread when your coin ran out. If the steward turns you away tonight, you're not entirely sure what's left to walk back to.`;
    },
    () => {
        narration.dialogGlue = true;
        narration.dialogue = `Whatever waits across that yard, it has to be better than another winter with nothing to show for it.`;
    },
]);

newLabel("start_hall", [
    () => {
        sound.stop("sfx_rain_ambience");
        sound.play("bgm_medieval_hall", { channel: BGM_CHANNEL_NAME, loop: true });
        narration.dialogue = `The Great Hall smells of woodsmoke and old wax. Above the hearth hangs a painted view of the keep at midsummer: ![The keep in summer](keep_hall)`;
    },
    () => {
        narration.dialogue = { character: mc, text: `"I'm here about the work," you say.` };
    },
    () => {
        narration.dialogue = `${steward.name} sets down his quill.`;
    },
    () => {
        narration.dialogue = {
            character: steward,
            text: `"Then you'll want to prove you're worth feeding, first."`,
        };
    },
    () => {
        requireLinkClickToContinue();
        narration.dialogue = {
            character: steward,
            text: `He nods toward a nail-worn notice pinned by the door. [Read the notice](notice_board)`,
        };
    },
]);

newLabel("notice_board", [
    () => {
        narration.dialogue = `The board by the door is crowded with the keep's business, wax-stiff scraps layered three deep: a bounty on a wolf that's been taking sheep from the low pasture, a plea for anyone who can splint a broken arm, a betrothal notice gone yellow at the corners.`;
    },
    () => {
        narration.dialogGlue = true;
        narration.dialogue = `Pinned above the rest, newer than the others, is the one you walked eleven days for - short and blunt: "Seeking able hands. Nights only. Ask the steward."`;
    },
    () => {
        narration.dialogGlue = true;
        narration.dialogue = `Nothing you didn't already gather. Still, seeing it nailed up in ink makes it feel less like a rumour and more like a job.`;
    },
    (props) => {
        return narration.jump("start_hall_task", props);
    },
]);

newLabel("start_hall_task", [
    () => {
        narration.dialogGlue = true;
        narration.dialogue = {
            character: steward,
            text: `"There's a task needs doing tonight. Simple enough - if you've got the nerve for it."`,
        };
        narration.choices = [
            newChoiceOption("Ask what the task is", "second_part", {}, { type: "jump" }),
            newChoiceOption(
                "Say you'd rather wait until morning",
                "start_wait_morning",
                {},
                { type: "jump" },
            ),
        ];
    },
]);

newLabel("start_wait_morning", [
    () => {
        narration.dialogue = {
            character: mc,
            text: `"Whatever it is, it'll keep till morning," you say. "I've had enough of the rain for one night."`,
        };
    },
    () => {
        narration.dialogGlue = true;
        narration.dialogue = `${steward.name} studies you a moment, then shrugs and waves you toward a bench by the fire. Sleep finds you fast - the first roof over your head in eleven days.`;
    },
    () => {
        sound.stop("bgm_medieval_hall");
        narration.dialogue = `You wake to grey morning light and the hall filling up with breakfast noise. ${steward.name} is already at his table, and he doesn't look up.`;
    },
    () => {
        narration.dialogue = {
            character: steward,
            text: `"Slept well? Good. Old Godwin took the watchtower job in the end - didn't fancy waiting on a stranger to make up his mind."`,
        };
    },
    () => {
        narration.dialogGlue = true;
        narration.dialogue = `He doesn't offer you another task. Sitting there with a cold bowl of porridge, you get the feeling you've already had your one chance to prove yourself - and let it pass.`;
    },
    () => {
        narration.dialogGlue = true;
        narration.dialogue = `— The End —`;
    },
]);
