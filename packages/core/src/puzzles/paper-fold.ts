import { createRng, shuffle, type Rng } from '../random';

/**
 * Katla-Aç bulmacası.
 *
 * Kağıt katlanır, delinir ve açılır. Doğru cevap deliklerin katlama
 * eksenlerine göre yansıtılmasıyla hesaplanır — tahmin değil, türetme.
 */

/** Açılmış kağıdın ızgara boyutu. */
export const PAPER_SIZE = 4;

export type FoldAxis = 'vertical' | 'horizontal';

/** Izgaradaki delikler; satır-sütun indisleri. */
export type HolePattern = readonly (readonly boolean[])[];

export type PaperFoldPuzzle = {
  readonly folds: readonly FoldAxis[];
  /** Katlanmış kağıttaki delikler (küçültülmüş ızgara). */
  readonly punches: readonly { row: number; column: number }[];
  /** Katlanmış ızgaranın boyutları. */
  readonly foldedRows: number;
  readonly foldedColumns: number;
  readonly options: readonly HolePattern[];
  readonly correctIndex: number;
};

function emptyGrid(size: number): boolean[][] {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => false));
}

/**
 * Katlanmış kağıttaki delikleri açılmış kağıda yansıtır.
 *
 * Dikey katlama sağ yarıyı sol yarının üstüne getirir; açılınca her
 * delik dikey eksende yansır. Yatay katlama için aynısı satırlarda.
 */
export function unfold(
  punches: readonly { row: number; column: number }[],
  folds: readonly FoldAxis[],
): HolePattern {
  const grid = emptyGrid(PAPER_SIZE);

  const verticalFolds = folds.filter((fold) => fold === 'vertical').length;
  const horizontalFolds = folds.filter((fold) => fold === 'horizontal').length;

  const foldedColumns = PAPER_SIZE / 2 ** verticalFolds;
  const foldedRows = PAPER_SIZE / 2 ** horizontalFolds;

  for (const punch of punches) {
    // Her katlama deliği ikiye katlar: önce sütunlar, sonra satırlar.
    let columns = [punch.column];
    for (let step = 0; step < verticalFolds; step += 1) {
      const width = foldedColumns * 2 ** step;
      columns = columns.flatMap((column) => [column, width * 2 - 1 - column]);
    }

    let rows = [punch.row];
    for (let step = 0; step < horizontalFolds; step += 1) {
      const height = foldedRows * 2 ** step;
      rows = rows.flatMap((row) => [row, height * 2 - 1 - row]);
    }

    for (const row of rows) {
      for (const column of columns) {
        const line = grid[row];
        if (line !== undefined) line[column] = true;
      }
    }
  }

  return grid;
}

export function patternKey(pattern: HolePattern): string {
  return pattern.map((row) => row.map((cell) => (cell ? '1' : '0')).join('')).join('/');
}

function countHoles(pattern: HolePattern): number {
  return pattern.reduce((total, row) => total + row.filter(Boolean).length, 0);
}

/**
 * Çeldiriciler: eksik yansıma, fazladan delik ve kaydırılmış desen.
 * Hepsi makul görünür ama yalnızca biri katlama kurallarına uyar.
 */
function distractorsFor(
  punches: readonly { row: number; column: number }[],
  folds: readonly FoldAxis[],
  answer: HolePattern,
  rng: Rng,
): HolePattern[] {
  const candidates: HolePattern[] = [];

  // Yalnızca tek eksende açılmış gibi.
  if (folds.length > 1) {
    candidates.push(unfold(punches, [folds[0] as FoldAxis]));
  }

  // Hiç açılmamış gibi: delikler olduğu yerde.
  candidates.push(unfold(punches, []));

  // Doğru desenden bir delik eksik.
  const removed = answer.map((row) => [...row]);
  outer: for (let row = 0; row < PAPER_SIZE; row += 1) {
    for (let column = 0; column < PAPER_SIZE; column += 1) {
      if (removed[row]?.[column] === true) {
        (removed[row] as boolean[])[column] = false;
        break outer;
      }
    }
  }
  candidates.push(removed);

  // Doğru desene fazladan bir delik.
  const added = answer.map((row) => [...row]);
  outer2: for (let row = PAPER_SIZE - 1; row >= 0; row -= 1) {
    for (let column = PAPER_SIZE - 1; column >= 0; column -= 1) {
      if (added[row]?.[column] === false) {
        (added[row] as boolean[])[column] = true;
        break outer2;
      }
    }
  }
  candidates.push(added);

  const answerKey = patternKey(answer);
  const unique: HolePattern[] = [];

  for (const candidate of shuffle(candidates, rng)) {
    const key = patternKey(candidate);
    if (key === answerKey) continue;
    if (countHoles(candidate) === 0) continue;
    if (unique.some((item) => patternKey(item) === key)) continue;
    unique.push(candidate);
    if (unique.length === 3) break;
  }

  // Adaylar yetmezse rastgele bir hücre çevrilerek tamamlanır.
  let attempt = 0;
  while (unique.length < 3 && attempt < 40) {
    const variant = answer.map((row) => [...row]);
    const row = Math.floor(rng() * PAPER_SIZE);
    const column = Math.floor(rng() * PAPER_SIZE);
    (variant[row] as boolean[])[column] = !(variant[row]?.[column] ?? false);

    const key = patternKey(variant);
    attempt += 1;
    if (key === answerKey) continue;
    if (unique.some((item) => patternKey(item) === key)) continue;
    unique.push(variant);
  }

  return unique;
}

export function generatePaperFold(level: number, seed: number): PaperFoldPuzzle {
  const rng = createRng(seed);

  // İlk seviyeler tek katlama, sonra iki.
  const folds: FoldAxis[] =
    level < 4 ? [rng() < 0.5 ? 'vertical' : 'horizontal'] : ['vertical', 'horizontal'];

  const verticalFolds = folds.filter((fold) => fold === 'vertical').length;
  const horizontalFolds = folds.filter((fold) => fold === 'horizontal').length;
  const foldedColumns = PAPER_SIZE / 2 ** verticalFolds;
  const foldedRows = PAPER_SIZE / 2 ** horizontalFolds;

  const punchCount = level < 6 ? 1 : 2;
  const punches: { row: number; column: number }[] = [];

  while (punches.length < punchCount) {
    const punch = {
      row: Math.floor(rng() * foldedRows),
      column: Math.floor(rng() * foldedColumns),
    };
    if (punches.some((item) => item.row === punch.row && item.column === punch.column)) continue;
    punches.push(punch);
  }

  const answer = unfold(punches, folds);
  const options = shuffle([answer, ...distractorsFor(punches, folds, answer, rng)], rng);
  const answerKey = patternKey(answer);

  return {
    folds,
    punches,
    foldedRows,
    foldedColumns,
    options,
    correctIndex: options.findIndex((option) => patternKey(option) === answerKey),
  };
}
