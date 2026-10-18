import type { VisualQuestion } from '@neuropeak/core';
import { radius, spacing } from '@neuropeak/ui';
import { StyleSheet, View } from 'react-native';

import { Figure } from '@/components/test/figure';
import { Text, useTheme } from '@/components/ui';

const MATRIX_CELL = 64;
const ANALOGY_CELL = 68;

/**
 * Görsel sorunun gövdesi: matris ızgarası ya da analoji sırası.
 *
 * "Farklı olan" sorusunun gövdesi yok — şıkların kendisi soru, o
 * yüzden burada çizilmiyor.
 */
export function VisualPrompt({ visual }: { visual: VisualQuestion }) {
  const theme = useTheme();

  if (visual.layout === 'odd_one_out') return null;

  if (visual.layout === 'analogy') {
    const [first, second, third] = visual.cells;

    return (
      <View style={styles.analogy}>
        <Slot figure={first ?? null} size={ANALOGY_CELL} />
        <Separator label="→" />
        <Slot figure={second ?? null} size={ANALOGY_CELL} />
        {/* İki çifti ayıran boşluk, çift içindeki oktan geniş:
            "A → B" ile "C → ?" iki ayrı ilişki olarak okunsun. */}
        <View style={styles.gap} />
        <Slot figure={third ?? null} size={ANALOGY_CELL} />
        <Separator label="→" />
        <Missing size={ANALOGY_CELL} color={theme.colors.brand} />
      </View>
    );
  }

  return (
    <View style={styles.matrix}>
      {visual.cells.map((cell, index) =>
        cell === null ? (
          <Missing key={index} size={MATRIX_CELL} color={theme.colors.brand} />
        ) : (
          <View
            key={index}
            style={[styles.cell, { backgroundColor: theme.colors.surface, width: MATRIX_CELL }]}
          >
            <Figure figure={cell} size={MATRIX_CELL - 10} />
          </View>
        ),
      )}
    </View>
  );
}

function Slot({
  figure,
  size,
}: {
  figure: Parameters<typeof Figure>[0]['figure'] | null;
  size: number;
}) {
  const theme = useTheme();

  return (
    <View style={[styles.cell, { backgroundColor: theme.colors.surface, width: size }]}>
      {figure !== null && <Figure figure={figure} size={size - 10} />}
    </View>
  );
}

function Separator({ label }: { label: string }) {
  return (
    <Text variant="body" color="textMuted">
      {label}
    </Text>
  );
}

/** Aranan hücre: kesik çerçeve ve soru işareti. */
function Missing({ size, color }: { size: number; color: string }) {
  return (
    <View style={[styles.cell, styles.missing, { borderColor: color, width: size }]}>
      <Text variant="heading" color="brand">
        ?
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  analogy: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs2,
    justifyContent: 'center',
  },
  cell: {
    alignItems: 'center',
    aspectRatio: 1,
    borderRadius: radius.sm,
    justifyContent: 'center',
  },
  gap: {
    width: spacing.md,
  },
  matrix: {
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs2,
    justifyContent: 'center',
    width: MATRIX_CELL * 3 + 8,
  },
  missing: {
    borderStyle: 'dashed',
    borderWidth: 2,
  },
});
