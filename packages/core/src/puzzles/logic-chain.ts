import { createRng, sample, shuffle, type Rng } from '../random';

/**
 * Mantık Zinciri bulmacası.
 *
 * Gizli bir sıralama kurulur, ondan doğru öncüller türetilir ve soru
 * bu sıralamaya göre cevaplanır. Öncüller gerçek sıralamadan üretildiği
 * için tutarsız bir bulmaca üretmek mümkün değil; sorunun tek bir
 * cevabı olduğu da sıralamanın tam olmasıyla garanti.
 */

const NAMES = [
  'Deniz',
  'Mert',
  'Elif',
  'Burak',
  'Ayşe',
  'Can',
  'Zeynep',
  'Kerem',
  'Selin',
] as const;

export type ComparisonKind = 'taller' | 'faster' | 'older' | 'heavier';

const KIND_TEXT: Record<
  ComparisonKind,
  { comparative: string; superlative: string; least: string }
> = {
  taller: { comparative: 'daha uzun', superlative: 'en uzun', least: 'en kısa' },
  faster: { comparative: 'daha hızlı', superlative: 'en hızlı', least: 'en yavaş' },
  older: { comparative: 'daha yaşlı', superlative: 'en yaşlı', least: 'en genç' },
  heavier: { comparative: 'daha ağır', superlative: 'en ağır', least: 'en hafif' },
};

export type LogicChainPuzzle = {
  /** Oyuncuya gösterilen öncüller. */
  readonly premises: readonly string[];
  readonly question: string;
  readonly options: readonly string[];
  readonly correctIndex: number;
};

export function chainLengthForLevel(level: number): number {
  // Üç kişiyle başlar, her iki seviyede bir büyür, beşte durur.
  return Math.min(5, 3 + Math.floor((level - 1) / 2));
}

export function generateLogicChain(level: number, seed: number): LogicChainPuzzle {
  const rng: Rng = createRng(seed);
  const size = chainLengthForLevel(level);

  // Gizli sıralama: baştakiler "daha çok" olanlar.
  const order: string[] = sample(NAMES, size, rng);
  const kind = (['taller', 'faster', 'older', 'heavier'] as ComparisonKind[])[
    Math.floor(rng() * 4)
  ] as ComparisonKind;
  const text = KIND_TEXT[kind];

  // Zinciri kuran komşu karşılaştırmalar; sıralamayı tam olarak belirler.
  const premises = order.slice(0, -1).map((name, index) => {
    const next = order[index + 1] as string;
    return `${name}, ${next}'den ${text.comparative}.`;
  });

  const askLeast = rng() < 0.5;
  const answer = askLeast ? (order[order.length - 1] as string) : (order[0] as string);
  const question = askLeast ? `Kim ${text.least}?` : `Kim ${text.superlative}?`;

  // Şıklar zincirdeki kişilerden; "belirlenemez" bilerek yok, çünkü
  // zincir tam ve cevap her zaman belirli.
  const options = shuffle(order, rng);

  return {
    premises: shuffle(premises, rng),
    question,
    options,
    correctIndex: options.indexOf(answer),
  };
}
