export default function SceneBackground() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 390 844"
      preserveAspectRatio="xMidYMid slice"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <defs>
        {/* Sky gradient */}
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#87ceeb" />
          <stop offset="55%" stopColor="#b8e0f7" />
          <stop offset="100%" stopColor="#d4eefc" />
        </linearGradient>

        {/* Sun glow */}
        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff7a0" stopOpacity="1" />
          <stop offset="40%" stopColor="#ffe566" stopOpacity="1" />
          <stop offset="100%" stopColor="#ffcc00" stopOpacity="0" />
        </radialGradient>

        {/* Field green gradient */}
        <linearGradient id="field" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4caf50" />
          <stop offset="100%" stopColor="#2e7d32" />
        </linearGradient>

        {/* Distant hills */}
        <linearGradient id="hills" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#66bb6a" />
          <stop offset="100%" stopColor="#388e3c" />
        </linearGradient>

        {/* Lake gradient */}
        <linearGradient id="lake" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4fc3f7" />
          <stop offset="100%" stopColor="#0288d1" />
        </linearGradient>

        {/* Solar panel face */}
        <linearGradient id="panelFace" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1565c0" />
          <stop offset="50%" stopColor="#1976d2" />
          <stop offset="100%" stopColor="#0d47a1" />
        </linearGradient>

        {/* Solar panel glint */}
        <linearGradient id="panelGlint" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        <filter id="lakeShadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0277bd" floodOpacity="0.4" />
        </filter>

        <filter id="sunBlur">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>

      {/* ── SKY ── */}
      <rect width="390" height="844" fill="url(#sky)" />

      {/* ── CLOUDS ── */}
      <g opacity="0.85">
        {/* Cloud 1 */}
        <ellipse cx="72" cy="90" rx="42" ry="18" fill="white" />
        <ellipse cx="100" cy="80" rx="34" ry="22" fill="white" />
        <ellipse cx="130" cy="88" rx="30" ry="16" fill="white" />
        <ellipse cx="54" cy="98" rx="24" ry="13" fill="white" />

        {/* Cloud 2 */}
        <ellipse cx="270" cy="60" rx="35" ry="14" fill="white" />
        <ellipse cx="296" cy="52" rx="28" ry="18" fill="white" />
        <ellipse cx="320" cy="62" rx="24" ry="13" fill="white" />
        <ellipse cx="254" cy="66" rx="20" ry="11" fill="white" />

        {/* Cloud 3 */}
        <ellipse cx="340" cy="130" rx="28" ry="11" fill="white" opacity="0.7" />
        <ellipse cx="360" cy="124" rx="20" ry="14" fill="white" opacity="0.7" />
        <ellipse cx="378" cy="132" rx="16" ry="10" fill="white" opacity="0.7" />
      </g>

      {/* ── SUN ── */}
      {/* Soft outer glow */}
      <circle cx="68" cy="140" r="55" fill="url(#sunGlow)" filter="url(#sunBlur)" opacity="0.6" />
      {/* Main disc */}
      <circle cx="68" cy="140" r="32" fill="#ffe566" />
      <circle cx="68" cy="140" r="26" fill="#fff176" />
      {/* Sun rays */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = 68 + 34 * Math.cos(rad);
        const y1 = 140 + 34 * Math.sin(rad);
        const x2 = 68 + 46 * Math.cos(rad);
        const y2 = 140 + 46 * Math.sin(rad);
        return (
          <line
            key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="#ffd600" strokeWidth="3" strokeLinecap="round"
          />
        );
      })}

      {/* ── DISTANT HILLS ── */}
      <path d="M0,430 Q80,370 160,395 Q230,420 310,375 Q360,355 390,390 L390,844 L0,844 Z"
        fill="url(#hills)" opacity="0.5" />

      {/* ── FIELD ── */}
      <path d="M0,480 Q100,455 200,470 Q300,485 390,465 L390,844 L0,844 Z"
        fill="url(#field)" />

      {/* Field texture — subtle horizontal stripes */}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <line key={i}
          x1="0" y1={510 + i * 28} x2="390" y2={510 + i * 28}
          stroke="#43a047" strokeWidth="1.5" opacity="0.35" />
      ))}

      {/* ── LAKE ── */}
      {/* Reflection glow */}
      <ellipse cx="310" cy="568" rx="72" ry="22" fill="#29b6f6" opacity="0.25" filter="url(#lakeShadow)" />
      {/* Lake body */}
      <ellipse cx="310" cy="558" rx="68" ry="18" fill="url(#lake)" filter="url(#lakeShadow)" />
      {/* Shore edge */}
      <ellipse cx="310" cy="558" rx="68" ry="18" fill="none" stroke="#0277bd" strokeWidth="1.5" opacity="0.4" />
      {/* Lake shimmer lines */}
      <line x1="265" y1="554" x2="310" y2="552" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.45" />
      <line x1="280" y1="560" x2="340" y2="557" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.35" />
      <line x1="320" y1="553" x2="355" y2="551" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
      {/* Sky reflection in lake */}
      <ellipse cx="310" cy="555" rx="60" ry="12" fill="#87ceeb" opacity="0.18" />

      {/* ── SOLAR PANELS — far row (smaller, behind) ── */}
      <SolarPanel x={20}  y={430} w={52} h={30} tilt={0.28} />
      <SolarPanel x={80}  y={425} w={52} h={30} tilt={0.28} />
      <SolarPanel x={140} y={432} w={52} h={30} tilt={0.28} />

      {/* ── SOLAR PANELS — near row (larger, front) ── */}
      <SolarPanel x={22}  y={495} w={68} h={40} tilt={0.32} />
      <SolarPanel x={100} y={490} w={68} h={40} tilt={0.32} />
      <SolarPanel x={178} y={498} w={68} h={40} tilt={0.32} />

      {/* ── GRASS BLADES (foreground) ── */}
      {[10, 28, 52, 78, 105, 130, 160, 200, 230, 255, 285, 315, 345, 370, 388].map((x, i) => (
        <g key={i}>
          <path d={`M${x},844 Q${x - 4},${820 + (i % 3) * 5} ${x + 2},${800 + (i % 4) * 8}`}
            stroke="#2e7d32" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d={`M${x + 5},844 Q${x + 9},${818 + (i % 2) * 6} ${x + 3},${802 + (i % 3) * 7}`}
            stroke="#388e3c" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </g>
      ))}
    </svg>
  );
}

