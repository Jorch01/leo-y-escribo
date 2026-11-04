// Genera los PDF del cuaderno con Chromium (Playwright).
// Uso: node tools/build-pdf.mjs [carpeta_salida] [nombre] [nombre completo]
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const out = path.resolve(process.argv[2] || path.join(root, 'pdf'));
const nombre = process.argv[3] || '';
const completo = process.argv[4] || '';
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();
const errores = [];
page.on('console', m => { if (m.type() === 'error') errores.push(m.text()); });
page.on('pageerror', e => errores.push(e.message));

async function hacer(query, archivo) {
  const url = pathToFileURL(path.join(root, 'cuaderno.html')).href + '?' + new URLSearchParams(query).toString();
  await page.goto(url);
  await page.waitForFunction(() => document.body.dataset.listo === '1', null, { timeout: 30000 });
  // revisar que nada se salga de la hoja
  const desbordes = await page.evaluate(() => Array.from(document.querySelectorAll('.pagina')).map((p, i) => {
    const r = p.getBoundingClientRect(); let peor = 0;
    p.querySelectorAll('*').forEach(el => { const b = el.getBoundingClientRect(); if (b.height && b.bottom > r.bottom - 6) peor = Math.max(peor, b.bottom - (r.bottom - 6)); });
    return peor > 1 ? `hoja ${i + 1}: +${peor.toFixed(0)}px` : null;
  }).filter(Boolean));
  if (desbordes.length) console.log('  DESBORDE', archivo, desbordes.join(', '));
  const chicas = await page.evaluate(() => Array.from(document.querySelectorAll('.pagina')).map((p, i) => {
    const a = p.querySelector('.actividad'); if (!a) return null;
    const h = a.getBoundingClientRect().height; return h < 170 ? `hoja ${i + 1}: ${(h / 3.78).toFixed(0)}mm` : null;
  }).filter(Boolean));
  if (chicas.length) console.log('  ESPACIO CHICO', archivo, chicas.join(', '));
  await page.pdf({ path: path.join(out, archivo), format: 'Letter', printBackground: true, preferCSSPageSize: true });
  console.log('  ok', archivo);
}

const base = nombre ? { nombre, completo } : {};
await hacer({ ...base, guia: 'solo' }, 'guia-para-papas.pdf');
for (let n = 1; n <= 8; n++) await hacer({ ...base, semana: String(n) }, `nivel-${n}.pdf`);
await hacer({ ...base, semana: 'todo' }, 'cuaderno-completo.pdf');
await browser.close();
if (errores.length) { console.log('ERRORES:\n' + [...new Set(errores)].join('\n')); process.exitCode = 1; }
