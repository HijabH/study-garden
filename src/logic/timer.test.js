import { describe, expect, it } from 'vitest';
import { createTimer, formatTime, giveUp, growthStage, pause, progress, start, tick } from './timer.js';

const T0 = 1_000_000;

describe('timer', () => {
  it('starts idle with the full duration', () => {
    const t = createTimer('focus', 25);
    expect(t).toMatchObject({ mode: 'focus', status: 'idle', duration: 1500, remaining: 1500 });
  });

  it('counts down from a fixed end time', () => {
    let t = start(createTimer('focus', 1), T0);
    t = tick(t, T0 + 10_400);
    expect(t.remaining).toBe(50);
    expect(t.status).toBe('running');
  });

  it('jumps correctly after a long gap, like a background tab', () => {
    const t = tick(start(createTimer('focus', 25), T0), T0 + 20 * 60_000);
    expect(t.remaining).toBe(300);
  });

  it('finishes at zero', () => {
    const t = tick(start(createTimer('break', 5), T0), T0 + 5 * 60_000);
    expect(t).toMatchObject({ status: 'done', remaining: 0 });
  });

  it('keeps the remaining time while paused and resumes from it', () => {
    let t = start(createTimer('focus', 1), T0);
    t = pause(t, T0 + 15_000);
    expect(t).toMatchObject({ status: 'paused', remaining: 45 });

    t = tick(t, T0 + 999_000);
    expect(t.remaining).toBe(45);

    t = tick(start(t, T0 + 100_000), T0 + 110_000);
    expect(t.remaining).toBe(35);
  });

  it('ignores start while running and pause while idle', () => {
    const running = start(createTimer('focus', 1), T0);
    expect(start(running, T0 + 5000)).toBe(running);
    const idle = createTimer('focus', 1);
    expect(pause(idle, T0)).toBe(idle);
  });

  it('wilts when given up', () => {
    const t = giveUp(start(createTimer('focus', 25), T0));
    expect(t.status).toBe('wilted');
    expect(t.endsAt).toBeNull();
  });

  it('grows through the stages and blooms only when done', () => {
    const base = createTimer('focus', 10);
    const at = (remaining) => growthStage({ ...base, status: 'running', remaining });
    expect(at(600)).toBe('seed');
    expect(at(440)).toBe('sprout');
    expect(at(290)).toBe('leaves');
    expect(at(140)).toBe('bud');
    expect(at(1)).toBe('bud');
    expect(growthStage({ ...base, status: 'done', remaining: 0 })).toBe('bloom');
  });

  it('reports progress between 0 and 1', () => {
    const t = createTimer('focus', 10);
    expect(progress(t)).toBe(0);
    expect(progress({ ...t, remaining: 150 })).toBe(0.75);
  });

  it('formats minutes and seconds', () => {
    expect(formatTime(1500)).toBe('25:00');
    expect(formatTime(65)).toBe('01:05');
    expect(formatTime(0)).toBe('00:00');
  });
});
