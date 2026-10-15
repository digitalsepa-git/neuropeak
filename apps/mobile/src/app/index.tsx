import { GAME_CATEGORIES, GAME_CATEGORY_META } from '@neuropeak/core';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Geçici karşılama ekranı. PR#3'te 5 sekmeli gerçek navigasyonla değiştirilecek.
 * Şimdilik paylaşılan @neuropeak/core paketinin uygulamadan çözümlendiğini doğrular.
 */
export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.title}>NeuroPeak</Text>
        <Text style={styles.subtitle}>IQ Arena</Text>

        <View style={styles.dots}>
          {GAME_CATEGORIES.map((category) => (
            <View
              key={category}
              style={[styles.dot, { backgroundColor: GAME_CATEGORY_META[category].accentColor }]}
            />
          ))}
        </View>

        <Text style={styles.caption}>{GAME_CATEGORIES.length} oyun kategorisi hazır</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F5FB',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#15111F',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '500',
    color: '#6C3BF4',
  },
  dots: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 32,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  caption: {
    marginTop: 20,
    fontSize: 14,
    color: '#6F6A80',
  },
});
