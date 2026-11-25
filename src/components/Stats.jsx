export default function Stats({ stats }) {
  const items = [
    ['Today', `${stats.todayPlants} ${stats.todayPlants === 1 ? 'plant' : 'plants'}`],
    ['Focused today', `${stats.todayMinutes} min`],
    ['Streak', `${stats.streak} ${stats.streak === 1 ? 'day' : 'days'}`],
    ['All time', `${stats.totalPlants} plants`],
  ];
  return (
    <dl className="stats">
      {items.map(([label, value]) => (
        <div key={label} className="stats__item">
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
