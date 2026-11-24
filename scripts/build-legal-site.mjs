// `legal/` altındaki belgeleri GitHub Pages'in sunacağı statik siteye
// çevirir. Apple, gizlilik politikasının incelemeden önce herkese açık
// bir adresten erişilebilir olmasını şart koşuyor; adresler
// `apps/mobile/src/lib/links.ts` içinde yazılı.
//
// Bağlantılar göreli: site hem proje sayfasının alt yolunda
// (`/neuropeak/privacy`) hem de ileride bir alan adının kökünde
// (`/privacy`) aynı şekilde çalışsın diye.
//
//   node scripts/build-legal-site.mjs <çıktı-dizini>

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { marked } from 'marked';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Paletten alınan değerler; `packages/ui/src/tokens/palette.ts`. */
const COLOR = {
  violet500: '#6C3BF4',
  violet300: '#A88DF9',
  ink900: '#120E20',
  ink700: '#272047',
  ink300: '#A8A2C4',
  grey50: '#F6F5FB',
  grey200: '#DCD9E8',
  grey600: '#6F6A80',
  white: '#FFFFFF',
};

const SUPPORT_EMAIL = 'destek@neuropeak.app';

/**
 * Her belge iki dilde duruyor. `path` çıktıdaki klasör, `other` da aynı
 * belgenin öbür dildeki göreli adresi.
 */
const PAGES = [
  {
    source: 'legal/privacy-policy.tr.md',
    path: 'privacy',
    lang: 'tr',
    title: 'Gizlilik Politikası',
    other: { href: '../en/privacy/', label: 'English' },
  },
  {
    source: 'legal/terms-of-use.tr.md',
    path: 'terms',
    lang: 'tr',
    title: 'Kullanım Şartları',
    other: { href: '../en/terms/', label: 'English' },
  },
  {
    source: 'legal/privacy-policy.en.md',
    path: 'en/privacy',
    lang: 'en',
    title: 'Privacy Policy',
    other: { href: '../../privacy/', label: 'Türkçe' },
  },
  {
    source: 'legal/terms-of-use.en.md',
    path: 'en/terms',
    lang: 'en',
    title: 'Terms of Use',
    other: { href: '../../terms/', label: 'Türkçe' },
  },
];

const STYLE = `
  :root {
    color-scheme: light dark;
    --bg: ${COLOR.grey50};
    --surface: ${COLOR.white};
    --text: ${COLOR.ink900};
    --muted: ${COLOR.grey600};
    --line: ${COLOR.grey200};
    --accent: ${COLOR.violet500};
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --bg: ${COLOR.ink900};
      --surface: ${COLOR.ink700};
      --text: ${COLOR.white};
      --muted: ${COLOR.ink300};
      --line: ${COLOR.ink700};
      --accent: ${COLOR.violet300};
    }
  }

  * { box-sizing: border-box; }

  body {
    margin: 0;
    padding: 0 16px 64px;
    background: var(--bg);
    color: var(--text);
    font: 17px/1.65 -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
      'Helvetica Neue', Arial, sans-serif;
    -webkit-text-size-adjust: 100%;
  }

  .wrap { max-width: 68ch; margin: 0 auto; }

  header {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: baseline;
    justify-content: space-between;
    padding: 32px 0 24px;
    border-bottom: 1px solid var(--line);
  }

  .brand {
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--accent);
    text-decoration: none;
  }

  h1 { font-size: 32px; line-height: 1.2; margin: 32px 0 8px; }
  h2 { font-size: 22px; line-height: 1.3; margin: 40px 0 8px; }
  h3 { font-size: 18px; margin: 28px 0 8px; }

  a { color: var(--accent); }

  main :is(ul, ol) { padding-left: 1.3em; }
  main li { margin: 6px 0; }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    font-size: 15px;
  }
  th, td { border: 1px solid var(--line); padding: 8px 10px; text-align: left; }
  th { background: var(--surface); }

  code {
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: 4px;
    padding: 1px 5px;
    font-size: 0.9em;
  }

  footer {
    margin-top: 56px;
    padding-top: 20px;
    border-top: 1px solid var(--line);
    color: var(--muted);
    font-size: 15px;
  }

  @media (max-width: 480px) {
    h1 { font-size: 27px; }
  }
`;

/** Sayfa iskeleti; `body` zaten HTML. */
function layout({ lang, title, nav, body, footer }) {
  return `<!doctype html>
<html lang="${lang}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title} · NeuroPeak</title>
    <style>${STYLE}</style>
  </head>
  <body>
    <div class="wrap">
      <header>${nav}</header>
      <main>${body}</main>
      <footer>${footer}</footer>
    </div>
  </body>
</html>
`;
}

async function buildPage(page, outDir) {
  const markdown = await readFile(join(ROOT, page.source), 'utf8');
  const body = await marked.parse(markdown);

  const home = page.lang === 'tr' ? 'Belgeler' : 'Documents';
  const homeHref = page.path.startsWith('en/') ? '../../' : '../';

  const nav = [
    '<a class="brand" href="' + homeHref + '">NeuroPeak</a>',
    '<nav><a href="' + homeHref + '">' + home + '</a> · ',
    '<a href="' + page.other.href + '">' + page.other.label + '</a></nav>',
  ].join('');

  const footer =
    page.lang === 'tr'
      ? `Sorular için <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.`
      : `Questions: <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.`;

  const html = layout({ lang: page.lang, title: page.title, nav, body, footer });

  const dir = join(outDir, page.path);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'index.html'), html, 'utf8');
}

async function buildIndex(outDir) {
  const rows = PAGES.map(
    (p) => `<li><a href="${p.path}/">${p.title}</a> <span>(${p.lang})</span></li>`,
  ).join('\n        ');

  const body = `
      <h1>NeuroPeak</h1>
      <p>Gizlilik politikası ve kullanım şartları — privacy policy and terms of use.</p>
      <ul>
        ${rows}
      </ul>`;

  const html = layout({
    lang: 'tr',
    title: 'Belgeler',
    nav: '<a class="brand" href="./">NeuroPeak</a>',
    body,
    footer: `<a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>`,
  });

  await mkdir(outDir, { recursive: true });
  await writeFile(join(outDir, 'index.html'), html, 'utf8');
  // Jekyll kapalı: alt çizgiyle başlayan dosyalar olmasa da işlem
  // adımını atlamak yayını hızlandırıyor ve sürprizi engelliyor.
  await writeFile(join(outDir, '.nojekyll'), '', 'utf8');
}

const outDir = process.argv[2];

if (outDir === undefined) {
  console.error('Kullanım: node scripts/build-legal-site.mjs <çıktı-dizini>');
  process.exit(64);
}

for (const page of PAGES) {
  await buildPage(page, outDir);
}
await buildIndex(outDir);

console.error(`Yazıldı: ${PAGES.length + 1} sayfa → ${outDir}`);
