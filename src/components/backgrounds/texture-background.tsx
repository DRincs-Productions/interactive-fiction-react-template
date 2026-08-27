import { NeuroNoise } from "@paper-design/shaders-react";
import { useEffect, useState } from "react";

const PAPER_COLORS = {
    light: { colorBack: "#ffffff", colorFront: "#9aa1ac" },
    dark: { colorBack: "#0a0a0a", colorFront: "#5a5b60" },
};

// ThemeProvider toggles the "dark"/"light" class on <html>; watch it directly
// instead of duplicating its system-theme resolution logic here.
function useResolvedTheme(): keyof typeof PAPER_COLORS {
    const [resolvedTheme, setResolvedTheme] = useState<keyof typeof PAPER_COLORS>(() =>
        document.documentElement.classList.contains("dark") ? "dark" : "light",
    );

    useEffect(() => {
        const root = document.documentElement;
        const observer = new MutationObserver(() => {
            setResolvedTheme(root.classList.contains("dark") ? "dark" : "light");
        });
        observer.observe(root, { attributes: true, attributeFilter: ["class"] });
        return () => observer.disconnect();
    }, []);

    return resolvedTheme;
}

export function MainMenuBackground() {
    const resolvedTheme = useResolvedTheme();
    const { colorBack } = PAPER_COLORS[resolvedTheme];

    return (
        <NeuroNoise
            // Bleeds past the page's own horizontal padding (px-6 sm:px-10 in __root.tsx)
            // so the texture reaches the page's edges instead of stopping at the padding box.
            className="pointer-events-none absolute inset-y-0 -inset-x-6 -z-10 opacity-70 sm:-inset-x-10"
            colorFront={colorBack}
            colorMid="#47a6ff"
            colorBack={colorBack}
            brightness={0.05}
            contrast={0.3}
            speed={0.3}
        />
    );
}

export function NarrationBackground() {
    const resolvedTheme = useResolvedTheme();
    const { colorBack } = PAPER_COLORS[resolvedTheme];

    return (
        <NeuroNoise
            className="pointer-events-none absolute inset-0 -z-10 opacity-70"
            colorFront={colorBack}
            colorMid="#47a6ff"
            colorBack={colorBack}
            brightness={0.05}
            contrast={0.3}
            speed={0.3}
        />
    );
}
