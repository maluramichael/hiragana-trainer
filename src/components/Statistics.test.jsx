import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18n from '../i18n/i18n.js';
import Statistics from './Statistics.jsx';
import { updateKanaStatistics } from '../utils/statisticsManager.js';

// The import trigger uses an existing translated label; resolve it through the
// live i18n instance so the query matches whatever language is active.
const importTriggerName = () => i18n.t('statistics.importCode');

// Seed a couple of practiced hiragana so the table has rows to render.
const seed = () => {
  updateKanaStatistics([
    { kana: 'あ', romaji: 'a', isCorrect: true, responseTime: 1200 },
    { kana: 'い', romaji: 'i', isCorrect: false, responseTime: 3000 },
    { kana: 'う', romaji: 'u', isCorrect: true, responseTime: 800 },
  ]);
};

describe('Statistics', () => {
  beforeEach(() => {
    localStorage.clear();
    seed();
  });

  it('#48: sort headers are focusable buttons and <th> carries aria-sort', async () => {
    const user = userEvent.setup();
    render(<Statistics onBack={() => {}} />);

    // The romaji column is the default sort column.
    const columnHeaders = screen.getAllByRole('columnheader');
    // Every header contains a real button as its click target.
    columnHeaders.forEach((th) => {
      expect(within(th).getByRole('button')).toBeInTheDocument();
    });

    // Exactly one header is currently sorted (ascending by default).
    const sorted = columnHeaders.filter((th) => th.getAttribute('aria-sort') !== 'none');
    expect(sorted).toHaveLength(1);
    expect(sorted[0]).toHaveAttribute('aria-sort', 'ascending');

    // Activating that header's button via keyboard toggles the direction.
    within(sorted[0]).getByRole('button').focus();
    await user.keyboard('{Enter}');
    expect(sorted[0]).toHaveAttribute('aria-sort', 'descending');
  });

  it('#67 + #50: opening import shows a dialog with a named textarea, ESC closes it', async () => {
    const user = userEvent.setup();
    render(<Statistics onBack={() => {}} />);

    await user.click(screen.getByRole('button', { name: importTriggerName() }));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby');

    // #50: the textarea has an accessible name (aria-label).
    const textarea = within(dialog).getByRole('textbox');
    expect(textarea).toHaveAccessibleName();

    // #67: ESC closes the modal.
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('#82: typing in the import textarea does not disturb the table rows', async () => {
    const user = userEvent.setup();
    render(<Statistics onBack={() => {}} />);

    const rowsBefore = screen.getAllByRole('row').length;

    await user.click(screen.getByRole('button', { name: importTriggerName() }));

    const textarea = within(screen.getByRole('dialog')).getByRole('textbox');
    await user.type(textarea, 'some-code');
    expect(textarea).toHaveValue('some-code');

    // Table behind the modal still holds the same rows.
    expect(screen.getAllByRole('row').length).toBe(rowsBefore);
  });
});
