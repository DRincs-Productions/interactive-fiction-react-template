import { NarrationBackground } from "@/components/backgrounds/texture-background";
import { NarrationBook } from "@/components/screens/narration/narration-book";
import { NarrationInput } from "@/components/screens/narration/narration-input";
import { NarrationMenubar } from "@/components/screens/narration/narration-menubar";

export function NarrationScreen() {
    return (
        <div className="absolute inset-0 isolate flex flex-col">
            <NarrationBackground />
            <NarrationMenubar />
            <div className="mx-0 flex min-h-0 flex-1 flex-col gap-2 pt-2 sm:mx-10 sm:gap-3 sm:pt-3 md:mx-20 lg:mx-20">
                <NarrationBook />
            </div>
            <NarrationInput />
        </div>
    );
}
