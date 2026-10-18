/**
 * Görsel test sorularının şekil şeması.
 *
 * Şekiller kodla değil veriyle anlatılıyor — rozet koşulları ve CRM
 * segmentlerindeki gibi. Soru bankası içerik paketinde duruyor,
 * mobil uygulama bu tanımı çiziyor, yönetim paneli aynı tanımı
 * okuyup listeliyor. Çizimi içeriğe gömmek, bir soruyu panelden
 * düzenlemeyi imkânsız kılardı.
 */

export const GLYPH_SHAPES = ['circle', 'square', 'triangle', 'diamond', 'star', 'hexagon'] as const;
export type GlyphShape = (typeof GLYPH_SHAPES)[number];

export const GLYPH_FILLS = ['solid', 'outline', 'half'] as const;
export type GlyphFill = (typeof GLYPH_FILLS)[number];

/**
 * Renk adı değil rol adı: tema koyuya geçince karşılıkları değişiyor
 * ve renk körlüğü olan birinin de ayırt edebilmesi için biçim ile
 * birlikte kullanılıyor — hiçbir soru yalnızca renge dayanmıyor.
 */
export const GLYPH_TONES = ['primary', 'secondary', 'accent', 'muted'] as const;
export type GlyphTone = (typeof GLYPH_TONES)[number];

export const GLYPH_ROTATIONS = [0, 45, 90, 135, 180, 225, 270, 315] as const;
export type GlyphRotation = (typeof GLYPH_ROTATIONS)[number];

export type FigureGlyph = {
  readonly shape: GlyphShape;
  readonly fill: GlyphFill;
  readonly tone: GlyphTone;
  readonly rotation?: GlyphRotation;
};

/** Bir hücrenin içeriği: aynı simgeden bir ya da birkaç tane. */
export type ContentFigure = {
  readonly glyphs: readonly FigureGlyph[];
};

export const FIGURE_LAYOUTS = ['matrix', 'analogy', 'odd_one_out'] as const;
export type FigureLayout = (typeof FIGURE_LAYOUTS)[number];

export type VisualQuestion = {
  readonly layout: FigureLayout;
  /**
   * Soru gövdesindeki hücreler, soldan sağa ve yukarıdan aşağıya.
   * `null` aranan hücre; `matrix` ve `analogy` düzenlerinde tam bir
   * tane olmalı, `odd_one_out` düzeninde hiç olmamalı.
   */
  readonly cells: readonly (ContentFigure | null)[];
  /** Şıkların şekilleri; sırası sorunun metin şıklarıyla birebir. */
  readonly choices: readonly ContentFigure[];
};

/**
 * Dönünce başka bir şekle benzeyen simgeler.
 *
 * 45 derece dönmüş kare baklavadan, 45 derece dönmüş baklava kareden
 * ayırt edilemiyor. Soru "hangisi dönük" diye sorarken oyuncu "hangisi
 * başka şekil" diye okuyor; iki farklı okuma iki farklı cevap demek.
 */
const AMBIGUOUS_ROTATIONS: readonly { shape: GlyphShape; rotation: GlyphRotation }[] = [
  { shape: 'square', rotation: 45 },
  { shape: 'square', rotation: 135 },
  { shape: 'square', rotation: 225 },
  { shape: 'square', rotation: 315 },
  { shape: 'diamond', rotation: 45 },
  { shape: 'diamond', rotation: 135 },
  { shape: 'diamond', rotation: 225 },
  { shape: 'diamond', rotation: 315 },
];

export function isAmbiguousGlyph(glyph: FigureGlyph): boolean {
  const rotation = glyph.rotation ?? 0;
  return AMBIGUOUS_ROTATIONS.some(
    (item) => item.shape === glyph.shape && item.rotation === rotation,
  );
}

export function figureKey(figure: ContentFigure): string {
  return figure.glyphs
    .map((glyph) => `${glyph.shape}:${glyph.fill}:${glyph.tone}:${glyph.rotation ?? 0}`)
    .join('|');
}

export function sameFigure(a: ContentFigure, b: ContentFigure): boolean {
  return figureKey(a) === figureKey(b);
}

