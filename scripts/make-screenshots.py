#!/usr/bin/env python3
"""App Store ekran görüntülerini üretir.

Girdi: `store/raw/<dil>/<ad>.png` — simülatörden alınmış ham ekranlar
(iPhone 17 Pro Max, 1320×2868; App Store'un 6.9" boyutu).
Çıktı: `store/screenshots/<dil>/` — başlık bandı eklenmiş hâlleri.

Ham ekranlar olduğu gibi duruyor; üzerine yazı ya da sahte veri
eklenmiyor. Cihazda ne görünüyorsa mağazada da o görünüyor; başlık
yalnızca çerçevenin üstünde duran ayrı bir bant.
"""

from __future__ import annotations

import pathlib

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
RAW = ROOT / 'store/raw'
OUT = ROOT / 'store/screenshots'
FONTS = ROOT / 'node_modules/@expo-google-fonts/inter'

WIDTH, HEIGHT = 1320, 2868

VIOLET_500 = (108, 59, 244)
VIOLET_700 = (67, 33, 168)
WHITE = (255, 255, 255)
MUTED = (210, 196, 252)

# Başlıklar: her ham ekranın karşılığı. İki dilde de aynı ekranlar.
CAPTIONS: dict[str, dict[str, tuple[str, str]]] = {
    'tr': {
        '01-home': ('Her gün 10 dakika', 'Günlük görevler, seri ve seviye'),
        '02-games': ('29 mini oyun', 'Hafıza, odak, mantık, matematik, hız'),
        '03-game': ('Zorluk seninle büyür', 'Her doğruda kural zorlaşır'),
        '04-progress': ('Beyin haritan', 'Beş eksende güncel performansın'),
        '05-league': ('Haftalık lig', 'Terfi et, zirvede kal'),
        '06-tests': ('IQ testleri', 'Detaylı rapor ve alt boyutlar'),
    },
    'en': {
        '01-home': ('Ten minutes a day', 'Daily tasks, streaks and levels'),
        '02-games': ('29 mini games', 'Memory, focus, logic, math, speed'),
        '03-game': ('It grows with you', 'Every correct answer raises the bar'),
        '04-progress': ('Your brain map', 'Current performance across five axes'),
        '05-league': ('Weekly league', 'Climb the table, stay on top'),
        '06-tests': ('IQ tests', 'Detailed reports and sub-dimensions'),
    },
}

TITLE_SIZE = 78
SUBTITLE_SIZE = 44
# Cihaz çerçevesinin tuval içindeki yeri.
DEVICE_WIDTH = 1020
DEVICE_TOP = 620
CORNER = 72


def font(weight: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONTS / weight / f'Inter_{weight}.ttf'), size)


def gradient(width: int, height: int) -> Image.Image:
    image = Image.new('RGB', (width, height))
    draw = ImageDraw.Draw(image)
    for y in range(height):
        ratio = y / max(1, height - 1)
        draw.line(
            [(0, y), (width, y)],
            fill=tuple(
                round(VIOLET_500[i] + (VIOLET_700[i] - VIOLET_500[i]) * ratio) for i in range(3)
            ),
        )
    return image


def rounded(image: Image.Image, radius: int) -> Image.Image:
    mask = Image.new('L', image.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, image.size[0], image.size[1]], radius, fill=255)
    out = image.convert('RGBA')
    out.putalpha(mask)
    return out


def centred(draw: ImageDraw.ImageDraw, text: str, y: int, f: ImageFont.FreeTypeFont, fill) -> None:
    box = draw.textbbox((0, 0), text, font=f)
    draw.text(((WIDTH - (box[2] - box[0])) / 2 - box[0], y), text, font=f, fill=fill)


def compose(raw: Image.Image, title: str, subtitle: str) -> Image.Image:
    canvas = gradient(WIDTH, HEIGHT).convert('RGBA')
    draw = ImageDraw.Draw(canvas)

    centred(draw, title, 190, font('700Bold', TITLE_SIZE), WHITE)
    centred(draw, subtitle, 320, font('500Medium', SUBTITLE_SIZE), MUTED)

    scale = DEVICE_WIDTH / raw.size[0]
    device = rounded(raw.resize((DEVICE_WIDTH, round(raw.size[1] * scale)), Image.LANCZOS), CORNER)

    # Gölge: çerçeveyi zeminden ayırıyor, yoksa ekran arka plana yapışıyor.
    shadow = Image.new('RGBA', canvas.size, (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle(
        [
            (WIDTH - DEVICE_WIDTH) // 2,
            DEVICE_TOP + 24,
            (WIDTH + DEVICE_WIDTH) // 2,
            DEVICE_TOP + device.size[1] + 24,
        ],
        CORNER,
        fill=(20, 8, 60, 150),
    )
    canvas.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(40)))
    canvas.alpha_composite(device, ((WIDTH - DEVICE_WIDTH) // 2, DEVICE_TOP))

    return canvas.convert('RGB')


def main() -> None:
    for language, captions in CAPTIONS.items():
        source = RAW / language
        target = OUT / language
        target.mkdir(parents=True, exist_ok=True)

        for name, (title, subtitle) in sorted(captions.items()):
            path = source / f'{name}.png'
            if not path.exists():
                print(f'atlandı (ham görüntü yok): {path}')
                continue

            raw = Image.open(path)
            if raw.size != (WIDTH, HEIGHT):
                # Yanlış cihazdan alınmış bir görüntü mağazada reddedilir;
                # sessizce ölçeklemek yerine durduruluyor.
                raise SystemExit(f'{path} boyutu {raw.size}, beklenen {(WIDTH, HEIGHT)}')

            compose(raw, title, subtitle).save(target / f'{name}.png')

        print(f'{language}: {len(list(target.glob("*.png")))} görsel yazıldı → {target}')


if __name__ == '__main__':
    main()
