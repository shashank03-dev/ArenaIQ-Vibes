import { AlertCircle, MapPin, Navigation } from 'lucide-react';
import VenueMap from './VenueMap';

/* ── Linear design tokens (mirrored from CSS) ─────────────── */
const T = {
  bg: '#08090a',
  panel: '#0f1011',
  surface: '#191a1b',
  surface2: '#28282c',
  border: 'rgba(255,255,255,0.08)',
  borderSub: 'rgba(255,255,255,0.05)',
  text1: '#f7f8f8',
  text2: '#d0d6e0',
  text3: '#8a8f98',
  text4: '#62666d',
  indigo: '#5e6ad2',
  violet: '#7170ff',
  green: '#27a644',
  emerald: '#10b981',
  amber: '#d97706',
  red: '#e5484d',
};

const font = { fontFamily: 'Inter, sans-serif', fontFeatureSettings: '"cv01", "ss03"' };

/* ── Gate status styling ─────────────────────────────────── */
const GATE_STYLES = {
  green: {
    label: 'Best gate',
    bg: 'rgba(16,185,129,0.07)',
    border: 'rgba(16,185,129,0.2)',
    accent: '#10b981',
    textAccent: '#34d399',
  },
  amber: {
    label: 'Moderate wait',
    bg: 'rgba(217,119,6,0.07)',
    border: 'rgba(217,119,6,0.2)',
    accent: '#d97706',
    textAccent: '#fbbf24',
  },
  red: {
    label: 'High congestion',
    bg: 'rgba(229,72,77,0.07)',
    border: 'rgba(229,72,77,0.2)',
    accent: '#e5484d',
    textAccent: '#f87171',
  },
};

/* ── Order step progress ─────────────────────────────────── */
const ORDER_STEPS = ['Placed', 'Preparing', 'Ready', 'Delivered'];

function OrderProgress({ currentStatus }) {
  const idx = ORDER_STEPS.indexOf(currentStatus);
  const step = idx === -1 ? 0 : idx;

  return (
    <>
      {/* Track */}
      <div
        style={{
          position: 'relative',
          height: 3,
          borderRadius: 99,
          background: 'rgba(255,255,255,0.06)',
          marginTop: 24,
        }}
      >
        {/* Fill bar */}
        <div
          style={{
            height: '100%',
            width: `${(step / (ORDER_STEPS.length - 1)) * 100}%`,
            background: `linear-gradient(90deg, ${T.indigo}, ${T.violet})`,
            borderRadius: 99,
            transition: 'width 0.6s cubic-bezier(0.22,1,0.36,1)',
          }}
        />
        {/* Step dots & labels */}
        {ORDER_STEPS.map((s, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: '50%',
              left: `${(i / (ORDER_STEPS.length - 1)) * 100}%`,
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                position: 'absolute',
                bottom: 12,
                whiteSpace: 'nowrap',
                ...font,
                fontSize: '0.6875rem',
                fontWeight: i <= step ? 510 : 400,
                color: i <= step ? T.violet : T.text4,
                letterSpacing: '-0.01em',
                transition: 'color 0.4s',
              }}
            >
              {s}
            </div>
            <div
              style={{
                width: i <= step ? 9 : 7,
                height: i <= step ? 9 : 7,
                borderRadius: '50%',
                background: i <= step ? T.violet : T.surface2,
                border: `1.5px solid ${i <= step ? T.violet : 'rgba(255,255,255,0.1)'}`,
                boxShadow: i === step ? `0 0 8px ${T.violet}99` : 'none',
                transition: 'all 0.4s',
              }}
            />
          </div>
        ))}
      </div>
    </>
  );
}

/* ── Crowd Ring (SVG percentage ring) ───────────────────── */
function CrowdRing({ pct, zone }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const col = pct > 85 ? T.red : pct > 60 ? T.amber : T.emerald;
  const textCol = pct > 85 ? '#f87171' : pct > 60 ? '#fbbf24' : '#34d399';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width={100} height={100} viewBox="0 0 100 100">
        {/* Track */}
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        {/* Progress */}
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={col}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          strokeDashoffset="0"
          transform="rotate(-90 50 50)"
          style={{
            transition: 'stroke-dasharray 0.8s cubic-bezier(0.22,1,0.36,1), stroke 0.5s',
            filter: `drop-shadow(0 0 4px ${col}66)`,
          }}
        />
        {/* Centre text */}
        <text
          x="50"
          y="46"
          textAnchor="middle"
          style={{ ...font, fill: textCol, fontSize: 17, fontWeight: 590 }}
        >
          {pct}%
        </text>
        <text
          x="50"
          y="60"
          textAnchor="middle"
          style={{
            ...font,
            fill: T.text4,
            fontSize: 8.5,
            fontWeight: 510,
            letterSpacing: '0.06em',
          }}
        >
          CROWD
        </text>
      </svg>
      <span
        style={{
          ...font,
          fontSize: '0.6875rem',
          color: T.text3,
          fontWeight: 510,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          marginTop: -2,
        }}
      >
        {zone}
      </span>
    </div>
  );
}

