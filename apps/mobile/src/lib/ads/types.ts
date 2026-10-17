export type AdOutcome =
  | { readonly status: 'shown' }
  /** Ödüllü reklam sonuna kadar izlendi; ödül verilebilir. */
  | { readonly status: 'rewarded' }
  | { readonly status: 'dismissed' }
  /** Reklam ağı kurulu değil ya da bu derlemede yok. */
  | { readonly status: 'unavailable' }
  /** Yüklenemedi ya da gösterilemedi; nedeni kullanıcıya yazılmıyor. */
  | { readonly status: 'error' };

export type AdProvider = {
  /** Gerçek reklam ağı bağlantısı var mı. */
  readonly isConfigured: boolean;
  /** Reklamları önceden yükler; gösterim anındaki bekleme azalsın diye. */
  prepare(): Promise<void>;
  showInterstitial(): Promise<AdOutcome>;
  showRewarded(): Promise<AdOutcome>;
};
