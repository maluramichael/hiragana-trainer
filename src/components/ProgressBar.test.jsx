import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressBar from './ProgressBar.jsx';

describe('ProgressBar', () => {
  it('exposes a progressbar role with aria-valuenow matching the level', () => {
    render(<ProgressBar level={4} accuracy={80} coverage={60} totalKana={46} practicedKana={20} />);

    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '4');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '10');
    expect(bar).toHaveAttribute('aria-label');
  });

  it('reflects level 0 as aria-valuenow 0', () => {
    render(<ProgressBar level={0} accuracy={0} coverage={0} totalKana={46} practicedKana={0} />);

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });
});
