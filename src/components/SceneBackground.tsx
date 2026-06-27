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
        {/* ── SKY ── */}
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#1a0533" />
          <stop offset="28%"  stopColor="#3d1060" />
          <stop offset="55%"  stopColor="#7b2d8b" />
          <stop offset="75%"  stopColor="#d4607a" />
          <stop offset="90%"  stopColor="#f4a261" />
          <stop offset="100%" stopColor="#ffd166" />
        </linearGradient>

        {/* ── AURORA bands ── */}
        <linearGradient id="aurora1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#00f5a0" stopOpacity="0" />
          <stop offset="30%"  stopColor="#00f5a0" stopOpacity="0.28" />
          <stop offset="60%"  stopColor="#00d9f5" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#00d9f5" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="aurora2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#f472b6" stopOpacity="0" />
          <stop offset="40%"  stopColor="#f472b6" stopOpacity="0.2" />
          <stop offset="70%"  stopColor="#a78bfa" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
        </linearGradient>

        {/* ── GROUND ── */}
        <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#2d6a4f" />
          <stop offset="45%"  stopColor="#1b4332" />
          <stop offset="100%" stopColor="#081c15" />
        </linearGradient>
        <linearGradient id="groundShine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#52b788" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#52b788" stopOpacity="0" />
        </linearGradient>

        {/* ── ISLANDS ── */}
        <linearGradient id="islandTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#74c69d" />
          <stop offset="55%"  stopColor="#2d6a4f" />
          <stop offset="100%" stopColor="#1b4332" />
        </linearGradient>
        <linearGradient id="islandBot" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#6b3fa0" />
          <stop offset="100%" stopColor="#3a1f5c" />
        </linearGradient>
        <linearGradient id="islandTopR" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#95d5b2" />
          <stop offset="55%"  stopColor="#40916c" />
          <stop offset="100%" stopColor="#1b4332" />
        </linearGradient>

        {/* ── SOLAR PANELS ── */}
        <linearGradient id="panelGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#ffd166" />
          <stop offset="50%"  stopColor="#f4a261" />
          <stop offset="100%" stopColor="#e76f51" />
        </linearGradient>
        <linearGradient id="panelGlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#fff9c4" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#fff9c4" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="panelHalo" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#ffd166" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffd166" stopOpacity="0" />
        </radialGradient>

        {/* ── SUN ── */}
        <radialGradient id="sunCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#fffde7" />
          <stop offset="40%"  stopColor="#ffd166" />
          <stop offset="100%" stopColor="#f4a261" stopOpacity="0" />
        </radialGradient>

        {/* ── WATER ── */}
        <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#a78bfa" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#5b21b6" stopOpacity="0.95" />
        </linearGradient>

        {/* ── CRYSTAL glow ── */}
        <radialGradient id="crystalGlow" cx="50%" cy="30%" r="60%">
          <stop offset="0%"   stopColor="#e0aaff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#9d4edd" stopOpacity="0.2" />
        </radialGradient>

        {/* ── SPARKLE ── */}
        <radialGradient id="sparkle" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="1" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>

        {/* ── CLOUD ── */}
        <filter id="softBloom" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="glow4" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" result="g"/>
          <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="glow8" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="8" result="g"/>
          <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* ══════════════ SKY ══════════════ */}
      <rect width="390" height="844" fill="url(#sky)" />

      {/* ── AURORA bands ── */}
      <path d="M-20,160 Q100,130 220,155 Q320,175 420,145 L420,195 Q320,225 220,205 Q100,180 -20,210 Z"
        fill="url(#aurora1)" />
      <path d="M-20,210 Q80,185 200,215 Q310,240 420,205 L420,250 Q310,285 200,260 Q80,230 -20,255 Z"
        fill="url(#aurora2)" />

      {/* ── STARS ── */}
      {[
        [30,28],[68,14],[110,40],[155,18],[198,32],[245,10],[288,25],[335,15],[372,38],
        [18,65],[52,80],[94,55],[140,72],[185,48],[230,70],[275,52],[318,68],[360,44],
        [42,105],[88,95],[135,115],[182,100],[228,88],[272,108],[315,92],[358,112],
        [25,145],[72,135],[118,155],[165,140],[212,125],[258,148],[302,132],[348,150],
      ].map(([x,y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.5 : 1} fill="white"
          opacity={0.5 + (i % 5) * 0.1} />
      ))}
      {/* Bright star twinkles */}
      {[[55,22],[178,38],[305,16],[88,75],[240,60]].map(([x,y],i) => (
        <g key={i}>
          <line x1={x-4} y1={y} x2={x+4} y2={y} stroke="white" strokeWidth="0.8" opacity="0.9" />
          <line x1={x} y1={y-4} x2={x} y2={y+4} stroke="white" strokeWidth="0.8" opacity="0.9" />
          <circle cx={x} cy={y} r="1.5" fill="white" />
        </g>
      ))}

      {/* ── SUN ── */}
      <circle cx="195" cy="310" r="80" fill="url(#sunCore)" opacity="0.28" />
      <circle cx="195" cy="310" r="45" fill="#ffd166" opacity="0.18" />
      <circle cx="195" cy="310" r="28" fill="#fffde7" opacity="0.55" />

      {/* ══════════════ MAGICAL CLOUDS ══════════════ */}
      <g opacity="0.88">
        {/* Cloud L */}
        <ellipse cx="60"  cy="185" rx="48" ry="16" fill="white" opacity="0.18" />
        <ellipse cx="82"  cy="175" rx="36" ry="22" fill="white" opacity="0.22" />
        <ellipse cx="108" cy="183" rx="32" ry="18" fill="white" opacity="0.2" />
        <ellipse cx="46"  cy="190" rx="26" ry="13" fill="white" opacity="0.15" />
        {/* Cloud R */}
        <ellipse cx="300" cy="168" rx="52" ry="17" fill="white" opacity="0.18" />
        <ellipse cx="322" cy="158" rx="38" ry="24" fill="white" opacity="0.22" />
        <ellipse cx="350" cy="168" rx="30" ry="17" fill="white" opacity="0.2" />
        <ellipse cx="280" cy="173" rx="24" ry="12" fill="white" opacity="0.14" />
        {/* Wispy top cloud */}
        <ellipse cx="195" cy="150" rx="60" ry="11" fill="white" opacity="0.1" />
        <ellipse cx="210" cy="145" rx="40" ry="14" fill="white" opacity="0.1" />
      </g>

      {/* ══════════════ DISTANT MOUNTAINS ══════════════ */}
      <path d="M0,480 Q40,430 90,455 Q130,475 170,445 Q210,415 250,450 Q290,480 330,445 Q365,415 390,450 L390,530 L0,530 Z"
        fill="#3d1060" opacity="0.45" />
      <path d="M0,510 Q50,470 100,490 Q145,505 185,478 Q225,452 265,478 Q305,505 345,475 Q372,455 390,472 L390,545 L0,545 Z"
        fill="#5b2191" opacity="0.5" />

      {/* ══════════════ GROUND BASE ══════════════ */}
      <path d="M0,620 Q80,595 160,608 Q240,620 320,605 Q360,598 390,610 L390,844 L0,844 Z"
        fill="url(#ground)" />
      <path d="M0,620 Q80,595 160,608 Q240,620 320,605 Q360,598 390,610 L390,660 Q360,648 320,655 Q240,670 160,658 Q80,645 0,670 Z"
        fill="url(#groundShine)" />

      {/* ── Ground magical glow patches ── */}
      {[[80,638],[195,632],[310,640],[140,665],[265,658]].map(([cx,cy],i) => (
        <ellipse key={i} cx={cx} cy={cy} rx={30+i*6} ry={8+i*2}
          fill="#52b788" opacity="0.12" />
      ))}

      {/* ══════════════ WATER / MAGICAL LAKE ══════════════ */}
      <ellipse cx="195" cy="658" rx="110" ry="28" fill="url(#water)" opacity="0.7" />
      <ellipse cx="195" cy="654" rx="105" ry="22" fill="#c4b5fd" opacity="0.18" />
      {/* Shimmer */}
      {[[148,652],[175,647],[210,650],[238,654],[260,648]].map(([x,y],i) => (
        <line key={i} x1={x} y1={y} x2={x+18+i*4} y2={y} stroke="white"
          strokeWidth="1.2" strokeLinecap="round" opacity={0.28+i*0.06} />
      ))}
      {/* Sun reflection in lake */}
      <ellipse cx="195" cy="656" rx="60" ry="10" fill="#ffd166" opacity="0.22" />

      {/* ══════════════ LEFT FLOATING ISLAND ══════════════ */}
      <g>
        {/* Island body */}
        <ellipse cx="72" cy="522" rx="68" ry="18" fill="#2d6a4f" />
        <path d="M10,522 Q20,498 40,492 Q60,487 80,490 Q100,493 115,500 Q130,508 134,522 Z"
          fill="url(#islandTop)" />
        <path d="M10,522 Q15,540 30,548 Q52,558 72,556 Q92,558 114,548 Q128,540 134,522 Z"
          fill="url(#islandBot)" />
        {/* Floating soil bottom tendrils */}
        <path d="M35,552 Q30,568 38,578 Q42,572 44,558 Z" fill="#3a1f5c" opacity="0.6" />
        <path d="M72,556 Q70,574 78,582 Q82,572 80,560 Z" fill="#3a1f5c" opacity="0.6" />
        <path d="M105,550 Q108,566 102,576 Q98,568 100,554 Z" fill="#3a1f5c" opacity="0.6" />

        {/* ── Solar Panels on left island ── */}
        <MagicPanel x={22} y={493} w={34} h={20} />
        <MagicPanel x={62} y={488} w={34} h={20} />
        <MagicPanel x={100} y={494} w={28} h={18} />

        {/* Magical crystal left */}
        <polygon points="30,492 35,472 40,492" fill="url(#crystalGlow)" opacity="0.9" />
        <polygon points="31,492 35,477 39,492" fill="#e0aaff" opacity="0.5" />
        <line x1="35" y1="472" x2="35" y2="466" stroke="#e0aaff" strokeWidth="1.5" opacity="0.7" />

        {/* Magical tree left */}
        <MagicTree x={115} y={492} h={52} color="#52b788" glowColor="#b7e4c7" />

        {/* Glowing flowers */}
        <GlowFlower x={48} y={492} color="#f9a8d4" />
        <GlowFlower x={90} y={489} color="#fde68a" />

        {/* Island halo glow */}
        <ellipse cx="72" cy="518" rx="70" ry="20"
          fill="none" stroke="#52b788" strokeWidth="2" opacity="0.2" />
      </g>

      {/* ══════════════ RIGHT FLOATING ISLAND ══════════════ */}
      <g>
        <ellipse cx="318" cy="510" rx="72" ry="19" fill="#40916c" />
        <path d="M252,510 Q260,484 282,478 Q302,472 320,476 Q340,480 355,488 Q368,496 384,510 Z"
          fill="url(#islandTopR)" />
        <path d="M252,510 Q256,530 272,540 Q292,550 318,548 Q344,550 362,540 Q378,530 384,510 Z"
          fill="url(#islandBot)" />
        {/* Tendrils */}
        <path d="M268,546 Q264,562 272,572 Q276,564 274,548 Z" fill="#3a1f5c" opacity="0.6" />
        <path d="M318,548 Q316,566 324,575 Q328,565 326,550 Z" fill="#3a1f5c" opacity="0.6" />
        <path d="M362,542 Q366,558 358,568 Q354,560 356,546 Z" fill="#3a1f5c" opacity="0.6" />

        {/* ── Solar Panels on right island ── */}
        <MagicPanel x={255} y={480} w={36} h={22} />
        <MagicPanel x={296} y={474} w={36} h={22} />
        <MagicPanel x={338} y={480} w={36} h={22} />

        {/* Magical crystal right */}
        <polygon points="375,480 381,456 387,480" fill="url(#crystalGlow)" opacity="0.9" />
        <polygon points="376,480 381,462 386,480" fill="#c4b5fd" opacity="0.5" />
        <line x1="381" y1="456" x2="381" y2="448" stroke="#c4b5fd" strokeWidth="1.5" opacity="0.7" />

        {/* Magical trees right */}
        <MagicTree x={258} y={478} h={48} color="#74c69d" glowColor="#d8f3dc" />
        <MagicTree x={380} y={480} h={44} color="#52b788" glowColor="#b7e4c7" />

        {/* Glowing flowers */}
        <GlowFlower x={278} y={477} color="#fde68a" />
        <GlowFlower x={360} y={480} color="#f9a8d4" />
        <GlowFlower x={340} y={477} color="#a5f3fc" />

        <ellipse cx="318" cy="506" rx="74" ry="21"
          fill="none" stroke="#74c69d" strokeWidth="2" opacity="0.2" />
      </g>

      {/* ══════════════ SMALL DISTANT FLOATING ISLANDS ══════════════ */}
      {/* Far small island center-left */}
      <g opacity="0.7">
        <ellipse cx="152" cy="418" rx="38" ry="10" fill="#2d6a4f" />
        <path d="M118,418 Q122,404 135,400 Q150,396 162,400 Q172,404 184,412 Q188,416 186,418 Z"
          fill="#52b788" />
        <path d="M118,418 Q120,428 132,434 Q148,438 162,436 Q176,432 186,418 Z"
          fill="#5b2191" />
        <MagicPanel x={124} y={401} w={24} h={14} />
        <MagicPanel x={153} y={398} w={24} h={14} />
        <MagicTree x={184} y={400} h={32} color="#74c69d" glowColor="#d8f3dc" />
      </g>

      {/* Far small island center-right */}
      <g opacity="0.65">
        <ellipse cx="265" cy="405" rx="34" ry="9" fill="#40916c" />
        <path d="M234,405 Q238,392 250,388 Q264,384 275,388 Q284,392 296,400 Q298,403 298,405 Z"
          fill="#74c69d" />
        <path d="M234,405 Q236,416 248,422 Q262,426 276,424 Q288,420 298,405 Z"
          fill="#6b3fa0" />
        <MagicPanel x={238} y={390} w={22} h={13} />
        <MagicPanel x={264} y={386} w={22} h={13} />
        <MagicTree x={235} y={390} h={28} color="#52b788" glowColor="#b7e4c7" />
      </g>

      {/* ══════════════ GROUND SCENE ══════════════ */}

      {/* Ground magical mushrooms */}
      <Mushroom x={20}  y={628} r={10} stemH={18} color="#f9a8d4" />
      <Mushroom x={52}  y={635} r={7}  stemH={13} color="#fde68a" />
      <Mushroom x={338} y={630} r={9}  stemH={16} color="#a5f3fc" />
      <Mushroom x={368} y={638} r={6}  stemH={11} color="#f9a8d4" />
      <Mushroom x={172} y={640} r={5}  stemH={10} color="#c4b5fd" />
      <Mushroom x={220} y={638} r={5}  stemH={10} color="#fde68a" />

      {/* Ground magical trees */}
      <MagicTree x={0}   y={630} h={80} color="#52b788" glowColor="#b7e4c7" />
      <MagicTree x={380} y={625} h={88} color="#40916c" glowColor="#d8f3dc" />
      <MagicTree x={32}  y={632} h={60} color="#74c69d" glowColor="#d8f3dc" />
      <MagicTree x={355} y={628} h={65} color="#52b788" glowColor="#b7e4c7" />

      {/* Ground flowers scattered */}
      <GlowFlower x={95}  y={628} color="#fde68a" />
      <GlowFlower x={128} y={635} color="#f9a8d4" />
      <GlowFlower x={158} y={630} color="#a5f3fc" />
      <GlowFlower x={232} y={632} color="#fde68a" />
      <GlowFlower x={260} y={628} color="#c4b5fd" />
      <GlowFlower x={292} y={633} color="#f9a8d4" />

      {/* Grass blades */}
      {[12,30,58,82,108,138,165,195,248,278,310,340,362,385].map((x, i) => (
        <g key={i}>
          <path d={`M${x},844 Q${x-5},${810+(i%4)*8} ${x+2},${790+(i%5)*10}`}
            stroke="#52b788" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.8" />
          <path d={`M${x+6},844 Q${x+11},${815+(i%3)*6} ${x+4},${795+(i%4)*8}`}
            stroke="#40916c" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
        </g>
      ))}

      {/* ══════════════ MAGICAL ENERGY PARTICLES ══════════════ */}
      {[
        [72, 475, 3, '#ffd166'],  [118, 462, 2.5, '#f9a8d4'],
        [195, 365, 3.5, '#fff'], [265, 378, 2.5, '#a5f3fc'],
        [318, 460, 3, '#fde68a'], [152, 398, 2, '#c4b5fd'],
        [40,  390, 2, '#f9a8d4'], [350, 415, 2, '#a5f3fc'],
        [200, 445, 2, '#ffd166'], [88,  445, 2, '#c4b5fd'],
        [305, 440, 2, '#fde68a'],
      ].map(([x,y,r,color], i) => (
        <circle key={i} cx={x} cy={y} r={r as number} fill={color as string}
          opacity={0.7 + (i % 3) * 0.1} filter="url(#glow4)" />
      ))}

      {/* Sparkle crosses in sky */}
      {[[145, 250],[248, 240],[340, 270],[55, 265],[195, 220]].map(([x,y],i) => (
        <g key={i} opacity={0.6 + (i % 3) * 0.12}>
          <line x1={x-5} y1={y} x2={x+5} y2={y} stroke="white" strokeWidth="1" />
          <line x1={x} y1={y-5} x2={x} y2={y+5} stroke="white" strokeWidth="1" />
          <circle cx={x} cy={y} r="1.5" fill="white" filter="url(#glow4)" />
        </g>
      ))}

      {/* ══════════════ FOREGROUND GLOW MIST ══════════════ */}
      <ellipse cx="195" cy="844" rx="250" ry="80"
        fill="#52b788" opacity="0.12" />
      <ellipse cx="60" cy="844" rx="90" ry="50"
        fill="#a78bfa" opacity="0.1" />
      <ellipse cx="330" cy="844" rx="90" ry="50"
        fill="#74c69d" opacity="0.12" />
    </svg>
  );
}

