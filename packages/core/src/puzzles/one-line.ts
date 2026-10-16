import { createRng, shuffle, type Rng } from '../random';

/**
 * Tek Çizgi bulmacası — kalemi kaldırmadan her kenarı bir kez çizme
 * (Euler yolu).
 *
 * Üretim, bulmacayı çözümünden türetiyor: ızgarada rastgele bir
 * yürüyüş yapılıyor, hiçbir kenardan iki kez geçilmiyor ve yürünen
 * kenarlar bulmacanın kendisi oluyor. Bu sırayla çizim zaten bir Euler
 * yoludur, dolayısıyla üretilen her tahta çözülebilir — ayrıca
 * bağlantılı olduğu da garanti, çünkü tek bir yürüyüşten çıkıyor.
 */

export type Edge = {
  readonly a: number;
  readonly b: number;
};

export type OneLinePuzzle = {
  readonly columns: number;
  readonly rows: number;
  /** Çizimde kullanılan düğümler; kenarı olmayan ızgara noktaları çizilmez. */
  readonly nodes: readonly number[];
  readonly edges: readonly Edge[];
};

/** Kenarı yönden bağımsız anahtarlar; (a,b) ile (b,a) aynı kenardır. */
export function edgeKey(a: number, b: number): string {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

/** Izgara boyutu ve hedef kenar sayısı seviyeye göre büyür. */
function shapeForLevel(level: number): { columns: number; rows: number; targetEdges: number } {
  const columns = Math.min(5, 3 + Math.floor((level - 1) / 6));
  const rows = Math.min(5, 3 + Math.floor((level - 1) / 8));
  const targetEdges = Math.min(columns * rows + 4, 5 + Math.floor((level - 1) / 2));

  return { columns, rows, targetEdges };
}

function neighboursOf(node: number, columns: number, rows: number): number[] {
  const column = node % columns;
  const row = Math.floor(node / columns);
  const result: number[] = [];

  if (row > 0) result.push(node - columns);
  if (row < rows - 1) result.push(node + columns);
  if (column > 0) result.push(node - 1);
  if (column < columns - 1) result.push(node + 1);

  return result;
}

/** Kenar tekrar etmeden yürür; sıkışınca durur. */
function randomWalk(columns: number, rows: number, targetEdges: number, rng: Rng): Edge[] {
  const used = new Set<string>();
  const edges: Edge[] = [];

  let current = Math.floor(rng() * columns * rows);

  while (edges.length < targetEdges) {
    const options = shuffle(neighboursOf(current, columns, rows), rng).filter(
      (candidate) => !used.has(edgeKey(current, candidate)),
    );

    const next = options[0];
    if (next === undefined) break;

    used.add(edgeKey(current, next));
    edges.push({ a: current, b: next });
    current = next;
  }

  return edges;
}

export function generateOneLine(level: number, seed: number): OneLinePuzzle {
  const { columns, rows, targetEdges } = shapeForLevel(level);

  // Yürüyüş erken sıkışabilir; kısa kalan tahtalar atlanıp yeni tohum
  // deneniyor. Son denemede ne çıktıysa kabul ediliyor, böylece üreteç
  // her zaman bir tahta döndürür.
  let edges: Edge[] = [];
  for (let attempt = 0; attempt < 30; attempt += 1) {
    edges = randomWalk(columns, rows, targetEdges, createRng(seed + attempt * 7919));
    if (edges.length >= targetEdges) break;
  }

  const nodes = [...new Set(edges.flatMap((edge) => [edge.a, edge.b]))].sort((a, b) => a - b);

  return { columns, rows, nodes, edges };
}

/**
 * Euler yolu var mı: kenarlar tek parça olmalı ve tek dereceli düğüm
 * sayısı 0 ya da 2 olmalı. Testler üretilen her tahtada bunu arar.
 */
export function hasEulerPath(puzzle: OneLinePuzzle): boolean {
  if (puzzle.edges.length === 0) return false;

  const degree = new Map<number, number>();
  const adjacency = new Map<number, number[]>();

  for (const edge of puzzle.edges) {
    degree.set(edge.a, (degree.get(edge.a) ?? 0) + 1);
    degree.set(edge.b, (degree.get(edge.b) ?? 0) + 1);
    adjacency.set(edge.a, [...(adjacency.get(edge.a) ?? []), edge.b]);
    adjacency.set(edge.b, [...(adjacency.get(edge.b) ?? []), edge.a]);
  }

  const odd = [...degree.values()].filter((value) => value % 2 === 1).length;
  if (odd !== 0 && odd !== 2) return false;

  const start = puzzle.edges[0]?.a as number;
  const seen = new Set<number>([start]);
  const stack = [start];

  while (stack.length > 0) {
    const node = stack.pop() as number;
    for (const next of adjacency.get(node) ?? []) {
      if (seen.has(next)) continue;
      seen.add(next);
      stack.push(next);
    }
  }

  return seen.size === degree.size;
}
