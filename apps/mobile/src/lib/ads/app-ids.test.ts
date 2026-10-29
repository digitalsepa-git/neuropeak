import { describe, expect, it } from 'vitest';

import { SAMPLE_ANDROID_APP_ID, SAMPLE_IOS_APP_ID, adMobAppIds } from './app-ids';

describe('adMobAppIds', () => {
  it('gerçek kimlikleri olduğu gibi kullanır', () => {
    const ids = adMobAppIds('ca-app-pub-1111~2222', 'ca-app-pub-3333~4444');

    expect(ids).toEqual({
      ios: 'ca-app-pub-1111~2222',
      android: 'ca-app-pub-3333~4444',
      isReal: true,
    });
  });

  it('kimlik yokken örnek kimliğe düşer', () => {
    // Boş bırakmak bir seçenek değil: SDK derlemede ve kimliksiz
    // açılışta uygulamayı düşürüyor.
    const ids = adMobAppIds(undefined, undefined);

    expect(ids.ios).toBe(SAMPLE_IOS_APP_ID);
    expect(ids.android).toBe(SAMPLE_ANDROID_APP_ID);
    expect(ids.isReal).toBe(false);
  });

  it('boş dizgeyi ve boşluğu kimlik saymaz', () => {
    expect(adMobAppIds('', '   ').isReal).toBe(false);
  });

  it('tek platformun kimliği yetmiyor', () => {
    // Yarım yapılandırma, diğer platformu çöken hâlinde bırakırdı.
    const ids = adMobAppIds('ca-app-pub-1111~2222', undefined);

    expect(ids.isReal).toBe(false);
    expect(ids.ios).toBe(SAMPLE_IOS_APP_ID);
  });
});
