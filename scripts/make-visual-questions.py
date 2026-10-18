#!/usr/bin/env python3
"""Görsel IQ soru bankasının TypeScript literalini üretir.

Yazım yardımcısı, çalışma zamanı kodu değil: matrisler kuraldan
kuruluyor, cevap kuralın kendisi oluyor ve çeldiriciler cevabın tek
bir özelliğini bozarak türetiliyor. Dokuz hücreyi elle yazmak hem
uzun hem hataya açıktı.

Çıktı düz veri ve depoya giren dosya o literal
(`packages/content/src/tests/visual-iq.ts`) — betik değil. Soru
bankası ileride panelden düzenlenecek; bu betik yalnızca ilk yazımı
ve toplu bir değişikliği kolaylaştırıyor.

Üretilen bankayı `packages/content/src/content.test.ts` bağımsız
olarak yeniden denetliyor: betikteki bir hata testten geçmiyor.

    python3 -I scripts/make-visual-questions.py > /tmp/questions.ts
"""

from __future__ import annotations

import itertools

SHAPES = ['circle', 'square', 'triangle', 'diamond', 'star', 'hexagon']
FILLS = ['solid', 'outline', 'half']
TONES = ['primary', 'secondary', 'accent', 'muted']

SHAPE_TR = {
    'circle': 'daire', 'square': 'kare', 'triangle': 'üçgen',
    'diamond': 'baklava', 'star': 'yıldız', 'hexagon': 'altıgen',
}
SHAPE_EN = {
    'circle': 'circle', 'square': 'square', 'triangle': 'triangle',
    'diamond': 'diamond', 'star': 'star', 'hexagon': 'hexagon',
}
SHAPE_EN_PLURAL = {k: v + 's' for k, v in SHAPE_EN.items()}
FILL_TR = {'solid': 'dolu', 'outline': 'boş', 'half': 'yarım dolu'}
FILL_EN = {'solid': 'solid', 'outline': 'outlined', 'half': 'half-filled'}
TONE_TR = {'primary': 'mor', 'secondary': 'mavi', 'accent': 'turuncu', 'muted': 'gri'}
TONE_EN = {'primary': 'purple', 'secondary': 'blue', 'accent': 'orange', 'muted': 'grey'}
COUNT_TR = {1: 'bir', 2: 'iki', 3: 'üç'}
COUNT_EN = {1: 'one', 2: 'two', 3: 'three'}
ROT_TR = {0: '', 90: ', 90 derece dönük', 180: ', ters', 270: ', 270 derece dönük', 45: ', 45 derece dönük', 135: ', 135 derece dönük'}
ROT_EN = {0: '', 90: ', rotated 90°', 180: ', upside down', 270: ', rotated 270°', 45: ', rotated 45°', 135: ', rotated 135°'}


class Cell:
    def __init__(self, shape, count=1, fill='solid', tone='primary', rotation=0):
        self.shape, self.count, self.fill, self.tone, self.rotation = shape, count, fill, tone, rotation

    def key(self):
        return (self.shape, self.count, self.fill, self.tone, self.rotation)

    def __eq__(self, other):
        return isinstance(other, Cell) and self.key() == other.key()

    def __hash__(self):
        return hash(self.key())

    def ts(self, indent):
        pad = ' ' * indent
        glyph = f"{{ shape: '{self.shape}', fill: '{self.fill}', tone: '{self.tone}'"
        if self.rotation:
            glyph += f', rotation: {self.rotation}'
        glyph += ' }'
        if self.count == 1:
            return f'{pad}{{ glyphs: [{glyph}] }}'
        inner = (',\n' + pad + '    ').join([glyph] * self.count)
        return f'{pad}{{\n{pad}  glyphs: [\n{pad}    {inner},\n{pad}  ],\n{pad}}}'

    def label_tr(self):
        parts = [COUNT_TR[self.count], FILL_TR[self.fill], TONE_TR[self.tone], SHAPE_TR[self.shape]]
        text = ' '.join(parts) + ROT_TR[self.rotation]
        # Türkçede "i" harfinin büyüğü "İ"; capitalize() "Iki" üretiyor.
        head = 'İ' if text[0] == 'i' else text[0].upper()
        return head + text[1:]

    def label_en(self):
        noun = SHAPE_EN_PLURAL[self.shape] if self.count > 1 else SHAPE_EN[self.shape]
        parts = [COUNT_EN[self.count], FILL_EN[self.fill], TONE_EN[self.tone], noun]
        return (' '.join(parts) + ROT_EN[self.rotation]).capitalize()


