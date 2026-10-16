import { createRng, shuffle, type Rng } from '../random';

/**
 * Matris bulmacası (Raven tarzı).
 *
 * 3×3 ızgaranın sekiz hücresi bir kurala göre doldurulur, dokuzuncusu
 * boş bırakılır. Kural üretimden geldiği için doğru cevap tanım gereği
 * bellidir; çeldiriciler doğru cevabın tek bir özelliği bozularak
 * üretilir, böylece hepsi makul görünür.
 */

export const MATRIX_SHAPES = ['circle', 'square', 'triangle', 'diamond'] as const;
export type MatrixShape = (typeof MATRIX_SHAPES)[number];

export type MatrixCell = {
  readonly shape: MatrixShape;
  /** 1–4 arası; hücrede kaç adet şekil var. */
  readonly count: number;
  /** 0–3 arası renk dizini; tasarım katmanı renge çevirir. */
  readonly colorIndex: number;
  /** 0, 90, 180 veya 270 derece. */
  readonly rotation: number;
};

export type MatrixPuzzle = {
  /** Soldan sağa, yukarıdan aşağıya sekiz hücre; dokuzuncusu boş. */
  readonly cells: readonly MatrixCell[];
  readonly options: readonly MatrixCell[];
  readonly correctIndex: number;
  readonly ruleName: string;
};

type Rule = {
  readonly name: string;
  readonly cellFor: (row: number, column: number) => MatrixCell;
};

function pick<T>(items: readonly T[], rng: Rng): T {
  return items[Math.floor(rng() * items.length)] as T;
}

/** Kural havuzu. Her kural satır ve sütundan hücreyi türetir. */
function buildRules(rng: Rng): Rule[] {
  const baseShape = pick(MATRIX_SHAPES, rng);
  const shapeOrder = shuffle(MATRIX_SHAPES, rng);
  const baseColor = Math.floor(rng() * 4);

  return [
    {
      name: 'satırda sayı artar',
      cellFor: (row, column) => ({
        shape: baseShape,
        count: column + 1,
        colorIndex: (baseColor + row) % 4,
        rotation: 0,
      }),
    },
    {
      name: 'sütunda şekil değişir',
      cellFor: (row, column) => ({
        shape: shapeOrder[column % shapeOrder.length] as MatrixShape,
        count: row + 1,
        colorIndex: baseColor,
        rotation: 0,
      }),
    },
    {
      name: 'satırda döner',
      cellFor: (row, column) => ({
        shape: baseShape,
        count: 1,
        colorIndex: (baseColor + column) % 4,
        rotation: (column * 90) % 360,
      }),
    },
    {
      name: 'çapraz renk, satırda sayı',
      cellFor: (row, column) => ({
        shape: shapeOrder[row % shapeOrder.length] as MatrixShape,
        count: ((row + column) % 3) + 1,
        colorIndex: (baseColor + row + column) % 4,
        rotation: 0,
      }),
    },
  ];
}

/** Doğru cevabın tek bir özelliğini bozarak çeldirici üretir. */
function distractorsFor(answer: MatrixCell, rng: Rng): MatrixCell[] {
  const candidates: MatrixCell[] = [
    { ...answer, count: answer.count === 4 ? answer.count - 1 : answer.count + 1 },
    { ...answer, colorIndex: (answer.colorIndex + 1 + Math.floor(rng() * 3)) % 4 },
    {
      ...answer,
      shape: pick(
        MATRIX_SHAPES.filter((shape) => shape !== answer.shape),
        rng,
      ),
    },
    {
      ...answer,
      count: Math.max(1, answer.count - 1),
      colorIndex: (answer.colorIndex + 2) % 4,
    },
    { ...answer, count: ((answer.count + 1) % 4) + 1, colorIndex: (answer.colorIndex + 3) % 4 },
  ];

  // Dönüş farkı yalnızca görünür olduğu şekillerde çeldirici olabilir.
  if (ROTATION_VISIBLE.has(answer.shape)) {
    candidates.push({ ...answer, rotation: (answer.rotation + 90) % 360 });
  }

  const unique: MatrixCell[] = [];
  for (const candidate of shuffle(candidates, rng)) {
    if (sameCell(candidate, answer)) continue;
    if (unique.some((item) => sameCell(item, candidate))) continue;
    unique.push(candidate);
    if (unique.length === 3) break;
  }

  // Adaylar tükenirse sayı ve rengi birlikte değiştirerek tamamlanır;
  // bu kombinasyon her zaman görsel olarak farklı bir hücre verir.
  let filler = 1;
  while (unique.length < 3) {
    const candidate: MatrixCell = {
      ...answer,
      count: ((answer.count + filler) % 4) + 1,
      colorIndex: (answer.colorIndex + filler) % 4,
    };
    filler += 1;
    if (sameCell(candidate, answer)) continue;
    if (unique.some((item) => sameCell(item, candidate))) continue;
    unique.push(candidate);
  }

  return unique;
}

/** Dönüş yalnızca üçgen ve baklavada görünür; daire ve karede fark etmez. */
const ROTATION_VISIBLE: ReadonlySet<MatrixShape> = new Set<MatrixShape>(['triangle', 'diamond']);

/**
 * İki hücrenin ekranda aynı görünüp görünmediği. Görünmeyen bir dönüş
 * farkı iki şıkkı "farklı" saymaya yetmez — oyuncu için ikisi de aynı.
 */
export function visuallyEqual(a: MatrixCell, b: MatrixCell): boolean {
  if (a.shape !== b.shape || a.count !== b.count || a.colorIndex !== b.colorIndex) {
    return false;
  }
  return ROTATION_VISIBLE.has(a.shape) ? a.rotation === b.rotation : true;
}

/** Hücrenin ekrandaki görünümünü temsil eden anahtar. */
export function visualKey(cell: MatrixCell): string {
  const rotation = ROTATION_VISIBLE.has(cell.shape) ? cell.rotation : 0;
  return `${cell.shape}-${cell.count}-${cell.colorIndex}-${rotation}`;
}

function sameCell(a: MatrixCell, b: MatrixCell): boolean {
  return visuallyEqual(a, b);
}

export function generateMatrixPuzzle(level: number, seed: number): MatrixPuzzle {
  const rng = createRng(seed);
  const rules = buildRules(rng);
  // Seviye ilerledikçe daha karmaşık kurallar devreye girer.
  const available = rules.slice(0, Math.min(rules.length, 2 + Math.floor(level / 4)));
  const rule = pick(available, rng);

  const cells: MatrixCell[] = [];
  for (let row = 0; row < 3; row += 1) {
    for (let column = 0; column < 3; column += 1) {
      if (row === 2 && column === 2) continue;
      cells.push(rule.cellFor(row, column));
    }
  }

  const answer = rule.cellFor(2, 2);
  const options = shuffle([answer, ...distractorsFor(answer, rng)], rng);

  return {
    cells,
    options,
    correctIndex: options.findIndex((option) => sameCell(option, answer)),
    ruleName: rule.name,
  };
}
