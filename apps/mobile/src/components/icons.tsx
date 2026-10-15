import type { ReactNode } from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

/**
 * Çizgi tabanlı ikon seti. Hepsi 24×24 kutuda, aynı kalınlık ve yuvarlak
 * uçlarla çizilir; böylece ekranlarda tek bir çizim dili olur.
 */
const PATHS = {
  home: (
    <>
      <Path d="M3 10.3 12 3l9 7.3" />
      <Path d="M5.6 9.3V19a2 2 0 0 0 2 2h8.8a2 2 0 0 0 2-2V9.3" />
      <Path d="M9.7 21v-5.4a2 2 0 0 1 2-2h.6a2 2 0 0 1 2 2V21" />
    </>
  ),
  games: (
    <>
      <Rect x={2.5} y={7.5} width={19} height={11} rx={5.5} />
      <Path d="M7.5 11.3v3.4M5.8 13h3.4" />
      <Circle cx={16.3} cy={12.2} r={1.15} />
      <Circle cx={18.6} cy={14.8} r={1.15} />
    </>
  ),
  tests: (
    <>
      <Rect x={4} y={4.5} width={16} height={16.5} rx={3} />
      <Path d="M9.2 2.8h5.6a1 1 0 0 1 1 1v1.7H8.2V3.8a1 1 0 0 1 1-1Z" />
      <Path d="M8.6 11.2h6.8M8.6 15.4h4.4" />
    </>
  ),
  progress: (
    <>
      <Path d="M4 20.5h16" />
      <Path d="M7 20.5v-6M12 20.5V6.5M17 20.5v-9.5" />
    </>
  ),
  league: (
    <>
      <Path d="M7.5 3.5h9v4.8a4.5 4.5 0 0 1-9 0V3.5Z" />
      <Path d="M7.5 5.4H5.2a3 3 0 0 0 3 3M16.5 5.4h2.3a3 3 0 0 1-3 3" />
      <Path d="M12 12.8v3.4M9 20.5h6M10.2 16.2h3.6l.8 4.3h-5.2Z" />
    </>
  ),
  star: (
    <Path d="m12 3.4 2.65 5.37 5.93.86-4.29 4.18 1.01 5.9L12 16.92l-5.3 2.79 1.01-5.9-4.29-4.18 5.93-.86L12 3.4Z" />
  ),
  flame: (
    <Path d="M12 2.6c3.3 2.7 5.1 5.5 5.1 8.5a5.1 5.1 0 1 1-10.2 0c0-1.5.5-2.9 1.5-4 .2 1.3.9 2.1 1.8 2.1 1.2 0 1.9-1.1 1.9-2.7 0-1.2-.4-2.6-1.1-3.9Z" />
  ),
  settings: (
    <>
      <Path d="M4 7.5h9.5M18.5 7.5H20M4 16.5h3.5M12.5 16.5H20" />
      <Circle cx={16} cy={7.5} r={2.3} />
      <Circle cx={10} cy={16.5} r={2.3} />
    </>
  ),
  lock: (
    <>
      <Rect x={4.5} y={10} width={15} height={10.5} rx={3} />
      <Path d="M8.2 10V7.3a3.8 3.8 0 0 1 7.6 0V10" />
    </>
  ),
  chevronRight: <Path d="m9.5 5 7 7-7 7" />,
  check: <Path d="m4.5 12.5 5 5 10-11" />,
  sound: (
    <>
      <Path d="M4 9.3h3.2L11.4 5.6v12.8L7.2 14.7H4z" />
      <Path d="M15.2 9.6a3.6 3.6 0 0 1 0 4.8M17.8 7a7.2 7.2 0 0 1 0 10" />
    </>
  ),
  globe: (
    <>
      <Circle cx={12} cy={12} r={9} />
      <Path d="M3.3 9.4h17.4M3.3 14.6h17.4" />
      <Path d="M12 3c2.3 2.5 3.4 5.5 3.4 9s-1.1 6.5-3.4 9c-2.3-2.5-3.4-5.5-3.4-9S9.7 5.5 12 3Z" />
    </>
  ),
  bell: (
    <>
      <Path d="M18 15.8V11a6 6 0 0 0-12 0v4.8L4.6 18.2h14.8L18 15.8Z" />
      <Path d="M10 20.6a2.2 2.2 0 0 0 4 0" />
    </>
  ),
  shield: <Path d="m12 2.8 7.5 3v5.5c0 4.3-3 8.2-7.5 9.6-4.5-1.4-7.5-5.3-7.5-9.6V5.8l7.5-3Z" />,
  document: (
    <>
      <Path d="M6.6 2.9h6.1l4.7 4.8v13.4H6.6z" />
      <Path d="M12.7 2.9v4.8h4.7" />
      <Path d="M9.6 13h5M9.6 16.6h3.4" />
    </>
  ),
  mail: (
    <>
      <Rect x={3} y={5.4} width={18} height={13.2} rx={3} />
      <Path d="m4.2 7.6 6.9 4.9a1.6 1.6 0 0 0 1.8 0l6.9-4.9" />
    </>
  ),
} as const satisfies Record<string, ReactNode>;

export type IconName = keyof typeof PATHS;

type IconProps = {
  name: IconName;
  color: string;
  size?: number;
  strokeWidth?: number;
  /** Yıldız ve alev gibi dolu çizilen ikonlar için. */
  filled?: boolean;
};

export function Icon({ name, color, size = 24, strokeWidth = 1.8, filled = false }: IconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? color : 'none'}
      stroke={color}
      strokeWidth={filled ? 0 : strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {PATHS[name]}
    </Svg>
  );
}