/** Bir hücrenin bir özelliğinin değeri; kural denetiminde kullanılıyor. */
export type FigureAttribute = 'shape' | 'fill' | 'tone' | 'rotation' | 'count';

export const FIGURE_ATTRIBUTES: readonly FigureAttribute[] = [
  'shape',
  'fill',
  'tone',
  'rotation',
  'count',
];

export function attributeOf(figure: ContentFigure, attribute: FigureAttribute): string {
  if (attribute === 'count') return String(figure.glyphs.length);

  const first = figure.glyphs[0];
  if (first === undefined) return 'none';
  if (attribute === 'rotation') return String(first.rotation ?? 0);
  return first[attribute];
}

/**
 * Tamamlanmış 3×3 matriste bir özelliğin keşfedilebilir bir kuralı
 * var mı.
 *
 * Üç kural kabul ediliyor: özellik satır boyunca sabit, sütun
 * boyunca sabit, ya da her satır üç değerin bir permütasyonu (Latin
 * kare). Hiçbirine uymayan özellik gürültüdür; sorunun çözülebilir
 * olması için en az bir özelliğin kurala uyması gerekir.
 */
export type AttributeRule =
  /** Bütün ızgarada tek değer; cevabı bulmaya yardım etmez ama bağlar. */
  'constant' | 'constant-in-row' | 'constant-in-column' | 'latin' | 'none';

export function attributeRule(
  grid: readonly ContentFigure[],
  attribute: FigureAttribute,
): AttributeRule {
  if (grid.length !== 9) return 'none';

  const value = (row: number, column: number): string =>
    attributeOf(grid[row * 3 + column] as ContentFigure, attribute);

  const rows = [0, 1, 2].map((row) => [0, 1, 2].map((column) => value(row, column)));
  const columns = [0, 1, 2].map((column) => [0, 1, 2].map((row) => value(row, column)));

  const distinctValues = new Set(rows.flat());
  // Tek değerli özellik cevabı bulmaya yardım etmiyor ama cevabı
  // bağlıyor: hepsi daireyken şık kare olamaz.
  if (distinctValues.size === 1) return 'constant';

  if (rows.every((row) => new Set(row).size === 1)) return 'constant-in-row';
  if (columns.every((column) => new Set(column).size === 1)) return 'constant-in-column';

  const isLatin =
    distinctValues.size === 3 &&
    rows.every((row) => new Set(row).size === 3) &&
    columns.every((column) => new Set(column).size === 3);
  if (isLatin) return 'latin';

  return 'none';
}

export type RuleSignature = Readonly<Record<FigureAttribute, AttributeRule>>;

export function ruleSignature(grid: readonly ContentFigure[]): RuleSignature {
  return Object.fromEntries(
    FIGURE_ATTRIBUTES.map((attribute) => [attribute, attributeRule(grid, attribute)]),
  ) as RuleSignature;
}

/**
 * Matrisin çözülebilir olması için en az bir özelliğin *değişen* bir
 * kuralı olmalı. Her şeyin sabit olduğu bir ızgara soru değildir.
 */
export function hasDiscoverableRule(grid: readonly ContentFigure[]): boolean {
  return FIGURE_ATTRIBUTES.some((attribute) => {
    const rule = attributeRule(grid, attribute);
    return rule !== 'none' && rule !== 'constant';
  });
}

/**
 * Bir şık, doğru cevabın sağladığı bütün kuralları sağlıyor mu.
 *
 * Tek bir kuralın varlığına bakmak yetmiyor: sayı kuralı bozulmadan
 * şekli yanlış olan bir şık da "bir kuralı var" testini geçiyordu.
 * Soru ancak tek bir şık bütün kuralları sağlıyorsa tek cevaplı.
 */
export function satisfiesAllRules(
  expected: RuleSignature,
  candidateGrid: readonly ContentFigure[],
): boolean {
  const actual = ruleSignature(candidateGrid);
  return FIGURE_ATTRIBUTES.every(
    (attribute) => expected[attribute] === 'none' || actual[attribute] === expected[attribute],
  );
}
