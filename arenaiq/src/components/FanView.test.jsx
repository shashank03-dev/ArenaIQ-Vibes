import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import FanView from './FanView';

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
  aiInsight: 'Test insight',
};

describe('FanView Component', () => {
  it('renders without crashing', () => {
    const { container } = render(React.createElement(FanView, { gameState: mockGameState }));
    expect(container).toBeInTheDocument();
  });

  it('displays correct home score', () => {
    render(React.createElement(FanView, { gameState: mockGameState }));
    expect(screen.getByText(/100/)).toBeInTheDocument();
  });

  it('displays correct away score', () => {
    render(React.createElement(FanView, { gameState: mockGameState }));
    expect(screen.getByText(/90/)).toBeInTheDocument();
  });

  it('displays live match label', () => {
    render(React.createElement(FanView, { gameState: mockGameState }));
    expect(screen.getByText(/Live Match/i)).toBeInTheDocument();
  });

  it('displays game time', () => {
    render(React.createElement(FanView, { gameState: mockGameState }));
    expect(screen.getByText(/4th Qtr 02:00/)).toBeInTheDocument();
  });

  it('shows the Gate Recommendation section', () => {
    render(React.createElement(FanView, { gameState: mockGameState }));
    expect(screen.getByText(/Gate Recommendation/i)).toBeInTheDocument();
  });

  it('recommends gate with lowest wait time', () => {
    render(React.createElement(FanView, { gameState: mockGameState }));
    // Gate C has 3 min wait, should be recommended — multiple elements may exist
    const gateCElements = screen.getAllByText(/Gate C/);
    expect(gateCElements.length).toBeGreaterThan(0);
  });

  it('shows your gate info', () => {
    render(React.createElement(FanView, { gameState: mockGameState }));
    expect(screen.getByText(/Your Gate/i)).toBeInTheDocument();
  });

  it('displays venue map', () => {
    render(React.createElement(FanView, { gameState: mockGameState }));
    expect(screen.getByText(/Venue Map/i)).toBeInTheDocument();
  });

  it('shows Navigate to Seat button', () => {
    render(React.createElement(FanView, { gameState: mockGameState }));
    expect(screen.getByText(/Navigate to Seat/i)).toBeInTheDocument();
  });

  it('shows Zone Crowd section', () => {
    render(React.createElement(FanView, { gameState: mockGameState }));
    expect(screen.getByText(/Zone Crowd/i)).toBeInTheDocument();
  });

  it('shows food order status', () => {
    render(React.createElement(FanView, { gameState: mockGameState }));
    expect(screen.getByText(/Concession/i)).toBeInTheDocument();
  });

  it('renders fan alert when provided', () => {
    const fanAlert = { message: 'North Stand is full, use Gate C.' };
    render(React.createElement(FanView, { gameState: mockGameState, fanAlert }));
    expect(screen.getByText(/North Stand is full/i)).toBeInTheDocument();
  });

  it('does not render fan alert section when fanAlert is null', () => {
    render(React.createElement(FanView, { gameState: mockGameState, fanAlert: null }));
    expect(screen.queryByText(/North Stand is full/i)).not.toBeInTheDocument();
  });

  it('shows crowd density percentages for all zones', () => {
    render(React.createElement(FanView, { gameState: mockGameState }));
    // North=40%, South=50%, East=20%, West=70%
    expect(screen.getByText(/40%/)).toBeInTheDocument();
    expect(screen.getByText(/50%/)).toBeInTheDocument();
    expect(screen.getByText(/20%/)).toBeInTheDocument();
    expect(screen.getByText(/70%/)).toBeInTheDocument();
  });

  it('shows critical tip when north density exceeds 85%', () => {
    const criticalState = {
      ...mockGameState,
      zones: {
        ...mockGameState.zones,
        North: { density: 91, status: 'critical' },
      },
    };
    render(React.createElement(FanView, { gameState: criticalState }));
    expect(screen.getByText(/North is/i)).toBeInTheDocument();
  });

  it('does not show critical tip when north density is normal', () => {
    render(React.createElement(FanView, { gameState: mockGameState }));
    expect(screen.queryByText(/North is/i)).not.toBeInTheDocument();
  });

  it('shows min wait text', () => {
    render(React.createElement(FanView, { gameState: mockGameState }));
    // Multiple 'min wait' labels exist (best gate + your gate)
    const minWaits = screen.getAllByText(/min wait/i);
    expect(minWaits.length).toBeGreaterThan(0);
  });

  it('renders all zone crowd rings', () => {
    render(React.createElement(FanView, { gameState: mockGameState }));
    expect(screen.getByText(/North/)).toBeInTheDocument();
    expect(screen.getByText(/South/)).toBeInTheDocument();
    expect(screen.getByText(/East/)).toBeInTheDocument();
    expect(screen.getByText(/West/)).toBeInTheDocument();
  });

  it('renders with high scoring game state', () => {
    const highScoreState = { ...mockGameState, score: { home: 200, away: 199 } };
    render(React.createElement(FanView, { gameState: highScoreState }));
    expect(screen.getByText(/200/)).toBeInTheDocument();
    expect(screen.getByText(/199/)).toBeInTheDocument();
  });
});
