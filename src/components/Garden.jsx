import { useState } from 'react';
import Plant from './Plant.jsx';

export default function Garden({ garden, onClear }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <section className="card garden" aria-labelledby="garden-heading">
      <div className="card__header">
        <h2 id="garden-heading">My garden</h2>
        {garden.length > 0 &&
          (confirming ? (
            <span className="confirm">
              Clear all plants?
              <button className="btn btn--small btn--danger" onClick={() => { onClear(); setConfirming(false); }}>Yes</button>
              <button className="btn btn--small" onClick={() => setConfirming(false)}>No</button>
            </span>
          ) : (
            <button className="btn btn--small btn--ghost" onClick={() => setConfirming(true)}>Clear</button>
          ))}
      </div>

      {garden.length === 0 ? (
        <p className="empty">Your garden is empty. Finish a focus session to grow your first plant.</p>
      ) : (
        <ul className="garden__grid">
          {garden.map((p) => {
            const when = new Date(p.at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
            return (
              <li key={p.id} title={`${p.kind}, ${p.minutes} min, ${when}`}>
                <Plant kind={p.kind} size={64} label={`${p.kind} grown on ${when}`} />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
