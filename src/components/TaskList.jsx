import { useState } from 'react';

export default function TaskList({ tasks, selectedId, disabled, onAdd, onToggle, onDelete, onSelect }) {
  const [text, setText] = useState('');

  function submit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setText('');
  }

  return (
    <section className="card tasks" aria-labelledby="tasks-heading">
      <h2 id="tasks-heading">Tasks</h2>
      <form onSubmit={submit} className="tasks__form">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What are you working on?"
          aria-label="New task"
          maxLength={80}
        />
        <button className="btn btn--primary" type="submit">Add</button>
      </form>

      {tasks.length === 0 ? (
        <p className="empty">No tasks yet. Add one and pick it before you start.</p>
      ) : (
        <ul className="tasks__list">
          {tasks.map((t) => (
            <li key={t.id} className={`task ${t.done ? 'task--done' : ''} ${t.id === selectedId ? 'task--selected' : ''}`}>
              <input type="checkbox" checked={t.done} onChange={() => onToggle(t.id)} aria-label={`Done: ${t.text}`} />
              <span className="task__text">{t.text}</span>
              <span className="task__actions">
                {t.sessions > 0 && (
                  <span className="task__count" title={`${t.sessions} focus sessions`}>
                    {t.sessions} {t.sessions === 1 ? 'plant' : 'plants'}
                  </span>
                )}
                <button
                  className="btn btn--small"
                  onClick={() => onSelect(t.id === selectedId ? null : t.id)}
                  disabled={disabled || t.done}
                  aria-pressed={t.id === selectedId}
                >
                  {t.id === selectedId ? 'Selected' : 'Focus'}
                </button>
                <button className="btn btn--small btn--ghost" onClick={() => onDelete(t.id)} aria-label={`Delete ${t.text}`}>
                  Delete
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
