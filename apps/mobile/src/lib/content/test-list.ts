import type { ContentTest, MeasureTest, ProfileTest } from '@neuropeak/content';

import type { Catalogue } from './catalogue';

/**
 * Testler sekmesinin listesi.
 *
 * Liste artık uygulamada sabit değil, katalogdan geliyor. Önceden
 * elle yazılmış bir tabloydu ve içerik veritabanına taşındıktan
 * sonra iki kaynak ayrışır olmuştu: panelden eklenen test uygulamada
 * görünmüyor, panelden kaldırılan test "Yakında" rozetiyle listede
 * kalıyordu.
 *
 * Üç tür test var ve üçünün ekranı ayrı: soru soranlar, Beyin Yaşı
 * (soru sormaz, dört ölçüm yaptırır) ve profil testleri (doğru
 * cevabı yoktur). Tür burada ayrılıyor ki kart hangi ekrana
 * gideceğini tahmin etmek zorunda kalmasın.
 */

export type TestEntry =
  | { readonly kind: 'question'; readonly group: 'iq' | 'fun'; readonly test: ContentTest }
  | { readonly kind: 'measure'; readonly group: 'fun'; readonly test: MeasureTest }
  | { readonly kind: 'profile'; readonly group: 'fun'; readonly test: ProfileTest };

/**
 * Katalogdaki her test, katalogdaki sırayla.
 *
 * Ölçüm ve profil testleri soru soranların arkasına diziliyor:
 * ikisi de "eğlence" bölümünde ve kendi aralarındaki sıra
 * katalogdan geliyor.
 */
export function testEntries(catalogue: Catalogue): readonly TestEntry[] {
  return [
    ...catalogue.tests.map((test): TestEntry => ({ kind: 'question', group: test.kind, test })),
    ...catalogue.measureTests.map((test): TestEntry => ({ kind: 'measure', group: 'fun', test })),
    ...catalogue.profileTests.map((test): TestEntry => ({ kind: 'profile', group: 'fun', test })),
  ];
}

export function entriesInGroup(
  entries: readonly TestEntry[],
  group: 'iq' | 'fun',
): readonly TestEntry[] {
  return entries.filter((entry) => entry.group === group);
}
