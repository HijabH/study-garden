export const PLANT_KINDS = ['tulip', 'daisy', 'cactus', 'mushroom', 'lavender'];

export function nextKind(garden) {
  return PLANT_KINDS[garden.length % PLANT_KINDS.length];
}

export function dayKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function addPlant(garden, { kind, minutes, taskId = null, at }) {
  return [...garden, { id: `${at}-${garden.length}`, kind, minutes, taskId, at }];
}

export function stats(garden, now) {
  const today = dayKey(now);
  const days = new Set(garden.map((p) => dayKey(p.at)));

  let streak = 0;
  const cursor = new Date(now);
  // A streak still counts if today has no plant yet, as long as yesterday had one.
  if (!days.has(today)) cursor.setDate(cursor.getDate() - 1);
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const todays = garden.filter((p) => dayKey(p.at) === today);
  return {
    todayPlants: todays.length,
    todayMinutes: todays.reduce((sum, p) => sum + p.minutes, 0),
    totalPlants: garden.length,
    totalMinutes: garden.reduce((sum, p) => sum + p.minutes, 0),
    streak,
  };
}
