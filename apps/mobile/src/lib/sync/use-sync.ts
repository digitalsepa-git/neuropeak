import { useEffect } from 'react';
import { AppState } from 'react-native';

import { ensureSession } from '../session';
import { flushOutbox } from './index';

/**
 * Açılışta anonim oturumu kurar ve bekleyen değişiklikleri gönderir;
 * uygulama arka plandan dönünce yeniden dener. Ağ durumunu dinlemek için
 * ayrı bir bağımlılık eklenmedi — öne gelme anı pratikte yeterli tetikleyici.
 */
export function useSyncBootstrap(): void {
  useEffect(() => {
    void ensureSession().then(() => flushOutbox());

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void flushOutbox();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);
}
