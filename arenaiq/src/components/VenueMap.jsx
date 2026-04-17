/* ─── helpers ─────────────────────────────────────────────── */
const COLORS = {
  critical: { fill: 'rgba(229,72,77,0.14)', stroke: '#e5484d' },
  amber:    { fill: 'rgba(217,119,6,0.12)',  stroke: '#d97706' },
  normal:   { fill: 'rgba(16,185,129,0.10)', stroke: '#10b981' },
};

function zoneColor(density) {
  if (density > 85) return 'critical';
  if (density > 60) return 'amber';
  return 'normal';
}

const interFont = { fontFamily: 'Inter, sans-serif', fontFeatureSettings: '"cv01", "ss03"' };

/* Individual SVG zone <path> with CSS animation when critical */
function ZonePath({ d, density, label, labelX, labelY, pctX, pctY, rotate, isOpsView }) {
  const level = zoneColor(density);
  const { fill, stroke } = COLORS[level];
  const isCrit = level === 'critical';

  const textCol = isCrit ? '#f87171' : level === 'amber' ? '#fbbf24' : '#34d399';

  return (
    <g>
      <path
        d={d}
        style={{
          fill,
          stroke,
          strokeWidth: 2.5,
          transition: 'fill 0.7s, stroke 0.7s',
          animation: isCrit ? 'zone-pulse 1.2s ease-in-out infinite' : 'none',
          cursor: 'default',
        }}
      />
      {/* Label */}
      <text
        x={labelX} y={labelY}
        textAnchor="middle"
        transform={rotate ? `rotate(${rotate}, ${labelX}, ${labelY})` : undefined}
        style={{ ...interFont, fill: 'rgba(247,248,248,0.75)', fontSize: 10, fontWeight: 510, letterSpacing: '0.08em' }}
      >
        {label}
      </text>
      {/* Density % shown in ops view */}
      {isOpsView && (
        <text
          x={pctX} y={pctY}
          textAnchor="middle"
          transform={rotate ? `rotate(${rotate}, ${pctX}, ${pctY})` : undefined}
          style={{
            ...interFont,
            fill: textCol,
            fontSize: 12, fontWeight: 590,
          }}
        >
          {density}%
        </text>
      )}
    </g>
  );
}

/* ─── VenueMap ────────────────────────────────────────────── */
export default function VenueMap({ zones, isOpsView = false }) {
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 460 }}>
      <svg viewBox="0 0 400 400" style={{ width: '100%', height: 'auto', filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.7))' }}>
        {/* CSS keyframe injected inline so SVG animations work */}
        <defs>
          <style>{`
            @keyframes zone-pulse {
              0%, 100% { opacity: 1; filter: drop-shadow(0 0 4px rgba(229,72,77,0.5)); }
              50% { opacity: 0.55; filter: drop-shadow(0 0 20px rgba(229,72,77,0.9)); }
            }
          `}</style>
        </defs>

        {/* Field */}
        <rect x="120" y="120" width="160" height="160" rx="10"
          style={{ fill: 'rgba(16,40,24,0.55)', stroke: 'rgba(16,185,129,0.2)', strokeWidth: 1.5 }} />
        {/* Centre circle */}
        <circle cx="200" cy="200" r="28"
          style={{ fill: 'none', stroke: 'rgba(16,185,129,0.18)', strokeWidth: 1.5 }} />
        {/* Half-way line */}
        <line x1="120" y1="200" x2="280" y2="200"
          style={{ stroke: 'rgba(16,185,129,0.18)', strokeWidth: 1.5 }} />
        {/* Centre dot */}
        <circle cx="200" cy="200" r="3"
          style={{ fill: 'rgba(16,185,129,0.35)' }} />

        {/* North Stand */}
        <ZonePath
          d="M 120 40 L 280 40 A 80 80 0 0 1 360 120 L 280 120 A 40 40 0 0 0 200 80 A 40 40 0 0 0 120 120 L 40 120 A 80 80 0 0 1 120 40 Z"
          density={zones.North?.density ?? 0}
          label="NORTH" labelX={200} labelY={68}
          pctX={200} pctY={95}
          isOpsView={isOpsView}
        />

        {/* South Stand */}
        <ZonePath
          d="M 120 360 L 280 360 A 80 80 0 0 0 360 280 L 280 280 A 40 40 0 0 1 200 320 A 40 40 0 0 1 120 280 L 40 280 A 80 80 0 0 0 120 360 Z"
          density={zones.South?.density ?? 0}
          label="SOUTH" labelX={200} labelY={345}
          pctX={200} pctY={315}
          isOpsView={isOpsView}
        />

        {/* East Stand */}
        <ZonePath
          d="M 360 120 L 360 280 L 280 280 L 280 120 Z"
          density={zones.East?.density ?? 0}
          label="EAST" labelX={320} labelY={205}
          pctX={305} pctY={225}
          rotate={90}
          isOpsView={isOpsView}
        />

        {/* West Stand */}
        <ZonePath
          d="M 40 120 L 40 280 L 120 280 L 120 120 Z"
          density={zones.West?.density ?? 0}
          label="WEST" labelX={80} labelY={205}
          pctX={95} pctY={225}
          rotate={-90}
          isOpsView={isOpsView}
        />
      </svg>
    </div>
  );
}
