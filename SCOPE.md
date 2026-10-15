# NeuroPeak: IQ Arena — Ürün Kapsamı

> **Durum:** Taslak v1.0 — onay bekliyor
> **Tarih:** 15 Ekim 2026
> **Referans:** IQ Masters (Codeway) — video analizi yapıldı

---

## 1. Ürün Özeti

**NeuroPeak: IQ Arena**, IQ/zeka testleri ile beyin antrenman mini oyunlarını tek çatı altında birleştiren, güçlü şekilde oyunlaştırılmış bir mobil uygulamadır.

Referans uygulamadan farkımız: IQ Masters bir "test uygulaması + yanına oyunlar"dır. Biz bunu **bir oyun** olarak kurguluyoruz — XP, seviye, günlük seri, haftalık ligler, beyin haritası ve rozet sistemi uygulamanın merkezinde, testler ise bu sistemi besleyen "boss fight"lar olarak konumlanıyor.

**Paket adı:** `com.neuropeak.iqarena`
**Mağaza adı:** `NeuroPeak: IQ Arena — Beyin Oyunları`

---

## 2. Teknoloji Kararları

| Katman         | Seçim                                                              | Not                          |
| -------------- | ------------------------------------------------------------------ | ---------------------------- |
| Mobil          | **React Native + Expo (SDK 54+)**                                  | Tek kod tabanı iOS + Android |
| Navigasyon     | Expo Router (file-based)                                           |                              |
| Dil            | TypeScript (strict)                                                |                              |
| Animasyon      | Reanimated 3 + Skia + Lottie                                       | Oyun render'ı Skia ile       |
| State          | Zustand + TanStack Query                                           |                              |
| Yerel depolama | MMKV + expo-sqlite                                                 | Offline cache                |
| Backend        | **Supabase** (Postgres + Auth + Storage + Edge Functions + RLS)    |                              |
| Admin panel    | **Next.js 15 (App Router) + Vercel**                               | Monorepo içinde              |
| Ödeme          | **RevenueCat** + App Store / Play Billing                          |                              |
| Reklam         | **AdMob** (banner + interstitial + rewarded)                       | Feature flag ile kontrol     |
| Push           | Expo Push Notifications                                            | Panelden segment gönderimi   |
| i18n           | i18next — **TR + EN** (AR/ES/PT altyapısı hazır)                   |                              |
| Analitik       | Supabase event tablosu (kendi dashboard'umuz) + RevenueCat webhook | 3. parti maliyeti yok        |
| CI/CD          | GitHub Actions (lint + typecheck + test) + EAS Build               |                              |

### Monorepo yapısı

```
neuropeak/
├── apps/
│   ├── mobile/          # Expo uygulaması
│   └── admin/           # Next.js admin panel (Vercel)
├── packages/
│   ├── core/            # Skorlama motoru, seviye üreticiler, tipler
│   ├── ui/              # Paylaşılan tasarım token'ları
│   └── content/         # Soru bankası seed dosyaları (JSON)
└── supabase/            # Şema, migration'lar, Edge Functions
```

---

## 3. Tasarım Sistemi

**Yön:** Açık ve ferah menü/test ekranları + koyu ve odaklı oyun ekranları.

### Renkler

**Açık tema (menü, testler, profil)**

| Rol            | Değer     |
| -------------- | --------- |
| Zemin          | `#F6F5FB` |
| Kart           | `#FFFFFF` |
| Ana metin      | `#15111F` |
| İkincil metin  | `#6F6A80` |
| Birincil (mor) | `#6C3BF4` |
| Birincil koyu  | `#5429D6` |
| Ayraç          | `#ECEAF4` |

**Koyu tema (oyun ekranları)**

| Rol                | Değer     |
| ------------------ | --------- |
| Zemin              | `#120E20` |
| Yüzey              | `#1C1733` |
| Yükseltilmiş yüzey | `#272047` |
| Metin              | `#F4F2FF` |

**Kategori aksanları** (oyun kartları, beyin haritası eksenleri)

| Kategori       | Renk              |
| -------------- | ----------------- |
| Hafıza         | `#3B82F6` mavi    |
| Odaklanma      | `#F59E0B` turuncu |
| Mantık         | `#8B5CF6` mor     |
| Matematik      | `#10B981` yeşil   |
| Görsel-Uzamsal | `#EC4899` pembe   |
| Hız            | `#EF4444` kırmızı |
| Sözel          | `#14B8A6` turkuaz |

### Diğer

- **Tipografi:** Inter (değişken ağırlık). Başlık 28/22/18 bold, gövde 16/14 regular
- **Köşe yarıçapı:** Kart 20, buton 16, pill 999
- **Gölge:** Tek bir yumuşak gölge token'ı — `0 4px 16px rgba(21,17,31,0.08)`
- **Boşluk skalası:** 4 / 8 / 12 / 16 / 24 / 32 / 48
- **Hareket:** Her etkileşimde haptic + spring animasyon. Doğru cevap yeşil pulse, yanlış kırmızı shake
- **İlke:** Bir ekranda tek bir birincil eylem. Sadelik ve nefes alan boşluk önceliklidir

### Görsel üretimi

Logo ve uygulama ikonu vektörel (SVG) olarak üretilecek. Test/oyun kart görselleri tek tutarlı stilde AI ile üretilip repoda tutulacak — telif riski yok, istenildiği zaman değiştirilebilir.

---

## 4. Bilgi Mimarisi — 5 Sekme

| Sekme         | İçerik                                                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Ana Sayfa** | Günlük görevler (3), seri sayacı, günün önerilen oyunu/testi, NeuroPeak skoru özeti, lig durumu kartı, devam eden seviye |
| **Oyunlar**   | 7 kategori × 28 oyun, filtre çipleri, her oyunda seviye ilerlemesi ve en yüksek skor                                     |
| **Testler**   | 11 test, kategori filtreleri (Popüler / IQ Testleri / Eğlence / Profil)                                                  |
| **İlerleme**  | Beyin haritası radar grafiği, NeuroPeak skoru geçmişi, kategori bazlı istatistikler, rozet vitrini, test geçmişi         |
| **Lig**       | Haftalık lig tablosu (30 kişilik grup), terfi/düşme bölgeleri, global ve ülke sıralaması                                 |

Üst bar: yıldız bakiyesi · PRO rozeti · ayarlar.

---

## 5. Oyunlaştırma Sistemi

### 5.1 XP ve Seviye

- Her oyun seansı ve test XP kazandırır
- Zorluk çarpanı: Kolay ×1.0 · Orta ×1.25 · Zor ×2.25
- Kullanıcı seviyesi 1–100, logaritmik eğri
- Seviye atlamada tam ekran kutlama + yıldız ödülü

### 5.2 Günlük Seri (Streak)

- Günde en az 1 oyun veya test → seri devam
- 3 / 7 / 14 / 30 / 100 gün kilometre taşlarında özel ödül
- **Seri dondurma:** 1 gün kaçırmayı affeder, yıldızla satın alınır (PRO'da aylık 2 ücretsiz)

### 5.3 Beyin Haritası (5 eksen)

Radar grafiği: **Hafıza · Odaklanma · Mantık · Hız · Problem Çözme**, her eksen 0–100.

**NeuroPeak Skoru** = bu 5 eksenin ağırlıklı ortalaması. Oynadıkça büyür, oynamayınca haftada %1 azalır (geri gelme motivasyonu). Paylaşılabilir görsel kart olarak dışa aktarılır — organik yayılımın ana motoru.

### 5.4 Rozetler

~40 rozet, 4 kademeli (Bronz/Gümüş/Altın/Platin):

- İlerleme rozetleri ("100 seviye tamamla")
- Ustalık rozetleri ("Stroop'ta 50 doğru üst üste")
- Seri rozetleri
- Keşif rozetleri ("Her kategoriden bir oyun oyna")
- Gizli rozetler (sürpriz tetikleyiciler)

### 5.5 Lig Sistemi

- 6 kademe: **Bronz → Gümüş → Altın → Platin → Elmas → Efsane**
- Her hafta pazartesi 00:00'da 30 kişilik gruplara dağıtım
- Haftalık XP'ye göre sıralama. İlk 10 terfi, son 5 düşer
- Hafta sonunda ödül: yıldız + rozet
- İlk günlerde canlı hissettirmek için bot doldurma (gerçek kullanıcı sayısı artınca kapanır)
- Ayrıca **global** ve **ülke bazlı** NeuroPeak skoru sıralaması

### 5.6 Yıldız Ekonomisi

| Kazanma                               | Harcama                   |
| ------------------------------------- | ------------------------- |
| Oyun/test tamamlama                   | İpucu (oyun içi)          |
| Günlük görevler (3/gün)               | Geri al / seviye atla     |
| Günlük giriş takvimi (7 günlük döngü) | Seri dondurma             |
| Ödüllü reklam izleme                  | Avatar / tema kilidi açma |
| Seviye atlama, rozet                  |                           |

PRO üyelikte yıldız harcaması yok — tüm yardımlar sınırsız.

### 5.7 Günlük Görevler

Her gün 3 görev, gece yarısı yenilenir. Örnek: "2 hafıza oyunu oyna", "500 XP kazan", "Bir testi tamamla". Üçünü bitirince bonus sandık.

---

## 6. Mini Oyunlar — 28 Oyun / 7 Kategori

> Yapı: **Seviyeli** oyunlar prosedürel üretilmiş (seed'li, herkeste aynı) uzun seviye listesine sahip. **Süreli** oyunlar 45–60 saniyelik skor modunda, lider tablosuna bağlı.

### Hafıza (5)

| #   | Oyun          | Yapı     | Açıklama                                             |
| --- | ------------- | -------- | ---------------------------------------------------- |
| 1   | Kart Eşleme   | Seviyeli | Klasik hafıza kartları, artan grid boyutu            |
| 2   | N-Geri        | Süreli   | N-back; 1-back'ten başlar, performansa göre yükselir |
| 3   | Işık Dizisi   | Sonsuz   | Simon tarzı, her turda bir uzayan dizi               |
| 4   | Sayı Menzili  | Adaptif  | Digit span — doğru oldukça uzayan sayı dizisi        |
| 5   | Nerede Kaldı? | Seviyeli | Izgarada yanıp sönen hücrelerin konumunu hatırlama   |

### Odaklanma / Dikkat (5)

| #   | Oyun             | Yapı     | Açıklama                                            |
| --- | ---------------- | -------- | --------------------------------------------------- |
| 6   | Renk Tuzağı      | Süreli   | Stroop testi — kelime/renk çelişkisi                |
| 7   | Farklı Olanı Bul | Süreli   | Izgarada tek farklı tonu bulma, zorlaşan kontrast   |
| 8   | Simge Avı        | Süreli   | Schulte tablosu — sırayla hedefleri bulma           |
| 9   | Dur / Geç        | Süreli   | Go/No-Go — dürtü kontrolü                           |
| 10  | Çoklu Takip      | Seviyeli | Hareket eden nesneler arasında hedefleri takip etme |

### Mantık & Problem Çözme (6)

| #   | Oyun           | Yapı     | Açıklama                                      |
| --- | -------------- | -------- | --------------------------------------------- |
| 11  | Matris Bulmaca | Seviyeli | Raven tarzı 3×3 örüntü tamamlama              |
| 12  | Sıvı Sıralama  | Seviyeli | Ball sort / renk ayırma, prosedürel üretim    |
| 13  | Tek Çizgi      | Seviyeli | Kalemi kaldırmadan şekli çizme (Euler yolu)   |
| 14  | Bağlantı       | Seviyeli | Aynı renk noktaları çakışmadan bağlama (flow) |
| 15  | Doğru Yolu Seç | Seviyeli | Labirent / yön mantığı                        |
| 16  | Mantık Zinciri | Seviyeli | "Eğer–ise" çıkarım bulmacaları                |

### Matematik (4)

| #   | Oyun        | Yapı     | Açıklama                                     |
| --- | ----------- | -------- | -------------------------------------------- |
| 17  | Hızlı İşlem | Süreli   | 60 saniyede maksimum doğru işlem             |
| 18  | Sayı Dizisi | Seviyeli | Örüntüyü bul, eksik sayıyı tamamla           |
| 19  | Terazi      | Seviyeli | Eşitliği kurma / denge bulmacası             |
| 20  | Hedef Sayı  | Seviyeli | 4 sayı ve 4 işlemle hedefe ulaşma (24 oyunu) |

### Görsel-Uzamsal (4)

| #   | Oyun            | Yapı     | Açıklama                              |
| --- | --------------- | -------- | ------------------------------------- |
| 21  | Şekil Döndürme  | Süreli   | Zihinsel rotasyon — aynı mı, ayna mı? |
| 22  | Katla-Aç        | Seviyeli | Kağıt katlama / delme tahmini         |
| 23  | Parça Birleştir | Seviyeli | Tangram / blok yerleştirme            |
| 24  | Gölge Eşleştir  | Süreli   | Nesne–siluet eşleştirme               |

### Hız / Refleks (2)

| #   | Oyun        | Yapı   | Açıklama                                        |
| --- | ----------- | ------ | ----------------------------------------------- |
| 25  | Reaksiyon   | Süreli | Saf tepki süresi ölçümü, milisaniye hassasiyeti |
| 26  | Hızlı Karar | Süreli | Sembol karşılaştırma — büyük/küçük, aynı/farklı |

### Sözel (2)

| #   | Oyun          | Yapı     | Açıklama                                            |
| --- | ------------- | -------- | --------------------------------------------------- |
| 27  | Kelime Avı    | Seviyeli | Anagram / harflerden kelime üretme (TR + EN sözlük) |
| 28  | Sözel Analoji | Seviyeli | "A : B :: C : ?" ilişki kurma                       |

Her oyun ekranının ortak iskeleti: üst bar (duraklat · seviye · skor · reklamsız · ses) → talimat balonu → oyun alanı → alt araç çubuğu (ipucu · geri al, yıldız bakiyesi ile).

Oyun öncesi brifing ekranı: oyun ikonu, zorluk seçimi (Kolay / Orta / Zor + XP çarpanı), "artırılacak yetenekler" kartları, **Başla** butonu.

---

## 7. Testler — 11 Test

| Test                       | Soru             | Süre   | Erişim                 |
| -------------------------- | ---------------- | ------ | ---------------------- |
| **Temel IQ Testi**         | 20               | ~10 dk | Ücretsiz (giriş testi) |
| **İleri IQ Testi**         | 60               | ~18 dk | PRO                    |
| **Görsel IQ Testi**        | 30               | ~12 dk | PRO                    |
| **Sayısal IQ Testi**       | 30               | ~12 dk | PRO                    |
| **Sözel IQ Testi**         | 25               | ~10 dk | PRO                    |
| **Hızlı IQ Testi**         | 12               | ~5 dk  | PRO                    |
| **Mantıksal Akıl Yürütme** | 25               | ~10 dk | PRO                    |
| **Beyin Yaşı Testi**       | 15 + 2 mini oyun | ~8 dk  | PRO                    |
| **Zihin Arketipi**         | 24               | ~7 dk  | PRO                    |
| **Odaklanma Profili**      | 20               | ~8 dk  | PRO                    |
| **Kişilik Haritası**       | 30               | ~10 dk | PRO                    |

### Soru tipleri

Matris/örüntü · sayı dizisi · şekil analojisi · sözel analoji · mantık çıkarımı · uzamsal rotasyon · kodlama/şifre · sınıflandırma (farklı olanı bul) · aritmetik akıl yürütme

### Skorlama motoru

**Norm tabanlı standart skor** — ortalama 100, standart sapma 15.

```
ham_puan = Σ (doğru_cevap × soru_zorluk_ağırlığı) + zaman_bonusu
z = (ham_puan − norm_ortalama) / norm_std
IQ = 100 + 15 × z   → [55, 145] aralığına kırpılır
yüzdelik_dilim = Φ(z) × 100
```

- Soru zorluk ağırlıkları içerik üretiminde etiketlenir, gerçek kullanıcı verisiyle panelden yeniden kalibre edilir
- Alt boyut kırılımı: Sözel / Sayısal / Görsel-Uzamsal / Mantık / Hız
- Sonuç ekranı: animasyonlu skor sayacı → yüzdelik dilim ("%87'sinden daha iyisin") → çan eğrisi üzerinde konum → alt boyut barları → **paylaş** butonu → detaylı rapor (PRO kilidi)

### Yasal

Her test sonucunda ve mağaza açıklamasında görünür ibare:

> _Bu test eğlence ve zihinsel egzersiz amaçlıdır. Klinik veya psikometrik bir teşhis aracı değildir._

---

## 8. Onboarding (8 adım)

1. **Hoş geldin** — animasyonlu beyin ikonu, ürün vaadi
2. **Yaş aralığı** — norm kalibrasyonu için gerçekten kullanılır
3. **Geliştirmek istediğin alanlar** (çoklu seçim) — Hafıza · Odaklanma · Mantık · Matematik · Hız
4. **Günlük hedef** — 5 / 10 / 20 dk
5. **Mevcut durum** — "Son zamanlarda unutkanlık yaşıyor musun?" tipi 2 soru
6. **Kişisel planın hazırlanıyor** — ilerleme animasyonu, seçimlerin özeti
7. **Bildirim izni** — faydası anlatılarak istenir (çıplak sistem dialogu değil)
8. **Paywall** — 3 gün ücretsiz deneme, "Geç" ile atlanabilir

---

## 9. Para Kazanma

### Planlar (RevenueCat)

| Plan               | Fiyat (TR) | Not                                           |
| ------------------ | ---------- | --------------------------------------------- |
| Haftalık           | ~₺349,99   | 3 gün ücretsiz deneme                         |
| Yıllık             | ~₺999,99   | Haftalığa bölünmüş gösterilir, "%94 tasarruf" |
| Yıllık (indirimli) | ~₺199,99   | Sadece çıkış kuponu ekranında                 |

Fiyatlar ülke bazlı ayarlanır (TR/AR/BR ucuz, US/EU/UK yüksek).

### Paywall noktaları

1. **Onboarding sonu** — 3 gün ücretsiz deneme, geçilebilir
2. **Test sonucu** — skor görünür, **detaylı rapor kilitli**
3. **Çıkış kuponu** — paywall kapatılınca tek seferlik %80 indirim, geri sayımlı
4. **Özellik kapıları** — İleri testler, reklamsız mod, sınırsız yıldız, beyin haritası geçmişi

### Ücretsiz katman

- Tüm 28 oyun oynanabilir (reklamlı)
- Temel IQ Testi tam erişim: **skor + yüzdelik dilim görünür**, detaylı rapor kilitli
- Günde 3 ödüllü reklam ile yıldız kazanımı
- Lig ve lider tablosuna katılım açık
- Banner (menü ekranları) + interstitial (her 3 oyun seansında bir)

### PRO

Reklamsız · tüm testler · tüm detaylı raporlar · sınırsız yıldız ve ipucu · beyin haritası geçmişi ve trend grafiği · özel avatar/tema · aylık 2 ücretsiz seri dondurma

---

## 10. Admin Panel (Next.js + Vercel)

**Erişim:** Tek admin hesabı, Supabase Auth (e-posta + şifre). Rol altyapısı (admin/editör/görüntüleyici) baştan kurulur, ileride ekip eklenebilir.

### 10.1 CMS — İçerik Yönetimi

- **Testler:** oluştur / düzenle / yayından kaldır, sıralama, kategori, erişim seviyesi (free/PRO)
- **Sorular:** zengin editör, şık yönetimi, doğru cevap, zorluk ağırlığı, açıklama metni, görsel yükleme, **TR/EN çeviri alanları yan yana**
- **Telefon önizlemesi:** soruyu gerçek cihaz mockup'ında anında gör
- **Oyunlar:** aktif/pasif, zorluk eğrisi parametreleri, XP ve yıldız ödülleri, kategori ataması, sıralama
- **Toplu işlem:** JSON/CSV içe-dışa aktarma, çoklu seçimle yayına alma
- **Sürüm geçmişi:** her değişiklik kayıtlı, geri alınabilir

### 10.2 CRM — Kullanıcı Yönetimi

- Kullanıcı listesi: filtre + arama (ülke, plan, seviye, son görülme)
- Kullanıcı detayı: test geçmişi, beyin haritası, seviye, seri, yıldız bakiyesi, abonelik durumu ve ödeme geçmişi
- **Segment oluşturucu:** "3 gündür girmeyenler", "denemesi bitmiş ama abone olmamışlar", "Elmas ligdekiler"
- Segmente **push bildirimi** gönderme (anında veya zamanlanmış), şablon kütüphanesi
- Manuel müdahale: yıldız hediye et, PRO hediye et, hesap dondur

### 10.3 Analitik Dashboard

- DAU / WAU / MAU, yeni kullanıcı
- Retention eğrisi (D1 / D7 / D30)
- **Onboarding funnel** — hangi adımda düşüyorlar
- Paywall funnel: görüntülenme → tıklama → deneme → ücretli dönüşüm
- Oyun bazlı: oynanma sayısı, ortalama seans süresi, terk oranı, zorluk dengesi
- Test bazlı: başlama / tamamlama oranı, ortalama skor dağılımı
- Gelir: MRR, deneme dönüşümü, iptal oranı (RevenueCat webhook)

### 10.4 Uzaktan Kontrol

- **Feature flag:** her oyunu/testi/özelliği uygulama güncellemesi olmadan aç-kapat
- **Paywall yönetimi:** başlık, alt metin, indirim oranı, geri sayım süresi, görsel varyant
- **A/B test:** iki varyantı yüzde dağılımıyla canlıya al, sonuçları dashboard'da karşılaştır
- **Uygulama içi duyuru:** tüm kullanıcılara banner/modal
- **Zorunlu güncelleme:** minimum sürüm zorlama

---

## 11. İçerik Üretimi

Tüm içerik (test soruları, oyun seviye parametreleri, metinler) **geliştirme sırasında AI ile üretilip** kalite kontrolünden geçirilerek veritabanına yüklenir. Panelde canlı AI üretimi yok — panel düzenleme, yayınlama ve yönetim için.

**Hedef hacim (V1):**

- ~900 test sorusu (11 test × ortalama 80 soru havuzu, her oturumda rastgele alt küme)
- Her soru TR + EN
- Oyun seviyeleri prosedürel üretilir — seed'li, sonsuz, her cihazda aynı

**İçerik dağıtımı:** Uygulama açılışta Supabase'den senkronize eder, yerelde cache'ler, internetsiz de çalışır. Panelden eklenen içerik mağaza güncellemesi beklemeden herkese ulaşır.

---

## 12. Push Bildirim Stratejisi

| Tür             | Tetikleyici                                    | Örnek                            |
| --------------- | ---------------------------------------------- | -------------------------------- |
| Seri hatırlatma | Günlük 20:00 (kullanıcının aktif saatine göre) | "7 günlük serin bitmek üzere!"   |
| Günlük görev    | Sabah 10:00                                    | "Bugünün 3 görevi hazır"         |
| Yeni içerik     | Panelden manuel                                | "Yeni test: Görsel Hafıza"       |
| Lig             | Sıralama değişimi, hafta sonu                  | "Sıralaman 12'ye düştü"          |
| Win-back        | 7 gün inaktif                                  | "Beyin skorun düşüyor, geri dön" |
| Kampanya        | Panelden segment seçimi                        | "Sana özel %80 indirim"          |

Frekans sınırı: günde en fazla 2 bildirim.

---

## 13. Çalışma Düzeni — GitHub

- **Repo:** `digitalsepa-git/neuropeak` (private)
- **Dal stratejisi:** `main` korumalı → her iş için `feat/...` dalı → PR → inceleme → merge
- **Her PR içeriği:** ne değişti özeti, ekran görüntüsü/video, test notu
- **CI:** GitHub Actions — lint, typecheck, unit test. Yeşil olmadan merge yok
- **Sürümleme:** Conventional Commits

### PR Yol Haritası

| PR         | İçerik                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| **#1**     | Monorepo kurulumu, Expo + Next.js iskeleti, TypeScript, lint, CI                                        |
| **#2**     | Tasarım sistemi: renk/tipografi/boşluk token'ları, temel bileşenler (buton, kart, çip, modal, progress) |
| **#3**     | Navigasyon + 5 sekme iskeleti, boş ekranlar, üst bar                                                    |
| **#4**     | Onboarding akışı (8 adım) + animasyonlar                                                                |
| **#5**     | Supabase şeması, RLS, auth (opsiyonel hesap), offline sync katmanı                                      |
| **#6**     | Skorlama motoru + Temel IQ Testi uçtan uca (soru → sonuç ekranı)                                        |
| **#7**     | Paywall ekranları (3 nokta) + RevenueCat entegrasyonu                                                   |
| **#8**     | Oyunlaştırma çekirdeği: XP, seviye, seri, yıldız, günlük görevler                                       |
| **#9–#15** | Mini oyunlar (kategori kategori, her PR'da 3-5 oyun)                                                    |
| **#16**    | Beyin haritası + İlerleme sekmesi                                                                       |
| **#17**    | Lig sistemi + lider tabloları                                                                           |
| **#18**    | Rozet sistemi                                                                                           |
| **#19**    | Kalan 10 test + içerik yükleme                                                                          |
| **#20**    | AdMob entegrasyonu + feature flag                                                                       |
| **#21**    | Admin panel: CMS                                                                                        |
| **#22**    | Admin panel: CRM + push                                                                                 |
| **#23**    | Admin panel: Analitik + uzaktan kontrol                                                                 |
| **#24**    | i18n EN tamamlama, mağaza varlıkları, ikon, ekran görüntüleri                                           |
| **#25**    | Yayın hazırlığı: TestFlight, gizlilik politikası, App Store metinleri                                   |

---

## 14. Yayın Planı

- **Öncelik:** iOS (Apple Developer hesabı mevcut) → TestFlight
- **Android:** Play Console hesabı açılana kadar APK ile test, sonra internal track
- **Gerekli yasal belgeler:** Gizlilik Politikası, Kullanım Şartları, Abonelik Şartları (App Store zorunlu), KVKK/GDPR aydınlatma metni
- **App Store riskleri ve önlemleri:**
  - IQ iddiası → her sonuçta görünür "eğlence amaçlıdır" ibaresi
  - Abonelik şeffaflığı → fiyat, periyot ve iptal bilgisi paywall'da net görünür
  - Çocuk kullanımı → 12+ yaş derecelendirmesi

---

## 15. Açık / Sonraya Bırakılan Konular

- Fiyatların ülke bazlı tam listesi — mağaza konsolundan belirlenecek
- AppLovin MAX mediation geçişi — trafik oluştuktan sonra değerlendirilecek
- Arkadaş ekleme / 1v1 düello — V2
- AR / ES / PT dilleri — V2 (altyapı hazır)
- Adaptif test (IRT) — V2, gerçek kullanıcı verisi ile kalibrasyon sonrası
