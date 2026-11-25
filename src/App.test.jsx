import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App.jsx';

function advance(ms) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

describe('App', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'setTimeout', 'clearTimeout', 'Date'] });
    vi.setSystemTime(new Date(2026, 10, 25, 9, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows an empty garden and a seed to plant', () => {
    render(<App />);
    expect(screen.getByText(/your garden is empty/i)).toBeInTheDocument();
    expect(screen.getByRole('timer')).toHaveTextContent('25:00');
    expect(screen.getByRole('img', { name: 'seed tulip' })).toBeInTheDocument();
  });

  it('grows a plant during a focus session and adds it to the garden', () => {
    render(<App />);
    fireEvent.change(screen.getByRole('combobox', { name: 'Focus' }), { target: { value: '15' } });
    fireEvent.click(screen.getByRole('button', { name: 'Plant a seed' }));

    advance(8 * 60_000);
    expect(screen.getByRole('timer')).toHaveTextContent('07:00');
    expect(screen.getByRole('img', { name: 'leaves tulip' })).toBeInTheDocument();

    advance(7 * 60_000);
    expect(screen.getByRole('status')).toHaveTextContent('Your tulip bloomed!');
    expect(screen.getByRole('img', { name: 'bloom tulip' })).toBeInTheDocument();

    const garden = screen.getByRole('region', { name: 'My garden' });
    expect(within(garden).getAllByRole('img')).toHaveLength(1);
    expect(screen.getByText('15 min', { selector: 'dd' })).toBeInTheDocument();
  });

  it('wilts the plant when giving up and adds nothing to the garden', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Plant a seed' }));
    advance(60_000);
    fireEvent.click(screen.getByRole('button', { name: 'Give up' }));

    expect(screen.getByRole('img', { name: /wilted tulip/ })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('wilted');
    expect(screen.getByText(/your garden is empty/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(screen.getByRole('timer')).toHaveTextContent('25:00');
  });

  it('pauses and resumes without losing time', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Plant a seed' }));
    advance(60_000);
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
    advance(10 * 60_000);
    expect(screen.getByRole('timer')).toHaveTextContent('24:00');
    fireEvent.click(screen.getByRole('button', { name: 'Keep growing' }));
    advance(60_000);
    expect(screen.getByRole('timer')).toHaveTextContent('23:00');
  });

  it('counts finished sessions on the selected task', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText('New task'), { target: { value: 'Revise C pointers' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    fireEvent.click(screen.getByRole('button', { name: 'Focus' }));
    expect(screen.getByText('Focusing on: Revise C pointers')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Plant a seed' }));
    advance(25 * 60_000);
    expect(screen.getByText('1 plant', { selector: '.task__count' })).toBeInTheDocument();
  });

  it('moves to a break after a session and back again', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Plant a seed' }));
    advance(25 * 60_000);
    fireEvent.click(screen.getByRole('button', { name: 'Take a break' }));

    expect(screen.getByRole('heading', { name: 'Break' })).toBeInTheDocument();
    expect(screen.getByRole('timer')).toHaveTextContent('05:00');
    fireEvent.click(screen.getByRole('button', { name: 'Start break' }));
    advance(5 * 60_000);
    fireEvent.click(screen.getByRole('button', { name: 'Plant another seed' }));
    expect(screen.getByRole('img', { name: 'seed daisy' })).toBeInTheDocument();
  });

  it('saves the garden and tasks between visits', () => {
    const { unmount } = render(<App />);
    fireEvent.change(screen.getByLabelText('New task'), { target: { value: 'Read DBC spec' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    fireEvent.click(screen.getByRole('button', { name: 'Plant a seed' }));
    advance(25 * 60_000);
    unmount();

    render(<App />);
    expect(screen.getByText('Read DBC spec')).toBeInTheDocument();
    const garden = screen.getByRole('region', { name: 'My garden' });
    expect(within(garden).getAllByRole('img')).toHaveLength(1);
  });

  it('clears the garden only after confirming', () => {
    window.localStorage.setItem(
      'study-garden:garden',
      JSON.stringify([{ id: '1', kind: 'daisy', minutes: 25, taskId: null, at: Date.now() }]),
    );
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    fireEvent.click(screen.getByRole('button', { name: 'No' }));
    expect(screen.queryByText(/your garden is empty/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    fireEvent.click(screen.getByRole('button', { name: 'Yes' }));
    expect(screen.getByText(/your garden is empty/i)).toBeInTheDocument();
  });

  it('starts and pauses with the space bar', () => {
    render(<App />);
    fireEvent.keyDown(window, { code: 'Space' });
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
    fireEvent.keyDown(window, { code: 'Space' });
    expect(screen.getByRole('button', { name: 'Keep growing' })).toBeInTheDocument();
  });

  it('survives storage that throws', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    render(<App />);
    expect(screen.getByText(/your garden is empty/i)).toBeInTheDocument();
    spy.mockRestore();
  });
});
