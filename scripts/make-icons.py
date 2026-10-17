#!/usr/bin/env python3
"""NeuroPeak marka varlıklarını üretir.

Tasarım: mor degrade zemin üzerinde beyaz bir zirve işareti ve
tepesinde kehribar bir düğüm. Zirve çizgisi açılış ekranındaki
işaretin aynısı — marka sürekliliği; tepedeki düğüm "neuro" tarafını
taşıyor ve ikonu başka yükseliş işaretlerinden ayırıyor.

Pillow'dan başka araç yok; kenarlar 4x çizilip küçültülerek
yumuşatılıyor.
"""

from __future__ import annotations

import pathlib

from PIL import Image, ImageDraw

OUT = pathlib.Path(__file__).resolve().parent.parent / 'apps/mobile/assets/images'

VIOLET_500 = (108, 59, 244)
VIOLET_600 = (84, 41, 214)
VIOLET_700 = (67, 33, 168)
AMBER = (245, 158, 11)
WHITE = (255, 255, 255)

SCALE = 4

# 1024'lük tuvalde zirve çizgisi ve tepedeki düğüm.
PEAK = [(176, 772), (512, 300), (848, 772)]
STROKE = 132
NODE_RADIUS = 88
# Düğüm zirvenin biraz üstünde: tam tepeye konunca beyaz uç
# tamamen kapanıyor ve işaret zirve gibi okunmuyor.
NODE_CENTER = (512, 236)


def lerp(a: tuple[int, int, int], b: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))  # type: ignore[return-value]


def gradient(size: int, top: tuple[int, int, int], bottom: tuple[int, int, int]) -> Image.Image:
    """Köşegen degrade; düz renge göre ekranda daha canlı duruyor."""
    image = Image.new('RGB', (size, size))
    draw = ImageDraw.Draw(image)
    for y in range(size):
        draw.line([(0, y), (size, y)], fill=lerp(top, bottom, y / max(1, size - 1)))
    return image


def _dot(draw: ImageDraw.ImageDraw, center: tuple[float, float], radius: float, colour) -> None:
    x, y = center
    draw.ellipse([x - radius, y - radius, x + radius, y + radius], fill=colour)


def draw_mark(
    draw: ImageDraw.ImageDraw,
    scale: float,
    offset: tuple[float, float] = (0, 0),
    node: bool = True,
) -> None:
    def point(p: tuple[int, int]) -> tuple[float, float]:
        return (p[0] * scale + offset[0], p[1] * scale + offset[1])

    width = round(STROKE * scale)
    points = [point(p) for p in PEAK]

    # `joint='curve'` köşeyi yuvarlıyor; uçlar için ayrıca daire
    # koyuluyor, yoksa çizgi düz kesilip sert duruyor.
    draw.line(points, fill=WHITE, width=width, joint='curve')
    # Uçlar ve tepe noktası daire ile kapatılıyor: `joint` köşeyi
    # yuvarlatmıyor, çizgi düz kesilip zirvede çentik bırakıyor.
    for corner in points:
        _dot(draw, corner, width / 2, WHITE)

    if node:
        _dot(draw, point(NODE_CENTER), NODE_RADIUS * scale, AMBER)


def mark_layer(big: int, node: bool = True) -> Image.Image:
    """İşareti kendi sınırlarına kırpılmış olarak döndürür."""
    layer = Image.new('RGBA', (big * 2, big * 2), (0, 0, 0, 0))
    draw_mark(ImageDraw.Draw(layer), big / 1024, (big * 0.5, big * 0.5), node=node)
    box = layer.getbbox()
    return layer if box is None else layer.crop(box)


def place(base: Image.Image, mark: Image.Image, padding: float) -> Image.Image:
    """İşareti, görünür sınırlarına göre ortalayarak yerleştirir.

    Ortalama çizim koordinatlarına göre değil kırpılmış görüntüye göre
    yapılıyor; zirve işaretinin ağırlık merkezi geometrik merkezinde
    değil ve elle hesaplanan boşluk ikonu hep bir yana kaydırıyordu.
    """
    size = base.size[0]
    inner = size * (1 - 2 * padding)
    ratio = min(inner / mark.size[0], inner / mark.size[1])
    resized = mark.resize((max(1, round(mark.size[0] * ratio)), max(1, round(mark.size[1] * ratio))), Image.LANCZOS)
    base.alpha_composite(
        resized,
        ((size - resized.size[0]) // 2, (size - resized.size[1]) // 2),
    )
    return base


def icon(size: int, with_background: bool, padding: float = 0.0, node: bool = True) -> Image.Image:
    """`padding`, işaretin kenarlardan ne kadar içeri çekileceği (oran)."""
    big = size * SCALE
    base = (
        gradient(big, VIOLET_500, VIOLET_700).convert('RGBA')
        if with_background
        else Image.new('RGBA', (big, big), (0, 0, 0, 0))
    )
    return place(base, mark_layer(big, node), padding).resize((size, size), Image.LANCZOS)


def monochrome(size: int) -> Image.Image:
    """Android tema ikonu: tek renk, sistem renklendirecek."""
    # Kehribar düğüm tek renkte kaybolacağı için hiç çizilmiyor.
    return icon(size, with_background=False, padding=0.26, node=False)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)

    # iOS / mağaza ikonu: kenarlardan %18 boşluk, köşe yuvarlatmayı sistem yapar.
    icon(1024, with_background=True, padding=0.16).convert('RGB').save(OUT / 'icon.png')

    # Android uyarlanabilir ikon: ön plan güvenli alana sığsın diye daha dar.
    icon(512, with_background=False, padding=0.24).save(OUT / 'android-icon-foreground.png')
    gradient(512, VIOLET_500, VIOLET_700).save(OUT / 'android-icon-background.png')
    monochrome(432).save(OUT / 'android-icon-monochrome.png')

    # Açılış ekranı: zeminini app.json veriyor, işaret saydam kalıyor.
    icon(512, with_background=False, padding=0.05).save(OUT / 'splash-icon.png')

    icon(48, with_background=True, padding=0.14).convert('RGB').save(OUT / 'favicon.png')

    print('Yazıldı:', ', '.join(sorted(p.name for p in OUT.glob('*.png'))))


if __name__ == '__main__':
    main()
