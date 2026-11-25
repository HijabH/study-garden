import { describe, expect, it } from 'vitest';
import { PLANT_KINDS, addPlant, nextKind, stats } from './garden.js';

const day = (d, h = 12) => new Date(2026, 10, d, h).getTime();

function gardenOn(...days) {
  return days.reduce((g, d) => addPlant(g, { kind: nextKind(g), minutes: 25, at: day(d) }), []);
}

describe('garden', () => {
  it('rotates through the plant kinds', () => {
    const g = gardenOn(...PLANT_KINDS.map(() => 1));
    expect(g.map((p) => p.kind)).toEqual(PLANT_KINDS);
    expect(nextKind(g)).toBe(PLANT_KINDS[0]);
  });

  it('adds plants without changing the old garden', () => {
    const before = [];
    const after = addPlant(before, { kind: 'tulip', minutes: 25, taskId: 't1', at: day(1) });
    expect(before).toHaveLength(0);
    expect(after[0]).toMatchObject({ kind: 'tulip', minutes: 25, taskId: 't1' });
  });

  it('counts today and all time', () => {
    const s = stats(gardenOn(20, 25, 25), day(25, 18));
    expect(s).toMatchObject({ todayPlants: 2, todayMinutes: 50, totalPlants: 3, totalMinutes: 75 });
  });

  it('counts a streak of consecutive days', () => {
    expect(stats(gardenOn(22, 23, 24, 25), day(25)).streak).toBe(4);
    expect(stats(gardenOn(21, 23, 24, 25), day(25)).streak).toBe(3);
  });

  it('keeps yesterday\'s streak alive until today ends', () => {
    expect(stats(gardenOn(23, 24), day(25)).streak).toBe(2);
    expect(stats(gardenOn(22, 23), day(25)).streak).toBe(0);
  });

  it('handles an empty garden', () => {
    expect(stats([], day(25))).toEqual({ todayPlants: 0, todayMinutes: 0, totalPlants: 0, totalMinutes: 0, streak: 0 });
  });
});
