import type { ContentQuestion, ContentTest } from '../types';

/**
 * Görsel IQ Testi.
 *
 * Diğer testlerden farkı sorunun metinde değil şekilde olması.
 * Şekiller kodla çizilmiyor; `VisualQuestion` şemasıyla veri olarak
 * yazılıyor (çekirdekteki `content/figures.ts`), uygulama o tanımı
 * çiziyor. Böylece soru bankası ileride panelden düzenlenebilir.
 *
 * Üç soru türü var:
 * - **matris**: 3×3 ızgarada eksik hücre. Her ızgarada en az bir
 *   özelliğin (şekil, sayı, dolgu, renk, açı) keşfedilebilir bir
 *   kuralı var; test bunu ayrıca denetliyor.
 * - **analoji**: A : B :: C : ? — ilk çiftteki dönüşüm üçüncüye
 *   uygulanır.
 * - **farklı olan**: dördünden biri bir özellikte ayrışır.
 *
 * Şıkların metinleri ekranda görünmüyor; ekran okuyucu için
 * şeklin sözle anlatımı olarak duruyorlar.
 */
const QUESTIONS: readonly ContentQuestion[] = [
  // ------------------------------------------------------------- matris
  {
    id: 'vi-mx-1',
    kind: 'matrix',
    prompt: { tr: 'Boş hücreye hangisi gelir?', en: 'Which one completes the grid?' },
    options: [
      { tr: 'Bir dolu mor daire', en: 'One solid purple circle' },
      { tr: 'Bir dolu mor üçgen', en: 'One solid purple triangle' },
      { tr: 'Bir dolu mor baklava', en: 'One solid purple diamond' },
      { tr: 'Bir dolu mor kare', en: 'One solid purple square' },
    ],
    correctIndex: 3,
    difficultyWeight: 0.7,
    explanation: {
      tr: 'Her satırda ve her sütunda üç şekil birer kez geçiyor; boş hücreye kare gelir.',
      en: 'Each row and column uses each shape once, so the empty cell is a square.',
    },
    visual: {
      layout: 'matrix',
      cells: [
        { glyphs: [{ shape: 'circle', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'square', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'triangle', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'square', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'triangle', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'circle', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'triangle', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'circle', fill: 'solid', tone: 'primary' }] },
        null,
      ],
      choices: [
        { glyphs: [{ shape: 'circle', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'triangle', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'diamond', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'square', fill: 'solid', tone: 'primary' }] },
      ],
    },
  },
  {
    id: 'vi-mx-2',
    kind: 'matrix',
    prompt: { tr: 'Boş hücreye hangisi gelir?', en: 'Which one completes the grid?' },
    options: [
      { tr: 'Bir dolu mor daire', en: 'One solid purple circle' },
      { tr: 'Üç dolu mor kare', en: 'Three solid purple squares' },
      { tr: 'Üç dolu mor daire', en: 'Three solid purple circles' },
      { tr: 'İki dolu mor daire', en: 'Two solid purple circles' },
    ],
    correctIndex: 2,
    difficultyWeight: 0.7,
    explanation: {
      tr: 'Satır indikçe daire sayısı birer artıyor; son satırda üç daire olur.',
      en: 'Each row adds one circle, so the bottom row has three.',
    },
    visual: {
      layout: 'matrix',
      cells: [
        { glyphs: [{ shape: 'circle', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'circle', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'circle', fill: 'solid', tone: 'primary' }] },
        {
          glyphs: [
            { shape: 'circle', fill: 'solid', tone: 'primary' },
            { shape: 'circle', fill: 'solid', tone: 'primary' },
          ],
        },
        {
          glyphs: [
            { shape: 'circle', fill: 'solid', tone: 'primary' },
            { shape: 'circle', fill: 'solid', tone: 'primary' },
          ],
        },
        {
          glyphs: [
            { shape: 'circle', fill: 'solid', tone: 'primary' },
            { shape: 'circle', fill: 'solid', tone: 'primary' },
          ],
        },
        {
          glyphs: [
            { shape: 'circle', fill: 'solid', tone: 'primary' },
            { shape: 'circle', fill: 'solid', tone: 'primary' },
            { shape: 'circle', fill: 'solid', tone: 'primary' },
          ],
        },
        {
          glyphs: [
            { shape: 'circle', fill: 'solid', tone: 'primary' },
            { shape: 'circle', fill: 'solid', tone: 'primary' },
            { shape: 'circle', fill: 'solid', tone: 'primary' },
          ],
        },
        null,
      ],
      choices: [
        { glyphs: [{ shape: 'circle', fill: 'solid', tone: 'primary' }] },
        {
          glyphs: [
            { shape: 'square', fill: 'solid', tone: 'primary' },
            { shape: 'square', fill: 'solid', tone: 'primary' },
            { shape: 'square', fill: 'solid', tone: 'primary' },
          ],
        },
        {
          glyphs: [
            { shape: 'circle', fill: 'solid', tone: 'primary' },
            { shape: 'circle', fill: 'solid', tone: 'primary' },
            { shape: 'circle', fill: 'solid', tone: 'primary' },
          ],
        },
        {
          glyphs: [
            { shape: 'circle', fill: 'solid', tone: 'primary' },
            { shape: 'circle', fill: 'solid', tone: 'primary' },
          ],
        },
      ],
    },
  },
  {
    id: 'vi-mx-3',
    kind: 'matrix',
    prompt: { tr: 'Boş hücreye hangisi gelir?', en: 'Which one completes the grid?' },
    options: [
      { tr: 'Bir dolu mavi kare', en: 'One solid blue square' },
      { tr: 'Bir dolu turuncu daire', en: 'One solid orange circle' },
      { tr: 'Bir dolu mor kare', en: 'One solid purple square' },
      { tr: 'Bir dolu turuncu kare', en: 'One solid orange square' },
    ],
    correctIndex: 3,
    difficultyWeight: 0.8,
    explanation: {
      tr: 'Renk her satırda ve her sütunda birer kez dönüyor; ortadaki hücre turuncu olur.',
      en: 'The colour cycles once per row and column, so the middle cell is orange.',
    },
    visual: {
      layout: 'matrix',
      cells: [
        { glyphs: [{ shape: 'square', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'square', fill: 'solid', tone: 'secondary' }] },
        { glyphs: [{ shape: 'square', fill: 'solid', tone: 'accent' }] },
        { glyphs: [{ shape: 'square', fill: 'solid', tone: 'secondary' }] },
        null,
        { glyphs: [{ shape: 'square', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'square', fill: 'solid', tone: 'accent' }] },
        { glyphs: [{ shape: 'square', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'square', fill: 'solid', tone: 'secondary' }] },
      ],
      choices: [
        { glyphs: [{ shape: 'square', fill: 'solid', tone: 'secondary' }] },
        { glyphs: [{ shape: 'circle', fill: 'solid', tone: 'accent' }] },
        { glyphs: [{ shape: 'square', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'square', fill: 'solid', tone: 'accent' }] },
      ],
    },
  },
  {
    id: 'vi-mx-4',
    kind: 'matrix',
    prompt: { tr: 'Boş hücreye hangisi gelir?', en: 'Which one completes the grid?' },
    options: [
      { tr: 'Üç dolu mor üçgen', en: 'Three solid purple triangles' },
      { tr: 'Üç dolu mor kare', en: 'Three solid purple squares' },
      { tr: 'Üç dolu mor daire', en: 'Three solid purple circles' },
      { tr: 'Bir dolu mor kare', en: 'One solid purple square' },
    ],
    correctIndex: 1,
    difficultyWeight: 0.9,
    explanation: {
      tr: 'Şekil satır ve sütunda birer kez geçiyor, sayı ise sütunla artıyor.',
      en: 'The shape appears once per row and column; the count grows with the column.',
    },
    visual: {
      layout: 'matrix',
      cells: [
        { glyphs: [{ shape: 'circle', fill: 'solid', tone: 'primary' }] },
        {
          glyphs: [
            { shape: 'square', fill: 'solid', tone: 'primary' },
            { shape: 'square', fill: 'solid', tone: 'primary' },
          ],
        },
        {
          glyphs: [
            { shape: 'triangle', fill: 'solid', tone: 'primary' },
            { shape: 'triangle', fill: 'solid', tone: 'primary' },
            { shape: 'triangle', fill: 'solid', tone: 'primary' },
          ],
        },
        { glyphs: [{ shape: 'square', fill: 'solid', tone: 'primary' }] },
        {
          glyphs: [
            { shape: 'triangle', fill: 'solid', tone: 'primary' },
            { shape: 'triangle', fill: 'solid', tone: 'primary' },
          ],
        },
        {
          glyphs: [
            { shape: 'circle', fill: 'solid', tone: 'primary' },
            { shape: 'circle', fill: 'solid', tone: 'primary' },
            { shape: 'circle', fill: 'solid', tone: 'primary' },
          ],
        },
        { glyphs: [{ shape: 'triangle', fill: 'solid', tone: 'primary' }] },
        {
          glyphs: [
            { shape: 'circle', fill: 'solid', tone: 'primary' },
            { shape: 'circle', fill: 'solid', tone: 'primary' },
          ],
        },
        null,
      ],
      choices: [
        {
          glyphs: [
            { shape: 'triangle', fill: 'solid', tone: 'primary' },
            { shape: 'triangle', fill: 'solid', tone: 'primary' },
            { shape: 'triangle', fill: 'solid', tone: 'primary' },
          ],
        },
        {
          glyphs: [
            { shape: 'square', fill: 'solid', tone: 'primary' },
            { shape: 'square', fill: 'solid', tone: 'primary' },
            { shape: 'square', fill: 'solid', tone: 'primary' },
          ],
        },
        {
          glyphs: [
            { shape: 'circle', fill: 'solid', tone: 'primary' },
            { shape: 'circle', fill: 'solid', tone: 'primary' },
            { shape: 'circle', fill: 'solid', tone: 'primary' },
          ],
        },
        { glyphs: [{ shape: 'square', fill: 'solid', tone: 'primary' }] },
      ],
    },
  },
  {
    id: 'vi-mx-5',
    kind: 'matrix',
    prompt: { tr: 'Boş hücreye hangisi gelir?', en: 'Which one completes the grid?' },
    options: [
      { tr: 'Bir yarım dolu mor üçgen', en: 'One half-filled purple triangle' },
      { tr: 'Bir boş mor üçgen', en: 'One outlined purple triangle' },
      { tr: 'Bir dolu mor üçgen', en: 'One solid purple triangle' },
      { tr: 'Bir yarım dolu mor daire', en: 'One half-filled purple circle' },
    ],
    correctIndex: 0,
    difficultyWeight: 0.8,
    explanation: {
      tr: 'Her satırın dolgusu aynı: üstte dolu, ortada boş, altta yarım dolu.',
      en: 'Each row shares a fill: solid, then outlined, then half-filled.',
    },
    visual: {
      layout: 'matrix',
      cells: [
        { glyphs: [{ shape: 'triangle', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'triangle', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'triangle', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'triangle', fill: 'outline', tone: 'primary' }] },
        { glyphs: [{ shape: 'triangle', fill: 'outline', tone: 'primary' }] },
        { glyphs: [{ shape: 'triangle', fill: 'outline', tone: 'primary' }] },
        { glyphs: [{ shape: 'triangle', fill: 'half', tone: 'primary' }] },
        null,
        { glyphs: [{ shape: 'triangle', fill: 'half', tone: 'primary' }] },
      ],
      choices: [
        { glyphs: [{ shape: 'triangle', fill: 'half', tone: 'primary' }] },
        { glyphs: [{ shape: 'triangle', fill: 'outline', tone: 'primary' }] },
        { glyphs: [{ shape: 'triangle', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'circle', fill: 'half', tone: 'primary' }] },
      ],
    },
  },
  {
    id: 'vi-mx-6',
    kind: 'matrix',
    prompt: { tr: 'Boş hücreye hangisi gelir?', en: 'Which one completes the grid?' },
    options: [
      { tr: 'Bir yarım dolu mor daire', en: 'One half-filled purple circle' },
      { tr: 'Bir boş mor kare', en: 'One outlined purple square' },
      { tr: 'Bir yarım dolu mor kare', en: 'One half-filled purple square' },
      { tr: 'Bir yarım dolu mor üçgen', en: 'One half-filled purple triangle' },
    ],
    correctIndex: 2,
    difficultyWeight: 1.1,
    explanation: {
      tr: 'Hem şekil hem dolgu satır ve sütunda birer kez geçiyor.',
      en: 'Both the shape and the fill appear once per row and column.',
    },
    visual: {
      layout: 'matrix',
      cells: [
        { glyphs: [{ shape: 'circle', fill: 'outline', tone: 'primary' }] },
        { glyphs: [{ shape: 'square', fill: 'half', tone: 'primary' }] },
        { glyphs: [{ shape: 'triangle', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'square', fill: 'half', tone: 'primary' }] },
        { glyphs: [{ shape: 'triangle', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'circle', fill: 'outline', tone: 'primary' }] },
        { glyphs: [{ shape: 'triangle', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'circle', fill: 'outline', tone: 'primary' }] },
        null,
      ],
      choices: [
        { glyphs: [{ shape: 'circle', fill: 'half', tone: 'primary' }] },
        { glyphs: [{ shape: 'square', fill: 'outline', tone: 'primary' }] },
        { glyphs: [{ shape: 'square', fill: 'half', tone: 'primary' }] },
        { glyphs: [{ shape: 'triangle', fill: 'half', tone: 'primary' }] },
      ],
    },
  },
  {
    id: 'vi-mx-7',
    kind: 'matrix',
    prompt: { tr: 'Boş hücreye hangisi gelir?', en: 'Which one completes the grid?' },
    options: [
      { tr: 'İki dolu mor daire', en: 'Two solid purple circles' },
      { tr: 'İki dolu mor üçgen', en: 'Two solid purple triangles' },
      { tr: 'İki dolu mor kare', en: 'Two solid purple squares' },
      { tr: 'Bir dolu mor daire', en: 'One solid purple circle' },
    ],
    correctIndex: 0,
    difficultyWeight: 1.0,
    explanation: {
      tr: 'Şekil satır ve sütunda birer kez geçiyor, sayı satırla artıyor.',
      en: 'The shape appears once per row and column; the count grows with the row.',
    },
    visual: {
      layout: 'matrix',
      cells: [
        { glyphs: [{ shape: 'circle', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'square', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'triangle', fill: 'solid', tone: 'primary' }] },
        {
          glyphs: [
            { shape: 'square', fill: 'solid', tone: 'primary' },
            { shape: 'square', fill: 'solid', tone: 'primary' },
          ],
        },
        {
          glyphs: [
            { shape: 'triangle', fill: 'solid', tone: 'primary' },
            { shape: 'triangle', fill: 'solid', tone: 'primary' },
          ],
        },
        null,
        {
          glyphs: [
            { shape: 'triangle', fill: 'solid', tone: 'primary' },
            { shape: 'triangle', fill: 'solid', tone: 'primary' },
            { shape: 'triangle', fill: 'solid', tone: 'primary' },
          ],
        },
        {
          glyphs: [
            { shape: 'circle', fill: 'solid', tone: 'primary' },
            { shape: 'circle', fill: 'solid', tone: 'primary' },
            { shape: 'circle', fill: 'solid', tone: 'primary' },
          ],
        },
        {
          glyphs: [
            { shape: 'square', fill: 'solid', tone: 'primary' },
            { shape: 'square', fill: 'solid', tone: 'primary' },
            { shape: 'square', fill: 'solid', tone: 'primary' },
          ],
        },
      ],
      choices: [
        {
          glyphs: [
            { shape: 'circle', fill: 'solid', tone: 'primary' },
            { shape: 'circle', fill: 'solid', tone: 'primary' },
          ],
        },
        {
          glyphs: [
            { shape: 'triangle', fill: 'solid', tone: 'primary' },
            { shape: 'triangle', fill: 'solid', tone: 'primary' },
          ],
        },
        {
          glyphs: [
            { shape: 'square', fill: 'solid', tone: 'primary' },
            { shape: 'square', fill: 'solid', tone: 'primary' },
          ],
        },
        { glyphs: [{ shape: 'circle', fill: 'solid', tone: 'primary' }] },
      ],
    },
  },
  {
    id: 'vi-mx-8',
    kind: 'matrix',
    prompt: { tr: 'Boş hücreye hangisi gelir?', en: 'Which one completes the grid?' },
    options: [
      { tr: 'Bir dolu mor üçgen, 90 derece dönük', en: 'One solid purple triangle, rotated 90°' },
      { tr: 'Bir dolu mor üçgen', en: 'One solid purple triangle' },
      { tr: 'Bir dolu mor daire, 90 derece dönük', en: 'One solid purple circle, rotated 90°' },
      { tr: 'Bir dolu mor üçgen, ters', en: 'One solid purple triangle, upside down' },
    ],
    correctIndex: 0,
    difficultyWeight: 1.1,
    explanation: {
      tr: 'Üçgen her adımda 90 derece dönüyor; satır ve sütunda üç açı birer kez geçiyor.',
      en: 'The triangle turns 90° at each step; each angle appears once per row and column.',
    },
    visual: {
      layout: 'matrix',
      cells: [
        { glyphs: [{ shape: 'triangle', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'triangle', fill: 'solid', tone: 'primary', rotation: 90 }] },
        { glyphs: [{ shape: 'triangle', fill: 'solid', tone: 'primary', rotation: 180 }] },
        { glyphs: [{ shape: 'triangle', fill: 'solid', tone: 'primary', rotation: 90 }] },
        { glyphs: [{ shape: 'triangle', fill: 'solid', tone: 'primary', rotation: 180 }] },
        { glyphs: [{ shape: 'triangle', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'triangle', fill: 'solid', tone: 'primary', rotation: 180 }] },
        { glyphs: [{ shape: 'triangle', fill: 'solid', tone: 'primary' }] },
        null,
      ],
      choices: [
        { glyphs: [{ shape: 'triangle', fill: 'solid', tone: 'primary', rotation: 90 }] },
        { glyphs: [{ shape: 'triangle', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'circle', fill: 'solid', tone: 'primary', rotation: 90 }] },
        { glyphs: [{ shape: 'triangle', fill: 'solid', tone: 'primary', rotation: 180 }] },
      ],
    },
  },
  {
    id: 'vi-mx-9',
    kind: 'matrix',
    prompt: { tr: 'Boş hücreye hangisi gelir?', en: 'Which one completes the grid?' },
    options: [
      { tr: 'Bir dolu mor yıldız', en: 'One solid purple star' },
      { tr: 'Bir dolu mor altıgen', en: 'One solid purple hexagon' },
      { tr: 'Bir dolu mor baklava', en: 'One solid purple diamond' },
      { tr: 'Bir dolu turuncu yıldız', en: 'One solid orange star' },
    ],
    correctIndex: 0,
    difficultyWeight: 1.2,
    explanation: {
      tr: 'Şekil ve renk ayrı ayrı dönüyor; ikisi de satır ve sütunda birer kez geçiyor.',
      en: 'Shape and colour cycle independently, each once per row and column.',
    },
    visual: {
      layout: 'matrix',
      cells: [
        { glyphs: [{ shape: 'diamond', fill: 'solid', tone: 'accent' }] },
        { glyphs: [{ shape: 'star', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'hexagon', fill: 'solid', tone: 'secondary' }] },
        { glyphs: [{ shape: 'star', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'hexagon', fill: 'solid', tone: 'secondary' }] },
        { glyphs: [{ shape: 'diamond', fill: 'solid', tone: 'accent' }] },
        { glyphs: [{ shape: 'hexagon', fill: 'solid', tone: 'secondary' }] },
        { glyphs: [{ shape: 'diamond', fill: 'solid', tone: 'accent' }] },
        null,
      ],
      choices: [
        { glyphs: [{ shape: 'star', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'hexagon', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'diamond', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'star', fill: 'solid', tone: 'accent' }] },
      ],
    },
  },
  {
    id: 'vi-mx-10',
    kind: 'matrix',
    prompt: { tr: 'Boş hücreye hangisi gelir?', en: 'Which one completes the grid?' },
    options: [
      { tr: 'Bir yarım dolu mor yıldız', en: 'One half-filled purple star' },
      { tr: 'İki yarım dolu mor yıldız', en: 'Two half-filled purple stars' },
      { tr: 'İki boş mor yıldız', en: 'Two outlined purple stars' },
      { tr: 'Üç yarım dolu mor yıldız', en: 'Three half-filled purple stars' },
    ],
    correctIndex: 1,
    difficultyWeight: 1.2,
    explanation: {
      tr: 'Yıldız sayısı ve dolgu ayrı ayrı dönüyor.',
      en: 'The number of stars and the fill cycle independently.',
    },
    visual: {
      layout: 'matrix',
      cells: [
        { glyphs: [{ shape: 'star', fill: 'outline', tone: 'primary' }] },
        {
          glyphs: [
            { shape: 'star', fill: 'half', tone: 'primary' },
            { shape: 'star', fill: 'half', tone: 'primary' },
          ],
        },
        {
          glyphs: [
            { shape: 'star', fill: 'solid', tone: 'primary' },
            { shape: 'star', fill: 'solid', tone: 'primary' },
            { shape: 'star', fill: 'solid', tone: 'primary' },
          ],
        },
        {
          glyphs: [
            { shape: 'star', fill: 'half', tone: 'primary' },
            { shape: 'star', fill: 'half', tone: 'primary' },
          ],
        },
        {
          glyphs: [
            { shape: 'star', fill: 'solid', tone: 'primary' },
            { shape: 'star', fill: 'solid', tone: 'primary' },
            { shape: 'star', fill: 'solid', tone: 'primary' },
          ],
        },
        { glyphs: [{ shape: 'star', fill: 'outline', tone: 'primary' }] },
        {
          glyphs: [
            { shape: 'star', fill: 'solid', tone: 'primary' },
            { shape: 'star', fill: 'solid', tone: 'primary' },
            { shape: 'star', fill: 'solid', tone: 'primary' },
          ],
        },
        { glyphs: [{ shape: 'star', fill: 'outline', tone: 'primary' }] },
        null,
      ],
      choices: [
        { glyphs: [{ shape: 'star', fill: 'half', tone: 'primary' }] },
        {
          glyphs: [
            { shape: 'star', fill: 'half', tone: 'primary' },
            { shape: 'star', fill: 'half', tone: 'primary' },
          ],
        },
        {
          glyphs: [
            { shape: 'star', fill: 'outline', tone: 'primary' },
            { shape: 'star', fill: 'outline', tone: 'primary' },
          ],
        },
        {
          glyphs: [
            { shape: 'star', fill: 'half', tone: 'primary' },
            { shape: 'star', fill: 'half', tone: 'primary' },
            { shape: 'star', fill: 'half', tone: 'primary' },
          ],
        },
      ],
    },
  },
  {
    id: 'vi-mx-11',
    kind: 'matrix',
    prompt: { tr: 'Boş hücreye hangisi gelir?', en: 'Which one completes the grid?' },
    options: [
      { tr: 'Bir dolu turuncu kare', en: 'One solid orange square' },
      { tr: 'Bir yarım dolu turuncu kare', en: 'One half-filled orange square' },
      { tr: 'Bir yarım dolu turuncu altıgen', en: 'One half-filled orange hexagon' },
      { tr: 'Bir yarım dolu turuncu daire', en: 'One half-filled orange circle' },
    ],
    correctIndex: 1,
    difficultyWeight: 1.5,
    explanation: {
      tr: 'Şekil satır ve sütunda birer kez geçiyor, dolgu satıra, renk sütuna bağlı.',
      en: 'The shape appears once per row and column, the fill follows the row and the colour the column.',
    },
    visual: {
      layout: 'matrix',
      cells: [
        { glyphs: [{ shape: 'circle', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'square', fill: 'solid', tone: 'secondary' }] },
        { glyphs: [{ shape: 'hexagon', fill: 'solid', tone: 'accent' }] },
        { glyphs: [{ shape: 'square', fill: 'outline', tone: 'primary' }] },
        { glyphs: [{ shape: 'hexagon', fill: 'outline', tone: 'secondary' }] },
        { glyphs: [{ shape: 'circle', fill: 'outline', tone: 'accent' }] },
        { glyphs: [{ shape: 'hexagon', fill: 'half', tone: 'primary' }] },
        { glyphs: [{ shape: 'circle', fill: 'half', tone: 'secondary' }] },
        null,
      ],
      choices: [
        { glyphs: [{ shape: 'square', fill: 'solid', tone: 'accent' }] },
        { glyphs: [{ shape: 'square', fill: 'half', tone: 'accent' }] },
        { glyphs: [{ shape: 'hexagon', fill: 'half', tone: 'accent' }] },
        { glyphs: [{ shape: 'circle', fill: 'half', tone: 'accent' }] },
      ],
    },
  },
  {
    id: 'vi-mx-12',
    kind: 'matrix',
    prompt: { tr: 'Boş hücreye hangisi gelir?', en: 'Which one completes the grid?' },
    options: [
      { tr: 'Bir yarım dolu mavi altıgen', en: 'One half-filled blue hexagon' },
      { tr: 'Üç dolu mavi altıgen', en: 'Three solid blue hexagons' },
      { tr: 'Üç yarım dolu mavi altıgen', en: 'Three half-filled blue hexagons' },
      { tr: 'İki yarım dolu mavi altıgen', en: 'Two half-filled blue hexagons' },
    ],
    correctIndex: 2,
    difficultyWeight: 1.6,
    explanation: {
      tr: 'Sayı satırla artıyor, dolgu sütuna bağlı, renk ise satır ve sütunda birer kez dönüyor.',
      en: 'The count grows with the row, the fill follows the column and the colour cycles once per row and column.',
    },
    visual: {
      layout: 'matrix',
      cells: [
        { glyphs: [{ shape: 'hexagon', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'hexagon', fill: 'outline', tone: 'secondary' }] },
        { glyphs: [{ shape: 'hexagon', fill: 'half', tone: 'accent' }] },
        {
          glyphs: [
            { shape: 'hexagon', fill: 'solid', tone: 'secondary' },
            { shape: 'hexagon', fill: 'solid', tone: 'secondary' },
          ],
        },
        {
          glyphs: [
            { shape: 'hexagon', fill: 'outline', tone: 'accent' },
            { shape: 'hexagon', fill: 'outline', tone: 'accent' },
          ],
        },
        {
          glyphs: [
            { shape: 'hexagon', fill: 'half', tone: 'primary' },
            { shape: 'hexagon', fill: 'half', tone: 'primary' },
          ],
        },
        {
          glyphs: [
            { shape: 'hexagon', fill: 'solid', tone: 'accent' },
            { shape: 'hexagon', fill: 'solid', tone: 'accent' },
            { shape: 'hexagon', fill: 'solid', tone: 'accent' },
          ],
        },
        {
          glyphs: [
            { shape: 'hexagon', fill: 'outline', tone: 'primary' },
            { shape: 'hexagon', fill: 'outline', tone: 'primary' },
            { shape: 'hexagon', fill: 'outline', tone: 'primary' },
          ],
        },
        null,
      ],
      choices: [
        { glyphs: [{ shape: 'hexagon', fill: 'half', tone: 'secondary' }] },
        {
          glyphs: [
            { shape: 'hexagon', fill: 'solid', tone: 'secondary' },
            { shape: 'hexagon', fill: 'solid', tone: 'secondary' },
            { shape: 'hexagon', fill: 'solid', tone: 'secondary' },
          ],
        },
        {
          glyphs: [
            { shape: 'hexagon', fill: 'half', tone: 'secondary' },
            { shape: 'hexagon', fill: 'half', tone: 'secondary' },
            { shape: 'hexagon', fill: 'half', tone: 'secondary' },
          ],
        },
        {
          glyphs: [
            { shape: 'hexagon', fill: 'half', tone: 'secondary' },
            { shape: 'hexagon', fill: 'half', tone: 'secondary' },
          ],
        },
      ],
    },
  },

  // ------------------------------------------------------------ analoji
  {
    id: 'vi-an-1',
    kind: 'shape_analogy',
    prompt: {
      tr: 'İlişkiyi kur: soru işareti yerine hangisi gelir?',
      en: 'Work out the relationship: which one replaces the question mark?',
    },
    options: [
      { tr: 'Bir dolu mor kare', en: 'One solid purple square' },
      { tr: 'İki dolu mor üçgen', en: 'Two solid purple triangles' },
      { tr: 'İki dolu mor kare', en: 'Two solid purple squares' },
      { tr: 'İki dolu mor daire', en: 'Two solid purple circles' },
    ],
    correctIndex: 2,
    difficultyWeight: 0.7,
    explanation: {
      tr: 'Soldaki çift şekli ikiye çıkarıyor; aynısı kareye uygulanır.',
      en: 'The first pair doubles the shape, so the square doubles too.',
    },
    visual: {
      layout: 'analogy',
      cells: [
        { glyphs: [{ shape: 'circle', fill: 'solid', tone: 'primary' }] },
        {
          glyphs: [
            { shape: 'circle', fill: 'solid', tone: 'primary' },
            { shape: 'circle', fill: 'solid', tone: 'primary' },
          ],
        },
        { glyphs: [{ shape: 'square', fill: 'solid', tone: 'primary' }] },
        null,
      ],
      choices: [
        { glyphs: [{ shape: 'square', fill: 'solid', tone: 'primary' }] },
        {
          glyphs: [
            { shape: 'triangle', fill: 'solid', tone: 'primary' },
            { shape: 'triangle', fill: 'solid', tone: 'primary' },
          ],
        },
        {
          glyphs: [
            { shape: 'square', fill: 'solid', tone: 'primary' },
            { shape: 'square', fill: 'solid', tone: 'primary' },
          ],
        },
        {
          glyphs: [
            { shape: 'circle', fill: 'solid', tone: 'primary' },
            { shape: 'circle', fill: 'solid', tone: 'primary' },
          ],
        },
      ],
    },
  },
  {
    id: 'vi-an-2',
    kind: 'shape_analogy',
    prompt: {
      tr: 'İlişkiyi kur: soru işareti yerine hangisi gelir?',
      en: 'Work out the relationship: which one replaces the question mark?',
    },
    options: [
      { tr: 'Bir boş mor yıldız', en: 'One outlined purple star' },
      { tr: 'Bir dolu mor yıldız', en: 'One solid purple star' },
      { tr: 'Bir boş mor üçgen', en: 'One outlined purple triangle' },
      { tr: 'Bir boş mor daire', en: 'One outlined purple circle' },
    ],
    correctIndex: 0,
    difficultyWeight: 0.8,
    explanation: {
      tr: 'İlk çiftte dolu şekil boşalıyor; yıldız da boşalır.',
      en: 'The first pair empties a solid shape, so the star is emptied too.',
    },
    visual: {
      layout: 'analogy',
      cells: [
        { glyphs: [{ shape: 'triangle', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'triangle', fill: 'outline', tone: 'primary' }] },
        { glyphs: [{ shape: 'star', fill: 'solid', tone: 'primary' }] },
        null,
      ],
      choices: [
        { glyphs: [{ shape: 'star', fill: 'outline', tone: 'primary' }] },
        { glyphs: [{ shape: 'star', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'triangle', fill: 'outline', tone: 'primary' }] },
        { glyphs: [{ shape: 'circle', fill: 'outline', tone: 'primary' }] },
      ],
    },
  },
  {
    id: 'vi-an-3',
    kind: 'shape_analogy',
    prompt: {
      tr: 'İlişkiyi kur: soru işareti yerine hangisi gelir?',
      en: 'Work out the relationship: which one replaces the question mark?',
    },
    options: [
      { tr: 'Bir dolu mor üçgen', en: 'One solid purple triangle' },
      { tr: 'Bir dolu mor daire, 90 derece dönük', en: 'One solid purple circle, rotated 90°' },
      { tr: 'Bir dolu mor üçgen, 90 derece dönük', en: 'One solid purple triangle, rotated 90°' },
      { tr: 'Bir dolu mor altıgen, 90 derece dönük', en: 'One solid purple hexagon, rotated 90°' },
    ],
    correctIndex: 2,
    difficultyWeight: 0.9,
    explanation: {
      tr: 'İlk çift şekli 90 derece döndürüyor.',
      en: 'The first pair turns the shape 90°.',
    },
    visual: {
      layout: 'analogy',
      cells: [
        { glyphs: [{ shape: 'hexagon', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'hexagon', fill: 'solid', tone: 'primary', rotation: 90 }] },
        { glyphs: [{ shape: 'triangle', fill: 'solid', tone: 'primary' }] },
        null,
      ],
      choices: [
        { glyphs: [{ shape: 'triangle', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'circle', fill: 'solid', tone: 'primary', rotation: 90 }] },
        { glyphs: [{ shape: 'triangle', fill: 'solid', tone: 'primary', rotation: 90 }] },
        { glyphs: [{ shape: 'hexagon', fill: 'solid', tone: 'primary', rotation: 90 }] },
      ],
    },
  },
  {
    id: 'vi-an-4',
    kind: 'shape_analogy',
    prompt: {
      tr: 'İlişkiyi kur: soru işareti yerine hangisi gelir?',
      en: 'Work out the relationship: which one replaces the question mark?',
    },
    options: [
      { tr: 'Bir dolu mor yıldız', en: 'One solid purple star' },
      { tr: 'Bir dolu mor daire', en: 'One solid purple circle' },
      { tr: 'Üç dolu mor yıldız', en: 'Three solid purple stars' },
      { tr: 'Bir dolu mor kare', en: 'One solid purple square' },
    ],
    correctIndex: 0,
    difficultyWeight: 0.8,
    explanation: {
      tr: 'İlk çift üç şekli bire indiriyor.',
      en: 'The first pair reduces three shapes to one.',
    },
    visual: {
      layout: 'analogy',
      cells: [
        {
          glyphs: [
            { shape: 'circle', fill: 'solid', tone: 'primary' },
            { shape: 'circle', fill: 'solid', tone: 'primary' },
            { shape: 'circle', fill: 'solid', tone: 'primary' },
          ],
        },
        { glyphs: [{ shape: 'circle', fill: 'solid', tone: 'primary' }] },
        {
          glyphs: [
            { shape: 'star', fill: 'solid', tone: 'primary' },
            { shape: 'star', fill: 'solid', tone: 'primary' },
            { shape: 'star', fill: 'solid', tone: 'primary' },
          ],
        },
        null,
      ],
      choices: [
        { glyphs: [{ shape: 'star', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'circle', fill: 'solid', tone: 'primary' }] },
        {
          glyphs: [
            { shape: 'star', fill: 'solid', tone: 'primary' },
            { shape: 'star', fill: 'solid', tone: 'primary' },
            { shape: 'star', fill: 'solid', tone: 'primary' },
          ],
        },
        { glyphs: [{ shape: 'square', fill: 'solid', tone: 'primary' }] },
      ],
    },
  },
  {
    id: 'vi-an-5',
    kind: 'shape_analogy',
    prompt: {
      tr: 'İlişkiyi kur: soru işareti yerine hangisi gelir?',
      en: 'Work out the relationship: which one replaces the question mark?',
    },
    options: [
      { tr: 'Bir dolu turuncu altıgen', en: 'One solid orange hexagon' },
      { tr: 'Bir dolu turuncu baklava', en: 'One solid orange diamond' },
      { tr: 'Bir dolu mor altıgen', en: 'One solid purple hexagon' },
      { tr: 'Bir dolu turuncu daire', en: 'One solid orange circle' },
    ],
    correctIndex: 0,
    difficultyWeight: 0.9,
    explanation: {
      tr: 'İlk çift rengi mordan turuncuya çeviriyor.',
      en: 'The first pair changes the colour from purple to orange.',
    },
    visual: {
      layout: 'analogy',
      cells: [
        { glyphs: [{ shape: 'diamond', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'diamond', fill: 'solid', tone: 'accent' }] },
        { glyphs: [{ shape: 'hexagon', fill: 'solid', tone: 'primary' }] },
        null,
      ],
      choices: [
        { glyphs: [{ shape: 'hexagon', fill: 'solid', tone: 'accent' }] },
        { glyphs: [{ shape: 'diamond', fill: 'solid', tone: 'accent' }] },
        { glyphs: [{ shape: 'hexagon', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'circle', fill: 'solid', tone: 'accent' }] },
      ],
    },
  },
  {
    id: 'vi-an-6',
    kind: 'shape_analogy',
    prompt: {
      tr: 'İlişkiyi kur: soru işareti yerine hangisi gelir?',
      en: 'Work out the relationship: which one replaces the question mark?',
    },
    options: [
      { tr: 'Bir yarım dolu mor kare', en: 'One half-filled purple square' },
      { tr: 'Bir yarım dolu mor üçgen', en: 'One half-filled purple triangle' },
      { tr: 'Bir yarım dolu mor daire', en: 'One half-filled purple circle' },
      { tr: 'Bir dolu mor daire', en: 'One solid purple circle' },
    ],
    correctIndex: 2,
    difficultyWeight: 1.0,
    explanation: {
      tr: 'İlk çift dolu şekli yarım dolduruyor.',
      en: 'The first pair turns a solid shape into a half-filled one.',
    },
    visual: {
      layout: 'analogy',
      cells: [
        { glyphs: [{ shape: 'square', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'square', fill: 'half', tone: 'primary' }] },
        { glyphs: [{ shape: 'circle', fill: 'solid', tone: 'primary' }] },
        null,
      ],
      choices: [
        { glyphs: [{ shape: 'square', fill: 'half', tone: 'primary' }] },
        { glyphs: [{ shape: 'triangle', fill: 'half', tone: 'primary' }] },
        { glyphs: [{ shape: 'circle', fill: 'half', tone: 'primary' }] },
        { glyphs: [{ shape: 'circle', fill: 'solid', tone: 'primary' }] },
      ],
    },
  },
  {
    id: 'vi-an-7',
    kind: 'shape_analogy',
    prompt: {
      tr: 'İlişkiyi kur: soru işareti yerine hangisi gelir?',
      en: 'Work out the relationship: which one replaces the question mark?',
    },
    options: [
      { tr: 'İki boş mor altıgen', en: 'Two outlined purple hexagons' },
      { tr: 'İki boş mor üçgen', en: 'Two outlined purple triangles' },
      { tr: 'Bir boş mor altıgen', en: 'One outlined purple hexagon' },
      { tr: 'İki dolu mor altıgen', en: 'Two solid purple hexagons' },
    ],
    correctIndex: 0,
    difficultyWeight: 1.2,
    explanation: {
      tr: 'İlk çift hem sayıyı ikiye çıkarıyor hem şekli boşaltıyor; iki değişiklik birden.',
      en: 'The first pair both doubles the count and empties the shape — two changes at once.',
    },
    visual: {
      layout: 'analogy',
      cells: [
        { glyphs: [{ shape: 'triangle', fill: 'solid', tone: 'primary' }] },
        {
          glyphs: [
            { shape: 'triangle', fill: 'outline', tone: 'primary' },
            { shape: 'triangle', fill: 'outline', tone: 'primary' },
          ],
        },
        { glyphs: [{ shape: 'hexagon', fill: 'solid', tone: 'primary' }] },
        null,
      ],
      choices: [
        {
          glyphs: [
            { shape: 'hexagon', fill: 'outline', tone: 'primary' },
            { shape: 'hexagon', fill: 'outline', tone: 'primary' },
          ],
        },
        {
          glyphs: [
            { shape: 'triangle', fill: 'outline', tone: 'primary' },
            { shape: 'triangle', fill: 'outline', tone: 'primary' },
          ],
        },
        { glyphs: [{ shape: 'hexagon', fill: 'outline', tone: 'primary' }] },
        {
          glyphs: [
            { shape: 'hexagon', fill: 'solid', tone: 'primary' },
            { shape: 'hexagon', fill: 'solid', tone: 'primary' },
          ],
        },
      ],
    },
  },
  {
    id: 'vi-an-8',
    kind: 'shape_analogy',
    prompt: {
      tr: 'İlişkiyi kur: soru işareti yerine hangisi gelir?',
      en: 'Work out the relationship: which one replaces the question mark?',
    },
    options: [
      { tr: 'Bir dolu mor baklava', en: 'One solid purple diamond' },
      { tr: 'Bir dolu mor yıldız, ters', en: 'One solid purple star, upside down' },
      { tr: 'Bir dolu mor daire, ters', en: 'One solid purple circle, upside down' },
      { tr: 'Bir dolu mor baklava, ters', en: 'One solid purple diamond, upside down' },
    ],
    correctIndex: 3,
    difficultyWeight: 1.0,
    explanation: {
      tr: 'İlk çift şekli ters çeviriyor.',
      en: 'The first pair flips the shape upside down.',
    },
    visual: {
      layout: 'analogy',
      cells: [
        { glyphs: [{ shape: 'star', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'star', fill: 'solid', tone: 'primary', rotation: 180 }] },
        { glyphs: [{ shape: 'diamond', fill: 'solid', tone: 'primary' }] },
        null,
      ],
      choices: [
        { glyphs: [{ shape: 'diamond', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'star', fill: 'solid', tone: 'primary', rotation: 180 }] },
        { glyphs: [{ shape: 'circle', fill: 'solid', tone: 'primary', rotation: 180 }] },
        { glyphs: [{ shape: 'diamond', fill: 'solid', tone: 'primary', rotation: 180 }] },
      ],
    },
  },
  {
    id: 'vi-an-9',
    kind: 'shape_analogy',
    prompt: {
      tr: 'İlişkiyi kur: soru işareti yerine hangisi gelir?',
      en: 'Work out the relationship: which one replaces the question mark?',
    },
    options: [
      { tr: 'Üç dolu mavi kare', en: 'Three solid blue squares' },
      { tr: 'Üç dolu gri daire', en: 'Three solid grey circles' },
      { tr: 'Üç dolu gri kare', en: 'Three solid grey squares' },
      { tr: 'İki dolu gri kare', en: 'Two solid grey squares' },
    ],
    correctIndex: 2,
    difficultyWeight: 1.1,
    explanation: {
      tr: 'İlk çift sayıyı bir artırıyor; renk değişmiyor.',
      en: 'The first pair adds one to the count and leaves the colour alone.',
    },
    visual: {
      layout: 'analogy',
      cells: [
        {
          glyphs: [
            { shape: 'circle', fill: 'solid', tone: 'secondary' },
            { shape: 'circle', fill: 'solid', tone: 'secondary' },
          ],
        },
        {
          glyphs: [
            { shape: 'circle', fill: 'solid', tone: 'secondary' },
            { shape: 'circle', fill: 'solid', tone: 'secondary' },
            { shape: 'circle', fill: 'solid', tone: 'secondary' },
          ],
        },
        {
          glyphs: [
            { shape: 'square', fill: 'solid', tone: 'muted' },
            { shape: 'square', fill: 'solid', tone: 'muted' },
          ],
        },
        null,
      ],
      choices: [
        {
          glyphs: [
            { shape: 'square', fill: 'solid', tone: 'secondary' },
            { shape: 'square', fill: 'solid', tone: 'secondary' },
            { shape: 'square', fill: 'solid', tone: 'secondary' },
          ],
        },
        {
          glyphs: [
            { shape: 'circle', fill: 'solid', tone: 'muted' },
            { shape: 'circle', fill: 'solid', tone: 'muted' },
            { shape: 'circle', fill: 'solid', tone: 'muted' },
          ],
        },
        {
          glyphs: [
            { shape: 'square', fill: 'solid', tone: 'muted' },
            { shape: 'square', fill: 'solid', tone: 'muted' },
            { shape: 'square', fill: 'solid', tone: 'muted' },
          ],
        },
        {
          glyphs: [
            { shape: 'square', fill: 'solid', tone: 'muted' },
            { shape: 'square', fill: 'solid', tone: 'muted' },
          ],
        },
      ],
    },
  },
  {
    id: 'vi-an-10',
    kind: 'shape_analogy',
    prompt: {
      tr: 'İlişkiyi kur: soru işareti yerine hangisi gelir?',
      en: 'Work out the relationship: which one replaces the question mark?',
    },
    options: [
      { tr: 'Bir dolu mor yıldız', en: 'One solid purple star' },
      { tr: 'Bir dolu mor yıldız, 90 derece dönük', en: 'One solid purple star, rotated 90°' },
      { tr: 'Bir dolu mor altıgen, 90 derece dönük', en: 'One solid purple hexagon, rotated 90°' },
      { tr: 'Bir boş mor yıldız, 90 derece dönük', en: 'One outlined purple star, rotated 90°' },
    ],
    correctIndex: 1,
    difficultyWeight: 1.4,
    explanation: {
      tr: 'İlk çift şekli hem dolduruyor hem 90 derece döndürüyor.',
      en: 'The first pair both fills the shape and turns it 90°.',
    },
    visual: {
      layout: 'analogy',
      cells: [
        { glyphs: [{ shape: 'hexagon', fill: 'outline', tone: 'primary' }] },
        { glyphs: [{ shape: 'hexagon', fill: 'solid', tone: 'primary', rotation: 90 }] },
        { glyphs: [{ shape: 'star', fill: 'outline', tone: 'primary' }] },
        null,
      ],
      choices: [
        { glyphs: [{ shape: 'star', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'star', fill: 'solid', tone: 'primary', rotation: 90 }] },
        { glyphs: [{ shape: 'hexagon', fill: 'solid', tone: 'primary', rotation: 90 }] },
        { glyphs: [{ shape: 'star', fill: 'outline', tone: 'primary', rotation: 90 }] },
      ],
    },
  },

  // -------------------------------------------------------- farklı olan
  {
    id: 'vi-oo-1',
    kind: 'odd_one_out',
    prompt: { tr: 'Hangisi diğerlerinden farklı?', en: 'Which one is different?' },
    options: [
      { tr: 'Bir dolu mor daire', en: 'One solid purple circle' },
      { tr: 'Bir dolu mor daire', en: 'One solid purple circle' },
      { tr: 'Bir dolu mor kare', en: 'One solid purple square' },
      { tr: 'Bir dolu mor daire', en: 'One solid purple circle' },
    ],
    correctIndex: 2,
    difficultyWeight: 0.7,
    explanation: { tr: 'Üçü daire, biri kare.', en: 'Three are circles and one is a square.' },
    visual: {
      layout: 'odd_one_out',
      cells: [],
      choices: [
        { glyphs: [{ shape: 'circle', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'circle', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'square', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'circle', fill: 'solid', tone: 'primary' }] },
      ],
    },
  },
  {
    id: 'vi-oo-2',
    kind: 'odd_one_out',
    prompt: { tr: 'Hangisi diğerlerinden farklı?', en: 'Which one is different?' },
    options: [
      { tr: 'Bir dolu mor yıldız', en: 'One solid purple star' },
      { tr: 'Bir dolu mor yıldız', en: 'One solid purple star' },
      { tr: 'Bir dolu mor yıldız', en: 'One solid purple star' },
      { tr: 'Bir boş mor yıldız', en: 'One outlined purple star' },
    ],
    correctIndex: 3,
    difficultyWeight: 0.8,
    explanation: { tr: 'Üçü dolu, biri boş.', en: 'Three are solid and one is outlined.' },
    visual: {
      layout: 'odd_one_out',
      cells: [],
      choices: [
        { glyphs: [{ shape: 'star', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'star', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'star', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'star', fill: 'outline', tone: 'primary' }] },
      ],
    },
  },
  {
    id: 'vi-oo-3',
    kind: 'odd_one_out',
    prompt: { tr: 'Hangisi diğerlerinden farklı?', en: 'Which one is different?' },
    options: [
      { tr: 'İki dolu mor üçgen', en: 'Two solid purple triangles' },
      { tr: 'İki dolu mor üçgen', en: 'Two solid purple triangles' },
      { tr: 'Üç dolu mor üçgen', en: 'Three solid purple triangles' },
      { tr: 'İki dolu mor üçgen', en: 'Two solid purple triangles' },
    ],
    correctIndex: 2,
    difficultyWeight: 0.8,
    explanation: {
      tr: 'Üçünde iki üçgen var, birinde üç.',
      en: 'Three have two triangles and one has three.',
    },
    visual: {
      layout: 'odd_one_out',
      cells: [],
      choices: [
        {
          glyphs: [
            { shape: 'triangle', fill: 'solid', tone: 'primary' },
            { shape: 'triangle', fill: 'solid', tone: 'primary' },
          ],
        },
        {
          glyphs: [
            { shape: 'triangle', fill: 'solid', tone: 'primary' },
            { shape: 'triangle', fill: 'solid', tone: 'primary' },
          ],
        },
        {
          glyphs: [
            { shape: 'triangle', fill: 'solid', tone: 'primary' },
            { shape: 'triangle', fill: 'solid', tone: 'primary' },
            { shape: 'triangle', fill: 'solid', tone: 'primary' },
          ],
        },
        {
          glyphs: [
            { shape: 'triangle', fill: 'solid', tone: 'primary' },
            { shape: 'triangle', fill: 'solid', tone: 'primary' },
          ],
        },
      ],
    },
  },
  {
    id: 'vi-oo-4',
    kind: 'odd_one_out',
    prompt: { tr: 'Hangisi diğerlerinden farklı?', en: 'Which one is different?' },
    options: [
      { tr: 'Bir dolu mor kare', en: 'One solid purple square' },
      { tr: 'Bir dolu mor kare', en: 'One solid purple square' },
      { tr: 'Bir dolu mor kare', en: 'One solid purple square' },
      { tr: 'Bir dolu turuncu kare', en: 'One solid orange square' },
    ],
    correctIndex: 3,
    difficultyWeight: 0.7,
    explanation: { tr: 'Üçü mor, biri turuncu.', en: 'Three are purple and one is orange.' },
    visual: {
      layout: 'odd_one_out',
      cells: [],
      choices: [
        { glyphs: [{ shape: 'square', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'square', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'square', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'square', fill: 'solid', tone: 'accent' }] },
      ],
    },
  },
  {
    id: 'vi-oo-5',
    kind: 'odd_one_out',
    prompt: { tr: 'Hangisi diğerlerinden farklı?', en: 'Which one is different?' },
    options: [
      { tr: 'Bir dolu mor üçgen', en: 'One solid purple triangle' },
      { tr: 'Bir dolu mor üçgen', en: 'One solid purple triangle' },
      { tr: 'Bir dolu mor üçgen, ters', en: 'One solid purple triangle, upside down' },
      { tr: 'Bir dolu mor üçgen', en: 'One solid purple triangle' },
    ],
    correctIndex: 2,
    difficultyWeight: 1.0,
    explanation: {
      tr: 'Üçü yukarı bakıyor, biri ters duruyor.',
      en: 'Three point up and one is upside down.',
    },
    visual: {
      layout: 'odd_one_out',
      cells: [],
      choices: [
        { glyphs: [{ shape: 'triangle', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'triangle', fill: 'solid', tone: 'primary' }] },
        { glyphs: [{ shape: 'triangle', fill: 'solid', tone: 'primary', rotation: 180 }] },
        { glyphs: [{ shape: 'triangle', fill: 'solid', tone: 'primary' }] },
      ],
    },
  },
  {
    id: 'vi-oo-6',
    kind: 'odd_one_out',
    prompt: { tr: 'Hangisi diğerlerinden farklı?', en: 'Which one is different?' },
    options: [
      { tr: 'İki boş mor daire', en: 'Two outlined purple circles' },
      { tr: 'İki boş mor kare', en: 'Two outlined purple squares' },
      { tr: 'İki dolu mor yıldız', en: 'Two solid purple stars' },
      { tr: 'İki boş mor altıgen', en: 'Two outlined purple hexagons' },
    ],
    correctIndex: 2,
    difficultyWeight: 1.1,
    explanation: {
      tr: 'Şekiller farklı ama üçü boş, biri dolu; ayırt eden şekil değil dolgu.',
      en: 'The shapes differ, but three are outlined and one is solid — the fill is what sets it apart.',
    },
    visual: {
      layout: 'odd_one_out',
      cells: [],
      choices: [
        {
          glyphs: [
            { shape: 'circle', fill: 'outline', tone: 'primary' },
            { shape: 'circle', fill: 'outline', tone: 'primary' },
          ],
        },
        {
          glyphs: [
            { shape: 'square', fill: 'outline', tone: 'primary' },
            { shape: 'square', fill: 'outline', tone: 'primary' },
          ],
        },
        {
          glyphs: [
            { shape: 'star', fill: 'solid', tone: 'primary' },
            { shape: 'star', fill: 'solid', tone: 'primary' },
          ],
        },
        {
          glyphs: [
            { shape: 'hexagon', fill: 'outline', tone: 'primary' },
            { shape: 'hexagon', fill: 'outline', tone: 'primary' },
          ],
        },
      ],
    },
  },
  {
    id: 'vi-oo-7',
    kind: 'odd_one_out',
    prompt: { tr: 'Hangisi diğerlerinden farklı?', en: 'Which one is different?' },
    options: [
      { tr: 'Bir dolu mavi üçgen', en: 'One solid blue triangle' },
      { tr: 'Üç dolu mavi üçgen', en: 'Three solid blue triangles' },
      { tr: 'İki dolu mavi üçgen', en: 'Two solid blue triangles' },
      { tr: 'İki dolu mavi yıldız', en: 'Two solid blue stars' },
    ],
    correctIndex: 3,
    difficultyWeight: 1.2,
    explanation: {
      tr: 'Sayılar farklı ama üçü üçgen, biri yıldız.',
      en: 'The counts differ, but three are triangles and one is a star.',
    },
    visual: {
      layout: 'odd_one_out',
      cells: [],
      choices: [
        { glyphs: [{ shape: 'triangle', fill: 'solid', tone: 'secondary' }] },
        {
          glyphs: [
            { shape: 'triangle', fill: 'solid', tone: 'secondary' },
            { shape: 'triangle', fill: 'solid', tone: 'secondary' },
            { shape: 'triangle', fill: 'solid', tone: 'secondary' },
          ],
        },
        {
          glyphs: [
            { shape: 'triangle', fill: 'solid', tone: 'secondary' },
            { shape: 'triangle', fill: 'solid', tone: 'secondary' },
          ],
        },
        {
          glyphs: [
            { shape: 'star', fill: 'solid', tone: 'secondary' },
            { shape: 'star', fill: 'solid', tone: 'secondary' },
          ],
        },
      ],
    },
  },
  {
    id: 'vi-oo-8',
    kind: 'odd_one_out',
    prompt: { tr: 'Hangisi diğerlerinden farklı?', en: 'Which one is different?' },
    options: [
      { tr: 'İki yarım dolu mor altıgen', en: 'Two half-filled purple hexagons' },
      { tr: 'İki yarım dolu mor altıgen', en: 'Two half-filled purple hexagons' },
      { tr: 'İki yarım dolu mor altıgen', en: 'Two half-filled purple hexagons' },
      { tr: 'Üç yarım dolu mor altıgen', en: 'Three half-filled purple hexagons' },
    ],
    correctIndex: 3,
    difficultyWeight: 1.0,
    explanation: {
      tr: 'Üçünde iki altıgen var, birinde üç.',
      en: 'Three have two hexagons and one has three.',
    },
    visual: {
      layout: 'odd_one_out',
      cells: [],
      choices: [
        {
          glyphs: [
            { shape: 'hexagon', fill: 'half', tone: 'primary' },
            { shape: 'hexagon', fill: 'half', tone: 'primary' },
          ],
        },
        {
          glyphs: [
            { shape: 'hexagon', fill: 'half', tone: 'primary' },
            { shape: 'hexagon', fill: 'half', tone: 'primary' },
          ],
        },
        {
          glyphs: [
            { shape: 'hexagon', fill: 'half', tone: 'primary' },
            { shape: 'hexagon', fill: 'half', tone: 'primary' },
          ],
        },
        {
          glyphs: [
            { shape: 'hexagon', fill: 'half', tone: 'primary' },
            { shape: 'hexagon', fill: 'half', tone: 'primary' },
            { shape: 'hexagon', fill: 'half', tone: 'primary' },
          ],
        },
      ],
    },
  },
];

export const visualIqTest: ContentTest = {
  id: 'visual-iq',
  kind: 'iq',
  title: { tr: 'Görsel IQ Testi', en: 'Visual IQ Test' },
  description: {
    tr: 'Şekil örüntüleri, görsel analojiler ve ayrıştırma üzerine, tamamen görsel bir değerlendirme.',
    en: 'A fully visual assessment of shape patterns, visual analogies and discrimination.',
  },
  questionCount: 20,
  estMinutes: [8, 12],
  isPro: true,
  focus: 'visual',
  norm: { mean: 0.55, sd: 0.18 },
  questions: QUESTIONS,
};
