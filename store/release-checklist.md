# Yayın hazırlığı — TestFlight ve mağaza

Kodla yapılabilecek her şey yapıldı. Kalanlar senin hesaplarını
istiyor ve hiçbiri bu makineden yapılamaz.

Sıra önemli: **Supabase projesi** olmadan panel, senkronizasyon,
analitik ve bildirim kapalı kalır; **Apple üyeliği** olmadan
TestFlight'a yükleme yapılamaz. İkisi de senin açman gereken hesap.

---

## Kodda hazır olanlar

### Uygulama

- 29 mini oyun, 7 IQ testi, Beyin Yaşı ve üç profil testi — hepsi
  oynanıyor, hepsinin bankası yazılı. Listede "yakında" diye duran
  test yok.
- İçerik veritabanından okunuyor; bağlantı yoksa uygulamayla gelen
  gömülü bankaya düşüyor. Uygulama çevrimdışı tam çalışıyor.
- Türkçe ve İngilizce; dil ayarlardan değişiyor.
- Oyun başına ilerleme, XP, seviye, günlük seri, günlük görevler,
  rozetler, beyin haritası, haftalık lig.
- **Ayarlar → Gizlilik Politikası / Kullanım Şartları / E-posta
  Desteği** gerçekten açılıyor. Adresler `apps/mobile/src/lib/links.ts`
  içinde tek yerde.
- Bildirim anahtarı çalışıyor: izin istiyor, jetonu `push_tokens`'a
  yazıyor, kapatınca jetonu silmiyor pasife alıyor.

### Derleme yapılandırması

- `apps/mobile/eas.json` — development / preview / production
  profilleri. Production'da `autoIncrement` açık; build numarasını
  elle artırmaya gerek yok.
- `apps/mobile/app.json` — sürüm **1.0.0**, paket kimliği
  `com.neuropeak.iqarena` (iOS ve Android aynı),
  `ITSAppUsesNonExemptEncryption: false`. Bu bayrak olmadan her
  TestFlight yüklemesinde dışa aktarma uyumluluğu sorusu elle
  yanıtlanıyor; uygulama yalnızca standart HTTPS kullandığı için
  yanıt "hayır".
- `aps-environment` derleme profiline bağlı: geliştirme sandbox,
  TestFlight ve mağaza üretim APNs'i. Sabit bir değer, TestFlight
  derlemesinin sandbox'a kaydolmasına ve bildirimlerin sessizce hiç
  ulaşmamasına yol açıyordu.
- Simge, uyarlanabilir Android simgesi ve açılış ekranı yerinde
  (`assets/images/`, 1024×1024).

### Panel

- Giriş ve yönetici yetkilendirmesi; içerik düzenleme (oyun, test,
  soru, görev, rozet üst bilgileri); kullanıcı ve analitik ekranları;
  push kampanyası bestecisi ve segment kitle sayaçları.
- Sayılar veritabanında hesaplanıyor; panel ham olay satırı okumuyor.

### Belgeler

- `legal/` — gizlilik politikası ve kullanım şartları, iki dilde.
- `store/listing/{tr,en}.md` — mağaza metinleri.
- `store/app-privacy.md` — Apple'ın App Privacy anketinin yanıtları,
  hangi kodun hangi veriyi gönderdiğiyle birlikte.
- `store/screenshots/{tr,en}/` — 6.9" ekran görüntüleri, altı tane.

---

## Senin yapman gerekenler

### 1. Supabase projesi

Panel, senkronizasyon, analitik ve bildirim bu olmadan açılmıyor.
Uygulama çalışmaya devam ediyor ama her şey cihazda kalıyor.

1. supabase.com'da proje aç.
2. `supabase/migrations/` altındaki dosyaları sırayla uygula
   (Supabase CLI ya da SQL editörü).
3. `npm run db:seed` ile içeriği yaz.
4. Project Settings → API'deki iki değeri hem `apps/mobile/.env`'e
   hem panelin ortamına yaz (`apps/mobile/.env.example` alanları
   gösteriyor).
