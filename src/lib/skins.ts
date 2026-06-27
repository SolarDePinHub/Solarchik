export interface SkinColors {
  bodyFill: string;
  bodyStroke: string;
  panelFill: string;
  panelInner: string;
  solarFill: string;
  solarStroke: string;
  eyeOuter: string;
  eyeInner: string;
  smileColor: string;
  accentFill: string;
  accentStroke: string;
  limbFill: string;
  limbAccent: string;
}

export type SkinType = 'cosmetic' | 'functional' | 'challenge' | 'limited';

export interface SkinDef {
  id: string;
  nameEn: string;
  nameUk: string;
  descEn: string;
  descUk: string;
  type: SkinType;
  price: number;         // energy cost; 0 = free / challenge / limited
  boostPercent: number;  // % bonus to tap multiplier and passive income
  /** For 'challenge' skins — total_energy_earned threshold to unlock */
  challengeEnergy?: number;
  /** For 'challenge' skins — player_level threshold to unlock */
  challengeLevel?: number;
  /** For 'limited' skins — ISO date string until which the skin is available */
  limitedUntil?: string;
  colors: SkinColors;
  /** Gradient colors for the card background preview */
  cardGradient: [string, string];
}

const DEFAULT_COLORS: SkinColors = {
  bodyFill: '#ECEFF1',
  bodyStroke: '#B0BEC5',
  panelFill: '#4FC3F7',
  panelInner: '#29B6F6',
  solarFill: '#1565C0',
  solarStroke: '#0D47A1',
  eyeOuter: '#1565C0',
  eyeInner: '#0D47A1',
  smileColor: '#0288D1',
  accentFill: '#90A4AE',
  accentStroke: '#78909C',
  limbFill: '#CFD8DC',
  limbAccent: '#B0BEC5',
};