/* ── Section label ───────────────────────────────────────── */
function SectionLabel({ children }) {
  return (
    <div
      style={{
        ...font,
        fontSize: '0.6875rem',
        fontWeight: 510,
        color: T.text4,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

/* ── FanView ─────────────────────────────────────────────── */
export default function FanView({ gameState, fanAlert }) {
  const myGate = 'C';
  const gateInfo = gameState.gates[myGate];
  const { bg, border, accent, textAccent, label } =
    GATE_STYLES[gateInfo.status] || GATE_STYLES.green;

  // Recommend the gate with shortest wait time
  const bestEntry = Object.entries(gameState.gates).sort(
    (a, b) => a[1].waitTime - b[1].waitTime
  )[0];

  const bestStyle = GATE_STYLES[bestEntry[1].status] || GATE_STYLES.green;

  return (
    <div
      style={{
        maxWidth: 1140,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      {/* ── Fan Alert banner ─────────────────────────────── */}
      {fanAlert && (
        <div
          className="fan-alert-in"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            background: 'rgba(229,72,77,0.07)',
            border: '1px solid rgba(229,72,77,0.25)',
            borderRadius: 8,
            padding: '12px 16px',
          }}
        >
          <AlertCircle size={16} style={{ color: T.red, flexShrink: 0, marginTop: 1 }} />
          <p
            style={{
              ...font,
              margin: 0,
              fontWeight: 510,
              color: '#f87171',
              fontSize: '0.875rem',
              letterSpacing: '-0.01em',
            }}
          >
            {fanAlert.message}
          </p>
        </div>
      )}

      <div className="fan-grid" style={{ display: 'grid', gap: 24, alignItems: 'start' }}>
        {/* ── Left Column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* ── Hero: Gate Recommendation ─────────────────────── */}
          <div
            style={{
              borderRadius: 12,
              border: `1px solid ${bestStyle.border}`,
              background: bestStyle.bg,
              padding: '24px 24px 20px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Subtle glow blob */}
            <div
              style={{
                position: 'absolute',
                top: -60,
                right: -60,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: bestStyle.accent,
                opacity: 0.05,
                pointerEvents: 'none',
              }}
            />

            <SectionLabel>🏆 Gate Recommendation</SectionLabel>

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
                  <span
                    style={{
                      ...font,
                      fontSize: '3.5rem',
                      fontWeight: 590,
                      color: bestStyle.textAccent,
                      lineHeight: 1,
                      fontVariantNumeric: 'tabular-nums',
                      letterSpacing: '-0.04em',
                    }}
                  >
                    Gate {bestEntry[0]}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      ...font,
                      fontSize: '1.25rem',
                      fontWeight: 510,
                      color: T.text1,
                      fontVariantNumeric: 'tabular-nums',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {bestEntry[1].waitTime}{' '}
                    <span style={{ fontSize: '0.875rem', fontWeight: 400, color: T.text3 }}>
                      min wait
                    </span>
                  </span>
                  {/* Status pill */}
                  <span
                    style={{
                      ...font,
                      padding: '3px 9px',
                      borderRadius: 9999,
                      border: `1px solid ${bestStyle.border}`,
                      fontSize: '0.6875rem',
                      fontWeight: 510,
                      color: bestStyle.textAccent,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      background: `${bestStyle.accent}11`,
                    }}
                  >
                    {label}
                  </span>
                </div>
              </div>

              {/* My Gate */}
              <div
                style={{
                  borderRadius: 8,
                  border: `1px solid ${T.border}`,
                  background: 'rgba(255,255,255,0.02)',
                  padding: '10px 16px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    ...font,
                    fontSize: '0.6875rem',
                    color: T.text4,
                    fontWeight: 510,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    marginBottom: 4,
                  }}
                >
                  Your Gate
                </div>
                <div
                  style={{
                    ...font,
                    fontSize: '1.75rem',
                    fontWeight: 590,
                    color: T.text1,
                    letterSpacing: '-0.03em',
                  }}
                >
                  Gate {myGate}
                </div>
                <div
                  style={{
                    ...font,
                    fontSize: '0.8125rem',
                    fontWeight: 510,
                    letterSpacing: '-0.01em',
                    color:
                      gateInfo.status === 'red'
                        ? '#f87171'
                        : gateInfo.status === 'amber'
                          ? '#fbbf24'
                          : '#34d399',
                  }}
                >
                  {gateInfo.waitTime} min wait
                </div>
              </div>
            </div>
          </div>

          {/* ── Live Score ─────────────────────────────────────── */}
          <div
            style={{
              borderRadius: 12,
              border: `1px solid ${T.border}`,
              background: 'rgba(255,255,255,0.02)',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1rem' }}>🏆</span>
              <span
                style={{
                  ...font,
                  fontSize: '0.6875rem',
                  color: T.text4,
                  fontWeight: 510,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                Live Match
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              <span
                style={{
                  ...font,
                  fontSize: '1.75rem',
                  fontWeight: 590,
                  color: T.text1,
                  letterSpacing: '-0.03em',
                }}
              >
                HOME&nbsp;{gameState.score.home}
              </span>
              <span
                style={{ color: 'rgba(255,255,255,0.1)', fontWeight: 400, fontSize: '1.25rem' }}
              >
                —
              </span>
              <span
                style={{
                  ...font,
                  fontSize: '1.75rem',
                  fontWeight: 590,
                  color: T.text3,
                  letterSpacing: '-0.03em',
                }}
              >
                AWAY&nbsp;{gameState.score.away}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(229,72,77,0.08)',
                border: '1px solid rgba(229,72,77,0.2)',
                borderRadius: 9999,
                padding: '4px 11px',
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: T.red,
                  animation: 'zone-pulse 1s ease-in-out infinite',
                }}
              />
              <span
                style={{
                  ...font,
                  fontSize: '0.8125rem',
                  fontWeight: 510,
                  color: '#f87171',
                  letterSpacing: '-0.01em',
                }}
              >
                {gameState.time}
              </span>
            </div>
          </div>

          {/* ── Order Progress + Crowd Rings ─────────────────── */}
          <div className="fan-stats-grid" style={{ display: 'grid', gap: 12 }}>
            {/* Food Order */}
            <div
              style={{
                borderRadius: 12,
                border: `1px solid ${T.border}`,
                background: 'rgba(255,255,255,0.02)',
                padding: '18px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: '0.9rem' }}>🍔</span>
                <div>
                  <div
                    style={{
                      ...font,
                      fontWeight: 510,
                      fontSize: '0.875rem',
                      color: T.text1,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    Concession #102
                  </div>
                  <div style={{ ...font, fontSize: '0.6875rem', color: T.text4, fontWeight: 400 }}>
                    Your order status
                  </div>
                </div>
              </div>
              <OrderProgress currentStatus="Preparing" />
            </div>

            {/* Crowd rings */}
            <div
              style={{
                borderRadius: 12,
                border: `1px solid ${T.border}`,
                background: 'rgba(255,255,255,0.02)',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: '0.9rem' }}>👥</span>
                <div
                  style={{
                    ...font,
                    fontWeight: 510,
                    fontSize: '0.875rem',
                    color: T.text1,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Zone Crowd
                </div>
              </div>
              <div
                className="crowd-ring-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '16px 8px',
                  flex: 1,
                  alignItems: 'center',
                  justifyItems: 'center',
                }}
              >
                {Object.entries(gameState.zones).map(([zone, info]) => (
                  <CrowdRing key={zone} pct={info.density} zone={zone} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column: Venue Map ──────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* ── Venue Map ──────────────────────────────────────── */}
          <div
            style={{
              borderRadius: 12,
              border: `1px solid ${T.border}`,
              background: 'rgba(255,255,255,0.02)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: `1px solid ${T.borderSub}`,
                background: 'rgba(255,255,255,0.015)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={14} style={{ color: T.text3 }} />
                <span
                  style={{
                    ...font,
                    fontWeight: 510,
                    fontSize: '0.875rem',
                    color: T.text1,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Venue Map
                </span>
              </div>
              <button
                style={{
                  ...font,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: T.indigo,
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 14px',
                  fontSize: '0.8125rem',
                  fontWeight: 510,
                  color: '#fff',
                  cursor: 'pointer',
                  letterSpacing: '-0.01em',
                  transition: 'background 0.15s, transform 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#828fff';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = T.indigo;
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <Navigation size={12} />
                Navigate to Seat
              </button>
            </div>

            <div
              style={{
                padding: '24px 20px 40px',
                display: 'flex',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.15)',
                position: 'relative',
              }}
            >
              <VenueMap zones={gameState.zones} />

              {/* Critical zone tip */}
              {gameState.zones.North?.density > 85 && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 16,
                    left: 0,
                    right: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <div
                    className="float-up"
                    style={{
                      background: 'rgba(15,16,17,0.92)',
                      border: '1px solid rgba(229,72,77,0.25)',
                      borderRadius: 9999,
                      padding: '5px 16px',
                      backdropFilter: 'blur(8px)',
                      whiteSpace: 'nowrap',
                      maxWidth: '90%',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      pointerEvents: 'auto',
                    }}
                  >
                    <span
                      style={{
                        ...font,
                        fontSize: '0.8125rem',
                        color: T.text2,
                        letterSpacing: '-0.01em',
                      }}
                    >
                      North is{' '}
                      <span style={{ color: '#f87171', fontWeight: 510 }}>
                        {gameState.zones.North.density}% full
                      </span>{' '}
                      — try Gate C
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