5. Kendi kullanıcını `public.admins` tablosuna ekle; panel yönetici
   olmayan hesaba veri göstermiyor.

### 2. Adresleri canlıya al — **Apple bunu şart koşuyor**

`legal/` altındaki iki belge şu adreslerden erişilebilir olmalı:

- <https://neuropeak.app/privacy>
- <https://neuropeak.app/terms>

Apple gizlilik politikası adresine erişemezse inceleme reddediliyor.
Alan adı yoksa en hızlı yol belgeleri GitHub Pages'e koyup
`links.ts` ile mağaza kaydındaki adresleri oraya çevirmek.

`destek@neuropeak.app` kutusu da açılmalı; şu an yalnızca
`links.ts` ve mağaza metinlerinde yazılı.

### 3. Apple Developer Program

- Üyelik (yıllık ücretli) ve App Store Connect erişimi.
- App Store Connect'te `com.neuropeak.iqarena` kimliğiyle uygulama
  kaydı.
- `eas.json` içindeki `ascAppId` ve `appleTeamId` yer tutucularını
  gerçek değerlerle doldur.

### 4. Abonelik ürünleri

App Store Connect → Abonelikler altında üç ürün:

| Ürün kimliği                 | Tür                    |
| ---------------------------- | ---------------------- |
| `neuropeak_pro_weekly`       | Haftalık, 3 gün deneme |
| `neuropeak_pro_annual`       | Yıllık                 |
| `neuropeak_pro_annual_offer` | Yıllık, indirimli      |

Kimlikler `apps/mobile/src/lib/billing/catalog.ts` ile birebir aynı
olmalı. Sonra RevenueCat projesinde bu ürünleri `pro` yetkisine bağla
ve API anahtarlarını `.env`'e yaz.

### 5. AdMob

AdMob panelinde uygulama ve reklam birimleri açıp kimlikleri
`.env`'e yaz. Kimlikler boşken uygulama reklamsız derleniyor — ilk
TestFlight yüklemesini reklamsız göndermek da bir seçenek, hatta
daha az değişken demek.

### 6. İlk TestFlight yüklemesi

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

### 7. Mağaza kaydı

- `store/listing/{tr,en}.md` metinlerini App Store Connect'e aktar.
- `store/screenshots/{tr,en}/` içindeki altı görseli her dil için
  yükle (6.9", 1320×2868).
- Yaş sınırı anketi: bütün içerik başlıkları "Yok", reklam kutusu
  işaretli. Beklenen sonuç **12+**.
- App Privacy anketi: `store/app-privacy.md`. Gönderdiğin derlemede
  AdMob ve RevenueCat anahtarlarının dolu olup olmadığına göre
  doğru sütunu doldur.

---

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

---

## Yayını engellemeyen bilinen eksikler

**Bildirim gönderilemiyor.** Zincirin üç halkası hazır: uygulama
jetonu kaydediyor, panel kampanyayı taslak olarak saklıyor, segment
kuralı kitleye çevriliyor. Dördüncüsü — taslağı alıp Expo'nun push
servisine yollayan Edge Function — yazılmadı. Dağıtılmış bir
Supabase projesi olmadan ne yazılabilir ne denenebilirdi; proje
açıldıktan sonra yapılacak ilk iş bu. Panel kullanıcıya "gönderim
henüz yok" diyor, gönderebiliyormuş gibi davranmıyor.

**Panelden içerik eklenemiyor, silinemiyor.** Var olan içerik
düzenlenebiliyor; yeni oyun/test/soru eklemek ve silmek yok. İçerik
`packages/content` içinde yazılı ve seed ile gidiyor.

**Lig rakipleri gerçek değil.** Sunucu tarafı lig eşleştirmesi
yazılmadı; rakipler cihazda üretiliyor ve ekran bunu söylüyor.

**Dil desteği iki dil.** Arapça, İspanyolca ve Portekizce altyapısı
hazır ama çeviri yok.
