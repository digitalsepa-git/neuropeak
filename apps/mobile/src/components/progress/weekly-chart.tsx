import type { DayActivity } from '@neuropeak/core';
import { radius, spacing } from '@neuropeak/ui';
import { StyleSheet, View } from 'react-native';

import { Text, useTheme } from '@/components/ui';
import { useT } from '@/lib/i18n';
import type { StringKey } from '@/lib/i18n';

const BAR_HEIGHT = 96;
/**
 * İki harf, tek harf değil: Pazar, Pazartesi ve Perşembe tek harfte
 * aynı görünüyor ve grafik okunmaz oluyordu.
 */
const DAY_KEYS: readonly StringKey[] = [
  'day.mon',
  'day.tue',
  'day.wed',
  'day.thu',
  'day.fri',
  'day.sat',
  'day.sun',
];

function dayKey(date: string): StringKey {
  // Pazartesi haftanın ilk günü; getUTCDay() pazarı 0 verdiği için kaydırılıyor.
  const index = (new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7;
  return DAY_KEYS[index] ?? 'day.mon';
}

/**
 * Son yedi günün XP'si. Oynanmayan gün boş bırakılmıyor, sıfır
 * yüksekliğinde bir iz olarak duruyor — seri kopukluğu görünür olsun.
 */
export function WeeklyChart({ days }: { days: readonly DayActivity[] }) {
  const theme = useTheme();
  const t = useT();
  const peak = Math.max(1, ...days.map((day) => day.xp));

  return (
    <View style={styles.root}>
      {days.map((day, index) => {
        const isToday = index === days.length - 1;
        const height = Math.max(3, (day.xp / peak) * BAR_HEIGHT);

        return (
          <View key={day.date} style={styles.column}>
            <Text variant="caption" color="textMuted" numberOfLines={1}>
              {day.xp > 0 ? day.xp : ''}
            </Text>
            <View
              style={[
                styles.bar,
                {
                  backgroundColor: isToday ? theme.colors.brand : theme.colors.surfaceElevated,
                  height,
                },
              ]}
            />
            <Text variant="caption" color={isToday ? 'brand' : 'textMuted'}>
              {t(dayKey(day.date))}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderRadius: radius.sm,
    width: 22,
  },
  column: {
    alignItems: 'center',
    gap: spacing.xs2,
    justifyContent: 'flex-end',
  },
  root: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: BAR_HEIGHT + 40,
  },
});
