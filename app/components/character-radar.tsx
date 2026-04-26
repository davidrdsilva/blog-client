interface RadarAxis {
    label: string;
    value: number;
}

interface CharacterRadarProps {
    axes: RadarAxis[];
    max?: number;
    size?: number;
}

export default function CharacterRadar({ axes, max = 100, size = 280 }: CharacterRadarProps) {
    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.32;
    const labelRadius = radius + size * 0.09;
    const rings = [0.25, 0.5, 0.75, 1];
    const n = axes.length;
    const padX = size * 0.3;
    const padY = size * 0.08;

    const angleAt = (i: number) => -Math.PI / 2 + (2 * Math.PI * i) / n;

    const pointOnRing = (i: number, ratio: number) => {
        const a = angleAt(i);
        return {
            x: cx + radius * ratio * Math.cos(a),
            y: cy + radius * ratio * Math.sin(a),
        };
    };

    const ringPath = (ratio: number) =>
        axes
            .map((_, i) => {
                const p = pointOnRing(i, ratio);
                return `${i === 0 ? "M" : "L"}${p.x},${p.y}`;
            })
            .join(" ") + " Z";

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
            className="w-full max-w-[400px] mx-auto"
            role="img"
            aria-label="Character skills radar chart"
        >
            <title>Character skills</title>

            {rings.map((ratio) => (
                <path
                    key={ratio}
                    d={ringPath(ratio)}
                    fill="none"
                    className="stroke-zinc-300 dark:stroke-zinc-700"
                    strokeWidth={1}
                />
            ))}

            {axes.map((axis, i) => {
                const p = pointOnRing(i, 1);
                return (
                    <line
                        key={axis.label}
                        x1={cx}
                        y1={cy}
                        x2={p.x}
                        y2={p.y}
                        className="stroke-zinc-300 dark:stroke-zinc-700"
                        strokeWidth={1}
                    />
                );
            })}

            <polygon
                points={valuePoints}
                className="fill-zinc-900/15 dark:fill-zinc-100/15 stroke-zinc-900 dark:stroke-zinc-100"
                strokeWidth={1.5}
            />

            {axes.map((axis, i) => {
                const a = angleAt(i);
                const x = cx + labelRadius * Math.cos(a);
                const y = cy + labelRadius * Math.sin(a);
                const cosA = Math.cos(a);
                const anchor =
                    Math.abs(cosA) < 0.15 ? "middle" : cosA > 0 ? "start" : "end";
                return (
                    <text
                        key={axis.label}
                        x={x}
                        y={y}
                        textAnchor={anchor}
                        dominantBaseline="middle"
                        className="fill-zinc-700 dark:fill-zinc-300 font-bold uppercase"
                        style={{ fontSize: size * 0.038, letterSpacing: "0.1em" }}
                    >
                        {axis.label}
                    </text>
                );
            })}
        </svg>
    );
}
