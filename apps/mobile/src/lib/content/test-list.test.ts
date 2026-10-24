import { describe, expect, it } from 'vitest';

import { EMBEDDED_CATALOGUE, type Catalogue } from './catalogue';
import { entriesInGroup, testEntries } from './test-list';

describe('testEntries', () => {
  it('katalogdaki bütün testleri listeliyor', () => {
    const entries = testEntries(EMBEDDED_CATALOGUE);

    expect(entries).toHaveLength(
      EMBEDDED_CATALOGUE.tests.length +
        EMBEDDED_CATALOGUE.measureTests.length +
        EMBEDDED_CATALOGUE.profileTests.length,
    );
  });

  it('ölçüm ve profil testlerini eğlence bölümüne koyuyor', () => {
    const fun = entriesInGroup(testEntries(EMBEDDED_CATALOGUE), 'fun');

    expect(fun.some((entry) => entry.kind === 'measure')).toBe(true);
    expect(fun.some((entry) => entry.kind === 'profile')).toBe(true);
  });

  it('IQ bölümünde yalnızca soru soran testler var', () => {
    const iq = entriesInGroup(testEntries(EMBEDDED_CATALOGUE), 'iq');

    expect(iq.length).toBeGreaterThan(0);
    expect(iq.every((entry) => entry.kind === 'question')).toBe(true);
  });

  it('katalog sırasını koruyor', () => {
    const ids = testEntries(EMBEDDED_CATALOGUE)
      .filter((entry) => entry.kind === 'question')
      .map((entry) => entry.test.id);

    expect(ids).toEqual(EMBEDDED_CATALOGUE.tests.map((test) => test.id));
  });

  it('boş katalogda boş liste veriyor', () => {
    // Panelden her şey kaldırılırsa sekme boş kalır; eski listede
    // olmayan testler "Yakında" diye durmaya devam ederdi.
    const empty: Catalogue = {
      games: [],
      tests: [],
      badges: [],
      dailyTasks: [],
      profileTests: [],
      measureTests: [],
    };

    expect(testEntries(empty)).toEqual([]);
  });
});
