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
│   └── core/            # Skorlama motoru, seviye üreticiler, paylaşılan tipler
└── supabase/            # Şema, migration'lar, Edge Functions
```

`packages/ui` (tasarım token'ları) PR#2'de, `packages/content` (soru bankası) PR#19'da eklenecek.

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