def latin(values, row, column, offset=0):
    return values[(row + column + offset) % len(values)]


def distractors(answer, grid, wanted=3):
    """Cevabın tek bir özelliğini bozarak çeldirici üretir.

    Önce ızgarada geçen değerler denenir: oradan gelen bir çeldirici,
    hiç görülmemiş bir değerden daha inandırıcı.
    """
    seen = {'shape': [], 'count': [], 'fill': [], 'tone': [], 'rotation': []}
    for cell in grid:
        for attribute in seen:
            value = getattr(cell, attribute)
            if value not in seen[attribute]:
                seen[attribute].append(value)

    # Izgarada geçmeyen değerler yedek: ızgara tek bir özelliği
    # değiştiriyorsa oradan üç çeldirici çıkmıyor.
    pools = {
        'shape': SHAPES, 'count': [1, 2, 3], 'fill': FILLS,
        'tone': TONES, 'rotation': [0, 45, 90, 180],
    }

    out = []
    for source in (seen, pools):
        for attribute in ['shape', 'count', 'fill', 'tone', 'rotation']:
            for value in source[attribute]:
                if value == getattr(answer, attribute):
                    continue
                candidate = Cell(answer.shape, answer.count, answer.fill, answer.tone, answer.rotation)
                setattr(candidate, attribute, value)
                if candidate != answer and candidate not in out:
                    out.append(candidate)
                if len(out) == wanted:
                    return out
    raise SystemExit(f'yeterli çeldirici yok: {answer.key()}')


def check_rule(grid):
    """Tamamlanmış ızgarada en az bir özelliğin kuralı olmalı."""
    def rule(attribute):
        values = [[getattr(grid[r * 3 + c], attribute) for c in range(3)] for r in range(3)]
        columns = [[values[r][c] for r in range(3)] for c in range(3)]
        distinct = {v for row in values for v in row}
        if len(distinct) == 1:
            return 'constant'
        if all(len(set(row)) == 1 for row in values):
            return 'constant-in-row'
        if all(len(set(col)) == 1 for col in columns):
            return 'constant-in-column'
        if len(distinct) == 3 and all(len(set(row)) == 3 for row in values) and all(
            len(set(col)) == 3 for col in columns
        ):
            return 'latin'
        return 'none'

    found = {a: rule(a) for a in ['shape', 'count', 'fill', 'tone', 'rotation']}
    if all(v in ('none', 'constant') for v in found.values()):
        raise SystemExit(f'keşfedilebilir kural yok: {found}')
    return found


MATRICES = []


def signature(grid):
    def rule(attribute):
        values = [[getattr(grid[r * 3 + c], attribute) for c in range(3)] for r in range(3)]
        columns = [[values[r][c] for r in range(3)] for c in range(3)]
        distinct = {v for row in values for v in row}
        if len(distinct) == 1:
            return 'constant'
        if all(len(set(row)) == 1 for row in values):
            return 'constant-in-row'
        if all(len(set(col)) == 1 for col in columns):
            return 'constant-in-column'
        if len(distinct) == 3 and all(len(set(row)) == 3 for row in values) and all(
            len(set(col)) == 3 for col in columns
        ):
            return 'latin'
        return 'none'
    return {a: rule(a) for a in ['shape', 'count', 'fill', 'tone', 'rotation']}


def matrix(qid, builder, missing, weight, tr, en):
    grid = [builder(r, c) for r in range(3) for c in range(3)]
    rules = check_rule(grid)
    answer = grid[missing]
    expected = signature(grid)

    def breaks_rules(candidate):
        trial = list(grid)
        trial[missing] = candidate
        actual = signature(trial)
        return any(expected[a] != 'none' and actual[a] != expected[a] for a in expected)

    picked = [c for c in distractors(answer, grid, wanted=12) if breaks_rules(c)][:3]
    if len(picked) < 3:
        raise SystemExit(f'{qid}: kuralı bozan üç çeldirici bulunamadı')
    options = [answer] + picked
    # Şıkların sırası sabitlenmesin diye kimliğe göre karıştırılıyor.
    order = sorted(range(len(options)), key=lambda i: (hash((qid, i)) % 97, i))
    shuffled = [options[i] for i in order]
    MATRICES.append({
        'id': qid, 'grid': grid, 'missing': missing, 'choices': shuffled,
        'correct': shuffled.index(answer), 'weight': weight,
        'tr': tr, 'en': en, 'rules': rules,
    })


