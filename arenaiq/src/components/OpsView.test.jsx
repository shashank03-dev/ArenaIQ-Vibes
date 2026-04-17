import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import OpsView from './OpsView';

const mockGameState = {
  score: { home: 100, away: 90 },
  time: '4th Qtr 02:00',
  gates: {
    A: { waitTime: 5, status: 'green' },
    B: { waitTime: 12, status: 'amber' },
    C: { waitTime: 3, status: 'green' },
    D: { waitTime: 25, status: 'red' },
  },
  zones: {
    North: { density: 40, status: 'normal' },
    South: { density: 50, status: 'normal' },
    East: { density: 20, status: 'normal' },
    West: { density: 70, status: 'amber' },
  },
  alerts: [],
  foodOrders: [],
  aiInsight: 'Test AI insight from Gemini',
};

describe('OpsView Component', () => {
  it('renders without crashing', () => {
    const { container } = render(
      React.createElement(OpsView, { gameState: mockGameState, simulateRush: () => {} })
    );
    expect(container).toBeInTheDocument();
  });

  it('displays AI insights section', () => {
    render(React.createElement(OpsView, { gameState: mockGameState, simulateRush: () => {} }));
    expect(screen.getByText(/Gemini AI Insights/i)).toBeInTheDocument();
  });

  it('displays the AI insight text', () => {
    render(React.createElement(OpsView, { gameState: mockGameState, simulateRush: () => {} }));
    expect(screen.getByText(/Test AI insight from Gemini/)).toBeInTheDocument();
  });

  it('displays Zone Metrics section', () => {
    render(React.createElement(OpsView, { gameState: mockGameState, simulateRush: () => {} }));
    expect(screen.getByText(/Zone Metrics/i)).toBeInTheDocument();
  });

  it('displays zone North Stand', () => {
    render(React.createElement(OpsView, { gameState: mockGameState, simulateRush: () => {} }));
    expect(screen.getByText(/North Stand/)).toBeInTheDocument();
  });

  it('displays all zone stands', () => {
    render(React.createElement(OpsView, { gameState: mockGameState, simulateRush: () => {} }));
    expect(screen.getByText(/North Stand/)).toBeInTheDocument();
    expect(screen.getByText(/South Stand/)).toBeInTheDocument();
    expect(screen.getByText(/East Stand/)).toBeInTheDocument();
    expect(screen.getByText(/West Stand/)).toBeInTheDocument();
  });

  it('displays zone density percentages', () => {
    render(React.createElement(OpsView, { gameState: mockGameState, simulateRush: () => {} }));
    // Densities appear in multiple places (zone rows + map), use getAllByText
    const fortyPct = screen.getAllByText(/40%/);
    expect(fortyPct.length).toBeGreaterThan(0);
    const fiftyPct = screen.getAllByText(/50%/);
    expect(fiftyPct.length).toBeGreaterThan(0);
  });

  it('displays Active Alerts section', () => {
    render(React.createElement(OpsView, { gameState: mockGameState, simulateRush: () => {} }));
    // 'Active Alerts' may appear in both heading and aria labels — use getAllByText
    const alertHeadings = screen.getAllByText(/Active Alerts/i);
    expect(alertHeadings.length).toBeGreaterThan(0);
  });

  it('shows all clear message when no alerts', () => {
    render(React.createElement(OpsView, { gameState: mockGameState, simulateRush: () => {} }));
    expect(screen.getByText(/All clear/i)).toBeInTheDocument();
  });

  it('shows alert messages when alerts exist', () => {
    const stateWithAlerts = {
      ...mockGameState,
      alerts: [
        {
          id: 1,
          message: 'North Stand 91% — reroute to East Gate',
          level: 'critical',
          time: '18:30:00',
        },
      ],
    };
    render(
      React.createElement(OpsView, { gameState: stateWithAlerts, simulateRush: () => {} })
    );
    expect(screen.getByText(/North Stand 91%/)).toBeInTheDocument();
  });

  it('displays Simulate Rush Hour button', () => {
    render(React.createElement(OpsView, { gameState: mockGameState, simulateRush: () => {} }));
    expect(screen.getByText(/Simulate Rush Hour/i)).toBeInTheDocument();
  });

  it('calls simulateRush when button is clicked', () => {
    const mockSimulateRush = vi.fn();
    render(
      React.createElement(OpsView, { gameState: mockGameState, simulateRush: mockSimulateRush })
    );
    const button = screen.getByText(/Simulate Rush Hour/i);
    fireEvent.click(button);
    expect(mockSimulateRush).toHaveBeenCalledTimes(1);
  });

  it('displays gate wait times', () => {
    render(React.createElement(OpsView, { gameState: mockGameState, simulateRush: () => {} }));
    // Gate A has 5 min, Gate C has 3 min
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('displays gate labels', () => {
    render(React.createElement(OpsView, { gameState: mockGameState, simulateRush: () => {} }));
    expect(screen.getByText(/Gate A/)).toBeInTheDocument();
    expect(screen.getByText(/Gate B/)).toBeInTheDocument();
    expect(screen.getByText(/Gate C/)).toBeInTheDocument();
    expect(screen.getByText(/Gate D/)).toBeInTheDocument();
  });

  it('displays Live Crowd Density heading', () => {
    render(React.createElement(OpsView, { gameState: mockGameState, simulateRush: () => {} }));
    expect(screen.getByText(/Live Crowd Density/i)).toBeInTheDocument();
  });

  it('shows fallback message if no aiInsight', () => {
    const stateNoInsight = { ...mockGameState, aiInsight: null };
    render(
      React.createElement(OpsView, { gameState: stateNoInsight, simulateRush: () => {} })
    );
    expect(screen.getByText(/No insights available yet/i)).toBeInTheDocument();
  });

  it('renders multiple alerts correctly', () => {
    const stateWithAlerts = {
      ...mockGameState,
      alerts: [
        { id: 1, message: 'Alert One', level: 'critical', time: '18:00' },
        { id: 2, message: 'Alert Two', level: 'warning', time: '18:05' },
      ],
    };
    render(
      React.createElement(OpsView, { gameState: stateWithAlerts, simulateRush: () => {} })
    );
    expect(screen.getByText(/Alert One/)).toBeInTheDocument();
    expect(screen.getByText(/Alert Two/)).toBeInTheDocument();
  });

  it('shows simulate rush button has correct aria-label', () => {
    render(React.createElement(OpsView, { gameState: mockGameState, simulateRush: () => {} }));
    const btn = screen.getByLabelText(/Simulate Rush Hour/i);
    expect(btn).toBeInTheDocument();
  });

  it('renders correctly when gate has red status', () => {
    render(React.createElement(OpsView, { gameState: mockGameState, simulateRush: () => {} }));
    // Gate D has 25 min wait / red status
    expect(screen.getByText('25')).toBeInTheDocument();
  });
});
