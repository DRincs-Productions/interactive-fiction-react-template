/**
 * Fixed, non-animated background tint. Uses the theme's own CSS custom properties
 * (not hardcoded colors), so it follows light/dark automatically through the normal
 * CSS cascade - no JS theme detection needed.
 */
function StaticGradientBackground({ className }: { className?: string }) {
    return (
        <div
            className={className}
            style={{
                backgroundImage:
                    "radial-gradient(circle at 30% 20%, var(--foreground) 0%, transparent 60%)",
                backgroundColor: "var(--background)",
            }}
            aria-hidden
        />
    );
}

export function MainMenuBackground() {
    return (
        <StaticGradientBackground className="pointer-events-none absolute inset-y-0 -inset-x-6 -z-10 opacity-10 sm:-inset-x-10" />
    );
}

export function NarrationBackground() {
    return (
        <StaticGradientBackground className="pointer-events-none absolute inset-0 -z-10 opacity-10" />
    );
}
