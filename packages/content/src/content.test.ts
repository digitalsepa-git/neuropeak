import { describe, expect, it } from 'vitest';

import { CONTENT_TESTS } from './index';

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

      it('rapor boyutlarının her biri yeterince temsil ediliyor', () => {
        const counts = new Map<string, number>();
        for (const question of test.questions) {
          counts.set(question.kind, (counts.get(question.kind) ?? 0) + 1);
        }

        // Tek bir soru türü havuzun yarısından fazlasını kaplamamalı.
        for (const [, count] of counts) {
          expect(count).toBeLessThan(test.questions.length / 2);
        }
      });
    });
  }
});
