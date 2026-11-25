import { useEffect, useMemo, useState } from 'react';
import Garden from './components/Garden.jsx';
import Stats from './components/Stats.jsx';
import TaskList from './components/TaskList.jsx';
import TimerCard from './components/TimerCard.jsx';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import { useTimer } from './hooks/useTimer.js';
import { addPlant, nextKind, stats as gardenStats } from './logic/garden.js';
import { formatTime } from './logic/timer.js';
import { playChime } from './sound.js';

const DEFAULT_SETTINGS = { focus: 25, break: 5, sound: true };

export default function App() {
  const [settings, setSettings] = useLocalStorage('study-garden:settings', DEFAULT_SETTINGS);
  const [garden, setGarden] = useLocalStorage('study-garden:garden', []);
  const [tasks, setTasks] = useLocalStorage('study-garden:tasks', []);
  const [mode, setMode] = useState('focus');
  const [selectedId, setSelectedId] = useState(null);
  const [message, setMessage] = useState('');
  const [celebrating, setCelebrating] = useState(false);

  const kind = nextKind(garden);
  const minutes = mode === 'focus' ? settings.focus : settings.break;

  const { timer, start, pause, giveUp, reset } = useTimer(mode, minutes, (finished) => {
    if (settings.sound) playChime();
    if (finished.mode === 'focus') {
      setGarden((g) => addPlant(g, { kind: nextKind(g), minutes: settings.focus, taskId: selectedId, at: Date.now() }));
      if (selectedId) {
        setTasks((ts) => ts.map((t) => (t.id === selectedId ? { ...t, sessions: (t.sessions ?? 0) + 1 } : t)));
      }
      setCelebrating(true);
      setMessage(`Your ${kind} bloomed! Time for a short break.`);
    } else {
      setMessage('Break is over. Ready to grow another plant?');
    }
  });

  const running = timer.status === 'running';
  // After a session the new plant is already in the garden, so show that one rather than the next seed.
  const shownKind = mode === 'focus' && timer.status === 'done' ? garden[garden.length - 1]?.kind ?? kind : kind;

  useEffect(() => {
    if (!celebrating) return undefined;
    const id = setTimeout(() => setCelebrating(false), 2200);
    return () => clearTimeout(id);
  }, [celebrating]);

  useEffect(() => {
    document.title = running ? `${formatTime(timer.remaining)} · Study Garden` : 'Study Garden';
  }, [running, timer.remaining]);

  useEffect(() => {
    function onKey(e) {
      if (e.code !== 'Space') return;
      if (e.target instanceof Element && e.target.closest('input, button, select, textarea')) return;
      e.preventDefault();
      if (running) pause();
      else if (timer.status === 'idle' || timer.status === 'paused') start();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [running, timer.status, start, pause]);

  const stats = useMemo(() => gardenStats(garden, Date.now()), [garden]);
  const selectedTask = tasks.find((t) => t.id === selectedId) ?? null;

  function handleGiveUp() {
    giveUp();
    setMessage(`Your ${kind} wilted. That's okay, every gardener loses a plant sometimes.`);
  }

  function handleNext() {
    setMessage('');
    setMode(mode === 'focus' ? 'break' : 'focus');
  }

  function handleReset() {
    setMessage('');
    reset();
  }

  function addTask(text) {
    setTasks((ts) => [...ts, { id: `${Date.now()}-${ts.length}`, text, done: false, sessions: 0 }]);
  }

  function toggleTask(id) {
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
    if (id === selectedId) setSelectedId(null);
  }

  function deleteTask(id) {
    setTasks((ts) => ts.filter((t) => t.id !== id));
    if (id === selectedId) setSelectedId(null);
  }

  function updateSetting(key, value) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1>Study Garden</h1>
        <p>Focus to grow a plant. Give up early and it wilts.</p>
      </header>

      <Stats stats={stats} />

      <main className="layout">
        <div className="layout__main">
          <TimerCard
            timer={timer}
            kind={shownKind}
            restingPlant={garden[garden.length - 1]}
            task={selectedTask}
            celebrating={celebrating}
            onStart={start}
            onPause={pause}
            onGiveUp={handleGiveUp}
            onNext={handleNext}
            onReset={handleReset}
          />
          <p className="message" role="status" aria-live="polite">{message}</p>

          <fieldset className="settings" disabled={running || timer.status === 'paused'}>
            <legend className="sr-only">Settings</legend>
            <label>
              Focus
              <select value={settings.focus} onChange={(e) => updateSetting('focus', Number(e.target.value))}>
                {[15, 25, 45, 50].map((m) => <option key={m} value={m}>{m} min</option>)}
              </select>
            </label>
            <label>
              Break
              <select value={settings.break} onChange={(e) => updateSetting('break', Number(e.target.value))}>
                {[5, 10, 15].map((m) => <option key={m} value={m}>{m} min</option>)}
              </select>
            </label>
            <label className="settings__check">
              <input type="checkbox" checked={settings.sound} onChange={(e) => updateSetting('sound', e.target.checked)} />
              Sound
            </label>
          </fieldset>
        </div>

        <div className="layout__side">
          <TaskList
            tasks={tasks}
            selectedId={selectedId}
            disabled={running}
            onAdd={addTask}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onSelect={setSelectedId}
          />
          <Garden garden={garden} onClear={() => setGarden([])} />
        </div>
      </main>

      <footer className="app__footer">
        Press <kbd>Space</kbd> to start or pause. Your garden is saved in this browser.
      </footer>
    </div>
  );
}
