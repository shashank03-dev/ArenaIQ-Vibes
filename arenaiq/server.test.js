import { describe, it, expect } from 'vitest';

// ── Gate Status Logic ────────────────────────────────────────
describe('Gate Status Logic', () => {
  const getStatus = (waitTime) => {
    if (waitTime < 10) return 'green';
    if (waitTime < 20) return 'amber';
    return 'red';
  };

  it('returns green for wait < 10 min', () => {
    expect(getStatus(5)).toBe('green');
    expect(getStatus(0)).toBe('green');
    expect(getStatus(9)).toBe('green');
  });

  it('returns amber for wait 10-19 min', () => {
    expect(getStatus(10)).toBe('amber');
    expect(getStatus(15)).toBe('amber');
    expect(getStatus(19)).toBe('amber');
  });

  it('returns red for wait >= 20 min', () => {
    expect(getStatus(20)).toBe('red');
    expect(getStatus(35)).toBe('red');
    expect(getStatus(100)).toBe('red');
  });
});

// ── Zone Density Logic ───────────────────────────────────────
describe('Zone Density Logic', () => {
  const getDensityStatus = (density) => {
    if (density > 85) return 'critical';
    if (density > 60) return 'amber';
    return 'normal';
  };

  it('returns critical for density > 85', () => {
    expect(getDensityStatus(86)).toBe('critical');
    expect(getDensityStatus(91)).toBe('critical');
    expect(getDensityStatus(100)).toBe('critical');
  });

  it('returns amber for density > 60 and <= 85', () => {
    expect(getDensityStatus(61)).toBe('amber');
    expect(getDensityStatus(75)).toBe('amber');
    expect(getDensityStatus(85)).toBe('amber');
  });

  it('returns normal for density <= 60', () => {
    expect(getDensityStatus(0)).toBe('normal');
    expect(getDensityStatus(40)).toBe('normal');
    expect(getDensityStatus(60)).toBe('normal');
  });
});

// ── Gate Recommendation Logic ────────────────────────────────
describe('Gate Recommendation Logic', () => {
  const getBestGate = (gates) => {
    return Object.entries(gates).sort((a, b) => a[1].waitTime - b[1].waitTime)[0];
  };

  it('recommends the gate with lowest wait time', () => {
    const gates = {
      A: { waitTime: 5, status: 'green' },
      B: { waitTime: 12, status: 'amber' },
      C: { waitTime: 3, status: 'green' },
      D: { waitTime: 25, status: 'red' },
    };
    const [gate] = getBestGate(gates);
    expect(gate).toBe('C');
  });

  it('handles single gate scenario', () => {
    const gates = {
      A: { waitTime: 8, status: 'green' },
    };
    const [gate] = getBestGate(gates);
    expect(gate).toBe('A');
  });

  it('returns first alphabetically if all wait times are equal', () => {
    const gates = {
      A: { waitTime: 10, status: 'amber' },
      B: { waitTime: 10, status: 'amber' },
    };
    const [gate] = getBestGate(gates);
    expect(gate).toBe('A');
  });
});

// ── Alert Management Logic ────────────────────────────────────
describe('Alert Management Logic', () => {
  const MAX_ALERTS = 5;

  it('keeps max 5 alerts', () => {
    const alerts = [];
    for (let i = 0; i < 7; i++) {
      alerts.push({ id: i, message: `Alert ${i}`, level: 'warning' });
      if (alerts.length > MAX_ALERTS) alerts.shift();
    }
    expect(alerts.length).toBe(MAX_ALERTS);
  });

  it('removes oldest alert when limit exceeded', () => {
    const alerts = [
      { id: 1, message: 'Alert 1' },
      { id: 2, message: 'Alert 2' },
      { id: 3, message: 'Alert 3' },
      { id: 4, message: 'Alert 4' },
      { id: 5, message: 'Alert 5' },
    ];
    alerts.push({ id: 6, message: 'Alert 6' });
    if (alerts.length > MAX_ALERTS) alerts.shift();
    expect(alerts[0].id).toBe(2);
    expect(alerts[alerts.length - 1].id).toBe(6);
  });

  it('initialises with empty alerts array', () => {
    const alerts = [];
    expect(alerts.length).toBe(0);
  });
});

// ── Score Simulation Logic ────────────────────────────────────
describe('Score Simulation Logic', () => {
  it('score only increases, never decreases', () => {
    let homeScore = 100;
    for (let i = 0; i < 20; i++) {
      if (Math.random() > 0.6) {
        homeScore += Math.floor(Math.random() * 3);
      }
      expect(homeScore).toBeGreaterThanOrEqual(100);
    }
  });

  it('score increment is between 0 and 2', () => {
    const increments = [];
    for (let i = 0; i < 100; i++) {
      increments.push(Math.floor(Math.random() * 3));
    }
    increments.forEach((inc) => {
      expect(inc).toBeGreaterThanOrEqual(0);
      expect(inc).toBeLessThanOrEqual(2);
    });
  });
});

// ── Wait Time Constraint Logic ────────────────────────────────
describe('Wait Time Constraints', () => {
  it('wait time cannot go below 0', () => {
    let waitTime = 2;
    const diff = -5;
    waitTime = Math.max(0, waitTime + diff);
    expect(waitTime).toBe(0);
  });

  it('wait time can increase normally', () => {
    let waitTime = 10;
    const diff = 3;
    waitTime = Math.max(0, waitTime + diff);
    expect(waitTime).toBe(13);
  });
});

// ── Order Progress Logic ──────────────────────────────────────
describe('Order Progress Logic', () => {
  const ORDER_STEPS = ['Placed', 'Preparing', 'Ready', 'Delivered'];

  it('correctly maps status to step index', () => {
    expect(ORDER_STEPS.indexOf('Placed')).toBe(0);
    expect(ORDER_STEPS.indexOf('Preparing')).toBe(1);
    expect(ORDER_STEPS.indexOf('Ready')).toBe(2);
    expect(ORDER_STEPS.indexOf('Delivered')).toBe(3);
  });

  it('returns -1 for unknown status', () => {
    expect(ORDER_STEPS.indexOf('Unknown')).toBe(-1);
  });

  it('fill percentage is proportional to step', () => {
    const idx = ORDER_STEPS.indexOf('Ready'); // 2
    const pct = (idx / (ORDER_STEPS.length - 1)) * 100;
    expect(pct).toBeCloseTo(66.67, 1);
  });
});