export const SKINS: SkinDef[] = [
  {
    id: 'default',
    nameEn: 'Default',
    nameUk: 'Стандартний',
    descEn: 'The classic Solarchyk look.',
    descUk: 'Класичний вигляд Солярчика.',
    type: 'cosmetic',
    price: 0,
    boostPercent: 0,
    colors: DEFAULT_COLORS,
    cardGradient: ['#1e3a5f', '#0d2240'],
  },
  {
    id: 'solar_blue',
    nameEn: 'Solar Blue',
    nameUk: 'Сонячний синій',
    descEn: 'Electric blue metallic finish.',
    descUk: 'Електрично-синє металеве покриття.',
    type: 'cosmetic',
    price: 30_000,
    boostPercent: 0,
    colors: {
      ...DEFAULT_COLORS,
      bodyFill: '#E3F2FD',
      bodyStroke: '#42A5F5',
      panelFill: '#1976D2',
      panelInner: '#2196F3',
      eyeOuter: '#0277BD',
      eyeInner: '#01579B',
      smileColor: '#0288D1',
      accentFill: '#42A5F5',
      accentStroke: '#1E88E5',
    },
    cardGradient: ['#0d47a1', '#1565c0'],
  },
  {
    id: 'volcano',
    nameEn: 'Volcano',
    nameUk: 'Вулкан',
    descEn: 'Red-hot fire energy from the core.',
    descUk: 'Вогняна енергія з самого серця.',
    type: 'cosmetic',
    price: 80_000,
    boostPercent: 0,
    colors: {
      ...DEFAULT_COLORS,
      bodyFill: '#FFF3E0',
      bodyStroke: '#FF7043',
      panelFill: '#D32F2F',
      panelInner: '#F44336',
      solarFill: '#BF360C',
      solarStroke: '#8D1900',
      eyeOuter: '#C62828',
      eyeInner: '#8D1900',
      smileColor: '#E64A19',
      accentFill: '#FF7043',
      accentStroke: '#F4511E',
      limbFill: '#FFCCBC',
      limbAccent: '#FF7043',
    },
    cardGradient: ['#7f1d1d', '#b91c1c'],
  },
  {
    id: 'eco_guardian',
    nameEn: 'Eco Guardian',
    nameUk: 'Еко-захисник',
    descEn: 'Powered by nature, green energy inside.',
    descUk: 'На природній зеленій енергії.',
    type: 'cosmetic',
    price: 120_000,
    boostPercent: 0,
    colors: {
      ...DEFAULT_COLORS,
      bodyFill: '#E8F5E9',
      bodyStroke: '#4CAF50',
      panelFill: '#2E7D32',
      panelInner: '#388E3C',
      solarFill: '#1B5E20',
      solarStroke: '#154010',
      eyeOuter: '#2E7D32',
      eyeInner: '#1B5E20',
      smileColor: '#388E3C',
      accentFill: '#66BB6A',
      accentStroke: '#43A047',
      limbFill: '#C8E6C9',
      limbAccent: '#81C784',
    },
    cardGradient: ['#14532d', '#166534'],
  },
  {
    id: 'midnight',
    nameEn: 'Shadow Protocol',
    nameUk: 'Тіньовий протокол',
    descEn: 'Dark stealth mode activated.',
    descUk: 'Активовано режим темного стелсу.',
    type: 'cosmetic',
    price: 200_000,
    boostPercent: 0,
    colors: {
      ...DEFAULT_COLORS,
      bodyFill: '#1A1A2E',
      bodyStroke: '#7C83FD',
      panelFill: '#16213E',
      panelInner: '#0F3460',
      solarFill: '#0D0D1A',
      solarStroke: '#533483',
      eyeOuter: '#7C83FD',
      eyeInner: '#533483',
      smileColor: '#9D4EDD',
      accentFill: '#7C83FD',
      accentStroke: '#533483',
      limbFill: '#16213E',
      limbAccent: '#7C83FD',
    },
    cardGradient: ['#0f0c29', '#302b63'],
  },
  {
    id: 'arctic',
    nameEn: 'Arctic Storm',
    nameUk: 'Арктичний шторм',
    descEn: 'Ice-cold precision and crystal clarity.',
    descUk: 'Крижана точність та кристальна ясність.',
    type: 'cosmetic',
    price: 350_000,
    boostPercent: 0,
    colors: {
      ...DEFAULT_COLORS,
      bodyFill: '#E0F7FA',
      bodyStroke: '#80DEEA',
      panelFill: '#006064',
      panelInner: '#00838F',
      solarFill: '#004D40',
      solarStroke: '#00352E',
      eyeOuter: '#00ACC1',
      eyeInner: '#006064',
      smileColor: '#0097A7',
      accentFill: '#80DEEA',
      accentStroke: '#4DD0E1',
      limbFill: '#B2EBF2',
      limbAccent: '#80DEEA',
    },
    cardGradient: ['#0c4a6e', '#075985'],
  },
  {
    id: 'golden_wings',
    nameEn: 'Golden Wings',
    nameUk: 'Золоті крила',
    descEn: 'Premium gold finish. +5% energy generation boost.',
    descUk: "Золоте преміум-покриття. +5% до генерації енергії.",
    type: 'functional',
    price: 600_000,
    boostPercent: 5,
    colors: {
      ...DEFAULT_COLORS,
      bodyFill: '#FFF8E1',
      bodyStroke: '#FFD700',
      panelFill: '#F57F17',
      panelInner: '#FF8F00',
      solarFill: '#E65100',
      solarStroke: '#BF360C',
      eyeOuter: '#F9A825',
      eyeInner: '#F57F17',
      smileColor: '#FF8F00',
      accentFill: '#FFD700',
      accentStroke: '#FFC107',
      limbFill: '#FFF8E1',
      limbAccent: '#FFD700',
    },
    cardGradient: ['#78350f', '#92400e'],
  },
  {
    id: 'plasma',
    nameEn: 'Plasma Core',
    nameUk: 'Плазмове ядро',
    descEn: 'Unstable plasma overclocked. +10% energy generation boost.',
    descUk: 'Нестабільна плазма на максимумі. +10% до генерації.',
    type: 'functional',
    price: 1_200_000,
    boostPercent: 10,
    colors: {
      ...DEFAULT_COLORS,
      bodyFill: '#F3E5F5',
      bodyStroke: '#CE93D8',
      panelFill: '#6A1B9A',
      panelInner: '#8E24AA',
      solarFill: '#4A148C',
      solarStroke: '#310073',
      eyeOuter: '#CE93D8',
      eyeInner: '#9C27B0',
      smileColor: '#AB47BC',
      accentFill: '#EA80FC',
      accentStroke: '#D500F9',
      limbFill: '#F3E5F5',
      limbAccent: '#CE93D8',
    },
    cardGradient: ['#4a044e', '#6b21a8'],
  },
  {
    id: 'solar_legend',
    nameEn: 'Solar Legend',
    nameUk: 'Сонячна легенда',
    descEn: 'For those who earned 5,000,000 kW total. Legendary status.',
    descUk: 'Для тих, хто зібрав 5,000,000 kW. Легендарний статус.',
    type: 'challenge',
    price: 0,
    boostPercent: 0,
    challengeEnergy: 5_000_000,
    colors: {
      ...DEFAULT_COLORS,
      bodyFill: '#FFFDE7',
      bodyStroke: '#FFD600',
      panelFill: '#FF6F00',
      panelInner: '#FF8F00',
      solarFill: '#E65100',
      solarStroke: '#FF3D00',
      eyeOuter: '#FFD600',
      eyeInner: '#FF6D00',
      smileColor: '#FF6F00',
      accentFill: '#FFD600',
      accentStroke: '#FFC400',
      limbFill: '#FFFDE7',
      limbAccent: '#FFD600',
    },
    cardGradient: ['#451a03', '#78350f'],
  },
  {
    id: 'level_master',
    nameEn: 'Level Master',
    nameUk: 'Майстер рівнів',
    descEn: 'Reach level 10 to unlock this prestigious look.',
    descUk: 'Досягни 10-го рівня, щоб отримати цей престижний вигляд.',
    type: 'challenge',
    price: 0,
    boostPercent: 0,
    challengeLevel: 10,
    colors: {
      ...DEFAULT_COLORS,
      bodyFill: '#E8EAF6',
      bodyStroke: '#5C6BC0',
      panelFill: '#1A237E',
      panelInner: '#283593',
      solarFill: '#0D1454',
      solarStroke: '#050B36',
      eyeOuter: '#5C6BC0',
      eyeInner: '#3949AB',
      smileColor: '#3F51B5',
      accentFill: '#7986CB',
      accentStroke: '#5C6BC0',
      limbFill: '#E8EAF6',
      limbAccent: '#7986CB',
    },
    cardGradient: ['#1e1b4b', '#312e81'],
  },
  {
    id: 'festival',
    nameEn: 'Festival Edition',
    nameUk: 'Святкова версія',
    descEn: 'Limited-time festive skin. Available until July 31.',
    descUk: 'Обмежений святковий скін. Доступний до 31 липня.',
    type: 'limited',
    price: 150_000,
    boostPercent: 0,
    limitedUntil: '2026-07-31T23:59:59Z',
    colors: {
      ...DEFAULT_COLORS,
      bodyFill: '#FCE4EC',
      bodyStroke: '#F48FB1',
      panelFill: '#AD1457',
      panelInner: '#C2185B',
      solarFill: '#880E4F',
      solarStroke: '#560027',
      eyeOuter: '#F48FB1',
      eyeInner: '#E91E63',
      smileColor: '#E91E63',
      accentFill: '#F48FB1',
      accentStroke: '#EC407A',
      limbFill: '#FCE4EC',
      limbAccent: '#F48FB1',
    },
    cardGradient: ['#831843', '#9d174d'],
  },
];

export const DEFAULT_SKIN = SKINS[0];

export function getSkinById(id: string): SkinDef {
  return SKINS.find((s) => s.id === id) ?? DEFAULT_SKIN;
}

export function isSkinOwned(ownedSkins: string[], skinId: string): boolean {
  return skinId === 'default' || ownedSkins.includes(skinId);
}

export function isChallengeUnlocked(
  skin: SkinDef,
  totalEnergyEarned: number,
  level: number,
): boolean {
  if (skin.type !== 'challenge') return false;
  if (skin.challengeEnergy && totalEnergyEarned < skin.challengeEnergy) return false;
  if (skin.challengeLevel && level < skin.challengeLevel) return false;
  return true;
}

export function isLimitedAvailable(skin: SkinDef): boolean {
  if (skin.type !== 'limited') return true;
  return !skin.limitedUntil || new Date() <= new Date(skin.limitedUntil);
}
