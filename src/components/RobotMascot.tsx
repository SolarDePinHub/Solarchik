export type RobotMood = 'normal' | 'happy' | 'wink' | 'sleepy' | 'charging';

import { getSkinById, type SkinColors } from '../lib/skins';

interface RobotMascotProps {
  size?: number;
  className?: string;
  tier?: 0 | 1 | 2 | 3 | 4;
  mood?: RobotMood;
  skinId?: string;
}

// tier 0 = default
// tier 1 = 10k kW  — blue electric glow
// tier 2 = 100k kW — golden panels + halo
// tier 3 = 1M kW   — rainbow aura + crown
// tier 4 = 10M kW  — platinum ultimate: solar wings + double crown + star burst
export default function RobotMascot({ size = 180, className = '', tier = 0, mood = 'normal', skinId }: RobotMascotProps) {
  const filterId = `robot-glow-${tier}`;

  const skinColors: SkinColors = getSkinById(skinId ?? 'default').colors;
  const hasSkin = !!skinId && skinId !== 'default';

  const eyeOuter =
    mood === 'charging' ? '#FFD700'
    : hasSkin ? skinColors.eyeOuter
    : tier >= 4 ? '#A855F7'
    : tier >= 3 ? '#FF4081'
    : tier >= 2 ? '#FF9800'
    : tier >= 1 ? '#00BCD4'
    : '#1565C0';

  const eyeInner =
    mood === 'charging' ? '#FF6F00'
    : hasSkin ? skinColors.eyeInner
    : tier >= 4 ? '#7B1FA2'
    : tier >= 3 ? '#C2185B'
    : tier >= 2 ? '#E65100'
    : tier >= 1 ? '#006064'
    : '#0D47A1';

  const smileColor = hasSkin ? skinColors.smileColor : tier >= 2 ? '#E65100' : '#0288D1';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ imageRendering: 'pixelated', overflow: 'visible' }}
    >
      <defs>
        {tier === 1 && (
          <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur"/>
            <feColorMatrix in="blur" type="matrix"
              values="0 0 1 0 0  0 0.5 1 0 0  0 0 1 0 0  0 0 0 18 -7" result="glow"/>
            <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        )}
        {tier === 2 && (
          <filter id={filterId} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="blur"/>
            <feColorMatrix in="blur" type="matrix"
              values="1 0.6 0 0 0  0.8 0.4 0 0 0  0 0 0 0 0  0 0 0 20 -8" result="glow"/>
            <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        )}
        {tier === 3 && (
          <>
            <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" result="blur"/>
              <feColorMatrix in="blur" type="matrix"
                values="1 0 0.5 0 0  0 0.8 0.5 0 0  0.5 0 1 0 0  0 0 0 22 -9" result="glow"/>
              <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <radialGradient id="rainbow-aura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFD700" stopOpacity="0"/>
              <stop offset="60%" stopColor="#FF6B35" stopOpacity="0.15"/>
              <stop offset="80%" stopColor="#A855F7" stopOpacity="0.25"/>
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.3"/>
            </radialGradient>
          </>
        )}
        {tier === 4 && (
          <>
            <filter id={filterId} x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="10" result="blur"/>
              <feColorMatrix in="blur" type="matrix"
                values="1 0.3 0.8 0 0  0.8 1 0.3 0 0  0.3 0.8 1 0 0  0 0 0 25 -10" result="glow"/>
              <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <radialGradient id="ultimate-aura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.1"/>
              <stop offset="40%" stopColor="#FFD700" stopOpacity="0.2"/>
              <stop offset="70%" stopColor="#FF6B35" stopOpacity="0.2"/>
              <stop offset="90%" stopColor="#A855F7" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.35"/>
            </radialGradient>
            <linearGradient id="wing-l" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFD700"/>
              <stop offset="50%" stopColor="#FF9800"/>
              <stop offset="100%" stopColor="#FF6B35"/>
            </linearGradient>
            <linearGradient id="wing-r" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFD700"/>
              <stop offset="50%" stopColor="#FF9800"/>
              <stop offset="100%" stopColor="#FF6B35"/>
            </linearGradient>
          </>
        )}
      </defs>

      {/* Tier 4: ultimate outer aura + sparkle ring */}
      {tier === 4 && (
        <>
          <ellipse cx="100" cy="145" rx="98" ry="118" fill="url(#ultimate-aura)"/>
          <ellipse cx="100" cy="145" rx="90" ry="108" fill="none"
            stroke="#FFD700" strokeWidth="1.5" opacity="0.4" strokeDasharray="8 4"/>
          {[0,45,90,135,180,225,270,315].map((deg, i) => {
            const r = 92 + (i % 2) * 10;
            const x = 100 + r * Math.cos((deg * Math.PI) / 180);
            const y = 145 + r * 0.82 * Math.sin((deg * Math.PI) / 180);
            return (
              <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 3 : 2}
                fill={(['#FFD700','#FF4081','#00E5FF','#69F0AE'] as const)[i % 4]} opacity="0.85"/>
            );
          })}
        </>
      )}

      {/* Tier 3: rainbow aura */}
      {tier === 3 && (
        <>
          <ellipse cx="100" cy="145" rx="95" ry="110" fill="url(#rainbow-aura)"/>
          <ellipse cx="100" cy="145" rx="85" ry="100" fill="none"
            stroke="url(#rainbow-aura)" strokeWidth="3" opacity="0.5"/>
        </>
      )}

      {/* Tier 2: golden halo */}
      {tier === 2 && (
        <ellipse cx="100" cy="65" rx="55" ry="14" fill="none"
          stroke="#FFD700" strokeWidth="3" opacity="0.6"/>
      )}

      <g filter={tier > 0 ? `url(#${filterId})` : undefined}>

        {/* Tier 4: large angled solar WINGS behind body */}
        {tier >= 4 && (
          <>
            <g transform="translate(-8,0) rotate(-18, 30, 130)">
              <rect x="0" y="85" width="48" height="82" rx="4"
                fill="url(#wing-l)" stroke="#E65100" strokeWidth="2"/>
              {[0,1,2,3].map(i => (
                <rect key={i} x={2} y={88 + i * 20} width="44" height="16" fill="#FFB74D" opacity="0.85"/>
              ))}
              {[1,2,3].map(i => (
                <line key={i} x1="0" y1={88 + i * 20} x2="48" y2={88 + i * 20}
                  stroke="#E65100" strokeWidth="1"/>
              ))}
              <line x1="24" y1="85" x2="24" y2="167" stroke="#E65100" strokeWidth="1.5"/>
              <rect x="21" y="165" width="6" height="22" fill="#546E7A"/>
            </g>
            <g transform="translate(8,0) rotate(18, 170, 130)">
              <rect x="152" y="85" width="48" height="82" rx="4"
                fill="url(#wing-r)" stroke="#E65100" strokeWidth="2"/>
              {[0,1,2,3].map(i => (
                <rect key={i} x={154} y={88 + i * 20} width="44" height="16" fill="#FFB74D" opacity="0.85"/>
              ))}
              {[1,2,3].map(i => (
                <line key={i} x1="152" y1={88 + i * 20} x2="200" y2={88 + i * 20}
                  stroke="#E65100" strokeWidth="1"/>
              ))}
              <line x1="176" y1="85" x2="176" y2="167" stroke="#E65100" strokeWidth="1.5"/>
              <rect x="173" y="165" width="6" height="22" fill="#546E7A"/>
            </g>
          </>
        )}

        {/* Standard solar panels (tiers 0-3) */}
        {tier < 4 && (
          <>
            <rect x="10" y="100" width="35" height="55" rx="3"
              fill={hasSkin ? skinColors.solarFill : tier >= 2 ? '#F57F17' : '#1565C0'}
              stroke={hasSkin ? skinColors.solarStroke : tier >= 2 ? '#E65100' : '#0D47A1'} strokeWidth="2"/>
            <rect x="12" y="103" width="14" height="22" fill={hasSkin ? skinColors.solarFill : tier >= 2 ? '#FB8C00' : '#1976D2'}/>
            <rect x="29" y="103" width="14" height="22" fill={hasSkin ? skinColors.solarFill : tier >= 2 ? '#FB8C00' : '#1976D2'}/>
            <rect x="12" y="128" width="14" height="22" fill={hasSkin ? skinColors.solarFill : tier >= 2 ? '#FB8C00' : '#1976D2'}/>
            <rect x="29" y="128" width="14" height="22" fill={hasSkin ? skinColors.solarFill : tier >= 2 ? '#FB8C00' : '#1976D2'}/>
            <line x1="10" y1="114" x2="45" y2="114" stroke={hasSkin ? skinColors.solarStroke : tier >= 2 ? '#E65100' : '#0D47A1'} strokeWidth="1.5"/>
            <line x1="10" y1="125" x2="45" y2="125" stroke={hasSkin ? skinColors.solarStroke : tier >= 2 ? '#E65100' : '#0D47A1'} strokeWidth="1.5"/>
            <line x1="27" y1="100" x2="27" y2="155" stroke={hasSkin ? skinColors.solarStroke : tier >= 2 ? '#E65100' : '#0D47A1'} strokeWidth="1.5"/>
            <rect x="24" y="153" width="6" height="20" fill="#546E7A"/>
            <rect x="155" y="100" width="35" height="55" rx="3"
              fill={hasSkin ? skinColors.solarFill : tier >= 2 ? '#F57F17' : '#1565C0'}
              stroke={hasSkin ? skinColors.solarStroke : tier >= 2 ? '#E65100' : '#0D47A1'} strokeWidth="2"/>
            <rect x="157" y="103" width="14" height="22" fill={hasSkin ? skinColors.solarFill : tier >= 2 ? '#FB8C00' : '#1976D2'}/>
            <rect x="174" y="103" width="14" height="22" fill={hasSkin ? skinColors.solarFill : tier >= 2 ? '#FB8C00' : '#1976D2'}/>
            <rect x="157" y="128" width="14" height="22" fill={hasSkin ? skinColors.solarFill : tier >= 2 ? '#FB8C00' : '#1976D2'}/>
            <rect x="174" y="128" width="14" height="22" fill={hasSkin ? skinColors.solarFill : tier >= 2 ? '#FB8C00' : '#1976D2'}/>
            <line x1="155" y1="114" x2="190" y2="114" stroke={hasSkin ? skinColors.solarStroke : tier >= 2 ? '#E65100' : '#0D47A1'} strokeWidth="1.5"/>
            <line x1="155" y1="125" x2="190" y2="125" stroke={hasSkin ? skinColors.solarStroke : tier >= 2 ? '#E65100' : '#0D47A1'} strokeWidth="1.5"/>
            <line x1="172" y1="100" x2="172" y2="155" stroke={hasSkin ? skinColors.solarStroke : tier >= 2 ? '#E65100' : '#0D47A1'} strokeWidth="1.5"/>
            <rect x="169" y="153" width="6" height="20" fill="#546E7A"/>
          </>
        )}

        {/* Ground shadow */}
        <ellipse cx="100" cy="233" rx="55" ry="8" fill="rgba(0,0,0,0.15)"/>

        {/* Body */}
        <rect x="62" y="118" width="76" height="75" rx="12"
          fill={hasSkin ? skinColors.bodyFill : tier >= 4 ? '#FAFAFA' : tier >= 3 ? '#FFF8E1' : '#ECEFF1'}
          stroke={hasSkin ? skinColors.bodyStroke : tier >= 4 ? '#E0E0E0' : tier >= 3 ? '#FFD700' : '#B0BEC5'} strokeWidth={tier >= 4 ? 3 : 2}/>
        <rect x="72" y="128" width="56" height="40" rx="6"
          fill={hasSkin ? skinColors.panelFill : tier >= 2 ? '#FF9800' : '#29B6F6'}
          stroke={hasSkin ? skinColors.solarStroke : tier >= 2 ? '#E65100' : '#0288D1'} strokeWidth="2"/>
        <rect x="76" y="132" width="48" height="32" rx="4"
          fill={hasSkin ? skinColors.panelInner : tier >= 2 ? '#FFB74D' : '#4FC3F7'}/>
        <line x1="76" y1="144" x2="124" y2="144" stroke="rgba(255,255,255,0.5)" strokeWidth="1"/>
        <line x1="100" y1="132" x2="100" y2="164" stroke="rgba(255,255,255,0.5)" strokeWidth="1"/>
        <circle cx="88" cy="138" r="3" fill={tier >= 1 ? '#00E5FF' : '#FFD700'} opacity="0.9"/>
        <circle cx="112" cy="152" r="3" fill={tier >= 3 ? '#FF4081' : '#00E676'} opacity="0.9"/>
        <rect x="93" y="141" width="14" height="8" rx="2" fill="rgba(255,255,255,0.3)"/>
        {tier >= 4 && (
          <>
            <circle cx="88" cy="152" r="2.5" fill="#FFD700" opacity="0.9"/>
            <circle cx="112" cy="138" r="2.5" fill="#A855F7" opacity="0.9"/>
          </>
        )}
        <circle cx="100" cy="182" r="7"
          fill={hasSkin ? skinColors.accentFill : tier >= 2 ? '#FF9800' : '#FFD700'}
          stroke={hasSkin ? skinColors.accentStroke : tier >= 2 ? '#E65100' : '#F9A825'} strokeWidth="2"/>
        <text x="100" y="186" textAnchor="middle" fill="#7B4F00" fontSize="8" fontWeight="bold">⚡</text>

        {/* Arms */}
        <rect x="38" y="126" width="26" height="18" rx="8"
          fill={hasSkin ? skinColors.bodyFill : tier >= 3 ? '#FFF8E1' : '#ECEFF1'} stroke={hasSkin ? skinColors.bodyStroke : tier >= 3 ? '#FFD700' : '#B0BEC5'} strokeWidth="2"/>
        <rect x="30" y="138" width="16" height="12" rx="6"
          fill={hasSkin ? skinColors.limbFill : tier >= 2 ? '#FFE082' : '#CFD8DC'} stroke={hasSkin ? skinColors.limbAccent : tier >= 2 ? '#FFD700' : '#B0BEC5'} strokeWidth="1.5"/>
        <rect x="136" y="126" width="26" height="18" rx="8"
          fill={hasSkin ? skinColors.bodyFill : tier >= 3 ? '#FFF8E1' : '#ECEFF1'} stroke={hasSkin ? skinColors.bodyStroke : tier >= 3 ? '#FFD700' : '#B0BEC5'} strokeWidth="2"/>
        <rect x="154" y="138" width="16" height="12" rx="6"
          fill={hasSkin ? skinColors.limbFill : tier >= 2 ? '#FFE082' : '#CFD8DC'} stroke={hasSkin ? skinColors.limbAccent : tier >= 2 ? '#FFD700' : '#B0BEC5'} strokeWidth="1.5"/>

        {/* Legs + feet */}
        <rect x="74" y="190" width="20" height="28" rx="8"
          fill={hasSkin ? skinColors.bodyFill : tier >= 3 ? '#FFF8E1' : '#ECEFF1'} stroke={hasSkin ? skinColors.bodyStroke : tier >= 3 ? '#FFD700' : '#B0BEC5'} strokeWidth="2"/>
        <rect x="106" y="190" width="20" height="28" rx="8"
          fill={hasSkin ? skinColors.bodyFill : tier >= 3 ? '#FFF8E1' : '#ECEFF1'} stroke={hasSkin ? skinColors.bodyStroke : tier >= 3 ? '#FFD700' : '#B0BEC5'} strokeWidth="2"/>
        <rect x="70" y="210" width="28" height="10" rx="5"
          fill={hasSkin ? skinColors.limbFill : tier >= 2 ? '#FFE082' : '#CFD8DC'} stroke={hasSkin ? skinColors.limbAccent : tier >= 2 ? '#FFD700' : '#B0BEC5'} strokeWidth="1.5"/>
        <rect x="102" y="210" width="28" height="10" rx="5"
          fill={hasSkin ? skinColors.limbFill : tier >= 2 ? '#FFE082' : '#CFD8DC'} stroke={hasSkin ? skinColors.limbAccent : tier >= 2 ? '#FFD700' : '#B0BEC5'} strokeWidth="1.5"/>

        {/* Head */}
        <rect x="58" y="63" width="84" height="70" rx="18"
          fill={
            mood === 'sleepy' ? '#D1D5DB'
            : hasSkin ? skinColors.bodyFill
            : tier >= 4 ? '#FFFFFF'
            : tier >= 3 ? '#FFFDE7'
            : '#ECEFF1'
          }
          stroke={hasSkin ? skinColors.bodyStroke : tier >= 4 ? '#FFD700' : tier >= 3 ? '#FFD700' : '#B0BEC5'} strokeWidth={tier >= 4 ? 3 : 2.5}/>
        <rect x="64" y="70" width="72" height="46" rx="12"
          fill={
            mood === 'charging' ? '#FF8F00'
            : mood === 'sleepy' ? '#9CA3AF'
            : hasSkin ? skinColors.panelFill
            : tier >= 4 ? '#FF6B35'
            : tier >= 3 ? '#FF6B35'
            : tier >= 2 ? '#FF9800'
            : tier >= 1 ? '#00BCD4'
            : '#29B6F6'
          }
          stroke={hasSkin ? skinColors.solarStroke : tier >= 3 ? '#E65100' : tier >= 2 ? '#E65100' : tier >= 1 ? '#0097A7' : '#0288D1'}
          strokeWidth="2"/>
        <rect x="68" y="74" width="64" height="38" rx="9"
          fill={
            mood === 'charging' ? '#FFA000'
            : mood === 'sleepy' ? '#9CA3AF'
            : hasSkin ? skinColors.panelInner
            : tier >= 4 ? '#FF8A50'
            : tier >= 3 ? '#FF8A50'
            : tier >= 2 ? '#FFB74D'
            : tier >= 1 ? '#26C6DA'
            : '#4FC3F7'
          }/>
        <rect x="70" y="76" width="20" height="6" rx="3" fill="rgba(255,255,255,0.5)"/>

        {/* ── EYES (mood-dependent) ── */}
        {mood === 'sleepy' ? (
          <>
            {/* Sleepy: narrow ellipse eyes */}
            <ellipse cx="84" cy="95" rx="11" ry="5" fill="white"/>
            <ellipse cx="84" cy="96" rx="7" ry="3" fill="#64748B" opacity="0.8"/>
            <ellipse cx="116" cy="95" rx="11" ry="5" fill="white"/>
            <ellipse cx="116" cy="96" rx="7" ry="3" fill="#64748B" opacity="0.8"/>
            {/* Sleepy Zzz above head */}
            <text x="124" y="62" fontSize="9" fill="#94A3B8" fontWeight="bold" opacity="0.7">z</text>
            <text x="132" y="52" fontSize="12" fill="#94A3B8" fontWeight="bold" opacity="0.6">z</text>
            <text x="142" y="38" fontSize="15" fill="#94A3B8" fontWeight="bold" opacity="0.5">Z</text>
          </>
        ) : mood === 'happy' ? (
          <>
            {/* Happy: upward arc squint eyes + blush */}
            <circle cx="84" cy="94" r="11" fill="white"/>
            <path d="M 74 97 Q 84 86 94 97" stroke={eyeOuter} strokeWidth="3.5" fill="none" strokeLinecap="round"/>
            <circle cx="116" cy="94" r="11" fill="white"/>
            <path d="M 106 97 Q 116 86 126 97" stroke={eyeOuter} strokeWidth="3.5" fill="none" strokeLinecap="round"/>
            {/* Blush */}
            <ellipse cx="73" cy="106" rx="6" ry="4" fill="#FB7185" opacity="0.4"/>
            <ellipse cx="127" cy="106" rx="6" ry="4" fill="#FB7185" opacity="0.4"/>
            {/* Stars */}
            <text x="50" y="82" fontSize="11" fill="#FFD700" opacity="0.9">✦</text>
            <text x="143" y="78" fontSize="13" fill="#FFD700" opacity="0.9">✦</text>
            <text x="136" y="62" fontSize="9" fill="#FB923C" opacity="0.8">★</text>
          </>
        ) : mood === 'wink' ? (
          <>
            {/* Wink: left eye normal, right eye closed arc */}
            <circle cx="84" cy="94" r="11" fill="white"/>
            <circle cx="84" cy="94" r="7" fill={eyeOuter}/>
            <circle cx="84" cy="94" r="4" fill={eyeInner}/>
            <circle cx="87" cy="91" r="2" fill="white"/>
            <circle cx="116" cy="94" r="11" fill="white"/>
            {/* Closed eye — curved line */}
            <path d="M 107 92 Q 116 102 125 92" stroke={eyeOuter} strokeWidth="3" fill="none" strokeLinecap="round"/>
            {/* Sparkle near winking eye */}
            <text x="128" y="84" fontSize="12" fill="#FFD700" opacity="0.9">✦</text>
          </>
        ) : mood === 'charging' ? (
          <>
            {/* Charging: electric yellow glowing eyes */}
            <circle cx="84" cy="94" r="11" fill="white"/>
            <circle cx="116" cy="94" r="11" fill="white"/>
            <circle cx="84" cy="94" r="8" fill="#FFD700"/>
            <circle cx="116" cy="94" r="8" fill="#FFD700"/>
            <circle cx="84" cy="94" r="4.5" fill="#FF6F00"/>
            <circle cx="116" cy="94" r="4.5" fill="#FF6F00"/>
            <circle cx="87" cy="91" r="2" fill="white" opacity="0.9"/>
            <circle cx="119" cy="91" r="2" fill="white" opacity="0.9"/>
            {/* Outer glow rings */}
            <circle cx="84" cy="94" r="13" fill="none" stroke="#FFD700" strokeWidth="2.5" opacity="0.75"/>
            <circle cx="116" cy="94" r="13" fill="none" stroke="#FFD700" strokeWidth="2.5" opacity="0.75"/>
            {/* Lightning bolts */}
            <text x="48" y="80" fontSize="14">⚡</text>
            <text x="136" y="80" fontSize="14">⚡</text>
          </>
        ) : (
          <>
            {/* Normal eyes */}
            <circle cx="84" cy="94" r="11" fill="white"/>
            <circle cx="116" cy="94" r="11" fill="white"/>
            <circle cx="84" cy="94" r="7" fill={eyeOuter}/>
            <circle cx="116" cy="94" r="7" fill={eyeOuter}/>
            <circle cx="84" cy="94" r="4" fill={eyeInner}/>
            <circle cx="116" cy="94" r="4" fill={eyeInner}/>
            <circle cx="87" cy="91" r="2" fill="white"/>
            <circle cx="119" cy="91" r="2" fill="white"/>
          </>
        )}

        {/* ── MOUTH (mood-dependent) ── */}
        {mood === 'sleepy' ? (
          <path d="M 88 112 Q 100 110 112 112"
            stroke="#94A3B8" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        ) : mood === 'happy' ? (
          <path d="M 76 107 Q 100 126 124 107"
            stroke={smileColor} strokeWidth="3.5" fill="none" strokeLinecap="round"/>
        ) : mood === 'charging' ? (
          <ellipse cx="100" cy="112" rx="7" ry="5"
            fill="none" stroke={smileColor} strokeWidth="2.5"/>
        ) : (
          <path d="M 82 108 Q 100 120 118 108"
            stroke={smileColor} strokeWidth="3" fill="none" strokeLinecap="round"/>
        )}

        {/* Antenna */}
        <rect x="96" y="48" width="8" height="18" rx="3" fill={tier >= 2 ? '#FFD700' : '#90A4AE'}/>
        <circle cx="100" cy="45" r="7"
          fill={mood === 'charging' ? '#FFD700' : tier >= 1 ? '#00E5FF' : '#FFD700'}
          stroke={mood === 'charging' ? '#FF6F00' : tier >= 1 ? '#006064' : '#F9A825'} strokeWidth="2"/>
        <circle cx="100" cy="45" r="3" fill={mood === 'charging' ? '#FF6F00' : tier >= 1 ? 'white' : '#FFF176'}/>

        {tier === 3 && (
          <g>
            <path d="M 86 42 L 90 30 L 100 38 L 110 30 L 114 42 Z"
              fill="#FFD700" stroke="#F9A825" strokeWidth="1.5" strokeLinejoin="round"/>
            <circle cx="90" cy="30" r="2.5" fill="#FF4081"/>
            <circle cx="100" cy="37" r="2.5" fill="#00E5FF"/>
            <circle cx="110" cy="30" r="2.5" fill="#FF4081"/>
          </g>
        )}

        {tier >= 4 && (
          <g>
            <path d="M 80 42 L 85 25 L 100 36 L 115 25 L 120 42 Z"
              fill="#FFD700" stroke="#F57F17" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M 85 42 L 89 31 L 100 39 L 111 31 L 115 42 Z"
              fill="#FFF9C4" stroke="#FFD700" strokeWidth="1" strokeLinejoin="round"/>
            <circle cx="85" cy="25" r="3.5" fill="#FF4081" stroke="#C2185B" strokeWidth="1"/>
            <circle cx="100" cy="35" r="4" fill="#00E5FF" stroke="#006064" strokeWidth="1"/>
            <circle cx="115" cy="25" r="3.5" fill="#FF4081" stroke="#C2185B" strokeWidth="1"/>
            <circle cx="100" cy="34" r="1.5" fill="white" opacity="0.8"/>
          </g>
        )}

        {/* Ear bolts */}
        <circle cx="58" cy="96" r="6"
          fill={hasSkin ? skinColors.accentFill : tier >= 2 ? '#FFD700' : '#90A4AE'} stroke={hasSkin ? skinColors.accentStroke : tier >= 2 ? '#F9A825' : '#78909C'} strokeWidth="1.5"/>
        <circle cx="142" cy="96" r="6"
          fill={hasSkin ? skinColors.accentFill : tier >= 2 ? '#FFD700' : '#90A4AE'} stroke={hasSkin ? skinColors.accentStroke : tier >= 2 ? '#F9A825' : '#78909C'} strokeWidth="1.5"/>

        {tier >= 1 && (
          <>
            <circle cx="45" cy="113" r="3" fill="#00E5FF" opacity="0.8"/>
            <circle cx="155" cy="113" r="3" fill="#00E5FF" opacity="0.8"/>
          </>
        )}
        {tier >= 4 && (
          <>
            <circle cx="40" cy="126" r="3" fill="#FFD700" opacity="0.9"/>
            <circle cx="160" cy="126" r="3" fill="#FFD700" opacity="0.9"/>
            <circle cx="36" cy="140" r="2" fill="#A855F7" opacity="0.8"/>
            <circle cx="164" cy="140" r="2" fill="#A855F7" opacity="0.8"/>
          </>
        )}

        {/* Sleepy overlay — dim the whole body slightly */}
        {mood === 'sleepy' && (
          <rect x="58" y="63" width="84" height="135" rx="12"
            fill="rgba(100,116,139,0.18)" pointerEvents="none"/>
        )}
      </g>
    </svg>
  );
}
