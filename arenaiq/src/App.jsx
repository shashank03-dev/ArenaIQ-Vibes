import React, { useState, useEffect, useCallback } from 'react';
import { useSocket } from './hooks/useSocket';
import FanView from './components/FanView';
import OpsView from './components/OpsView';

/* ── LiveClock ────────────────────────────────────────────── */
const LiveClock = React.memo(function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const h = time.getHours().toString().padStart(2, '0');
  const m = time.getMinutes().toString().padStart(2, '0');
  const s = time.getSeconds().toString().padStart(2, '0');

  return (
    <time
      aria-label={`Current time: ${h}:${m}:${s}`}
      style={{
        fontVariantNumeric: 'tabular-nums',
        fontFeatureSettings: '"cv01", "ss03"',
        color: '#7170ff',
        fontWeight: 510,
        fontSize: '0.875rem',
        letterSpacing: '-0.01em',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {h}:{m}:{s}
    </time>
  );
});

/* ── Last Updated Stamp ─────────────────────────────────────── */
const LastUpdated = React.memo(function LastUpdated() {
  const [ts, setTs] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTs(new Date()), 2000);
    return () => clearInterval(id);
  }, []);

  const fmt = ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  return (
    <span
      aria-live="polite"
      aria-atomic="true"
      style={{
        color: '#62666d',
        fontSize: '0.75rem',
        letterSpacing: '-0.01em',
        fontFeatureSettings: '"cv01", "ss03"',
      }}
    >
      synced {fmt}
    </span>
  );
});

/* ── App ─────────────────────────────────────────────────────── */
function App() {
  const [role, setRole] = useState('fan');
  const { isConnected, gameState, fanAlert, simulateRush } = useSocket();

  /** Handle keyboard navigation within role switcher */
  const handleRoleKeyDown = useCallback((e, r) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setRole(r);
    }
  }, []);

  if (!gameState) {
    return (
      <div
        role="status"
        aria-label="Connecting to ArenaIQ"
        aria-busy="true"
        style={{
          display: 'flex',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#08090a',
          gap: '12px',
          flexDirection: 'column',
        }}
      >
        {/* Spinner */}
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          aria-hidden="true"
          style={{ animation: 'spin 0.9s linear infinite' }}
        >
          <circle cx="14" cy="14" r="11" fill="none" stroke="#191a1b" strokeWidth="2.5" />
          <circle
            cx="14"
            cy="14"
            r="11"
            fill="none"
            stroke="#7170ff"
            strokeWidth="2.5"
            strokeDasharray="30 55"
            strokeLinecap="round"
          />
        </svg>
        <span
          style={{
            color: '#8a8f98',
            fontWeight: 510,
            fontSize: '0.875rem',
            letterSpacing: '-0.01em',
            fontFeatureSettings: '"cv01", "ss03"',
          }}
        >
          Connecting to ArenaIQ…
        </span>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#08090a', color: '#f7f8f8' }}>
      {/* ── Navbar ─────────────────────────────────────────── */}
      <header>
        <nav
          className="app-nav"
          aria-label="Main navigation"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'transparent',
            padding: '32px 32px 0',
            height: '84px',
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <div
              aria-hidden="true"
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: '#5e6ad2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 590,
                fontSize: '0.72rem',
                letterSpacing: '-0.03em',
                fontFeatureSettings: '"cv01", "ss03"',
                color: '#fff',
              }}
            >
              IQ
            </div>
            <span
              style={{
                fontWeight: 590,
                fontSize: '0.9375rem',
                letterSpacing: '-0.03em',
                fontFeatureSettings: '"cv01", "ss03"',
                color: '#f7f8f8',
              }}
            >
              Arena<span style={{ color: '#7170ff' }}>IQ</span>
            </span>
          </div>

          {/* Centre: clock + last synced */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <LiveClock />
            <LastUpdated />
          </div>

          {/* Right: role switcher + connection status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Role Switcher — pill style */}
            <div
              role="group"
              aria-label="View selector"
              style={{
                display: 'flex',
                borderRadius: 9999,
                background: 'rgba(255,255,255,0.03)',
                padding: '4px',
                border: '1px solid rgba(255,255,255,0.08)',
                gap: '4px',
              }}
            >
              {['fan', 'ops'].map((r) => (
                <button
                  key={r}
                  id={`role-${r}-btn`}
                  aria-label={`Switch to ${r} view`}
                  aria-pressed={role === r}
                  onClick={() => setRole(r)}
                  onKeyDown={(e) => handleRoleKeyDown(e, r)}
                  style={{
                    borderRadius: 9999,
                    padding: '6px 18px',
                    fontSize: '0.9375rem',
                    fontWeight: 510,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: role === r ? '#5e6ad2' : 'transparent',
                    color: role === r ? '#fff' : '#8a8f98',
                    letterSpacing: '-0.01em',
                    fontFeatureSettings: '"cv01", "ss03"',
                    fontFamily: 'Inter, sans-serif',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    if (role !== r) e.currentTarget.style.outline = '2px solid #7170ff';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.outline = 'none';
                  }}
                >
                  {r === 'fan' ? '🏟 Fan' : '⚡ Ops'}
                </button>
              ))}
            </div>

            {/* Connection status pill */}
            <div
              role="status"
              aria-live="polite"
              aria-label={isConnected ? 'Live connection active' : 'Connection lost'}
              title={isConnected ? 'Live' : 'Disconnected'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 9999,
                padding: '8px 16px',
                height: 'max-content',
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: isConnected ? '#10b981' : '#e5484d',
                  boxShadow: isConnected ? '0 0 8px rgba(16,185,129,0.8)' : 'none',
                  animation: isConnected ? 'pulse-dot 2s ease-in-out infinite' : 'none',
                }}
              />
              <span
                style={{
                  fontSize: '0.9375rem',
                  fontWeight: 510,
                  color: '#8a8f98',
                  letterSpacing: '-0.01em',
                  fontFeatureSettings: '"cv01", "ss03"',
                }}
              >
                {isConnected ? 'Live' : 'Off'}
              </span>
            </div>
          </div>
        </nav>
      </header>

      {/* ── Main ────────────────────────────────────────────── */}
      <main id="main-content" style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 20px' }}>
        {role === 'fan' ? (
          <FanView gameState={gameState} fanAlert={fanAlert} />
        ) : (
          <OpsView gameState={gameState} simulateRush={simulateRush} />
        )}
      </main>
    </div>
  );
}

export default App;
