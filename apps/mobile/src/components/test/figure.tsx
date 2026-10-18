import type { ContentFigure, FigureGlyph, GlyphTone } from '@neuropeak/core';
import { palette, radius } from '@neuropeak/ui';
import { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';

import { useTheme } from '@/components/ui';

/**
 * Görsel test sorularının şekil çizimi.
 *
 * İçerikteki `ContentFigure` tanımını çizer. Şekiller 100×100'lük bir
 * kutuda tanımlı ve istenen boya ölçekleniyor; aynı simge hem soru
 * ızgarasında hem şık kartında kullanılabilsin diye.
 *
 * Renk adı değil rol geliyor (`primary`, `accent`…): koyu temada
 * karşılıkları değişiyor. Hiçbir soru yalnızca renge dayanmıyor —
 * ayrım biçimde de var, renk körlüğü olan biri de çözebilsin.
 */

/** 100×100 kutuda, merkezi (50,50) olan şekil yolları. */
const PATHS: Record<FigureGlyph['shape'], string> = {
  circle: 'M50 8 A42 42 0 1 1 49.99 8 Z',
  square: 'M12 12 H88 V88 H12 Z',
  triangle: 'M50 8 L92 86 H8 Z',
  diamond: 'M50 6 L94 50 L50 94 L6 50 Z',
  star: 'M50 5 L61 38 H96 L68 59 L79 92 L50 71 L21 92 L32 59 L4 38 H39 Z',
  hexagon: 'M50 6 L88 28 V72 L50 94 L12 72 V28 Z',
};

function Glyph({ glyph, size, color }: { glyph: FigureGlyph; size: number; color: string }) {
  // Kırpma kimliği belgede benzersiz olmalı; aynı anda onlarca simge
  // çizilebiliyor ve sabit bir kimlik hepsini birbirine bağlardı.
  // `useId` iki nokta üstüste içeriyor (":r3:"), bu da `url(#...)`
  // başvurusunu geçersiz kılıyor — harf ve rakam dışı her şey atılıyor.
  const clipId = `half${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const path = PATHS[glyph.shape];
  const outlined = glyph.fill !== 'solid';

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <ClipPath id={clipId}>
          <Rect x="0" y="0" width="50" height="100" />
        </ClipPath>
      </Defs>
      <G rotation={glyph.rotation ?? 0} origin="50, 50">
        <Path
          d={path}
          fill={outlined ? 'none' : color}
          stroke={color}
          strokeWidth={outlined ? 8 : 0}
          strokeLinejoin="round"
        />
        {glyph.fill === 'half' && <Path d={path} fill={color} clipPath={`url(#${clipId})`} />}
      </G>
    </Svg>
  );
}

export function Figure({
  figure,
  size,
  dimmed = false,
}: {
  figure: ContentFigure;
  size: number;
  /** Devre dışı kartlarda soluk çizim. */
  dimmed?: boolean;
}) {
  const theme = useTheme();

  const toneColor: Record<GlyphTone, string> = {
    primary: theme.colors.brand,
    secondary: palette.accentMemory,
    accent: palette.accentAttention,
    muted: theme.colors.textMuted,
  };

  // Birden çok simge yan yana sığsın diye kutu simge sayısına bölünür.
  const count = Math.max(1, figure.glyphs.length);
  const glyphSize = count === 1 ? size * 0.8 : Math.max(12, size / count - 3);

  return (
    <View style={[styles.row, { height: size, width: size, opacity: dimmed ? 0.35 : 1 }]}>
      {figure.glyphs.map((glyph, index) => (
        // Aynı hücredeki simgeler özdeş olabiliyor; sıradan başka
        // ayırt edici yok.
        <Glyph key={index} glyph={glyph} size={glyphSize} color={toneColor[glyph.tone]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    borderRadius: radius.sm,
    flexDirection: 'row',
    gap: 2,
    justifyContent: 'center',
  },
});
