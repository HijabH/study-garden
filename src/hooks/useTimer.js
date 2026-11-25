import { useCallback, useEffect, useRef, useState } from 'react';
import * as T from '../logic/timer.js';

export function useTimer(mode, minutes, onDone) {
  const [timer, setTimer] = useState(() => T.createTimer(mode, minutes));
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    setTimer(T.createTimer(mode, minutes));
  }, [mode, minutes]);

  useEffect(() => {
    if (timer.status !== 'running') return undefined;
    const id = setInterval(() => setTimer((t) => T.tick(t, Date.now())), 250);
    return () => clearInterval(id);
  }, [timer.status]);

  useEffect(() => {
    if (timer.status === 'done') onDoneRef.current?.(timer);
  }, [timer]);

  return {
    timer,
    start: useCallback(() => setTimer((t) => T.start(t, Date.now())), []),
    pause: useCallback(() => setTimer((t) => T.pause(t, Date.now())), []),
    giveUp: useCallback(() => setTimer((t) => T.giveUp(t)), []),
    reset: useCallback(() => setTimer(T.createTimer(mode, minutes)), [mode, minutes]),
  };
}
