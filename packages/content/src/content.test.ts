import { describe, expect, it } from 'vitest';

import {
  FIGURE_ATTRIBUTES,
  attributeOf,
  figureKey,
  hasDiscoverableRule,
  isAmbiguousGlyph,
  ruleSignature,
  satisfiesAllRules,
  type ContentFigure,
} from '@neuropeak/core';

import { GAME_CATALOGUE } from './games/catalogue';
import { displayNamesFor, wordBankFor } from './words/bank';

import { CONTENT_TESTS } from './index';

/**
 * Soru türünün hangi rapor boyutuna yazdığı; `@neuropeak/core`'daki
 * eşlemenin aynısı. Core bunu dışa açmıyor, burada tekrar ediliyor ve
 * bir test ikisinin uyumunu zaten dolaylı olarak koruyor.
 */
function dimensionFor(kind: string): string {
  switch (kind) {
    case 'verbal_analogy':
      return 'verbal';
    case 'number_series':
    case 'arithmetic':
      return 'numeric';
    case 'matrix':
    case 'shape_analogy':
    case 'spatial':
      return 'visual';
    default:
      return 'logical';
  }
}

/** "17 × 4 − 9" gibi ifadeleri hesaplar; bilinmeyen biçimde null döner. */
function evaluateExpression(text: string): number | null {
  const tokens = text.replace(/\s+/g, ' ').trim().split(' ');
  if (tokens.some((token) => !/^[0-9]+$|^[+−×÷()]$/.test(token))) return null;

  let position = 0;

  const parseExpression = (): number => {
    let value = parseTerm();
    while (tokens[position] === '+' || tokens[position] === '−') {
      const operator = tokens[position];
      position += 1;
      const right = parseTerm();
      value = operator === '+' ? value + right : value - right;
    }
    return value;
  };

  const parseTerm = (): number => {
    let value = parseFactor();
    while (tokens[position] === '×' || tokens[position] === '÷') {
      const operator = tokens[position];
      position += 1;
      const right = parseFactor();
      value = operator === '×' ? value * right : value / right;
    }
    return value;
  };

  const parseFactor = (): number => {
    if (tokens[position] === '(') {
      position += 1;
      const value = parseExpression();
      position += 1;
      return value;
    }
    const value = Number(tokens[position]);
    position += 1;
    return value;
  };

  const result = parseExpression();
  return position === tokens.length ? result : null;
}

describe('soru bankası', () => {
  for (const test of CONTENT_TESTS) {
    describe(test.id, () => {
      it('havuz, bir oturumda sorulacak soru sayısından büyük', () => {
        expect(test.questions.length).toBeGreaterThanOrEqual(test.questionCount);
      });

      it('soru kimlikleri benzersiz', () => {
        const ids = test.questions.map((question) => question.id);
        expect(new Set(ids).size).toBe(ids.length);
      });

      it('her sorunun doğru cevabı şıklar arasında', () => {
        for (const question of test.questions) {
          expect(question.correctIndex).toBeGreaterThanOrEqual(0);
          expect(question.correctIndex).toBeLessThan(question.options.length);
        }
      });

      it('her soruda en az iki şık var ve şıklar tekrar etmiyor', () => {
        for (const question of test.questions) {
          expect(question.options.length).toBeGreaterThanOrEqual(2);

          // "Farklı olan" sorusunda şıkların üçü bilerek aynı; metin
          // etiketleri de aynı oluyor. Ayrışmayı görsel denetim
          // sağlıyor, burada tekrar aranmıyor.
          if (question.visual?.layout === 'odd_one_out') continue;

          const turkish = question.options.map((option) => option.tr);
          expect(new Set(turkish).size, `${question.id} şıkları tekrar ediyor`).toBe(
            turkish.length,
          );
        }
      });

      it('her metin iki dilde de dolu', () => {
        for (const question of test.questions) {
          expect(question.prompt.tr.length, `${question.id} TR metni boş`).toBeGreaterThan(0);
          expect(question.prompt.en.length, `${question.id} EN metni boş`).toBeGreaterThan(0);

          for (const option of question.options) {
            expect(option.tr.length).toBeGreaterThan(0);
            expect(option.en.length).toBeGreaterThan(0);
          }
        }
      });

      it('zorluk ağırlıkları makul aralıkta', () => {
        for (const question of test.questions) {
          expect(question.difficultyWeight).toBeGreaterThanOrEqual(0.5);
          expect(question.difficultyWeight).toBeLessThanOrEqual(2.5);
        }
      });

      it('ortalama zorluk 1 civarında', () => {
        const average =
          test.questions.reduce((total, question) => total + question.difficultyWeight, 0) /
          test.questions.length;

        expect(average).toBeGreaterThan(0.85);
        expect(average).toBeLessThan(1.35);
      });

      it('soru türü dağılımı teste uygun', () => {
        const counts = new Map<string, number>();
        for (const question of test.questions) {
          counts.set(question.kind, (counts.get(question.kind) ?? 0) + 1);
        }

        if (test.focus === undefined) {
          // Genel testte tek bir tür havuzun yarısından fazlasını
          // kaplamamalı; yoksa "genel" olmaktan çıkar.
          for (const [, count] of counts) {
            expect(count).toBeLessThan(test.questions.length / 2);
          }
          return;
        }

        // Alan testinde tersi beklenir: soruların çoğu o alana yazmalı.
        const onFocus = test.questions.filter(
          (question) => dimensionFor(question.kind) === test.focus,
        ).length;

        expect(onFocus, `${test.id} odak alanına yeterince soru yazmıyor`).toBeGreaterThan(
          test.questions.length / 2,
        );
      });

      it('havuz oturumdan belirgin biçimde büyük ya da eşit', () => {
        expect(test.questions.length).toBeGreaterThanOrEqual(test.questionCount);
      });
    });
  }
});

