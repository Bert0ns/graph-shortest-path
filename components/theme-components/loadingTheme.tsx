"use client"

type LoadingThemeProps = {
    exiting?: boolean
}

const LoadingTheme = ({ exiting = false }: LoadingThemeProps) => {
    return (
        <div
            role="status"
            aria-live="polite"
            className={
                [
                    "fixed inset-0 z-[9999] grid place-items-center bg-white text-neutral-700 dark:bg-neutral-950 dark:text-neutral-200",
                    "transition-opacity duration-300 ease-out will-change-[opacity]",
                    exiting ? "opacity-0 pointer-events-none" : "opacity-100"
                ].join(" ")
            }
        >
            <div className="flex flex-col items-center gap-6">
                {/* Animated Graph Loader */}
                <div className="relative h-28 w-28">
                    <svg
                        viewBox="0 0 120 120"
                        className="h-28 w-28 drop-shadow-sm"
                        aria-hidden="true"
                    >
                        <defs>
                            <linearGradient id="ring" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#60a5fa"/>
                                <stop offset="100%" stopColor="#22d3ee"/>
                            </linearGradient>
                            <linearGradient id="edge" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#a78bfa"/>
                                <stop offset="100%" stopColor="#38bdf8"/>
                            </linearGradient>
                        </defs>

                        {/* Outer subtle ring */}
                        <circle cx="60" cy="60" r="46" fill="none" stroke="#e5e7eb" className="dark:stroke-neutral-800" strokeWidth="2"/>

                        {/* Rotating dashed ring */}
                        <g className="[transform-origin:60px_60px] [animation:spin_8s_linear_infinite] motion-reduce:[animation:none]">
                            <circle cx="60" cy="60" r="38" fill="none" stroke="url(#ring)" strokeWidth="4" strokeLinecap="round" strokeDasharray="6 10"/>
                        </g>

                        {/* Graph nodes */}
                        <circle cx="32" cy="38" r="6" className="fill-sky-400/90 dark:fill-sky-300/90 origin-center [animation:pulseNode_1.6s_ease-in-out_infinite] motion-reduce:[animation:none]"/>
                        <circle cx="88" cy="42" r="6" className="fill-violet-400/90 dark:fill-violet-300/90 origin-center [animation:pulseNode_1.6s_ease-in-out_infinite] [animation-delay:120ms] motion-reduce:[animation:none]"/>
                        <circle cx="54" cy="86" r="6" className="fill-cyan-400/90 dark:fill-cyan-300/90 origin-center [animation:pulseNode_1.6s_ease-in-out_infinite] [animation-delay:240ms] motion-reduce:[animation:none]"/>

                        {/* Edges */}
                        <path d="M32 38 L88 42" fill="none" stroke="#d1d5db" className="dark:stroke-neutral-700" strokeWidth="2"/>
                        <path d="M32 38 L54 86" fill="none" stroke="#d1d5db" className="dark:stroke-neutral-700" strokeWidth="2"/>
                        <path d="M88 42 L54 86" fill="none" stroke="#d1d5db" className="dark:stroke-neutral-700" strokeWidth="2"/>

                        {/* Animated traversal (edge highlight) */}
                        <path
                            d="M32 38 L88 42 L54 86 L32 38"
                            fill="none"
                            stroke="url(#edge)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray="160 200"
                            className="[animation:dash_2.8s_ease-in-out_infinite] motion-reduce:[animation:none]"
                        />

                        {/* Orbiting dot */}
                        <g className="[transform-origin:60px_60px] [animation:spin_12s_linear_infinite] motion-reduce:[animation:none]">
                            <circle cx="60" cy="14" r="3" className="fill-emerald-400 dark:fill-emerald-300 shadow"/>
                        </g>
                    </svg>
                </div>

                {/* Title and subtle helper text */}
                <div className="flex flex-col items-center">
                    <span className="text-sm font-medium tracking-wide text-neutral-600 dark:text-neutral-300">Preparing theme…</span>
                    <span className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">Optimizing colors and contrast</span>
                </div>

                {/* Optional progress bar shimmer */}
                <div className="h-1.5 w-48 overflow-hidden rounded-full bg-neutral-200/70 dark:bg-neutral-800">
                    <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 dark:from-sky-300 dark:via-cyan-300 dark:to-emerald-300 [animation:shimmer_0.7s_ease-in-out_infinite] motion-reduce:[animation:none]"/>
                </div>
            </div>

            <span className="sr-only">Caricamento tema in corso</span>
        </div>
    )
}

export default LoadingTheme;