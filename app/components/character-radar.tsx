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
    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.34;
    const labelRadius = radius + size * 0.11;
    const valueBadgeRadius = radius + size * 0.045;
    const rings = [0.25, 0.5, 0.75, 1];
    const n = axes.length;
    const padX = size * 0.28;
    const padY = size * 0.1;

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

    return (
        <svg
            viewBox={`${-padX} ${-padY} ${size + 2 * padX} ${size + 2 * padY}`}
            className="w-full max-w-[440px] mx-auto"
            role="img"
            aria-label="Character skills radar chart"
        >
            <title>Character skills</title>

            <defs>
                <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
                    <stop offset="65%" stopColor="currentColor" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                </radialGradient>
            </defs>

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
                        strokeOpacity={0.28}
                        strokeWidth={1}
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
                fillOpacity={0.18}
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinejoin="round"
            />

            {axes.map((axis, i) => {
                const ratio = Math.max(0, Math.min(1, axis.value / max));
                const p = pointOnRing(i, ratio);
                return (
                    <circle
                        key={`vertex-${axis.label}`}
                        cx={p.x}
                        cy={p.y}
                        r={3.5}
                        fill="currentColor"
                    />
                );
            })}

            {axes.map((axis, i) => {
                const a = angleAt(i);
                const x = cx + valueBadgeRadius * Math.cos(a);
                const y = cy + valueBadgeRadius * Math.sin(a);
                return (
                    <text
                        key={`value-${axis.label}`}
                        x={x}
                        y={y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="currentColor"
                        fontFamily="var(--font-serif)"
                        style={{ fontSize: size * 0.05 }}
                    >
                        {Math.round(axis.value)}
                    </text>
                );
            })}

            {axes.map((axis, i) => {
                const a = angleAt(i);
                const x = cx + labelRadius * Math.cos(a);
                const y = cy + labelRadius * Math.sin(a);
                const cosA = Math.cos(a);
                const anchor = Math.abs(cosA) < 0.15 ? "middle" : cosA > 0 ? "start" : "end";
                return (
                    <text
                        key={`label-${axis.label}`}
                        x={x}
                        y={y}
                        textAnchor={anchor}
                        dominantBaseline="middle"
                        fill="currentColor"
                        fillOpacity={0.7}
                        className="font-bold uppercase"
                        style={{ fontSize: size * 0.036, letterSpacing: "0.25em" }}
                    >
                        {axis.label}
                    </text>
                );
            })}
        </svg>
    );
}