describe('aritmetik soruların cevabı', () => {
  /**
   * Elle yazılan bankada en kolay kaçan hata yanlış işaretlenmiş şık.
   * İfadesi hesaplanabilen her soruda cevap yeniden hesaplanıp
   * karşılaştırılıyor.
   */
  it('işaretli şık ifadenin sonucuna eşit', () => {
    let checked = 0;

    for (const test of CONTENT_TESTS) {
      for (const question of test.questions) {
        if (question.kind !== 'arithmetic') continue;

        const expected = evaluateExpression(question.prompt.tr);
        if (expected === null) continue;

        const marked = Number(question.options[question.correctIndex]?.tr);
        expect(marked, `${question.id}: ${question.prompt.tr}`).toBe(expected);
        checked += 1;
      }
    }

    expect(checked, 'hiç aritmetik soru denetlenmedi').toBeGreaterThan(20);
  });

  it('çeldiriciler doğru cevaptan farklı sayılar', () => {
    for (const test of CONTENT_TESTS) {
      for (const question of test.questions) {
        if (question.kind !== 'arithmetic' && question.kind !== 'number_series') continue;

        const values = question.options.map((option) => Number(option.tr));
        expect(new Set(values).size, `${question.id} tekrar eden şık`).toBe(values.length);
        expect(
          values.every((value) => Number.isFinite(value)),
          `${question.id}`,
        ).toBe(true);
      }
    }
  });
});

