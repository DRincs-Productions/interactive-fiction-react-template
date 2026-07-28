import { BGM_CHANNEL_NAME } from "@/constants";
import { gatekeeper, mc, steward } from "@/content/characters";
import { requireLinkClickToContinue } from "@/lib/utils/continue-lock-utility";
import { narration, newChoiceOption, newCloseChoiceOption, newLabel, sound } from "@drincs/pixi-vn";

export const startLabel = newLabel("start", [
    () => {
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
        narration.requestInput({ type: "string" }, "Edmund");
        narration.dialogue = `He waits for your name.`;
    },
    async (props) => {
        mc.name = (narration.inputValue as string) || mc.name;
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
        narration.dialogue = `Whatever waits across that yard, it has to be better than another winter with nothing to show for it.`;
    },
]);

newLabel("start_hall", [
    () => {
        sound.stop("sfx_rain_ambience");
        sound.play("bgm_medieval_hall", { channel: BGM_CHANNEL_NAME, loop: true });
        narration.dialogue = `The Great Hall smells of woodsmoke and old wax. Above the hearth hangs a painted view of the keep at midsummer: ![The keep in summer](background_main_menu)`;
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
        narration.dialogue = `The notice is short and blunt: "Seeking able hands. Nights only. Ask the steward." Nothing you didn't already gather.`;
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
            newCloseChoiceOption("Say you'd rather wait until morning"),
        ];
    },
]);
