import App from "@/App";
import {
    BGM_CHANNEL_NAME,
    SFX_CHANNEL_NAME
} from "@/constants";
import { ChannelSound } from "@/lib/stores/channel-sound-stores";
import { MasterSound } from "@/lib/stores/master-sound-storage";
import { PendingLabelStart } from "@/lib/stores/pending-label-start-store";
import "@/styles.css";
import { Game, narration, sound } from "@drincs/pixi-vn";
import { createRoot } from "react-dom/client";

// Canvas setup with PIXI
const body = document.body;
if (!body) {
    throw new Error("body element not found");
}

Game.init().then(() => {
    // Sound setup
    sound.addChannel(BGM_CHANNEL_NAME, { background: true });
    sound.addChannel(SFX_CHANNEL_NAME);
    sound.defaultChannelAlias = SFX_CHANNEL_NAME;
    MasterSound.init();
    ChannelSound.init();

    // React setup with ReactDOM
    const root = document.getElementById("root");
    if (!root) {
        throw new Error("root element not found");
    }

    const reactRoot = createRoot(root);
    reactRoot.render(<App />);
});

Game.onEnd(async ({ navigate }) => {
    Game.clear();
    navigate({ to: "/" });
});

Game.addOnError((error, { toast, uiTransition }) => {
    toast && uiTransition && toast.error(uiTransition("allert_error_occurred"));
    console.error(`Error occurred`, error);
});

Game.onLabelStarting((labelId, _props, options, defaultStart) => {
    // Let the very first label of a game (no label active yet, e.g. Game.start) begin
    // immediately; only defer label starts that happen mid-story (see PendingLabelStart).
    if (!narration.currentLabel) {
        return defaultStart();
    }
    PendingLabelStart.set(labelId, options, defaultStart);
});
