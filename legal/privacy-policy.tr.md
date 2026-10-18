# NeuroPeak Gizlilik Politikası

**Son güncelleme:** 17 Ekim 2026

NeuroPeak: IQ Arena ("uygulama"), zihinsel egzersiz ve eğlence amaçlı
mini oyunlar ve testler sunar. Bu belge, uygulamanın hangi verileri
topladığını, neden topladığını ve ne kadar sakladığını anlatır.

Kısaca: **hesap açmıyorsun, adını ve e-postanı sormuyoruz.** Uygulama
seni, ilk açılışta cihazında üretilen rastgele bir kimlikle tanıyor.
Bu kimlik yalnızca senin ilerlemeni kendi içinde tutarlı tutmak için
var; bir kişiye, telefona ya da reklam kimliğine bağlı değil.

## Topladığımız veriler

### 1. Cihazda kalanlar

Aşağıdakiler cihazının kendi depolamasında durur. Sunucuya
gönderilmez; uygulamayı silince gider.

- Dil tercihin
- Onboarding cevapların (aşağıdaki kopyası sunucuya da gidebilir)
- XP, seviye, yıldız, seri, günlük görevler
- Beyin haritası puanların ve son yedi günün etkinliği
- Lig durumun ve haftalık XP'n
- Test sonuçlarının yerel kopyası

### 2. Sunucuya gönderilenler

Uygulama bir Supabase veritabanına bağlı olduğunda aşağıdakiler
rastgele kimliğinle birlikte gönderilir:

| Veri                 | İçeriği                                                                                                                                                                                                                                              | Niçin                                                        |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Onboarding cevapları | Yaş **aralığı** (doğum tarihi değil), odak alanları, günlük hedef, zorlandığın alan, egzersiz alışkanlığı, bildirim izni                                                                                                                             | Günlük planı ve başlangıç zorluğunu kurmak                   |
| Test sonuçları       | Test kimliği, ham puan, IQ puanı, yüzdelik, doğru/cevaplanan soru sayısı, alt boyut puanları, süre, tarih                                                                                                                                            | Sonuç geçmişini göstermek, puanı yaş grubuyla karşılaştırmak |
| İlerleme             | XP, seviye, seri gün sayısı, en uzun seri, son etkin gün, seri dondurma hakkı                                                                                                                                                                        | Cihaz değiştirsen de ilerlemenin kaybolmaması                |
| Kullanım olayları    | Olayın adı (uygulama açılışı, test başlatma/bitirme, oyun bitirme, paywall görüntüleme, reklam izleme), olayla gelen alanlar (oyun kimliği, kategori, zorluk, seviye, test kimliği, IQ puanı, doğru sayısı), platform (iOS/Android) ve zaman damgası | Hangi oyunların oynandığını, nerede takılındığını görmek     |

Bu kayıtların hiçbirinde ad, e-posta, telefon numarası, konum, rehber,
fotoğraf ya da cihaz kimliği yoktur.

### 3. Üçüncü taraf servisler

- **Google AdMob** — reklamlar açıkken. Reklam göstermek ve ölçmek
  için Google kendi verilerini toplar (cihaz türü, yaklaşık konum,
  reklam kimliği gibi). iOS'ta izleme izni istenir; reddedersen
  reklamlar kişiselleştirilmez ve uygulamanın hiçbir özelliği
  kapanmaz. Google'ın politikası:
  <https://policies.google.com/privacy>
- **RevenueCat** — abonelik açıkken. Satın alma durumunu doğrulamak
  için mağazadan gelen abonelik bilgilerini işler.
  <https://www.revenuecat.com/privacy>
- **Apple App Store / Google Play** — satın almayı sen mağazada
  yaparsın; kart bilgilerini biz görmeyiz.
- **Supabase** — yukarıdaki verilerin saklandığı veritabanı
  sağlayıcısı. <https://supabase.com/privacy>

### 4. Bildirimler

Onboarding'de bildirim izni isteriz. **Bu sürümde bildirim gönderilmiyor
ve cihazının bildirim kimliği saklanmıyor.** Hatırlatmalar açıldığında
bu belge güncellenecek ve üstündeki tarih değişecek.

## Yapmadıklarımız

- Veriyi satmıyoruz.
- Reklam ağları dışında kimseyle paylaşmıyoruz.
- Profil çıkarıp sana uygulama dışında reklam göstermiyoruz.
- Çocuklara yönelik bir uygulama değiliz ve bilerek 13 yaşından küçük
  kullanıcılardan veri toplamıyoruz.

## Ne kadar saklıyoruz

Test sonuçları ve ilerleme, uygulamayı kullanmayı bıraktıktan sonra en
çok 24 ay saklanır. Kullanım olayları 14 ay sonra silinir. Cihazdaki
veriler uygulamayı silince gider.

## Haklarını nasıl kullanırsın

Hesap olmadığı için verini rastgele kimliğinle buluruz. Silme ya da
kopya talebin için <destek@neuropeak.app> adresine yaz; uygulamadaki
**Ayarlar → E-posta Desteği** satırı bu adresi açar. Talebi 30 gün
içinde yanıtlarız. Rastgele kimliğini bilmediğimiz bir talepte veriyi
eşleştiremeyebileceğimizi baştan söyleyelim; uygulamayı sildiysen
cihazdaki kimlik de silinmiş olur.

## Bu test bir teşhis değildir

Uygulamadaki IQ testleri ve "beyin yaşı" gibi ölçümler eğlence ve
zihinsel egzersiz amaçlıdır. Klinik ya da psikometrik bir teşhis
aracı değildir; sağlıkla ilgili bir karar için kullanılmamalıdır.

## Değişiklikler

Bu politika değişirse üstündeki tarih güncellenir. Önemli bir değişiklik
olursa uygulama içinde bildiririz.

## İletişim

<destek@neuropeak.app>
