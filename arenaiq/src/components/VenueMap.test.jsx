import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import VenueMap from './VenueMap';

const mockZones = {
  North: { density: 45, status: 'normal' },
  South: { density: 60, status: 'normal' },
  East: { density: 30, status: 'normal' },
  West: { density: 90, status: 'critical' },
};

describe('VenueMap Component', () => {
  it('renders all four zones', () => {
    render(<VenueMap zones={mockZones} />);
    expect(screen.getByText('NORTH')).toBeInTheDocument();
    expect(screen.getByText('SOUTH')).toBeInTheDocument();
    expect(screen.getByText('EAST')).toBeInTheDocument();
    expect(screen.getByText('WEST')).toBeInTheDocument();
  });

  it('renders density percentages when isOpsView is true', () => {
    render(<VenueMap zones={mockZones} isOpsView={true} />);
    expect(screen.getByText('45%')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
  });

  it('does not render density percentages when isOpsView is false', () => {
    render(<VenueMap zones={mockZones} isOpsView={false} />);
    expect(screen.queryByText('45%')).not.toBeInTheDocument();
  });

  it('handles missing zone data gracefully', () => {
    render(<VenueMap zones={{}} isOpsView={true} />);
    // Should fall back to 0% density
    const zeros = screen.getAllByText('0%');
    expect(zeros).toHaveLength(4);
  });
});