# --------------------------------------------------------------- kolay
matrix('vi-mx-1', lambda r, c: Cell(latin(['circle', 'square', 'triangle'], r, c)), 8, 0.7,
       'Her satırda ve her sütunda üç şekil birer kez geçiyor; boş hücreye kare gelir.',
       'Each row and column uses each shape once, so the empty cell is a square.')

matrix('vi-mx-2', lambda r, c: Cell('circle', count=r + 1), 8, 0.7,
       'Satır indikçe daire sayısı birer artıyor; son satırda üç daire olur.',
       'Each row adds one circle, so the bottom row has three.')

matrix('vi-mx-3', lambda r, c: Cell('square', tone=latin(['primary', 'secondary', 'accent'], r, c)), 4, 0.8,
       'Renk her satırda ve her sütunda birer kez dönüyor; ortadaki hücre turuncu olur.',
       'The colour cycles once per row and column, so the middle cell is orange.')

matrix('vi-mx-4', lambda r, c: Cell(latin(['circle', 'square', 'triangle'], r, c), count=c + 1), 8, 0.9,
       'Şekil satır ve sütunda birer kez geçiyor, sayı ise sütunla artıyor.',
       'The shape appears once per row and column; the count grows with the column.')

matrix('vi-mx-5', lambda r, c: Cell('triangle', fill=['solid', 'outline', 'half'][r]), 7, 0.8,
       'Her satırın dolgusu aynı: üstte dolu, ortada boş, altta yarım dolu.',
       'Each row shares a fill: solid, then outlined, then half-filled.')

# ---------------------------------------------------------------- orta
matrix('vi-mx-6', lambda r, c: Cell(latin(['circle', 'square', 'triangle'], r, c),
                                    fill=latin(['solid', 'outline', 'half'], r, c, 1)), 8, 1.1,
       'Hem şekil hem dolgu satır ve sütunda birer kez geçiyor.',
       'Both the shape and the fill appear once per row and column.')

matrix('vi-mx-7', lambda r, c: Cell(latin(['circle', 'square', 'triangle'], r, c), count=r + 1), 5, 1.0,
       'Şekil satır ve sütunda birer kez geçiyor, sayı satırla artıyor.',
       'The shape appears once per row and column; the count grows with the row.')

matrix('vi-mx-8', lambda r, c: Cell('triangle', rotation=[0, 90, 180][(r + c) % 3]), 8, 1.1,
       'Üçgen her adımda 90 derece dönüyor; satır ve sütunda üç açı birer kez geçiyor.',
       'The triangle turns 90° at each step; each angle appears once per row and column.')

matrix('vi-mx-9', lambda r, c: Cell(latin(['diamond', 'star', 'hexagon'], r, c),
                                    tone=latin(['primary', 'secondary', 'accent'], r, c, 2)), 8, 1.2,
       'Şekil ve renk ayrı ayrı dönüyor; ikisi de satır ve sütunda birer kez geçiyor.',
       'Shape and colour cycle independently, each once per row and column.')

matrix('vi-mx-10', lambda r, c: Cell('star', count=latin([1, 2, 3], r, c),
                                     fill=latin(['solid', 'outline', 'half'], r, c, 1)), 8, 1.2,
       'Yıldız sayısı ve dolgu ayrı ayrı dönüyor.',
       'The number of stars and the fill cycle independently.')

# ----------------------------------------------------------------- zor
matrix('vi-mx-11', lambda r, c: Cell(latin(['circle', 'square', 'hexagon'], r, c),
                                     fill=['solid', 'outline', 'half'][r],
                                     tone=['primary', 'secondary', 'accent'][c]), 8, 1.5,
       'Şekil satır ve sütunda birer kez geçiyor, dolgu satıra, renk sütuna bağlı.',
       'The shape appears once per row and column, the fill follows the row and the colour the column.')

matrix('vi-mx-12', lambda r, c: Cell('hexagon', count=r + 1,
                                     tone=latin(['primary', 'secondary', 'accent'], r, c),
                                     fill=['solid', 'outline', 'half'][c]), 8, 1.6,
       'Sayı satırla artıyor, dolgu sütuna bağlı, renk ise satır ve sütunda birer kez dönüyor.',
       'The count grows with the row, the fill follows the column and the colour cycles once per row and column.')


ANALOGIES = []


