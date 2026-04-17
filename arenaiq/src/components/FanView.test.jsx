import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FanView from './FanView';

describe('FanView Component', () => {
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

  it('renders without crashing', () => {
    const { container } = render(React.createElement(FanView, { gameState: mockGameState }));
    expect(container).toBeInTheDocument();
  });

  it('displays correct score', () => {
    render(React.createElement(FanView, { gameState: mockGameState }));
    expect(screen.getByText(/100/)).toBeInTheDocument();
    expect(screen.getByText(/90/)).toBeInTheDocument();
  });
});
