const COLORS = {
  tulip: { petal: '#ff9eb5', dark: '#f27a99' },
  daisy: { petal: '#ffffff', dark: '#ffd36e' },
  cactus: { petal: '#ff9eb5', dark: '#7cc6a4' },
  mushroom: { petal: '#ff8a80', dark: '#fff4e8' },
  lavender: { petal: '#c9a7f2', dark: '#a983e0' },
};

function Bloom({ kind }) {
  const c = COLORS[kind];
  switch (kind) {
    case 'tulip':
      return (
        <g>
          <path d="M44 34 Q46 14 52 22 Q60 8 68 22 Q74 14 76 34 Q76 50 60 50 Q44 50 44 34Z" fill={c.petal} />
          <path d="M52 22 Q60 34 68 22" fill="none" stroke={c.dark} strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    case 'daisy':
      return (
        <g>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <ellipse key={a} cx="60" cy="20" rx="6" ry="12" fill={c.petal} stroke="#f3dfe6" transform={`rotate(${a} 60 32)`} />
          ))}
          <circle cx="60" cy="32" r="8" fill={c.dark} />
        </g>
      );
    case 'cactus':
      return (
        <g>
          <rect x="48" y="26" width="24" height="70" rx="12" fill={c.dark} />
          <rect x="34" y="48" width="12" height="24" rx="6" fill={c.dark} />
          <rect x="74" y="40" width="12" height="22" rx="6" fill={c.dark} />
          <circle cx="60" cy="24" r="7" fill={c.petal} />
          <circle cx="60" cy="24" r="3" fill="#ffd36e" />
        </g>
      );
    case 'mushroom':
      return (
        <g>
          <rect x="52" y="40" width="16" height="56" rx="7" fill={c.dark} />
          <path d="M32 46 Q34 14 60 14 Q86 14 88 46Z" fill={c.petal} />
          <circle cx="48" cy="32" r="4" fill="#fff" />
          <circle cx="66" cy="24" r="5" fill="#fff" />
          <circle cx="76" cy="38" r="3" fill="#fff" />
        </g>
      );
    default:
      return (
        <g>
          {[18, 26, 34, 42].map((y, i) => (
            <g key={y}>
              <ellipse cx={55 - i * 0.5} cy={y} rx="5" ry="4" fill={i % 2 ? c.dark : c.petal} />
              <ellipse cx={65 + i * 0.5} cy={y + 3} rx="5" ry="4" fill={i % 2 ? c.petal : c.dark} />
            </g>
          ))}
        </g>
      );
  }
}

function Growth({ kind, stage }) {
  const ownBody = kind === 'cactus' || kind === 'mushroom';
  if (stage === 'seed') return <ellipse cx="60" cy="92" rx="6" ry="4" fill="#a47551" />;
  if (stage === 'bloom' && ownBody) return <Bloom kind={kind} />;

  const top = { sprout: 74, leaves: 52, bud: 40, bloom: 40 }[stage];
  return (
    <g>
      <path d={`M60 96 Q58 ${(96 + top) / 2} 60 ${top}`} stroke="#6bbf8e" strokeWidth="4" fill="none" strokeLinecap="round" />
      <ellipse cx="50" cy={top + 14} rx="10" ry="5" fill="#8fd6a8" transform={`rotate(-25 50 ${top + 14})`} />
      <ellipse cx="70" cy={top + 10} rx="10" ry="5" fill="#8fd6a8" transform={`rotate(25 70 ${top + 10})`} />
      {stage === 'bud' && <ellipse cx="60" cy={top - 4} rx="7" ry="10" fill={COLORS[kind].petal} />}
      {stage === 'bloom' && <Bloom kind={kind} />}
    </g>
  );
}

export default function Plant({ kind = 'tulip', stage = 'bloom', wilted = false, size = 120, animate = false, label }) {
  const mood = wilted ? 'sad' : stage === 'bloom' ? 'happy' : 'calm';
  return (
    <svg
      viewBox="0 0 120 140"
      width={size}
      height={(size * 140) / 120}
      role="img"
      aria-label={label ?? `${wilted ? 'wilted' : stage} ${kind}`}
      className={`plant ${wilted ? 'plant--wilted' : ''} ${animate ? 'plant--sway' : ''}`}
    >
      <g className="plant__top">
        <Growth kind={kind} stage={stage} />
      </g>
      <path d="M30 96 H90 L84 134 Q83 138 78 138 H42 Q37 138 36 134Z" fill="#ffc9a8" />
      <rect x="26" y="92" width="68" height="10" rx="5" fill="#ffb38a" />
      <circle cx="50" cy="114" r="2.6" fill="#5b4a5e" />
      <circle cx="70" cy="114" r="2.6" fill="#5b4a5e" />
      <ellipse cx="44" cy="121" rx="4.5" ry="2.5" fill="#ff9eb5" opacity="0.7" />
      <ellipse cx="76" cy="121" rx="4.5" ry="2.5" fill="#ff9eb5" opacity="0.7" />
      {mood === 'happy' && <path d="M54 120 Q60 126 66 120" stroke="#5b4a5e" strokeWidth="2.2" fill="none" strokeLinecap="round" />}
      {mood === 'calm' && <path d="M56 121 Q60 123 64 121" stroke="#5b4a5e" strokeWidth="2.2" fill="none" strokeLinecap="round" />}
      {mood === 'sad' && <path d="M54 124 Q60 118 66 124" stroke="#5b4a5e" strokeWidth="2.2" fill="none" strokeLinecap="round" />}
    </svg>
  );
}
