import { spacing } from '@neuropeak/ui';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';

type SectionProps = {
  title: string;
  /** Başlığın sağında küçük açıklama (ör. "3/3 tamamlandı"). */
  meta?: string;
  children: ReactNode;
};

export function Section({ title, meta, children }: SectionProps) {
  return (
    <View style={styles.root}>
      <View style={styles.head}>
        <Text variant="overline" color="textMuted">
          {title}
        </Text>
        {meta !== undefined && (
          <Text variant="caption" color="textMuted">
            {meta}
          </Text>
        )}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  head: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  root: {
    marginTop: spacing.lg,
  },
});
