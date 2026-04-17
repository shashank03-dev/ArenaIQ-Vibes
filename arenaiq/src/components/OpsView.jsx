import { useRef, useEffect, useState } from 'react';
import VenueMap from './VenueMap';

/* ── Linear design tokens ────────────────────────────────── */
const T = {
  bg:          '#08090a',
  panel:       '#0f1011',
  surface:     '#191a1b',
  surface2:    '#28282c',
  border:      'rgba(255,255,255,0.08)',
  borderSub:   'rgba(255,255,255,0.05)',
  text1:       '#f7f8f8',
  text2:       '#d0d6e0',
  text3:       '#8a8f98',
  text4:       '#62666d',
  indigo:      '#5e6ad2',
  violet:      '#7170ff',
  violetHover: '#828fff',
  green:       '#27a644',
  emerald:     '#10b981',
  amber:       '#d97706',
  red:         '#e5484d',
};

const font = { fontFamily: 'Inter, sans-serif', fontFeatureSettings: '"cv01", "ss03"' };

/* ── Status colour helpers ────────────────────────────────── */
const gateColor = (status) => {
  if (status === 'red')   return { text: '#f87171', glow: 'rgba(229,72,77,0.3)', solid: T.red };
  if (status === 'amber') return { text: '#fbbf24', glow: 'rgba(217,119,6,0.25)', solid: T.amber };
  return { text: '#34d399', glow: 'rgba(16,185,129,0.25)', solid: T.emerald };
};

const alertBg = (level) =>
  level === 'critical'
    ? 'rgba(229,72,77,0.07)'
    : level === 'warning'
    ? 'rgba(217,119,6,0.06)'
    : 'rgba(113,112,255,0.06)';

const alertBorder = (level) =>
  level === 'critical'
    ? 'rgba(229,72,77,0.2)'
    : level === 'warning'
    ? 'rgba(217,119,6,0.18)'
    : 'rgba(113,112,255,0.18)';

/* ── Animated Wait Bar ───────────────────────────────────── */
function WaitBar({ waitTime, status }) {
  const pct = Math.min((waitTime / 40) * 100, 100);
  const { solid: col, glow } = gateColor(status);

  return (
    <div style={{
      height: 3, width: '100%', borderRadius: 99,
      background: 'rgba(255,255,255,0.05)', overflow: 'hidden', marginTop: 8,
    }}>
      <div
        key={`${waitTime}-${status}`}
        style={{
          height: '100%', width: `${pct}%`,
          background: col,
          borderRadius: 99,
          boxShadow: `0 0 4px ${glow}`,
          animation: 'bar-grow 0.7s cubic-bezier(0.22,1,0.36,1) both',
        }}
      />
    </div>
  );
}