describe('oyun kataloğu', () => {
  it('kimlikler benzersiz', () => {
    const ids = GAME_CATALOGUE.map((game) => game.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('her metin iki dilde de dolu', () => {
    for (const game of GAME_CATALOGUE) {
      for (const field of [game.title, game.instruction, game.description, ...game.skills]) {
        expect(field.tr.trim().length, `${game.id} tr`).toBeGreaterThan(0);
        expect(field.en.trim().length, `${game.id} en`).toBeGreaterThan(0);
      }
    }
  });

  it('her oyunun üç yeteneği var', () => {
    for (const game of GAME_CATALOGUE) {
      expect(game.skills.length, game.id).toBe(3);
    }
  });

  it('süreli oyunlarda seviye sayısı yok, seviyelide var', () => {
    for (const game of GAME_CATALOGUE) {
      if (game.mode === 'timed') expect(game.totalLevels, game.id).toBe(0);
      else expect(game.totalLevels, game.id).toBeGreaterThan(0);
    }
  });
});

describe('sözel bankalar', () => {
  for (const [language, bank] of [
    ['tr', wordBankFor('tr')],
    ['en', wordBankFor('en')],
  ] as const) {
    describe(language, () => {
      it('anagram kelimeleri küçük harfli ve benzersiz', () => {
        const words = bank.anagrams.map((entry) => entry.word);
        expect(new Set(words).size).toBe(words.length);
        for (const word of words) {
          expect(word, word).toBe(word.toLocaleLowerCase(language));
        }
      });

      it('her uzunlukta en az sekiz anagram var', () => {
        const counts = new Map<number, number>();
        for (const entry of bank.anagrams) {
          counts.set(entry.word.length, (counts.get(entry.word.length) ?? 0) + 1);
        }
        // Seviye yükseldikçe kelime uzuyor; eksik uzunluk, o seviyede
        // oyunun hep aynı kelimeyi sorması demek.
        for (const length of [4, 5, 6, 7, 8]) {
          expect(counts.get(length) ?? 0, `${length} harfli`).toBeGreaterThanOrEqual(8);
        }
      });

      it('analoji çeldiricileri doğru cevabı tekrarlamıyor', () => {
        for (const entry of bank.analogies) {
          expect(entry.distractors, entry.id).not.toContain(entry.answer);
          expect(new Set(entry.distractors).size, entry.id).toBe(entry.distractors.length);
        }
      });

      it('her kademede en az altı analoji var', () => {
        for (const level of [1, 2, 3, 4, 5]) {
          const count = bank.analogies.filter((entry) => entry.level === level).length;
          expect(count, `kademe ${level}`).toBeGreaterThanOrEqual(6);
        }
      });

      it('kelime çiftlerinde çeldirici cevaba eşit değil', () => {
        for (const entry of bank.wordPairs) {
          expect(entry.distractors, entry.id).not.toContain(entry.answer);
          expect(entry.distractors, entry.id).not.toContain(entry.word);
          expect(new Set(entry.distractors).size, entry.id).toBe(entry.distractors.length);
        }
      });

      it('eş ve zıt anlam soruları dengeli', () => {
        const synonyms = bank.wordPairs.filter((entry) => entry.mode === 'synonym').length;
        const antonyms = bank.wordPairs.filter((entry) => entry.mode === 'antonym').length;
        expect(synonyms).toBeGreaterThanOrEqual(20);
        expect(antonyms).toBeGreaterThanOrEqual(20);
      });

      it('kimlikler benzersiz', () => {
        const ids = [...bank.analogies, ...bank.wordPairs].map((entry) => entry.id);
        expect(new Set(ids).size).toBe(ids.length);
      });
    });
  }

  it('iki dilin ad havuzu aynı boyutta', () => {
    // Aynı tohumla aynı sıralama çıksın diye havuzlar eşit tutuluyor.
    expect(displayNamesFor('en').length).toBe(displayNamesFor('tr').length);
  });
});

describe('görsel sorular', () => {
  const visualQuestions = CONTENT_TESTS.flatMap((test) =>
    test.questions.flatMap((question) =>
      question.visual === undefined ? [] : [{ test: test.id, question }],
    ),
  );

  it('görsel soru bankası boş değil', () => {
    expect(visualQuestions.length).toBeGreaterThan(0);
  });

  for (const { test, question } of visualQuestions) {
    const visual = question.visual as NonNullable<typeof question.visual>;

    describe(`${test} · ${question.id}`, () => {
      it('şık sayısı metin şıklarıyla aynı', () => {
        // Şıkların metni ekran okuyucu etiketi; biri eksikse o şık
        // sesli okumada boş kalır.
        expect(visual.choices.length).toBe(question.options.length);
      });

      if (visual.layout !== 'odd_one_out') {
        it('şıklar birbirinden farklı', () => {
          const keys = visual.choices.map(figureKey);
          expect(new Set(keys).size).toBe(keys.length);
        });
      }

      it('aranan hücre sayısı düzene uygun', () => {
        const blanks = visual.cells.filter((cell) => cell === null).length;
        // "Farklı olan" sorusunda gövde yok: şıkların kendisi soru.
        expect(blanks).toBe(visual.layout === 'odd_one_out' ? 0 : 1);
      });

      it('hücre sayısı düzene uygun', () => {
        const expected = { matrix: 9, analogy: 4, odd_one_out: 0 }[visual.layout];
        expect(visual.cells.length).toBe(expected);
      });

      it('her hücrede en az bir simge var', () => {
        for (const cell of visual.cells) {
          if (cell !== null) expect(cell.glyphs.length).toBeGreaterThan(0);
        }
        for (const choice of visual.choices) {
          expect(choice.glyphs.length).toBeGreaterThan(0);
        }
      });

      it('dönünce başka şekle benzeyen simge yok', () => {
        // 45 derece dönmüş kare baklava gibi görünüyor; oyuncu
        // "dönük olan" yerine "farklı şekil" okuyor.
        const glyphs = [...visual.cells, ...visual.choices].flatMap((cell) =>
          cell === null ? [] : [...cell.glyphs],
        );
        expect(glyphs.filter(isAmbiguousGlyph), question.id).toEqual([]);
      });

      it('açıklaması var', () => {
        // Görsel soruda "neden bu cevap" metinsiz anlaşılmıyor.
        expect(question.explanation?.tr.length ?? 0).toBeGreaterThan(0);
        expect(question.explanation?.en.length ?? 0).toBeGreaterThan(0);
      });

      if (visual.layout === 'matrix') {
        it('doğru şıkla tamamlanan matrisin keşfedilebilir bir kuralı var', () => {
          // Kuralı olmayan matris tahmin oyunudur; cevap ancak bir
          // özellik satır/sütun boyunca düzenliyse bulunabilir.
          const completed = visual.cells.map(
            (cell) => cell ?? (visual.choices[question.correctIndex] as ContentFigure),
          );
          expect(hasDiscoverableRule(completed), question.id).toBe(true);
        });

        it('kuralların tamamını yalnızca doğru şık sağlıyor', () => {
          // Tek bir kuralın ayakta kalmasına bakmak yetmiyor: sayı
          // kuralı bozulmadan şekli yanlış olan şık da geçiyordu.
          const completed = visual.cells.map(
            (cell) => cell ?? (visual.choices[question.correctIndex] as ContentFigure),
          );
          const expectedRules = ruleSignature(completed);

          const valid = visual.choices.filter((choice) =>
            satisfiesAllRules(
              expectedRules,
              visual.cells.map((cell) => cell ?? choice),
            ),
          );
          expect(valid.length, question.id).toBe(1);
        });
      }

      if (visual.layout === 'odd_one_out') {
        /**
         * Ayrıştıran özellik: diğer hepsinin aynı değeri paylaştığı,
         * tek bir şıkkın farklı olduğu özellik. Şekiller başka
         * özelliklerde de farklı olabilir (ör. hepsi başka şekil ama
         * yalnızca biri dolu); soruyu çözülebilir yapan, tek bir
         * özellikte tek bir aykırının olması.
         */
        const discriminators = FIGURE_ATTRIBUTES.flatMap((attribute) => {
          const values = visual.choices.map((choice) => attributeOf(choice, attribute));
          const counts = new Map<string, number[]>();
          values.forEach((value, index) => {
            counts.set(value, [...(counts.get(value) ?? []), index]);
          });
          const groups = [...counts.values()];
          if (groups.length !== 2) return [];
          const single = groups.find((group) => group.length === 1);
          const rest = groups.find((group) => group.length === visual.choices.length - 1);
          return single === undefined || rest === undefined ? [] : [single[0] as number];
        });

        it('bir özellikte tek bir aykırı var', () => {
          expect(discriminators.length, question.id).toBeGreaterThan(0);
        });

        it('ayrıştıran özellikler aynı şıkkı gösteriyor', () => {
          // İki özellik iki farklı şıkkı gösterirse sorunun iki
          // cevabı olur.
          expect(new Set(discriminators).size, question.id).toBe(1);
        });

        it('işaretli cevap ayrışan şık', () => {
          expect(discriminators[0], question.id).toBe(question.correctIndex);
        });
      }
    });
  }
});
