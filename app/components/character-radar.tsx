"use client";

import { useState } from "react";

interface RadarAxis {
    label: string;
    value: number;
}

interface CharacterRadarProps {
    axes: RadarAxis[];
    max?: number;
    size?: number;
}

export default function CharacterRadar({ axes, max = 100, size = 320 }: CharacterRadarProps) {
    const [hovered, setHovered] = useState<number | null>(null);

    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.34;
    const labelRadius = radius + size * 0.12;
    const valueBadgeRadius = radius + size * 0.05;
    const rings = [0.25, 0.5, 0.75, 1];
    const n = axes.length;
    const padX = size * 0.3;
    const padY = size * 0.12;
    const sliceHalfAngle = Math.PI / n;

    const angleAt = (i: number) => -Math.PI / 2 + (2 * Math.PI * i) / n;

    const pointOnRing = (i: number, ratio: number) => {
        const a = angleAt(i);
        return {
            x: cx + radius * ratio * Math.cos(a),
            y: cy + radius * ratio * Math.sin(a),
        };
    };

    const ringPath = (ratio: number) =>
        `${axes
            .map((_, i) => {
                const p = pointOnRing(i, ratio);
                return `${i === 0 ? "M" : "L"}${p.x},${p.y}`;
            })
            .join(" ")} Z`;

    const valuePoints = axes
        .map((axis, i) => {
            const ratio = Math.max(0, Math.min(1, axis.value / max));
            const p = pointOnRing(i, ratio);
            return `${p.x},${p.y}`;
        })
        .join(" ");

    const slicePath = (i: number) => {
        const a = angleAt(i);
        const r = radius * 1.35;
        const a1 = a - sliceHalfAngle;
        const a2 = a + sliceHalfAngle;
        const p1 = { x: cx + r * Math.cos(a1), y: cy + r * Math.sin(a1) };
        const p2 = { x: cx + r * Math.cos(a2), y: cy + r * Math.sin(a2) };
        return `M ${cx} ${cy} L ${p1.x} ${p1.y} A ${r} ${r} 0 0 1 ${p2.x} ${p2.y} Z`;
    };

    return (
        <svg
            viewBox={`${-padX} ${-padY} ${size + 2 * padX} ${size + 2 * padY}`}
            className="w-full max-w-[440px] mx-auto select-none"
            role="img"
            aria-label="Character skills radar chart"
            onMouseLeave={() => setHovered(null)}
        >
            <title>Character skills</title>

            <defs>
                <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
                    <stop offset="65%" stopColor="currentColor" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                </radialGradient>
            </defs>

            <g style={{ pointerEvents: "none" }}>
                <circle cx={cx} cy={cy} r={radius * 1.08} fill="url(#radar-glow)" />

                {rings.map((ratio, idx) => (
                    <path
                        key={ratio}
                        d={ringPath(ratio)}
                        fill="none"
                        stroke="currentColor"
                        strokeOpacity={idx === rings.length - 1 ? 0.55 : 0.22}
                        strokeWidth={idx === rings.length - 1 ? 1.25 : 1}
                        strokeDasharray={idx === rings.length - 1 ? undefined : "2 4"}
                    />
                ))}

                {axes.map((axis, i) => {
                    const p = pointOnRing(i, 1);
                    return (
                        <line
                            key={`axis-${axis.label}`}
                            x1={cx}
                            y1={cy}
                            x2={p.x}
                            y2={p.y}
                            stroke="currentColor"
                            strokeOpacity={hovered === i ? 0.55 : 0.28}
                            strokeWidth={1}
                            style={{ transition: "stroke-opacity 220ms" }}
                        />
                    );
                })}

                {axes.flatMap((axis, i) =>
                    rings.map((ratio) => {
                        const p = pointOnRing(i, ratio);
                        return (
                            <circle
                                key={`tick-${axis.label}-${ratio}`}
                                cx={p.x}
                                cy={p.y}
                                r={1.4}
                                fill="currentColor"
                                fillOpacity={0.5}
                            />
                        );
                    })
                )}

                <polygon
                    points={valuePoints}
                    fill="currentColor"
                    fillOpacity={hovered === null ? 0.18 : 0.12}
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinejoin="round"
                    style={{ transition: "fill-opacity 220ms" }}
                />
            </g>

            {axes.map((axis, i) => {
                const ratio = Math.max(0, Math.min(1, axis.value / max));
                const vertex = pointOnRing(i, ratio);
                const a = angleAt(i);
                const valueX = cx + valueBadgeRadius * Math.cos(a);
                const valueY = cy + valueBadgeRadius * Math.sin(a);
                const labelX = cx + labelRadius * Math.cos(a);
                const labelY = cy + labelRadius * Math.sin(a);
                const cosA = Math.cos(a);
                const anchor = Math.abs(cosA) < 0.15 ? "middle" : cosA > 0 ? "start" : "end";

                const isActive = hovered === i;
                const isDim = hovered !== null && hovered !== i;

                return (
                    // biome-ignore lint/a11y/noStaticElementInteractions: decorative hover spotlight on SVG group; the chart's data is already announced via the parent svg's aria-label
                    <g
                        key={`axis-group-${axis.label}`}
                        onMouseEnter={() => setHovered(i)}
                        style={{
                            opacity: isDim ? 0.35 : 1,
                            transition: "opacity 220ms",
                            cursor: "pointer",
                        }}
                    >
                        <path
                            d={slicePath(i)}
                            fill="transparent"
                            style={{ pointerEvents: "all" }}
                        />

                        {isActive && (
                            <circle
                                cx={vertex.x}
                                cy={vertex.y}
                                r={9}
                                fill="currentColor"
                                fillOpacity={0.2}
                                style={{ pointerEvents: "none" }}
                            />
                        )}

                        <circle
                            cx={vertex.x}
                            cy={vertex.y}
                            r={isActive ? 5 : 3.5}
                            fill="currentColor"
                            style={{ transition: "r 220ms", pointerEvents: "none" }}
                        />

                        <text
                            x={valueX}
                            y={valueY}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="currentColor"
                            fontFamily="var(--font-serif)"
                            style={{
                                fontSize: isActive ? size * 0.075 : size * 0.05,
                                transition: "font-size 220ms",
                                pointerEvents: "none",
                            }}
                        >
                            {Math.round(axis.value)}
                        </text>

                        <text
                            x={labelX}
                            y={labelY}
                            textAnchor={anchor}
                            dominantBaseline="middle"
                            fill="currentColor"
                            fillOpacity={isActive ? 1 : 0.7}
                            className="font-bold uppercase"
                            style={{
                                fontSize: size * 0.036,
                                letterSpacing: "0.25em",
                                transition: "fill-opacity 220ms",
                                pointerEvents: "none",
                            }}
                        >
                            {axis.label}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}
