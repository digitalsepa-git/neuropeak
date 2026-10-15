# NeuroPeak: IQ Arena

Oyunlaştırılmış IQ testi ve beyin antrenmanı uygulaması. 28 mini oyun, 11 test, haftalık ligler ve beyin haritası.

Ürün kapsamının tamamı için: **[SCOPE.md](SCOPE.md)**

## Yapı

```
neuropeak/
├── apps/
│   ├── mobile/          # Expo (React Native) — iOS + Android
│   └── admin/           # Next.js admin panel (CMS + CRM + Analitik)
├── packages/
│   ├── core/            # Skorlama motoru, seviye üreticiler, paylaşılan tipler
│   └── ui/              # Tasarım token'ları ve temalar
└── supabase/            # Şema, migration'lar, Edge Functions
```

`packages/content` (soru bankası) PR#19'da eklenecek.

## Veritabanı

Şema `supabase/migrations` altında, elle yazılmış SQL migration'ları olarak durur.

| Komut                    | Açıklama                                                                                           |
| ------------------------ | -------------------------------------------------------------------------------------------------- |
| `npm run db:verify`      | Geçici bir Postgres kurup migration'ları uygular, şema kısıtlarını ve RLS politikalarını test eder |
| `npm run db:types`       | Şemadan TypeScript tiplerini üretir (`apps/mobile/src/lib/database.types.ts`)                      |
| `npm run db:types:check` | Üretilen tipler güncel mi diye bakar (CI)                                                          |

Yerelde `brew install postgresql@17` yeterlidir; Docker gerekmez. CI aynı betikleri hizmet olarak çalışan bir Postgres üzerinde koşturur.

`database.types.ts` üretilen bir dosyadır, elle düzenlenmez — şema değişince `npm run db:types` çalıştırılıp sonuç commit edilir.

### Bağlantı

`apps/mobile/.env.example` dosyasını `.env` olarak kopyalayıp Supabase projesinin URL ve anon anahtarını doldurun. Boş bırakılırsa uygulama tamamen çevrimdışı çalışır: veriler cihazda durur, senkronizasyon ilk fırsatta yapılır.

## Tasarım sistemi

Renk, boşluk, yarıçap, tipografi, gölge ve hareket token'larının tek kaynağı `packages/ui`'dir.

- **Mobil** token'ları doğrudan içe aktarır; bileşenler `apps/mobile/src/components/ui` altındadır.
- **Panel** aynı token'ları Tailwind teması olarak kullanır. `apps/admin/src/app/tokens.css` üretilen bir dosyadır, elle düzenlenmez:

```bash
npm run tokens:css --workspace @neuropeak/ui
```

CI, dosyanın token'larla uyumlu olduğunu `tokens:check` ile doğrular.

Uygulama cihazın açık/koyu tercihini takip etmez: menü, test ve profil ekranları açık, oyun ekranları koyu temadadır. Oyun ekranları kendilerini `<ThemeProvider name="dark">` ile sarar.

## Gereksinimler

- Node.js 22+
- npm 10+
- iOS geliştirme için Xcode 16+

## Başlangıç

```bash
npm install
```

| Komut                | Açıklama                                        |
| -------------------- | ----------------------------------------------- |
| `npm run dev:mobile` | Expo geliştirme sunucusunu başlatır             |
| `npm run dev:admin`  | Admin paneli `localhost:3000` üzerinde başlatır |
| `npm run lint`       | Tüm workspace'lerde ESLint                      |
| `npm run typecheck`  | Tüm workspace'lerde TypeScript kontrolü         |
| `npm run test`       | Birim testleri                                  |

## Çalışma düzeni

`main` korumalıdır. Her iş kendi dalında geliştirilir, PR ile incelenir ve merge edilir.

```bash
git switch -c feat/kisa-aciklama
# ...
git push -u origin feat/kisa-aciklama
gh pr create
```

CI (lint + typecheck + test) yeşil olmadan merge edilmez. Commit mesajları [Conventional Commits](https://www.conventionalcommits.org/) biçimindedir.
