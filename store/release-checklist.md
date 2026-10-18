# Yayın hazırlığı — TestFlight ve mağaza

Bu listedeki adımların bir kısmı senin hesaplarını gerektiriyor;
kodla yapılabilecek her şey yapıldı ve nerede durduğu aşağıda yazıyor.

## Kodda hazır olanlar

- `apps/mobile/eas.json` — development / preview / production yapı
  profilleri. Production'da `autoIncrement` açık, böylece build
  numarasını elle artırmaya gerek yok.
- `apps/mobile/app.json` — sürüm **1.0.0**, paket kimliği
  `com.neuropeak.iqarena` (iOS ve Android aynı),
  `ITSAppUsesNonExemptEncryption: false`. Bu bayrak olmadan her
  TestFlight yüklemesinde dışa aktarma uyumluluğu sorusu elle
  yanıtlanıyor; uygulama yalnızca standart HTTPS kullandığı için yanıt
  "hayır".
- `legal/` — gizlilik politikası ve kullanım şartları, Türkçe ve
  İngilizce.
- `store/listing/` — mağaza metinleri, iki dilde.
- `store/app-privacy.md` — Apple'ın App Privacy anketinin yanıtları,
  hangi kodun hangi veriyi gönderdiğiyle birlikte.
- `store/screenshots/` — 6.9" ekran görüntüleri, iki dilde.
- Uygulamadaki **Ayarlar → Gizlilik Politikası / Kullanım Şartları /
  E-posta Desteği** satırları artık gerçekten açılıyor. Adresler
  `apps/mobile/src/lib/links.ts` içinde tek yerde.

## Senin yapman gerekenler

### 1. Adresleri canlıya al — **Apple bunu şart koşuyor**

`legal/` altındaki iki belge şu adreslerden erişilebilir olmalı:

- <https://neuropeak.app/privacy>
- <https://neuropeak.app/terms>

Apple gizlilik politikası adresine erişemezse inceleme reddediliyor.
Alan adı yoksa en hızlı yol belgeleri GitHub Pages'e koyup
`links.ts` ile mağaza kaydındaki adresleri oraya çevirmek.

`destek@neuropeak.app` kutusu da açılmalı; şu an yalnızca
`links.ts` ve mağaza metinlerinde yazılı.

### 2. Apple Developer Program

- Üyelik (yıllık ücretli) ve App Store Connect erişimi.
- App Store Connect'te `com.neuropeak.iqarena` kimliğiyle uygulama
  kaydı.
- `eas.json` içindeki `ascAppId` ve `appleTeamId` yer tutucularını
  gerçek değerlerle doldur.

### 3. Abonelik ürünleri

App Store Connect → Abonelikler altında üç ürün:

| Ürün kimliği                 | Tür                    |
| ---------------------------- | ---------------------- |
| `neuropeak_pro_weekly`       | Haftalık, 3 gün deneme |
| `neuropeak_pro_annual`       | Yıllık                 |
| `neuropeak_pro_annual_offer` | Yıllık, indirimli      |

Kimlikler `apps/mobile/src/lib/billing/catalog.ts` ile birebir aynı
olmalı. Sonra RevenueCat projesinde bu ürünleri `pro` yetkisine bağla
ve API anahtarlarını `.env`'e yaz.

### 4. AdMob

AdMob panelinde uygulama ve reklam birimleri açıp kimlikleri
`.env`'e yaz (`apps/mobile/.env.example` alanları gösteriyor).
Kimlikler boşken uygulama reklamsız derleniyor — ilk TestFlight
yüklemesini reklamsız göndermek de bir seçenek.

### 5. İlk TestFlight yüklemesi

```bash
npm i -g eas-cli
eas login
cd apps/mobile
eas build --platform ios --profile production
eas submit --platform ios --latest
```

TestFlight'ta doldurulacaklar:

- **Beta App Description** — `store/listing/tr.md` içindeki promosyon
  metni yeterli.
- **Feedback Email** — `destek@neuropeak.app`.
- **Beta App Review Information** — test hesabı gerekmiyor; uygulama
  hesapsız çalışıyor. Not alanına şunu yazmak incelemeyi hızlandırır:
  _"Uygulama hesap gerektirmez. Temel IQ Testi ücretsizdir ve
  abonelik olmadan tamamlanabilir."_

### 6. Mağaza kaydı

- `store/listing/{tr,en}.md` metinlerini App Store Connect'e aktar.
- `store/screenshots/{tr,en}/` içindeki altı görseli her dil için
  yükle (6.9", 1320×2868).
- Yaş sınırı anketi: bütün içerik başlıkları "Yok", reklam kutusu
  işaretli. Beklenen sonuç **12+**.
- App Privacy anketi: `store/app-privacy.md`. Gönderdiğin derlemede
  AdMob ve RevenueCat anahtarlarının dolu olup olmadığına göre
  doğru sütunu doldur.

## İnceleme öncesi riskler

**IQ iddiası.** App Store, ölçüm ve sağlık iddialarına karşı
hassas. Önlem olarak:

- Uygulama içinde test girişinde ve sonuç ekranında "eğlence ve
  zihinsel egzersiz amaçlıdır; klinik veya psikometrik bir teşhis
  aracı değildir" uyarısı var.
- Aynı cümle mağaza açıklamasının sonunda da var.
- Açıklamada "gerçek IQ'nu ölç", "zekânı artır" gibi iddialar yok.

Yine de reddedilirse en olası gerekçe budur; metni yumuşatmak
gerekebilir.

**Abonelik ekranı.** Apple fiyatın, dönemin ve otomatik yenilemenin
satın alma ekranında görünmesini şart koşuyor. Üçü de var; deneme
süresi varsa açıklama cümlesi deneme süresini de yazıyor.

**Boş durum.** İnceleyen kişi hiç oyun oynamadan Lig sekmesine
bakarsa üretilmiş rakipleri görecek. Ekranda "Deneme ligi — rakipler
şimdilik cihazında üretiliyor" kartı var, gerçek oyuncu gibi
sunulmuyor.

## Eksik kalan ürün işleri

Yayını engellemiyor ama ilk güncellemeye girmeli:

- Beş testin soru bankası yok (Görsel IQ, Beyin Yaşı, Zihin Arketipi,
  Odaklanma Profili, Kişilik Haritası). Listede "Yakında" rozetiyle
  duruyorlar ve açılmıyorlar.
- Oyun başına ilerleme kaydı yer tutucu (`data/placeholder.ts`
  içindeki `GAME_PROGRESS`).
- Bildirimler: izin isteniyor ama bildirim gönderilmiyor ve cihaz
  bildirim kimliği saklanmıyor. Gizlilik politikası bunu açıkça
  yazıyor; push açılınca politika da güncellenmeli.
