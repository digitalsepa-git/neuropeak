import {
  DEFAULT_REMOTE_CONFIG,
  experimentVariant,
  isVersionBelow,
  remoteBoolean,
  remoteNumber,
  remoteString,
  type RemoteConfig,
} from '@neuropeak/core';
import Constants from 'expo-constants';
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { getDeviceId } from '../progress/storage';
import { fetchRemoteConfig, loadCachedConfig } from './storage';

type RemoteContextValue = {
  readonly config: RemoteConfig;
  /** Sunucudan en az bir kez okundu mu; okunmadıysa önbellek ya da varsayılan. */
  readonly isFresh: boolean;
  getString: (key: string) => string;
  getNumber: (key: string) => number;
  getBoolean: (key: string) => boolean;
  /** Bu kullanıcının deneydeki kolu. */
  variantOf: (experiment: string, splitKey: string) => 'a' | 'b';
  /** Uygulama sürümü sunucunun istediği en düşük sürümün altında mı. */
  readonly needsUpdate: boolean;
};

const RemoteContext = createContext<RemoteContextValue>({
  config: DEFAULT_REMOTE_CONFIG,
  isFresh: false,
  getString: (key) => remoteString(DEFAULT_REMOTE_CONFIG, key),
  getNumber: (key) => remoteNumber(DEFAULT_REMOTE_CONFIG, key),
  getBoolean: (key) => remoteBoolean(DEFAULT_REMOTE_CONFIG, key),
  variantOf: () => 'a',
  needsUpdate: false,
});

const APP_VERSION = Constants.expoConfig?.version ?? '0.0.0';

/**
 * Yapılandırmayı açılışta okur: önce cihazdaki son bilinen değerler,
 * sonra sunucudan güncelleme. Sunucuya ulaşılamazsa uygulama
 * önbellekle, o da yoksa varsayılanlarla çalışır — yapılandırma
 * okunamadı diye hiçbir ekran boş kalmaz.
 */
export function RemoteConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<RemoteConfig>(DEFAULT_REMOTE_CONFIG);
  const [isFresh, setIsFresh] = useState(false);
  const [userId, setUserId] = useState('anonymous');

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const [cached, id] = await Promise.all([loadCachedConfig(), getDeviceId()]);
      if (cancelled) return;

      setConfig(cached);
      setUserId(id);

      const fresh = await fetchRemoteConfig();
      if (cancelled || fresh === null) return;

      setConfig(fresh);
      setIsFresh(true);
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<RemoteContextValue>(() => {
    const getString = (key: string) => remoteString(config, key);
    const getNumber = (key: string) => remoteNumber(config, key);
    const getBoolean = (key: string) => remoteBoolean(config, key);

    return {
      config,
      isFresh,
      getString,
      getNumber,
      getBoolean,
      variantOf: (experiment, splitKey) =>
        experimentVariant(experiment, userId, getNumber(splitKey)),
      needsUpdate: isVersionBelow(APP_VERSION, getString('app.min_version')),
    };
  }, [config, isFresh, userId]);

  return <RemoteContext value={value}>{children}</RemoteContext>;
}

export function useRemoteConfig(): RemoteContextValue {
  return use(RemoteContext);
}

/** Tek bir anahtarı okumak için kısayol. */
export function useRemoteBoolean(key: string): boolean {
  const { getBoolean } = useRemoteConfig();
  return useCallback(() => getBoolean(key), [getBoolean, key])();
}