function SolarPanel({ x, y, w, h, tilt }: { x: number; y: number; w: number; h: number; tilt: number }) {
  const th = h * tilt; // top-side foreshortening
  // Panel face (parallelogram, tilted toward viewer)
  const pts = `${x},${y + th} ${x + w},${y} ${x + w},${y + h} ${x},${y + h + th}`;
  // Bottom support post
  const midX = x + w / 2;
  const postTop = y + h + th;

  return (
    <g>
      {/* Post */}
      <rect x={midX - 2} y={postTop} width={4} height={14} fill="#546e7a" rx="1" />
      {/* Base */}
      <ellipse cx={midX} cy={postTop + 14} rx={8} ry={3} fill="#455a64" opacity="0.6" />

      {/* Panel body */}
      <polygon points={pts} fill="url(#panelFace)" />

      {/* Grid lines */}
      {[1, 2].map((col) => {
        const fx = x + (w / 3) * col;
        return (
          <line
            key={col}
            x1={fx} y1={y + th * (1 - col / 3)}
            x2={fx} y2={y + h + th * (1 - col / 3)}
            stroke="#1a237e" strokeWidth="0.8" opacity="0.6"
          />
        );
      })}
      {[1, 2, 3].map((row) => {
        const fy = y + (h / 4) * row;
        const leftX = x;
        const leftY = fy + th;
        const rightX = x + w;
        const rightY = fy;
        return (
          <line key={row}
            x1={leftX} y1={leftY} x2={rightX} y2={rightY}
            stroke="#1a237e" strokeWidth="0.8" opacity="0.6"
          />
        );
      })}

      {/* Glint */}
      <polygon points={pts} fill="url(#panelGlint)" />
    </g>
  );
}
