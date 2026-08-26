import { NeuroNoise, PaperTexture, Voronoi } from "@paper-design/shaders-react";
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
    const { colorBack, colorFront } = PAPER_COLORS[resolvedTheme];

    return (
        <>
            <Voronoi
                className="pointer-events-none absolute inset-0 -z-10"
                colors={["#ff8247", "#ffe53d"]}
                colorGlow="#ffffff"
                colorGap="#2e0000"
                stepsPerColor={3}
                distortion={0.4}
                gap={0.04}
                glow={0}
                speed={0.5}
                scale={0.5}
            />
            <PaperTexture
                className="pointer-events-none absolute inset-0 -z-10"
                colorBack={colorBack}
                colorFront={colorFront}
                contrast={0.45}
                roughness={0.4}
                fiber={0.35}
                fiberSize={0.2}
                crumples={0.35}
                crumpleSize={0.35}
                folds={0.5}
                foldCount={5}
                fade={0.5}
                drops={0.15}
            />
        </>
    );
}

export function NarrationBackground() {
    const resolvedTheme = useResolvedTheme();
    const { colorBack, colorFront } = PAPER_COLORS[resolvedTheme];

    return (
        <>
            <PaperTexture
                className="pointer-events-none absolute inset-0 -z-10"
                colorBack={colorBack}
                colorFront={colorFront}
                contrast={0.45}
                roughness={0.4}
                fiber={0.35}
                fiberSize={0.2}
                crumples={0.35}
                crumpleSize={0.35}
                folds={0.5}
                foldCount={5}
                fade={0}
                drops={0.15}
            />
            <NeuroNoise
                className="pointer-events-none absolute inset-0 -z-10 opacity-70"
                colorFront="#ffffff"
                colorMid="#47a6ff"
                colorBack="#ffffff"
                brightness={0.05}
                contrast={0.3}
                speed={0.3}
            />
        </>
    );
}