def analogy(qid, a, b, c, answer, weight, tr, en):
    options = [answer] + distractors(answer, [a, b, c, answer])
    order = sorted(range(len(options)), key=lambda i: (hash((qid, i)) % 89, i))
    shuffled = [options[i] for i in order]
    ANALOGIES.append({
        'id': qid, 'cells': [a, b, c], 'choices': shuffled,
        'correct': shuffled.index(answer), 'weight': weight, 'tr': tr, 'en': en,
    })


analogy('vi-an-1', Cell('circle'), Cell('circle', 2), Cell('square'), Cell('square', 2), 0.7,
        'Soldaki çift şekli ikiye çıkarıyor; aynısı kareye uygulanır.',
        'The first pair doubles the shape, so the square doubles too.')
analogy('vi-an-2', Cell('triangle'), Cell('triangle', fill='outline'), Cell('star'),
        Cell('star', fill='outline'), 0.8,
        'İlk çiftte dolu şekil boşalıyor; yıldız da boşalır.',
        'The first pair empties a solid shape, so the star is emptied too.')
analogy('vi-an-3', Cell('hexagon'), Cell('hexagon', rotation=90), Cell('triangle'),
        Cell('triangle', rotation=90), 0.9,
        'İlk çift şekli 90 derece döndürüyor.',
        'The first pair turns the shape 90°.')
analogy('vi-an-4', Cell('circle', 3), Cell('circle'), Cell('star', 3), Cell('star'), 0.8,
        'İlk çift üç şekli bire indiriyor.',
        'The first pair reduces three shapes to one.')
analogy('vi-an-5', Cell('diamond', tone='primary'), Cell('diamond', tone='accent'),
        Cell('hexagon', tone='primary'), Cell('hexagon', tone='accent'), 0.9,
        'İlk çift rengi mordan turuncuya çeviriyor.',
        'The first pair changes the colour from purple to orange.')
analogy('vi-an-6', Cell('square', fill='solid'), Cell('square', fill='half'),
        Cell('circle', fill='solid'), Cell('circle', fill='half'), 1.0,
        'İlk çift dolu şekli yarım dolduruyor.',
        'The first pair turns a solid shape into a half-filled one.')
analogy('vi-an-7', Cell('triangle'), Cell('triangle', 2, fill='outline'), Cell('hexagon'),
        Cell('hexagon', 2, fill='outline'), 1.2,
        'İlk çift hem sayıyı ikiye çıkarıyor hem şekli boşaltıyor; iki değişiklik birden.',
        'The first pair both doubles the count and empties the shape — two changes at once.')
analogy('vi-an-8', Cell('star', rotation=0), Cell('star', rotation=180), Cell('diamond', rotation=0),
        Cell('diamond', rotation=180), 1.0,
        'İlk çift şekli ters çeviriyor.',
        'The first pair flips the shape upside down.')
analogy('vi-an-9', Cell('circle', 2, tone='secondary'), Cell('circle', 3, tone='secondary'),
        Cell('square', 2, tone='muted'), Cell('square', 3, tone='muted'), 1.1,
        'İlk çift sayıyı bir artırıyor; renk değişmiyor.',
        'The first pair adds one to the count and leaves the colour alone.')
analogy('vi-an-10', Cell('hexagon', fill='outline', rotation=0),
        Cell('hexagon', fill='solid', rotation=90), Cell('star', fill='outline', rotation=0),
        Cell('star', fill='solid', rotation=90), 1.4,
        'İlk çift şekli hem dolduruyor hem 90 derece döndürüyor.',
        'The first pair both fills the shape and turns it 90°.')


ODD = []


def odd(qid, cells, odd_index, weight, tr, en):
    ODD.append({'id': qid, 'cells': cells, 'correct': odd_index, 'weight': weight, 'tr': tr, 'en': en})


odd('vi-oo-1', [Cell('circle'), Cell('circle'), Cell('square'), Cell('circle')], 2, 0.7,
    'Üçü daire, biri kare.', 'Three are circles and one is a square.')
odd('vi-oo-2', [Cell('star', fill='solid'), Cell('star', fill='solid'), Cell('star', fill='solid'),
                Cell('star', fill='outline')], 3, 0.8,
    'Üçü dolu, biri boş.', 'Three are solid and one is outlined.')
odd('vi-oo-3', [Cell('triangle', 2), Cell('triangle', 2), Cell('triangle', 3), Cell('triangle', 2)], 2, 0.8,
    'Üçünde iki üçgen var, birinde üç.', 'Three have two triangles and one has three.')
