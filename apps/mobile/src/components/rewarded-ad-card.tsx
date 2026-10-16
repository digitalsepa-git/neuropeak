import { DAILY_REWARDED_AD_LIMIT, STAR_REWARDS } from '@neuropeak/core';
import { radius, spacing } from '@neuropeak/ui';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icons';
import { Button, Card, Text, useTheme } from '@/components/ui';
import { useAds } from '@/lib/ads/context';

/**
 * Ödüllü reklam girişi.
 *
 * Reklam birimi tanımlı değilse, günlük hak bittiyse ya da kullanıcı
 * PRO ise hiç görünmüyor: tıklanınca hiçbir şey olmayan bir düğme
 * göstermek, olmayan bir ödülü vaat etmek olurdu.
 */
export function RewardedAdCard() {
  const theme = useTheme();
  const { canWatchRewarded, rewardedLeft, watchRewarded } = useAds();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  if (!canWatchRewarded) return null;

  return (
    <Card padding="md">
      <View style={styles.row}>
        <View style={[styles.icon, { backgroundColor: `${theme.colors.brand}1F` }]}>
          <Icon name="star" color={theme.colors.brand} size={20} />
        </View>
        <View style={styles.copy}>
          <Text variant="subheading">+{STAR_REWARDS.rewardedAd} yıldız</Text>
          <Text variant="caption" color="textMuted">
            Kısa bir reklam izle. Bugün {rewardedLeft}/{DAILY_REWARDED_AD_LIMIT} hakkın kaldı.
          </Text>
        </View>
      </View>

      {note !== null && (
        <Text variant="caption" color="textMuted" style={styles.note}>
          {note}
        </Text>
      )}

      <View style={styles.action}>
        <Button
          label="Reklam izle"
          variant="secondary"
          size="md"
          loading={busy}
          onPress={() => {
            setNote(null);
            setBusy(true);
            void watchRewarded()
              .then((outcome) => {
                if (outcome.status === 'rewarded') return;
                setNote(
                  outcome.status === 'dismissed'
                    ? 'Reklam sonuna kadar izlenmedi, yıldız eklenmedi.'
                    : 'Şu anda uygun reklam yok, sonra tekrar dene.',
                );
              })
              .finally(() => setBusy(false));
          }}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  action: {
    marginTop: spacing.sm,
  },
  copy: {
    flex: 1,
    gap: spacing.xs2,
  },
  icon: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  note: {
    marginTop: spacing.xs,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
