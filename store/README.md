# Mağaza varlıkları

App Store ve Google Play için görseller. İkisi de betikle üretiliyor;
elle düzenlenmiş dosya yok, böylece arayüz değişince yeniden üretmek
tek komut.

## İkon ve açılış işareti

```bash
npm run assets:icons
```

`scripts/make-icons.py` → `apps/mobile/assets/images/`:

| Dosya                         | Nerede kullanılıyor                          |
| ----------------------------- | -------------------------------------------- |
| `icon.png` (1024×1024)        | iOS uygulama ikonu ve mağaza ikonu           |
| `android-icon-foreground.png` | Android uyarlanabilir ikon — ön plan         |
| `android-icon-background.png` | Android uyarlanabilir ikon — zemin           |
| `android-icon-monochrome.png` | Android tema ikonu (tek renk)                |
| `splash-icon.png`             | Açılış ekranı işareti (zemini `app.json`'da) |
| `favicon.png`                 | Web derlemesi                                |

İşaret: mor degrade üzerinde beyaz bir zirve ve tepesinde kehribar bir
düğüm. Zirve çizgisi açılış ekranındaki işaretle aynı; tepedeki düğüm
"neuro" tarafını taşıyor.

## Ekran görüntüleri

```bash
npm run assets:screenshots
```

`scripts/make-screenshots.py`: `store/raw/<dil>/` içindeki ham
ekranlara başlık bandı ekleyip `store/screenshots/<dil>/` altına
yazıyor.

Ham görüntülerin üstüne hiçbir şey çizilmiyor ve içlerindeki veri
düzenlenmiyor — cihazda ne görünüyorsa mağazada da o görünüyor.
Başlık, çerçevenin üstünde duran ayrı bir bant.

### Ham görüntüler nasıl alındı

- Cihaz: **iPhone 17 Pro Max** simülatörü — 1320×2868, App Store'un
  6.9" boyutu. Başka bir cihazdan alınan görüntüyü betik reddediyor;
  yanlış boyut mağazada geri çevriliyor.
- Durum çubuğu sabitlendi:
  ```bash
  xcrun simctl status_bar <udid> override --time "09:41" \
    --batteryState charged --batteryLevel 100 \
    --cellularMode active --cellularBars 4 --wifiBars 3 --operatorName ""
  ```
- Hesap gerçek kullanımla dolduruldu: onboarding tamamlandı, Temel IQ
  testi bitirildi, bir oyun turu oynandı. Ekranlardaki seri, seviye,
  yıldız ve beyin haritası değerleri o oturumdan geliyor.
- Yakalama: `xcrun simctl io <udid> screenshot store/raw/<dil>/<ad>.png`

Dil değiştirip aynı altı ekran yeniden alınıyor: **Ayarlar → Dil**.

### Hâlâ eksik

- **Test sonucu ekranı** sette yok. Ham görüntü almak için testi
  gerçekten çözmek gerekiyor; şıkları rastgele işaretleyerek alınan
  sonuç mağazada yanıltıcı olurdu.
- App Store metinleri (başlık, alt başlık, açıklama, anahtar
  kelimeler), gizlilik politikası ve destek sayfası bu klasörde değil;
  yayın hazırlığı adımında eklenecek.
- Google Play'in kendi boyutları (telefon için 1080×1920 ve üstü) bu
  görüntülerden türetilebilir; şimdilik yalnızca App Store boyutu var.
