# App Store Connect — App Privacy yanıtları

Apple'ın "App Privacy" anketi gönderilen ikiliyle örtüşmek zorunda.
Aşağıdaki yanıtlar koddan çıkarıldı; hangi dosyanın hangi veriyi
gönderdiği yazılı ki anket bir dahaki sefere tahminle doldurulmasın.

Uygulama iki yapılandırmada farklı veri topluyor. Hangi sütunu
dolduracağın, gönderdiğin derlemede AdMob ve RevenueCat anahtarlarının
tanımlı olup olmadığına bağlı (`apps/mobile/.env`).

| Veri türü (Apple'ın adlandırması) | Anahtarsız derleme | AdMob + RevenueCat açıkken | Nereden                                                                      |
| --------------------------------- | ------------------ | -------------------------- | ---------------------------------------------------------------------------- |
| Contact Info                      | Toplanmıyor        | Toplanmıyor                | —                                                                            |
| Health & Fitness                  | Toplanmıyor        | Toplanmıyor                | IQ puanı sağlık verisi değil; testler teşhis aracı değil                     |
| Financial Info                    | Toplanmıyor        | Toplanmıyor                | Satın alma mağazada; kart bilgisi uygulamaya gelmiyor                        |
| Location                          | Toplanmıyor        | **Coarse Location**        | AdMob reklam seçimi için yaklaşık konum kullanabiliyor                       |
| Sensitive Info                    | Toplanmıyor        | Toplanmıyor                | —                                                                            |
| Contacts                          | Toplanmıyor        | Toplanmıyor                | —                                                                            |
| User Content                      | Toplanmıyor        | Toplanmıyor                | —                                                                            |
| Browsing History                  | Toplanmıyor        | Toplanmıyor                | —                                                                            |
| Search History                    | Toplanmıyor        | Toplanmıyor                | —                                                                            |
| Identifiers → User ID             | **Toplanıyor**     | **Toplanıyor**             | `progress/storage.ts` `getDeviceId()` — cihazda üretilen rastgele kimlik     |
| Identifiers → Device ID           | Toplanmıyor        | **Toplanıyor**             | AdMob reklam kimliği (IDFA/GAID)                                             |
| Identifiers → Push Token          | Toplanmıyor        | **Toplanıyor**             | `lib/push/tokens.ts` → `push_tokens`; yalnızca kullanıcı bildirimleri açarsa |
| Purchases                         | Toplanmıyor        | **Toplanıyor**             | RevenueCat abonelik durumu                                                   |
| Usage Data → Product Interaction  | **Toplanıyor**     | **Toplanıyor**             | `lib/analytics.ts` → `analytics_events`                                      |
| Usage Data → Advertising Data     | Toplanmıyor        | **Toplanıyor**             | AdMob gösterim ve tıklama ölçümü                                             |
| Diagnostics                       | Toplanmıyor        | Toplanmıyor                | Çökme raporu servisi bağlı değil                                             |
| Other Data → Other                | **Toplanıyor**     | **Toplanıyor**             | Onboarding cevapları ve test sonuçları (`lib/sync/index.ts`)                 |

## Her veri için anketin sorduğu üç şey

**Identifiers → Push Token**

- Kullanım amacı: App Functionality
- Kimliğe bağlı mı: **Evet** (kayıt kullanıcının kimliğiyle duruyor)
- İzleme için mi: Hayır
- Not: Yalnızca kullanıcı Ayarlar'dan bildirimleri açarsa toplanıyor.
  Kapatınca kayıt siliniyor değil pasife alınıyor; hesap silinince
  gidiyor. Anahtarsız derlemede bildirim yok, jeton da yok.

**Identifiers → User ID**

- Kullanım amacı: App Functionality, Analytics
- Kimliğe bağlı mı: **Evet** (kullanıcının kendi kaydı bu kimlikle bulunuyor)
- İzleme için mi (tracking): **Hayır**

**Usage Data → Product Interaction**

- Amaç: Analytics, App Functionality
- Kimliğe bağlı mı: **Evet** (olaylar rastgele kimlikle gönderiliyor)
- İzleme için mi: **Hayır**

**Other Data** (onboarding cevapları, test sonuçları)

- Amaç: App Functionality, Analytics
- Kimliğe bağlı mı: **Evet**
- İzleme için mi: **Hayır**
- Not: Yaş **aralığı** soruluyor, doğum tarihi değil. Apple'ın
  "Sensitive Info" tanımına girmiyor.

**Identifiers → Device ID, Usage Data → Advertising Data, Coarse
Location** (yalnızca reklamlar açıkken)

- Amaç: Third-Party Advertising
- Kimliğe bağlı mı: **Evet**
- İzleme için mi: **Evet** → bu durumda App Tracking Transparency
  istemi zorunlu. `app.config.ts` içindeki
  `userTrackingUsageDescription` bu istemin metnini veriyor.

**Purchases** (yalnızca abonelik açıkken)

- Amaç: App Functionality
- Kimliğe bağlı mı: Evet
- İzleme için mi: Hayır

## Gönderim öncesi kontrol

- [ ] `apps/mobile/.env` içinde hangi anahtarların dolu olduğunu
      doğrula; ankette o sütunu doldur.
- [ ] Reklamlar açıksa ATT istemi gerçek cihazda görünüyor mu, bak.
- [ ] Gizlilik politikası adresi canlı mı (Apple erişemezse reddediyor).
- [ ] `legal/privacy-policy.*.md` ile bu tablo birbirini tutuyor mu.
