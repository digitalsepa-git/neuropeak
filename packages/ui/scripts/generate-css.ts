/**
 * Tasarım token'larını admin panelinin Tailwind temasına çevirir.
 *
 *   npm run tokens:css   --workspace @neuropeak/ui   → tokens.css dosyasını yazar
 *   npm run tokens:check --workspace @neuropeak/ui   → güncel mi diye bakar (CI)
 *
 * Tek görsel kaynak packages/ui'dir; tokens.css elle düzenlenmez.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { categoryAccent, darkTheme, lightTheme, radius, shadow, spacing, textStyles } from '../src';

const OUTPUT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../apps/admin/src/app/tokens.css',
);

/** camelCase → kebab-case */
function kebab(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Tailwind yardımcı sınıfı adları. `text-text-secondary` yerine `text-fg-muted`
 * okunuyor; CSS değişkenlerinin kendisi tema anahtarlarıyla aynı kalır.
 */
const UTILITY_NAMES: Record<string, string> = {
  textPrimary: 'fg',
  textSecondary: 'fg-muted',
  textMuted: 'fg-subtle',
};

function utilityName(themeKey: string): string {
  return UTILITY_NAMES[themeKey] ?? kebab(themeKey);
}

/** Prettier CSS'te hex değerlerini küçük harfe çevirir; üretim de aynısını yapar. */
function themeVars(colors: Record<string, string>, indent: string): string {
  return Object.entries(colors)
    .map(([name, value]) => `${indent}--np-${kebab(name)}: ${value.toLowerCase()};`)
    .join('\n');
}

function build(): string {
  const colorAliases = Object.keys(lightTheme.colors)
    .map((name) => `  --color-${utilityName(name)}: var(--np-${kebab(name)});`)
    .join('\n');

  const accentAliases = Object.entries(categoryAccent)
    .map(([category, value]) => `  --color-accent-${kebab(category)}: ${value.toLowerCase()};`)
    .join('\n');

  const spacingAliases = Object.entries(spacing)
    .map(([name, value]) => `  --spacing-${kebab(name)}: ${value}px;`)
    .join('\n');

  const radiusAliases = Object.entries(radius)
    .map(([name, value]) => `  --radius-${kebab(name)}: ${value}px;`)
    .join('\n');

  const shadowAliases = Object.entries(shadow)
    .filter(([name]) => name !== 'none')
    .map(([name, token]) => `  --shadow-${kebab(name)}: ${token.css};`)
    .join('\n');

  const textAliases = Object.entries(textStyles)
    .flatMap(([name, style]) => [
      `  --text-${kebab(name)}: ${style.fontSize}px;`,
      `  --text-${kebab(name)}--line-height: ${style.lineHeight}px;`,
      `  --text-${kebab(name)}--letter-spacing: ${style.letterSpacing}px;`,
    ])
    .join('\n');

  return `/*
 * ÜRETİLEN DOSYA — elle düzenlemeyin.
 * Kaynak: packages/ui · Yeniden üretmek için: npm run tokens:css --workspace @neuropeak/ui
 */

:root {
${themeVars(lightTheme.colors, '  ')}
}

@media (prefers-color-scheme: dark) {
  :root {
${themeVars(darkTheme.colors, '    ')}
  }
}

@theme inline {
${colorAliases}

${accentAliases}

${spacingAliases}

${radiusAliases}

${shadowAliases}

${textAliases}

  --font-sans: var(--font-inter), system-ui, sans-serif;
}
`;
}

const generated = build();
const isCheck = process.argv.includes('--check');

if (isCheck) {
  let current: string | null = null;
  try {
    current = readFileSync(OUTPUT, 'utf8');
  } catch {
    current = null;
  }

  if (current !== generated) {
    console.error(
      'tokens.css güncel değil. `npm run tokens:css --workspace @neuropeak/ui` çalıştırıp sonucu commit edin.',
    );
    process.exit(1);
  }

  console.log('tokens.css güncel.');
} else {
  writeFileSync(OUTPUT, generated);
  console.log(`Yazıldı: ${OUTPUT}`);
}