odd('vi-oo-4', [Cell('square', tone='primary'), Cell('square', tone='primary'),
                Cell('square', tone='primary'), Cell('square', tone='accent')], 3, 0.7,
    'Üçü mor, biri turuncu.', 'Three are purple and one is orange.')
odd('vi-oo-5', [Cell('triangle', rotation=0), Cell('triangle', rotation=0),
                Cell('triangle', rotation=180), Cell('triangle', rotation=0)], 2, 1.0,
    'Üçü yukarı bakıyor, biri ters duruyor.', 'Three point up and one is upside down.')
odd('vi-oo-6', [Cell('circle', 2, fill='outline'), Cell('square', 2, fill='outline'),
                Cell('star', 2, fill='solid'), Cell('hexagon', 2, fill='outline')], 2, 1.1,
    'Şekiller farklı ama üçü boş, biri dolu; ayırt eden şekil değil dolgu.',
    'The shapes differ, but three are outlined and one is solid — the fill is what sets it apart.')
odd('vi-oo-7', [Cell('triangle', 1, tone='secondary'), Cell('triangle', 3, tone='secondary'),
                Cell('triangle', 2, tone='secondary'), Cell('star', 2, tone='secondary')], 3, 1.2,
    'Sayılar farklı ama üçü üçgen, biri yıldız.',
    'The counts differ, but three are triangles and one is a star.')
odd('vi-oo-8', [Cell('hexagon', 2, fill='half'), Cell('hexagon', 2, fill='half'),
                Cell('hexagon', 2, fill='half'), Cell('hexagon', 3, fill='half')], 3, 1.0,
    'Üçünde iki altıgen var, birinde üç.', 'Three have two hexagons and one has three.')


def localized(tr, en, indent):
    pad = ' ' * indent
    return f"{pad}{{ tr: '{tr}', en: '{en}' }}"


def esc(text):
    return text.replace("'", "\\'")


def emit_question(kind, qid, prompt_tr, prompt_en, choices, correct, weight, expl_tr, expl_en,
                  layout, cells):
    lines = []
    lines.append('  {')
    lines.append(f"    id: '{qid}',")
    lines.append(f"    kind: '{kind}',")
    lines.append(f"    prompt: {{ tr: '{esc(prompt_tr)}', en: '{esc(prompt_en)}' }},")
    lines.append('    options: [')
    for cell in choices:
        lines.append(f"      {{ tr: '{esc(cell.label_tr())}', en: '{esc(cell.label_en())}' }},")
    lines.append('    ],')
    lines.append(f'    correctIndex: {correct},')
    lines.append(f'    difficultyWeight: {weight},')
    lines.append(f"    explanation: {{ tr: '{esc(expl_tr)}', en: '{esc(expl_en)}' }},")
    lines.append('    visual: {')
    lines.append(f"      layout: '{layout}',")
    lines.append('      cells: [')
    for cell in cells:
        lines.append(('        null,' if cell is None else cell.ts(8) + ','))
    lines.append('      ],')
    lines.append('      choices: [')
    for cell in choices:
        lines.append(cell.ts(8) + ',')
    lines.append('      ],')
    lines.append('    },')
    lines.append('  },')
    return '\n'.join(lines)


out = []
out.append('  // ------------------------------------------------------------- matris')
for m in MATRICES:
    cells = list(m['grid'])
    cells[m['missing']] = None
    out.append(emit_question(
        'matrix', m['id'], 'Boş hücreye hangisi gelir?', 'Which one completes the grid?',
        m['choices'], m['correct'], m['weight'], m['tr'], m['en'], 'matrix', cells))

out.append('')
out.append('  // ------------------------------------------------------------ analoji')
for a in ANALOGIES:
    out.append(emit_question(
        'shape_analogy', a['id'], 'İlişkiyi kur: soru işareti yerine hangisi gelir?',
        'Work out the relationship: which one replaces the question mark?',
        a['choices'], a['correct'], a['weight'], a['tr'], a['en'], 'analogy',
        a['cells'] + [None]))

out.append('')
out.append('  // -------------------------------------------------------- farklı olan')
for o in ODD:
    out.append(emit_question(
        'odd_one_out', o['id'], 'Hangisi diğerlerinden farklı?', 'Which one is different?',
        o['cells'], o['correct'], o['weight'], o['tr'], o['en'], 'odd_one_out', []))

print('\n'.join(out))
