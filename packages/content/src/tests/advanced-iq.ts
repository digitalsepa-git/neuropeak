import { basicIqTest } from './basic-iq';
import { logicReasoningTest } from './logic-reasoning';
import { numericIqTest } from './numeric-iq';
import { verbalIqTest } from './verbal-iq';
import type { ContentQuestion, ContentTest } from '../types';

/**
 * İleri IQ Testi — uzun ve kapsamlı değerlendirme.
 *
 * Havuzu kendi soruları değil, bütün bankaların **zor yarısı**: tek
 * bir alana değil hepsine birden bakan uzun bir test için doğru
 * malzeme zaten orada duruyor ve aynı soruları ikinci kez yazmak
 * bankayı iyileştirmezdi.
 *
 * Bunun bilinen sınırı şu: dört alan testini de çözmüş biri burada
 * tanıdık sorularla karşılaşır. İleri teste özel bir banka
 * yazıldığında bu dosya ona döner; seçim mantığı aynı kalır.
 */

/** Bu ağırlığın altındaki sorular ileri teste girmez. */
const HARD_ENOUGH = 1;

const POOL: readonly ContentQuestion[] = [
  ...basicIqTest.questions,
  ...numericIqTest.questions,
  ...verbalIqTest.questions,
  ...logicReasoningTest.questions,
].filter((question) => question.difficultyWeight >= HARD_ENOUGH);

export const advancedIqTest: ContentTest = {
  id: 'advanced-iq',
  kind: 'iq',
  title: { tr: 'İleri IQ Testi', en: 'Advanced IQ Test' },
  description: {
    tr: 'Dört alanın zor sorularından oluşan uzun değerlendirme. En ayrıntılı sonucu bu test verir.',
    en: 'A long assessment built from the harder questions across all four areas.',
  },
  questionCount: 60,
  estMinutes: [15, 20],
  isPro: true,
  // Norm zor havuza göre aşağı çekildi: aynı ham oran burada daha
  // yüksek bir skora karşılık gelmeli.
  norm: { mean: 0.45, sd: 0.18 },
  questions: POOL,
};