/* ─── Sub-components ─────────────────────────────────────────── */

function MagicPanel({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const tilt = h * 0.3;
  const pts = `${x},${y+tilt} ${x+w},${y} ${x+w},${y+h} ${x},${y+h+tilt}`;
  const mid = x + w / 2;
  const base = y + h + tilt;
  return (
    <g>
      {/* Glow halo */}
      <ellipse cx={mid} cy={base + 4} rx={w * 0.65} ry={5}
        fill="#ffd166" opacity="0.35" />
      {/* Post */}
      <rect x={mid-1.5} y={base} width={3} height={10} fill="#78350f" rx="1" />
      {/* Panel face */}
      <polygon points={pts} fill="url(#panelGrad)" />
      {/* Grid lines */}
      {[1,2].map(c => {
        const fx = x + (w/3)*c;
        return <line key={c}
          x1={fx} y1={y + tilt*(1-c/3)} x2={fx} y2={y+h+tilt*(1-c/3)}
          stroke="#92400e" strokeWidth="0.7" opacity="0.6" />;
      })}
      {[1,2,3].map(r => {
        const fy = y + (h/4)*r;
        return <line key={r}
          x1={x} y1={fy+tilt} x2={x+w} y2={fy}
          stroke="#92400e" strokeWidth="0.7" opacity="0.6" />;
      })}
      {/* Glint */}
      <polygon points={pts} fill="url(#panelGlow)" />
      {/* Glow ring */}
      <polygon points={pts} fill="none"
        stroke="#ffd166" strokeWidth="1" opacity="0.55" />
    </g>
  );
}

function MagicTree({ x, y, h, color, glowColor }: { x: number; y: number; h: number; color: string; glowColor: string }) {
  const trunkW = Math.max(3, h * 0.07);
  const r1 = h * 0.38;
  const r2 = h * 0.28;
  const r3 = h * 0.2;
  return (
    <g>
      {/* Trunk */}
      <rect x={x - trunkW/2} y={y - h*0.28} width={trunkW} height={h*0.28}
        fill="#78350f" rx={trunkW/2} />
      {/* Canopy layers */}
      <ellipse cx={x} cy={y - h*0.28} rx={r1} ry={r1*0.55}
        fill={color} opacity="0.88" />
      <ellipse cx={x} cy={y - h*0.48} rx={r2} ry={r2*0.55}
        fill={color} opacity="0.9" />
      <ellipse cx={x} cy={y - h*0.66} rx={r3} ry={r3*0.55}
        fill={glowColor} opacity="0.85" />
      {/* Magical glow */}
      <ellipse cx={x} cy={y - h*0.46} rx={r1*0.8} ry={r1*0.45}
        fill={glowColor} opacity="0.25" />
      {/* Glowing orbs in canopy */}
      {[[-r1*0.4, h*0.32],[r1*0.3, h*0.38],[0, h*0.52]].map(([dx, dy], i) => (
        <circle key={i} cx={x+(dx as number)} cy={y-(dy as number)} r="2.5"
          fill={glowColor} opacity="0.8" />
      ))}
    </g>
  );
}

function GlowFlower({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={y+12} stroke="#52b788" strokeWidth="1.5" strokeLinecap="round" />
      {[0,60,120,180,240,300].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const px = x + 5 * Math.cos(rad);
        const py = y + 5 * Math.sin(rad);
        return <circle key={i} cx={px} cy={py} r="2.8" fill={color} opacity="0.9" />;
      })}
      <circle cx={x} cy={y} r="2" fill="white" opacity="0.95" />
    </g>
  );
}

function Mushroom({ x, y, r, stemH, color }: { x: number; y: number; r: number; stemH: number; color: string }) {
  return (
    <g>
      {/* Stem */}
      <rect x={x - r*0.35} y={y - stemH} width={r*0.7} height={stemH}
        fill="#f5f0e8" rx={r*0.2} />
      {/* Cap */}
      <ellipse cx={x} cy={y - stemH} rx={r} ry={r*0.45} fill={color} opacity="0.9" />
      <path d={`M${x-r},${y-stemH} Q${x-r*0.2},${y-stemH-r*1.4} ${x},${y-stemH-r*1.6} Q${x+r*0.2},${y-stemH-r*1.4} ${x+r},${y-stemH} Z`}
        fill={color} opacity="0.92" />
      {/* Spots */}
      <circle cx={x-r*0.3} cy={y-stemH-r*0.8} r={r*0.18} fill="white" opacity="0.8" />
      <circle cx={x+r*0.25} cy={y-stemH-r*1.1} r={r*0.14} fill="white" opacity="0.8" />
      {/* Glow */}
      <ellipse cx={x} cy={y-stemH-r*0.5} rx={r*1.1} ry={r*1.1}
        fill={color} opacity="0.15" />
    </g>
  );
}
