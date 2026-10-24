import { createRng, sample, shuffle, type Rng } from '../random';

/**
 * Mantık Zinciri bulmacası.
 *
 * Gizli bir sıralama kurulur, ondan doğru öncüller türetilir ve soru
 * bu sıralamaya göre cevaplanır. Öncüller gerçek sıralamadan üretildiği
 * için tutarsız bir bulmaca üretmek mümkün değil; sorunun tek bir
 * cevabı olduğu da sıralamanın tam olmasıyla garanti.
 */

export const COMPARISON_KINDS = ['taller', 'faster', 'older', 'heavier'] as const;
export type ComparisonKind = (typeof COMPARISON_KINDS)[number];

/**
 * Adın iki biçimi. Türkçede karşılaştırılan kişi ayrılma hâli alıyor
 * ("Mert'ten"), İngilizcede ad olduğu gibi duruyor; ikisini ayrı
 * tutmak kuralı dile sokmadan doğru cümleyi kurmayı sağlıyor.
 */
export type LogicChainName = {
  readonly subject: string;
  readonly object: string;
};

export type ComparisonText = {
  readonly comparative: string;
  readonly superlative: string;
  readonly least: string;
};

/**
 * Bulmacanın dile bağlı parçaları; içerik paketinden geliyor.
 *
 * Cümleler kalıp: `premise` içinde `{a}`, `{b}` ve `{comparative}`,
 * `question` içinde `{superlative}` yerine konuyor. Kalıp olması iki
 * dilin farklı söz dizimini karşılıyor ve metni panelden
 * düzenlenebilir bırakıyor.
 */
export type LogicChainBank = {
  readonly names: readonly LogicChainName[];
  readonly kinds: Record<ComparisonKind, ComparisonText>;
  readonly premise: string;
  readonly question: string;
};

function fill(template: string, values: Readonly<Record<string, string>>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}

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

export function generateLogicChain(
  level: number,
  seed: number,
  bank: LogicChainBank,
): LogicChainPuzzle {
  const rng: Rng = createRng(seed);
  const size = chainLengthForLevel(level);

  // Gizli sıralama: baştakiler "daha çok" olanlar.
  const order: LogicChainName[] = sample(bank.names, size, rng);
  const kind = COMPARISON_KINDS[Math.floor(rng() * COMPARISON_KINDS.length)] as ComparisonKind;
  const text = bank.kinds[kind];

  // Zinciri kuran komşu karşılaştırmalar; sıralamayı tam olarak belirler.
  const premises = order.slice(0, -1).map((name, index) => {
    const next = order[index + 1] as LogicChainName;
    return fill(bank.premise, {
      a: name.subject,
      b: next.object,
      comparative: text.comparative,
    });
  });

  const askLeast = rng() < 0.5;
  const answer = (askLeast ? order[order.length - 1] : order[0]) as LogicChainName;
  const question = fill(bank.question, {
    superlative: askLeast ? text.least : text.superlative,
  });

  // Şıklar zincirdeki kişilerden; "belirlenemez" bilerek yok, çünkü
  // zincir tam ve cevap her zaman belirli.
  const options = shuffle(
    order.map((name) => name.subject),
    rng,
  );

  return {
    premises: shuffle(premises, rng),
    question,
    options,
    correctIndex: options.indexOf(answer.subject),
  };
}
