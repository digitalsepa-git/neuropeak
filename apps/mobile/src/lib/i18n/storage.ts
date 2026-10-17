import AsyncStorage from '@react-native-async-storage/async-storage';
import { parseLanguage, resolveLanguage, type AppLanguage } from '@neuropeak/core';
import { getLocales } from 'expo-localization';

const STORAGE_KEY = 'neuropeak.language.v1';

/** Cihazın dil sıralamasına göre varsayılan dil. */
export function deviceLanguage(): AppLanguage {
  try {
    return resolveLanguage(getLocales().map((locale) => locale.languageTag));
  } catch {
    return 'en';
  }
}

/**
 * Kullanıcının seçtiği dil; seçmemişse cihazın dili.
 *
 * Seçim okunamazsa cihaz dili kullanılıyor: dil yüzünden açılmayan
 * bir uygulama, yanlış dilde açılan uygulamadan kötüdür.
 */
export async function loadLanguage(): Promise<AppLanguage> {
  try {
    return parseLanguage(await AsyncStorage.getItem(STORAGE_KEY)) ?? deviceLanguage();
  } catch {
    return deviceLanguage();
  }
}

export async function saveLanguage(language: AppLanguage): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, language);
  } catch {
    // Yazılamazsa seçim bu oturum boyunca geçerli kalır.
  }
}