/* ── Gate Card ───────────────────────────────────────────── */
function GateCard({ gate, info }) {
  const { text: col } = gateColor(info.status);
  return (
    <div style={{
      borderRadius: 8, border: `1px solid ${T.border}`,
      background: 'rgba(255,255,255,0.02)', padding: '14px 16px',
      transition: 'background 0.15s',
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.035)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
    >
      <div style={{ ...font, fontSize: '0.6875rem', color: T.text4, fontWeight: 510, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5 }}>
        Gate {gate}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ ...font, fontSize: '2.25rem', fontWeight: 590, color: col, lineHeight: 1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.04em' }}>
          {info.waitTime}
        </span>
        <span style={{ ...font, fontSize: '0.75rem', color: T.text4, fontWeight: 400 }}>min</span>
      </div>
      <WaitBar waitTime={info.waitTime} status={info.status} />
    </div>
  );
}

/* ── Alert Card ──────────────────────────────────────────── */
function AlertCard({ alert, idx }) {
  return (
    <div
      className="alert-slide-in"
      style={{
        animationDelay: `${idx * 0.05}s`,
        background: alertBg(alert.level),
        border: `1px solid ${alertBorder(alert.level)}`,
        borderRadius: 8, padding: '10px 14px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ ...font, fontSize: '0.6875rem', color: T.text4, fontWeight: 400 }}>{alert.time}</span>
        <span style={{
          ...font,
          fontSize: '0.625rem', fontWeight: 590, letterSpacing: '0.08em',
          color: alert.level === 'critical' ? '#f87171' : '#fbbf24',
          textTransform: 'uppercase',
        }}>
          {alert.level}
        </span>
      </div>
      <p style={{ ...font, fontSize: '0.875rem', fontWeight: 400, color: T.text2, margin: 0, letterSpacing: '-0.01em' }}>
        {alert.message}
      </p>
    </div>
  );
}

/* ── Zone Row ────────────────────────────────────────────── */
function ZoneRow({ zone, info }) {
  const pct = info.density;
  const col = pct > 85 ? '#f87171' : pct > 60 ? '#fbbf24' : '#34d399';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '11px 16px',
      borderBottom: `1px solid ${T.borderSub}`,
      transition: 'background 0.15s',
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <span style={{ ...font, fontWeight: 510, color: T.text2, fontSize: '0.875rem', letterSpacing: '-0.01em' }}>{zone} Stand</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 88, height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
          <div
            key={pct}
            style={{
              height: '100%', width: `${pct}%`, background: col,
              borderRadius: 99,
              animation: 'bar-grow 0.6s cubic-bezier(0.22,1,0.36,1) both',
            }}
          />
        </div>
        <span style={{ ...font, width: 36, textAlign: 'right', fontSize: '0.8125rem', color: col, fontWeight: 510, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em' }}>
          {pct}%
        </span>
      </div>
    </div>
  );
}

/* ── Section Header ──────────────────────────────────────── */
function SectionHeader({ icon, label, accent = T.text3 }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '12px 16px',
      borderBottom: `1px solid ${T.borderSub}`,
      background: 'rgba(255,255,255,0.015)',
    }}>
      <span style={{ fontSize: '0.875rem' }}>{icon}</span>
      <h3 style={{ ...font, margin: 0, fontWeight: 510, fontSize: '0.875rem', color: accent, letterSpacing: '-0.02em' }}>{label}</h3>
    </div>
  );
}

/* ── Card Wrapper ────────────────────────────────────────── */
function Card({ children, style = {} }) {
  return (
    <div style={{
      borderRadius: 12, border: `1px solid ${T.border}`,
      background: 'rgba(255,255,255,0.02)', overflow: 'hidden',
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ── OpsView ─────────────────────────────────────────────── */
export default function OpsView({ gameState, simulateRush }) {
  return (
    <div className="ops-grid" style={{ display: 'grid', gap: 16 }}>
      {/* ── Left 2-col: Map + Gate Cards ─── */}
      <div className="ops-left-col" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Map card */}
        <Card>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', borderBottom: `1px solid ${T.borderSub}`,
            background: 'rgba(255,255,255,0.015)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>⚡</span>
              <h3 style={{ ...font, margin: 0, fontWeight: 510, fontSize: '0.875rem', color: T.violet, letterSpacing: '-0.02em' }}>Live Crowd Density</h3>
            </div>

            {/* ── SIMULATE RUSH HOUR ─ THE DEMO BUTTON ── */}
            <button
              id="simulate-rush-btn"
              onClick={simulateRush}
              style={{
                ...font,
                background: T.red,
                border: 'none', borderRadius: 6, padding: '8px 18px',
                fontSize: '0.8125rem', fontWeight: 590, color: '#fff',
                cursor: 'pointer', letterSpacing: '-0.01em',
                display: 'flex', alignItems: 'center', gap: 7,
                transition: 'background 0.15s, transform 0.12s',
                boxShadow: '0 0 16px rgba(229,72,77,0.35)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#f56167';
                e.currentTarget.style.transform = 'scale(1.03)';
                e.currentTarget.style.boxShadow = '0 0 24px rgba(229,72,77,0.55)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = T.red;
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 0 16px rgba(229,72,77,0.35)';
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1.03)'}
            >
              🚨 Simulate Rush Hour
            </button>
          </div>

          <div style={{
            padding: '28px 20px', display: 'flex', justifyContent: 'center',
            background: 'rgba(0,0,0,0.18)',
          }}>
            <VenueMap zones={gameState.zones} isOpsView />
          </div>
        </Card>

        {/* Gate wait time cards */}
        <div className="ops-gate-grid" style={{ display: 'grid', gap: 10 }}>
          {Object.entries(gameState.gates).map(([gate, info]) => (
            <GateCard key={gate} gate={gate} info={info} />
          ))}
        </div>
      </div>

      {/* ── Right 1-col: Alerts + Zone Metrics ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Active Alerts */}
        <Card style={{ flex: '0 0 auto' }}>
          <SectionHeader icon="🚨" label="Active Alerts" accent="#f87171" />
          <div style={{ padding: 10, maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 7 }}>
            {gameState.alerts.length === 0 ? (
              <div style={{ ...font, padding: '28px 0', textAlign: 'center', color: T.text4, fontSize: '0.875rem', letterSpacing: '-0.01em' }}>
                ✅ All clear — no active alerts
              </div>
            ) : (
              [...gameState.alerts].reverse().map((alert, i) => (
                <AlertCard key={alert.id} alert={alert} idx={i} />
              ))
            )}
          </div>
        </Card>

        {/* Zone Metrics */}
        <Card>
          <SectionHeader icon="👥" label="Zone Metrics" accent={T.violet} />
          <div>
            {Object.entries(gameState.zones).map(([zone, info]) => (
              <ZoneRow key={zone} zone={zone} info={info} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
