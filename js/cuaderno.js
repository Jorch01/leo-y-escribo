/*
 * Arma las hojas del cuaderno imprimible a partir de js/curriculum.js.
 * Parámetros de la URL:
 *   semana=1..8 | todo     qué nivel imprimir
 *   guia=1                 incluir la guía para papás al inicio (siempre en la semana 1)
 *   guia=solo              solo la guía
 *   nombre=...             nombre del niño (no se guarda en ningún lado)
 *   completo=...           nombre completo para el nivel 7 y el diploma
 */
(function () {
  'use strict';
  const C = window.CURRICULUM, G = window.Glyphs, M = window.Monsters, IMG = window.IMG;
  const Q = new URLSearchParams(location.search);
  const NOMBRE = (Q.get('nombre') || '').trim();
  const COMPLETO = (Q.get('completo') || '').trim() || NOMBRE;
  const N_CUENTO = NOMBRE || 'Beto';
  const ANCHO = 193.9; // mm útiles de la hoja carta
  const SITIO = C.SITE.replace(/^https?:\/\//, '').replace(/\/$/, '');

  // ---------------------------------------------------------------- utilidades
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const LINEA = window.DIBUJOS_LINEA || {};
  const uri = (h) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(LINEA[h] || '');
  function img(word, mode, cls) {
    const h = IMG[word];
    if (!h || !LINEA[h]) { console.error('Sin dibujo para: ' + word); return ''; }
    return `<img class="${cls || 'dibujo'}" src="${uri(h)}" alt="${esc(word)}">`;
  }
  const mon = (k, mode, o) => M.svg(k, Object.assign({ mode: mode || 'linea' }, o || {}));
  function monAt(k, x, y, w, h, mode) {
    return mon(k, mode).replace('<svg ', `<svg x="${x}" y="${y}" width="${w}" height="${h}" `);
  }
  function imgAt(word, x, y, w, h, mode) {
    const hx = IMG[word];
    if (!hx || !LINEA[hx]) { console.error('Sin dibujo para: ' + word); return ''; }
    return `<image href="${uri(hx)}" x="${x}" y="${y}" width="${w}" height="${h}"/>`;
  }
  const STAR = '<svg viewBox="0 0 24 24"><path d="M12 2.2l2.9 6.6 7.1.7-5.4 4.8 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.5l7.1-.7z" fill="none" stroke="#111" stroke-width="1.5" stroke-linejoin="round"/></svg>';
  const ROT = { '↑': 0, '→': 90, '↓': 180, '←': 270 };
  function arrowG(dir, x, y, s, color) {
    return `<g transform="translate(${x} ${y}) scale(${s / 24}) rotate(${ROT[dir]} 12 12)"><path d="M12 2 L21 12 L15.5 12 L15.5 22 L8.5 22 L8.5 12 L3 12 Z" fill="${color || '#111'}"/></g>`;
  }
  function rng(seed) {
    let a = seed >>> 0;
    return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function shuffle(arr, seed) {
    const r = rng(seed); const a = arr.slice();
    for (let k = 0; k < 6; k++) {
      for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
      if (a.some((v, i) => v !== arr[i])) break;
    }
    return a;
  }
  const conNombre = (s) => s.replace(/\{N\}/g, N_CUENTO);

  // ---------------------------------------------------------------- sílabas
  const VOC = 'aeiouáéíóúü', FUERTE = 'aeoáéóíú';
  const INSEP = ['pl', 'bl', 'cl', 'gl', 'fl', 'pr', 'br', 'tr', 'dr', 'cr', 'gr', 'fr'];
  function unidades(w) {
    const lw = w.toLowerCase(); const out = []; let i = 0;
    while (i < lw.length) {
      const two = lw.slice(i, i + 2);
      if (['ch', 'll', 'rr'].includes(two) || ((two === 'qu' || two === 'gu') && 'eiéí'.includes(lw[i + 2] || ''))) { out.push(w.slice(i, i + 2)); i += 2; continue; }
      out.push(w[i]); i++;
    }
    return out;
  }
  const esV = (u) => u.length === 1 && VOC.includes(u.toLowerCase());
  function silabear(w) {
    const u = unidades(w); const nuc = []; let i = 0;
    while (i < u.length) {
      if (esV(u[i])) {
        let j = i + 1;
        while (j < u.length && esV(u[j])) {
          if (FUERTE.includes(u[j - 1].toLowerCase()) && FUERTE.includes(u[j].toLowerCase())) break;
          j++;
        }
        nuc.push([i, j]); i = j;
      } else i++;
    }
    if (nuc.length <= 1) return [w];
    const cuts = [];
    for (let k = 1; k < nuc.length; k++) {
      const s = nuc[k - 1][1], e = nuc[k][0], n = e - s;
      if (n === 0) cuts.push(e);
      else if (n === 1) cuts.push(s);
      else if (n === 2) cuts.push(INSEP.includes((u[s] + u[s + 1]).toLowerCase()) ? s : s + 1);
      else cuts.push(INSEP.includes((u[e - 2] + u[e - 1]).toLowerCase()) ? e - 2 : e - 1);
    }
    const out = []; let prev = 0;
    cuts.forEach(c => { out.push(u.slice(prev, c).join('')); prev = c; });
    out.push(u.slice(prev).join(''));
    return out;
  }
  window.silabear = silabear;
  const silHTML = (w) => silabear(w).map((s, i) => `<span class="sil${i % 2 ? ' alt' : ''}">${esc(s)}</span>`).join('');

  // ---------------------------------------------------------------- textos por actividad
  function sonidoDe(letras) {
    return letras.filter(l => C.SONIDOS[l]).map(l => `la <b>${l}</b> suena ${C.SONIDOS[l]}`).join('; ');
  }
  function consDe(sil) { const m = sil.match(/^(ll|ch|rr|[^aeiouáéíóú]*)(.*)$/i); return [m[1], m[2]]; }

  // ---------------------------------------------------------------- piezas comunes
  function cabecera(w, sub) {
    return `<div class="cab"><div class="mini">${mon(w.jefe, 'color')}</div>
      <div class="nivel">Nivel ${w.n} · ${esc(w.titulo)}<small>${esc(sub)}</small></div>
      <div class="esp"></div>
      <div class="nombre">Nombre: ${NOMBRE ? `<b>${esc(NOMBRE)}</b>` : '<span class="raya"></span>'}</div>
      <div class="estrellas"><span>Misión<br>cumplida</span>${STAR}${STAR}${STAR}</div></div>`;
  }
  const pie = (izq) => `<div class="pie"><span>${esc(izq)}</span><span>Juegos en línea: ${SITIO}</span></div>`;
  const tituloMision = (cls, txt, quien, burbuja) => `<div class="mision-t"><span class="chip ${cls}">${txt}</span>${quien ? `<div style="width:9mm;height:11mm">${mon(quien, 'color')}</div>` : ''}<div class="burbuja">${burbuja || ''}</div></div>`;
  const papas = (html) => `<div class="papas"><b>Para usted:</b> ${html}</div>`;

  // ---------------------------------------------------------------- ESCRIBO
  function renglones(w, items) {
    const u = w.unidad, W = ANCHO / u;
    const cupo = 3;
    const prim = [], prac = [];
    const nLetras = items.filter(i => i.t === 'letra' || i.t === 'trazo').length;
    const cabe = (text, gap) => G.layout(text, gap).w <= W - 1.2;
    const partir = (text) => {
      if (cabe(text)) return [text];
      const ws = text.split(' '); let a = [], b = [];
      for (const x of ws) { if (cabe(a.concat(x).join(' '))) a.push(x); else b.push(x); }
      return [a.join(' '), b.join(' ')].filter(Boolean);
    };
    items.forEach(it => {
      if (it.t === 'letra' || it.t === 'trazo') {
        prim.push({ items: [{ text: it.g, mode: 'model' }], fill: { text: it.g, mode: 'dots' }, itemGap: 0.75 });
        prac.push({ fill: [{ text: it.g, mode: 'dots' }, { text: it.g, mode: 'start' }], itemGap: 0.75, g: it.g });
      } else if (it.t === 'continuo') {
        prim.push({ cont: it.c });
        prac.push({ cont: it.c, contMode: 'start' });
      } else if (it.t === 'palabras') {
        it.p.forEach(p => {
          prim.push({ items: [{ text: p, mode: 'solid' }], fill: { text: p, mode: 'dots' }, itemGap: 1.2 });
          prac.push({ fill: { text: p, mode: 'start' }, itemGap: 1.2 });
        });
      } else if (it.t === 'nombre') {
        if (NOMBRE && cabe(NOMBRE)) {
          prim.push({ fill: { text: NOMBRE, mode: 'dots' }, itemGap: 1.4, label: 'Mi nombre' });
          prac.push({ fill: { text: NOMBRE, mode: 'start' }, itemGap: 1.4 });
        } else prim.push({ blank: true, label: 'Mi nombre (escríbelo como puedas)' });
      } else if (it.t === 'nombreCompleto') {
        if (COMPLETO) partir(COMPLETO).forEach(t => { prim.push({ items: [{ text: t, mode: 'solid' }], letterGap: 0.28 }); prac.push({ items: [{ text: t, mode: 'dots' }], letterGap: 0.28 }); });
        else { prim.push({ blank: true, label: 'Mi nombre completo' }); prac.push({ blank: true }); }
      } else if (it.t === 'frase' || it.t === 'fraseNombre') {
        const f = it.t === 'frase' ? it.f : (NOMBRE ? `Mi nombre es ${NOMBRE}.` : 'Mi nombre es');
        partir(f).forEach(t => { prim.push({ items: [{ text: t, mode: 'dots' }], letterGap: 0.3 }); prac.push({ items: [{ text: t, mode: 'start' }], letterGap: 0.3 }); });
        if (it.t === 'fraseNombre' && !NOMBRE) prac.push({ blank: true });
      }
    });
    let rows = prim.slice(0, cupo);
    if (rows.length < cupo) {
      if (nLetras === 2 && prac.length === 2 && prac[0].g) {
        rows.push({ fill: [{ text: prac[0].g, mode: 'start' }, { text: prac[1].g, mode: 'start' }], itemGap: 0.9 });
      }
      let k = 0;
      while (rows.length < cupo && prac.length) { rows.push(prac[k % prac.length]); k++; }
    }
    const h = (3.16 * u).toFixed(2);
    return `<div class="renglones">${rows.map((r, i) => {
      const lab = r.label ? `<div style="font-size:10.5pt;margin-bottom:0.6mm;font-weight:700">${esc(r.label)}:</div>` : '';
      const svg = r.blank ? G.rowSVG({ W, key: i === 0 }) : G.rowSVG(Object.assign({ W, key: i === 0 }, r));
      return `<div>${lab}<div class="renglon" style="height:${h}mm">${svg}</div></div>`;
    }).join('')}</div>`;
  }
  function textoEscribo(day) {
    const t = day.escriboTip || '';
    return t + ' Empiecen en el <b>punto verde</b> y sigan la <b>flecha roja</b>. Que se detenga si se cansa: calidad antes que cantidad.';
  }

  // ---------------------------------------------------------------- ESPACIO
  function gridSVG(n, cell, ox, oy, opts) {
    opts = opts || {};
    let s = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
      s += `<rect x="${ox + c * cell}" y="${oy + r * cell}" width="${cell}" height="${cell}" fill="${(r + c) % 2 ? '#ffffff' : '#f3f6fa'}" stroke="#222" stroke-width="0.35"/>`;
    }
    return s;
  }
  function dotGrid(cols, rows, sp, ox, oy) {
    let s = '';
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) s += `<circle cx="${ox + c * sp}" cy="${oy + r * sp}" r="1" fill="#222"/>`;
    return s;
  }
  function figSVG(fig, sp, ox, oy, sw) {
    return fig.map(pl => {
      const zero = pl.length === 2 && Math.hypot(pl[0][0] - pl[1][0], pl[0][1] - pl[1][1]) < 0.1;
      if (zero) return `<circle cx="${ox + pl[0][0] * sp}" cy="${oy + pl[0][1] * sp}" r="${sw * 0.9}" fill="#111"/>`;
      return `<polyline points="${pl.map(p => `${ox + p[0] * sp},${oy + p[1] * sp}`).join(' ')}" fill="none" stroke="#111" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;
    }).join('');
  }
  function mover(p, d) { const q = p.slice(); if (d === '→') q[0]++; if (d === '←') q[0]--; if (d === '↓') q[1]++; if (d === '↑') q[1]--; return q; }
  function cajasFlechas(pasos, x, y, s, gap, perRow) {
    let o = '';
    pasos.forEach((d, i) => {
      const cx = x + (i % perRow) * (s + gap), cy = y + Math.floor(i / perRow) * (s + gap);
      o += `<rect x="${cx}" y="${cy}" width="${s}" height="${s}" rx="2" fill="#fff" stroke="#111" stroke-width="0.5"/>`;
      if (d) o += arrowG(d, cx + s * 0.15, cy + s * 0.15, s * 0.7, '#1d5fa8');
    });
    return o;
  }
  // mano vista desde arriba (apoyada en la mesa). der=true -> pulgar a la izquierda
  function manoSVG(x, y, s, der) {
    const tr = der ? `translate(${x} ${y}) scale(${s})` : `translate(${x + 60 * s} ${y}) scale(${-s} ${s})`;
    return `<g transform="${tr}" fill="#fff" stroke="#111" stroke-width="${1.6 / s * 0.5}" stroke-linejoin="round">
      <rect x="22" y="2" width="9" height="34" rx="4.5"/><rect x="32" y="0" width="9" height="36" rx="4.5"/>
      <rect x="42" y="4" width="8.5" height="32" rx="4.2"/><rect x="51" y="12" width="7.5" height="26" rx="3.7"/>
      <path d="M22 30 C8 22 2 30 6 36 C10 42 16 46 20 54 L22 30 Z"/>
      <path d="M20 30 L59 30 L58 58 C56 72 44 78 36 78 C26 78 20 70 20 58 Z"/></g>`;
  }

  function espacio(e, w, d) {
    const H = 80, Wd = 194;
    const svg = (inner, vw, vh) => `<svg class="llena" viewBox="0 0 ${vw || Wd} ${vh || H}" preserveAspectRatio="xMidYMid meet">${inner}</svg>`;
    switch (e.t) {
      case 'dibujaDonde': {
        const lis = e.ins.map(([o, t]) => `<li><span class="cb"></span>${img(o)}<span>Dibuja ${o === 'árbol' ? 'un' : (['flor', 'nube', 'casa'].includes(o) ? 'una' : 'un')} <b>${esc(o)}</b> ${esc(t).replace(/(ARRIBA|ABAJO|IZQUIERDA|DERECHA)/g, '<b>$1</b>')}.</span></li>`).join('');
        return { kid: 'Escucha y dibuja cada cosa en su lugar.', parent: 'Lea una instrucción a la vez y señale la palabra clave (ARRIBA, ABAJO...). Que marque la casilla cuando termine cada una.', html: `<div class="dd${e.ins.length > 3 ? ' muchas' : ''}"><div class="lienzo">${img(e.centro)}</div><ol>${lis}</ol></div>` };
      }
      case 'colorea': {
        const scenes = e.esc.map(sc => {
          const [mode, ...ms] = sc;
          if (mode === 'v') return `<div class="esc">${svg(monAt(ms[0], 2, 0, 36, 40) + monAt(ms[1], 2, 42, 36, 40), 40, 82)}</div>`;
          if (mode === 'h') return `<div class="esc">${svg(monAt(ms[0], 0, 2, 38, 44) + monAt(ms[1], 42, 2, 38, 44), 80, 48)}</div>`;
          return `<div class="esc">${svg(ms.map((m, i) => monAt(m, i * 42, 0, 40, 46)).join(''), 168, 48)}</div>`;
        }).join('');
        const cols = e.esc[0][0] === 'fila' ? 1 : e.esc.length;
        return { kid: e.ins.replace(/(ARRIBA|ABAJO|IZQUIERDA|DERECHA|PRIMERO|ÚLTIMO)/g, '<b>$1</b>'), parent: 'Lea la instrucción y pregunte "¿cómo sabes?". Si duda con izquierda y derecha, que mire su pulsera.', html: `<div class="esc-grid" style="grid-template-columns:repeat(${cols},1fr);grid-template-rows:repeat(${cols === 1 ? e.esc.length : 1},minmax(0,1fr))">${scenes}</div>` };
      }
      case 'escalera': {
        let s = '';
        e.pasos.forEach((seq, k) => {
          const ox = k * 100 + 8, cell = 10.5, cells = 7;
          for (let i = 0; i < cells; i++) s += `<rect x="${ox}" y="${2 + i * cell}" width="20" height="${cell}" fill="${i % 2 ? '#fff' : '#f3f6fa'}" stroke="#111" stroke-width="0.4"/>`;
          s += `<line x1="${ox}" y1="2" x2="${ox}" y2="${2 + cells * cell}" stroke="#111" stroke-width="1.2"/><line x1="${ox + 20}" y1="2" x2="${ox + 20}" y2="${2 + cells * cell}" stroke="#111" stroke-width="1.2"/>`;
          s += monAt(['pasti', 'nubo'][k], ox + 21, 2 + (cells - 1) * cell - 4, 13, 16, 'color');
          s += `<text x="${ox + 40}" y="14" font-family="Fredoka" font-size="6.5" font-weight="600">Código:</text>`;
          s += cajasFlechas(seq, ox + 40, 18, 11, 2.5, 4);
        });
        return { kid: 'Empieza abajo con el monstruo. Sube o baja un escalón por cada flecha. Dibuja una ⭐ donde termina.', parent: 'Que ponga su dedo en el monstruo y mueva un escalón por flecha, diciendo en voz alta "arriba" o "abajo".', html: svg(s) };
      }
      case 'carril': {
        let s = '';
        e.pasos.forEach((seq, k) => {
          const oy = k * 40 + 4, cell = 13, cells = 9, ox = 4;
          for (let i = 0; i < cells; i++) s += `<rect x="${ox + i * cell}" y="${oy + 14}" width="${cell}" height="${cell}" fill="${i % 2 ? '#fff' : '#f3f6fa'}" stroke="#111" stroke-width="0.5"/>`;
          s += monAt(['topi', 'chispa'][k], ox + 4 * cell + 0.5, oy - 1, 12, 15, 'color');
          s += cajasFlechas(seq, ox + cells * cell + 8, oy + 13, 12, 2.5, 5);
        });
        return { kid: 'El monstruo camina por la calle. Muévelo una casilla por flecha. Dibuja una ⭐ donde termina.', parent: 'Antes de empezar: "¿hacia dónde apunta esta flecha? ¿hacia la mano de la pulsera?".', html: svg(s) };
      }
      case 'caminos': {
        let s = '';
        e.tipos.forEach((tipo, k) => {
          const y0 = k * 26 + 13, x0 = 30, x1 = 164;
          const pts = [];
          for (let i = 0; i <= 120; i++) {
            const t = i / 120, x = x0 + (x1 - x0) * t;
            let y = y0;
            if (tipo === 'olas') y = y0 - 6 * Math.sin(t * Math.PI * 6);
            if (tipo === 'picos') { const ph = (t * 6) % 1; y = y0 + 6 - 12 * (ph < 0.5 ? ph * 2 : 2 - ph * 2); }
            if (tipo === 'montes') { const ph = (t * 5) % 1; y = y0 + 6 - 12 * Math.sin(ph * Math.PI); }
            if (tipo === 'escalones') { const ph = Math.floor(t * 8); y = y0 + (ph % 2 ? -5 : 5); }
            pts.push([x, y]);
          }
          if (tipo === 'escalones') {
            const q = []; let last = null;
            pts.forEach(p => { if (last && Math.abs(last[1] - p[1]) > 1) q.push([p[0], last[1]]); q.push(p); last = p; });
            pts.length = 0; q.forEach(p => pts.push(p));
          }
          s += monAt(e.de[k], 2, y0 - 12, 22, 24, 'linea');
          s += imgAt(e.a[k], 168, y0 - 11, 22, 22);
          s += `<polyline points="${pts.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="0 3.4"/>`;
          s += `<circle cx="${x0}" cy="${pts[0][1]}" r="2.3" fill="#1b7f3b"/>`;
        });
        return { kid: 'Lleva a cada monstruo a su comida. ¡De izquierda a derecha, sin levantar el lápiz!', parent: 'Que empiece en el punto verde y vaya despacio por encima de los puntitos. Al final, que coloree a los monstruos.', html: svg(s) };
      }
      case 'flechas': case 'flechasInversa': case 'dictado': {
        const n = e.n, cell = Math.min(76 / n, 14), gs = cell * n, ox = 4, oy = (H - gs) / 2;
        let s = gridSVG(n, cell, ox, oy);
        const at = (p) => [ox + p[0] * cell, oy + p[1] * cell];
        const [sx, sy] = at(e.inicio);
        s += monAt(e.t === 'dictado' ? 'trueno' : 'bombo', sx + cell * 0.08, sy, cell * 0.84, cell, 'color');
        let kid, parent, extra = '';
        const tx = ox + gs + 10;
        if (e.t === 'flechas') {
          const pasos = Array.from(e.pasos);
          let p = e.inicio.slice(); pasos.forEach(d => { p = mover(p, d); });
          const [mx, my] = at(p);
          s += imgAt(e.meta, mx + cell * 0.12, my + cell * 0.12, cell * 0.76, cell * 0.76);
          s += `<text x="${tx}" y="${oy + 6}" font-family="Fredoka" font-size="7" font-weight="600">Código secreto:</text>`;
          s += cajasFlechas(pasos, tx, oy + 11, 13, 3, 6);
          kid = 'Sigue el código secreto, una casilla por flecha. Dibuja el camino hasta la comida.';
          parent = 'Que diga cada flecha en voz alta ("derecha", "abajo") mientras mueve el dedo, y luego dibuje el camino con color.';
        } else if (e.t === 'flechasInversa') {
          const [mx, my] = at(e.meta);
          s += imgAt(e.comida, mx + cell * 0.12, my + cell * 0.12, cell * 0.76, cell * 0.76);
          const pasosN = Math.abs(e.meta[0] - e.inicio[0]) + Math.abs(e.meta[1] - e.inicio[1]);
          s += `<text x="${tx}" y="${oy + 6}" font-family="Fredoka" font-size="7" font-weight="600">Escribe el código:</text>`;
          s += cajasFlechas(new Array(pasosN + 2).fill(null), tx, oy + 11, 13, 3, 6);
          kid = 'Ahora tú inventas el código. Dibuja una flecha en cada cuadro para llevar al monstruo a su premio.';
          parent = 'Primero que trace el camino con el dedo; luego que dibuje las flechas. Sobran cuadros a propósito: no tiene que llenarlos todos.';
        } else {
          s += `<text x="${tx}" y="${oy + 10}" font-family="Fredoka" font-size="7.5" font-weight="600">Escucha a papá o mamá</text><text x="${tx}" y="${oy + 20}" font-family="Fredoka" font-size="7.5" font-weight="500">y dibuja la línea.</text><text x="${tx}" y="${oy + 36}" font-family="Fredoka" font-size="7.5" font-weight="500">¿Qué forma salió?</text>`;
          s += `<rect x="${tx}" y="${oy + 42}" width="70" height="26" rx="3" fill="#fff" stroke="#111" stroke-width="0.5" stroke-dasharray="2 1.5"/>`;
          kid = 'Dictado de flechas: escucha y dibuja la línea casilla por casilla.';
          parent = `Dicte despacio, una flecha a la vez, empezando en el monstruo: <b>${esc(e.dicta)}</b>. Debe salir ${esc(e.forma || 'una figura')}.`;
        }
        return { kid, parent, html: svg(s) };
      }
      case 'copia': case 'simetria': {
        let s = '';
        if (e.t === 'copia') {
          const n = e.n, sp = Math.min(68 / (n - 1), 15), w1 = sp * (n - 1), oy = (H - w1) / 2;
          const ox1 = 12, ox2 = Wd - 12 - w1;
          s += dotGrid(n, n, sp, ox1, oy) + dotGrid(n, n, sp, ox2, oy);
          s += figSVG(e.fig, sp, ox1, oy, 1.6);
          const p0 = e.fig[0][0];
          s += `<circle cx="${ox1 + p0[0] * sp}" cy="${oy + p0[1] * sp}" r="2.2" fill="#1b7f3b"/><circle cx="${ox2 + p0[0] * sp}" cy="${oy + p0[1] * sp}" r="2.2" fill="#1b7f3b"/>`;
          s += arrowG('→', Wd / 2 - 8, H / 2 - 8, 16, '#b83a0c');
          return { kid: 'Copia el dibujo en la otra cuadrícula, igualito. Empieza en el punto verde.', parent: 'Que cuente los puntos antes de cada línea: "dos puntos a la derecha, uno abajo". Esto entrena el tamaño de las letras.', html: svg(s) };
        }
        const cols = 7, rows = 7, sp = 10.5, w1 = sp * (cols - 1), oy = (H - sp * (rows - 1)) / 2, ox = (Wd - w1) / 2;
        s += dotGrid(cols, rows, sp, ox, oy);
        s += `<line x1="${ox + 3 * sp}" y1="${oy - 4}" x2="${ox + 3 * sp}" y2="${oy + sp * (rows - 1) + 4}" stroke="#b83a0c" stroke-width="0.9" stroke-dasharray="3 2"/>`;
        s += figSVG(e.fig, sp, ox, oy, 1.6);
        s += monAt('espejo', 8, 18, 34, 42, 'color') + monAt('espejo', Wd - 42, 18, 34, 42, 'color').replace('<g>', '<g transform="translate(120 0) scale(-1 1)">');
        return { kid: 'El monstruo Espejo dibujó solo la mitad. Completa el otro lado igualito, como en un espejo.', parent: 'Que cuente cuántos puntos está cada esquina de la línea roja y repita la misma distancia del otro lado.', html: svg(s) };
      }
      case 'busca': case 'clasifica': {
        const r = rng(w.n * 100 + d * 7 + (e.letra || 'x').charCodeAt(0));
        const pool = e.t === 'busca' ? [e.letra, e.otra] : e.letras;
        const cols = 9, rows = 3, cellW = 17, cellH = 22, ox = e.t === 'busca' ? 40 : 34, oy = 6;
        let s = '';
        let count = 0;
        for (let i = 0; i < cols * rows; i++) {
          let ch;
          if (e.t === 'busca') { ch = r() < 0.42 ? e.letra : e.otra; if (ch === e.letra) count++; }
          else ch = pool[Math.floor(r() * pool.length)];
          const x = ox + (i % cols) * cellW + cellW / 2, y = oy + Math.floor(i / cols) * cellH + 17;
          s += `<text x="${x}" y="${y}" font-family="Andika" font-size="20" text-anchor="middle" fill="#111">${ch}</text>`;
        }
        let kid, parent;
        if (e.t === 'busca') {
          s += `<rect x="2" y="12" width="32" height="44" rx="4" fill="#fff" stroke="#5b2fa8" stroke-width="1.2"/><text x="18" y="46" font-family="Andika" font-size="34" text-anchor="middle" font-weight="700">${e.letra}</text>`;
          kid = `Encierra todas las <b>${e.letra}</b>. ¡Espejo puso ${e.otra} para engañarte!`;
          parent = `Recuerde el truco: ${e.letra === 'b' || e.letra === 'd' ? 'la b empieza con el bastón, la d empieza con la bolita' : 'la p tiene la panza a la derecha, la q a la izquierda'}. Hay ${count} para encontrar.`;
        } else {
          const cols4 = [['b', 'AZUL', '#1d5fa8'], ['d', 'ROJO', '#c62828'], ['p', 'VERDE', '#2e7d32'], ['q', 'AMARILLO', '#f9a825']];
          cols4.forEach(([l, n, c], i) => { s += `<rect x="2" y="${4 + i * 18}" width="9" height="9" rx="2" fill="${c}" stroke="#111" stroke-width="0.4"/><text x="13" y="${12 + i * 18}" font-family="Andika" font-size="10" font-weight="700">${l}</text><text x="13" y="${18 + i * 18}" font-family="Andika" font-size="4.2">${n}</text>`; });
          kid = 'Colorea cada letra con su color: b azul, d rojo, p verde, q amarillo.';
          parent = 'Que diga el sonido de cada letra antes de colorearla. Si se equivoca, pregunte "¿dónde tiene la panza?".';
        }
        return { kid, parent, html: svg(s) };
      }
      case 'manos': {
        let s = manoSVG(18, 4, 0.9, false) + manoSVG(Wd - 18 - 54, 4, 0.9, true);
        s += `<text x="45" y="78" font-family="Fredoka" font-size="7" font-weight="600" text-anchor="middle">IZQUIERDA</text><text x="${Wd - 45}" y="78" font-family="Fredoka" font-size="7" font-weight="600" text-anchor="middle">DERECHA</text>`;
        s += `<text x="${Wd / 2}" y="30" font-family="Fredoka" font-size="6" text-anchor="middle">Pon tus manos</text><text x="${Wd / 2}" y="38" font-family="Fredoka" font-size="6" text-anchor="middle">encima de las manos</text><text x="${Wd / 2}" y="46" font-family="Fredoka" font-size="6" text-anchor="middle">del dibujo.</text>`;
        return { kid: 'Colorea la mano <b>DERECHA</b> y dibújale una pulsera. A la <b>IZQUIERDA</b> dibújale un anillo.', parent: 'Que apoye sus manos sobre los dibujos (palmas hacia abajo) para descubrir cuál es cuál. La derecha es la de la pulsera.', html: svg(s) };
      }
      case 'dibujaMonstruo': {
        const lis = e.ins.map(t => `<li><span class="cb"></span><span>${esc(t).replace(/(ARRIBA|ABAJO|IZQUIERDA|DERECHA)/g, '<b>$1</b>')}</span></li>`).join('');
        const cuerpo = `<svg viewBox="0 0 120 130" style="height:96%;width:auto;max-height:62mm"><path d="M60 22 C92 20 104 50 102 74 C100 98 82 108 60 108 C38 108 18 98 18 74 C18 48 30 24 60 22 Z" fill="#fff" stroke="#111" stroke-width="2.4"/></svg>`;
        return { kid: '¡Inventa tu propio monstruo! Escucha dónde va cada parte.', parent: 'Lea una instrucción a la vez. Cuando termine, que le ponga nombre y lo coloree. ¡Su primer personaje!', html: `<div class="dd"><div class="lienzo">${cuerpo}</div><ol>${lis}</ol></div>` };
      }
      case 'tamano': {
        const sets = [['pasti', 'pasti'], ['nubo', 'nubo'], ['topi', 'topi'], ['bombo', 'bombo']];
        const scenes = sets.map((ms, i) => {
          const big = i % 2 === 0;
          return `<div class="esc">${svg(big ? monAt(ms[0], 0, 4, 34, 40) + monAt(ms[1], 34, 24, 16, 20) : monAt(ms[0], 0, 24, 16, 20) + monAt(ms[1], 16, 4, 34, 40), 52, 48)}</div>`;
        }).join('');
        return { kid: 'Colorea el monstruo <b>GRANDE</b>. Encierra el <b>pequeño</b>.', parent: 'Relacione con las letras: las mayúsculas son grandes (tocan el cielo) y las minúsculas pequeñas.', html: `<div class="esc-grid" style="grid-template-columns:repeat(4,1fr)">${scenes}</div>` };
      }
      case 'une': {
        const der = shuffle(e.der, w.n * 31 + d);
        const rows = e.izq.map((a, i) => `<div class="izq" style="font-size:10mm">${a}<span class="pt"></span></div><div></div><div class="der" style="font-size:10mm"><span class="pt"></span>${der[i]}</div>`).join('');
        return { kid: 'Une cada letra GRANDE con su letra pequeña.', parent: 'Que diga el sonido de la letra antes de unirla. Si quiere, que use un color distinto para cada línea.', html: `<div class="une" style="grid-template-columns:1fr 60mm 1fr;align-content:center;row-gap:0.5mm">${rows}</div>` };
      }
      case 'patron': {
        const forma = { pasti: 'c', nubo: 's', topi: 't' };
        const n = e.seq.length, cw = 19.5;
        let s = '';
        e.seq.forEach((k, i) => {
          const x = 4 + i * (cw + 1.5), y = 22;
          if (!k) { s += `<rect x="${x}" y="${y}" width="${cw}" height="${cw}" rx="2.5" fill="#fff" stroke="#111" stroke-width="0.6" stroke-dasharray="2 1.6"/>`; return; }
          const f = forma[k], cx = x + cw / 2, cy = y + cw / 2;
          if (f === 'c') s += `<circle cx="${cx}" cy="${cy}" r="8" fill="#fff" stroke="#111" stroke-width="1.2"/>`;
          if (f === 's') s += `<rect x="${cx - 7.5}" y="${cy - 7.5}" width="15" height="15" rx="1.5" fill="#fff" stroke="#111" stroke-width="1.2"/>`;
          if (f === 't') s += `<path d="M${cx} ${cy - 8.5} L${cx + 8.5} ${cy + 7} L${cx - 8.5} ${cy + 7} Z" fill="#fff" stroke="#111" stroke-width="1.2" stroke-linejoin="round"/>`;
          s += `<circle cx="${cx - 2.6}" cy="${cy + 0.5}" r="1.6" fill="#111"/><circle cx="${cx + 2.6}" cy="${cy + 0.5}" r="1.6" fill="#111"/>`;
        });
        s += `<text x="${4 + (n - 3) * (cw + 1.5)}" y="16" font-family="Fredoka" font-size="6.5" font-weight="600">¿Qué sigue?</text>`;
        return { kid: 'Mira el patrón de izquierda a derecha. Dibuja los monstruos que siguen.', parent: 'Que "lea" el patrón en voz alta (bolita, cuadro, triángulo...) antes de dibujar. Es la misma habilidad que leer de izquierda a derecha.', html: svg(s, Wd, 64) };
      }
      case 'secuencia': {
        let s = '';
        e.items.forEach((set, k) => {
          const sh = shuffle(set, w.n * 17 + k + d);
          sh.forEach((it, i) => {
            const x = 10 + i * 62, y = k * 40 + 2;
            s += `<rect x="${x}" y="${y}" width="54" height="36" rx="3" fill="#fff" stroke="#111" stroke-width="0.5"/>`;
            s += imgAt(it, x + 4, y + 4, 28, 28);
            s += `<circle cx="${x + 44}" cy="${y + 18}" r="7" fill="#fff" stroke="#111" stroke-width="0.6" stroke-dasharray="1.6 1.2"/>`;
          });
        });
        return { kid: '¿Qué pasó primero, después y al final? Escribe 1, 2 y 3 en los círculos.', parent: 'Si aún no escribe números, que dibuje 1, 2 o 3 puntitos. Pídale que cuente la historia en orden.', html: svg(s) };
      }
      case 'ordena': {
        const filas = e.frases.map(f => `<div style="display:flex;gap:4mm;align-items:center;justify-content:center">${f.map(p => `<div class="tarjeta" style="flex-direction:row;padding:2mm 4mm;gap:3mm"><span style="font-size:10mm;line-height:1.1">${esc(p)}</span><span style="width:9mm;height:9mm;border:0.5mm dashed #555;border-radius:50%"></span></div>`).join('')}</div>`).join('');
        return { kid: 'Rugido desordenó las frases. Escribe 1, 2, 3... para ponerlas en orden y léelas.', parent: 'Pista: la primera palabra empieza con mayúscula y la última tiene punto.', html: `<div style="display:flex;flex-direction:column;justify-content:center;gap:6mm;height:100%">${filas}</div>` };
      }
      case 'mapa': {
        const n = 6, rowsN = 5, cell = 14.5, ox = 4, oy = 4;
        let s = '';
        for (let r = 0; r < rowsN; r++) for (let c = 0; c < n; c++) s += `<rect x="${ox + c * cell}" y="${oy + r * cell}" width="${cell}" height="${cell}" fill="${(r + c) % 2 ? '#fff' : '#f3f6fa'}" stroke="#222" stroke-width="0.35"/>`;
        const put = (wd, c, r) => imgAt(wd, ox + c * cell + 1.5, oy + r * cell + 1.5, cell - 3, cell - 3);
        s += monAt('mega', ox + 0 * cell + 1, oy + 4 * cell, cell - 2, cell, 'color');
        s += put('tesoro', 3, 2) + put('árbol', 1, 2) + put('volcan', 5, 0) + put('castillo', 4, 4) + put('cohete', 0, 0) + put('casa', 2, 0);
        const tx = ox + n * cell + 8;
        const ins = ['1. Empieza en el Megamonstruo.', '2. Camina 3 casillas a la DERECHA.', '3. Sube 2 casillas hacia ARRIBA.', '¿Qué encontraste? Enciérralo.', '4. Desde ahí, 2 a la IZQUIERDA.', '¿Qué hay? Coloréalo.'];
        ins.forEach((t, i) => { s += `<text x="${tx}" y="${oy + 7 + i * 11.5}" font-family="Fredoka" font-size="6.3" font-weight="${t.match(/^\d/) ? 500 : 600}">${esc(t)}</text>`; });
        return { kid: 'Mapa del tesoro: sigue las instrucciones con tu dedo.', parent: 'Lea cada paso y espere a que mueva el dedo. Respuestas: tesoro (paso 3) y árbol (paso 4).', html: svg(s) };
      }
    }
    return { kid: '', parent: '', html: '' };
  }

  // ---------------------------------------------------------------- LEO
  function leo(c, w, d) {
    switch (c.t) {
      case 'vocales': {
        const cards = C.VOCALES.map(([v, p]) => `<div class="tarjeta"><span class="v">${v}</span>${img(p)}<small>${p}</small></div>`).join('');
        return { kid: 'Di el sonido de cada vocal y colorea su dibujo.', parent: 'Las vocales suenan igual que su nombre. Que las diga en voz alta y busque objetos de la casa que empiecen con cada una.', html: `<div class="vocales">${cards}</div>` };
      }
      case 'sonidoInicial': {
        const it = c.items.map(([p, ops]) => `<div class="tarjeta">${img(p)}<div class="ops">${ops.map(o => `<span>${o}</span>`).join('')}</div></div>`).join('');
        return { kid: '¿Con qué vocal empieza? Enciérrala.', parent: 'Diga la palabra alargando el primer sonido: "ooooso". No escriba la palabra; que la escuche.', html: `<div class="sinicial">${it}</div>` };
      }
      case 'tobogan': {
        const n = c.silabas.length, compact = n >= 4;
        const cw = compact ? Math.min(36, (194 - (n - 1) * 3) / n) : 50, ch = compact ? 35 : 40;
        const cards = c.silabas.map((sil) => {
          const [co, vo] = consDe(sil);
          const fs = compact ? 15 : 20;
          return `<div class="tarjeta" style="width:${cw}mm;height:${ch}mm;padding:1mm"><svg viewBox="0 0 60 50" style="width:100%;height:100%">
            <rect x="2" y="12" width="${co.length > 1 ? 22 : 16}" height="3" rx="1.5" fill="#7a4e2a"/>
            <path d="M${co.length > 1 ? 24 : 18} 14 C 32 14, 34 34, 46 34" fill="none" stroke="#2e7d32" stroke-width="3" stroke-linecap="round"/>
            <path d="M${co.length > 1 ? 24 : 18} 14 C 32 14, 34 34, 46 34" fill="none" stroke="#fff" stroke-width="0.8" stroke-dasharray="2 2.5"/>
            <text x="${co.length > 1 ? 13 : 10}" y="10.5" font-family="Andika" font-size="${fs * 0.62}" text-anchor="middle" font-weight="700">${co}</text>
            <text x="51" y="42" font-family="Andika" font-size="${fs * 0.62}" text-anchor="middle" font-weight="700">${vo}</text>
            <rect x="2" y="37" width="${co.length > 1 ? 30 : 24}" height="12" rx="3" fill="#fff" stroke="#5b2fa8" stroke-width="0.9"/>
            <text x="${co.length > 1 ? 17 : 14}" y="46.5" font-family="Andika" font-size="10" text-anchor="middle" fill="#5b2fa8" font-weight="700">${sil}</text>
          </svg></div>`;
        }).join('');
        const lets = [...new Set(c.silabas.map(s => consDe(s)[0]))];
        return { kid: 'Tobogán de sonidos: empieza arriba, resbala hasta la vocal ¡y lee la sílaba!', parent: `Ponga el dedo en la letra de arriba, digan su sonido y "resbalen" por el tobogán hasta la vocal sin parar. ${sonidoDe(lets) ? 'Recuerde: ' + sonidoDe(lets) + '.' : ''}`, html: `<div class="fila" style="flex-wrap:wrap;justify-content:center">${cards}</div>` };
      }
      case 'tren': {
        const rows = c.filas.map((f, k) => {
          let x = 30, s = '';
          s += monAt(k % 2 ? 'nubo' : 'pasti', 0, 0, 26, 30, 'color');
          s += `<rect x="4" y="22" width="22" height="10" rx="2" fill="#5b2fa8"/><circle cx="9" cy="34" r="3" fill="#111"/><circle cx="21" cy="34" r="3" fill="#111"/>`;
          f.forEach((sil) => {
            const wd = Math.max(26, sil.length * 7.4 + 8);
            s += `<line x1="${x - 4}" y1="24" x2="${x}" y2="24" stroke="#111" stroke-width="1.2"/>`;
            s += `<rect x="${x}" y="6" width="${wd}" height="24" rx="3" fill="#fff" stroke="#111" stroke-width="0.9"/>`;
            s += `<text x="${x + wd / 2}" y="24" font-family="Andika" font-size="14" text-anchor="middle">${esc(sil)}</text>`;
            s += `<circle cx="${x + 6}" cy="33" r="3" fill="#111"/><circle cx="${x + wd - 6}" cy="33" r="3" fill="#111"/>`;
            s += `<g transform="translate(${x + wd / 2 - 3.5} 37) scale(0.29)">${STAR.replace(/<\/?svg[^>]*>/g, '')}</g>`;
            x += wd + 5;
          });
          return `<svg viewBox="0 0 ${Math.max(x, 215)} 44" style="width:100%;height:auto">${s}</svg>`;
        }).join('');
        return { kid: 'Lee cada vagón de izquierda a derecha. Colorea la estrella cuando lo leas.', parent: 'Que pase el dedo por debajo de cada vagón. Si lee letra por letra, pídale: "ahora dilo rápido, como tren".', html: `<div style="display:flex;flex-direction:column;gap:2mm">${rows}</div>` };
      }
      case 'tarjetas': {
        const n = c.palabras.length;
        const cols = n === 1 ? 1 : (n === 4 ? 4 : 3);
        const cards = c.palabras.map(p => `<div class="tarjeta">${img(p)}<div class="pal">${silHTML(p)}</div></div>`).join('');
        return { kid: 'Lee la palabra y colorea su dibujo.', parent: 'Que lea por sílabas (cada arco es una sílaba) y luego la palabra completa. Tape el dibujo con la mano si adivina sin leer.', html: `<div class="tarjetas${n === 1 ? ' uno' : ''}" style="grid-template-columns:${n === 1 ? '70mm' : `repeat(${cols},1fr)`}">${cards}</div>` };
      }
      case 'palabrasSueltas': {
        const ps = c.palabras.map(p => `<div class="p">${silHTML(p)}${STAR}</div>`).join('');
        return { kid: 'Palabras sin dibujo: ¡léelas como un detective!', parent: 'Aquí no hay dibujos para adivinar. Que lea cada una y coloree la estrella. Los nombres empiezan con mayúscula.', html: `<div class="sueltas">${ps}</div>` };
      }
      case 'frases': {
        const fs = c.frases.map(([f, im]) => `<div class="frase">${img(im)}<div class="txt">${f.split(' ').map(x => `<span class="w">${esc(x)}</span>`).join('')}</div><div class="est">${STAR}</div></div>`).join('');
        return { kid: 'Lee la frase poniendo tu dedo en cada punto verde.', parent: 'Un punto verde = una palabra. Que toque cada punto al leer. Al terminar, pregunte de qué trata la frase.', html: `<div class="frases">${fs}</div>` };
      }
      case 'uneDibujo': {
        const der = shuffle(c.palabras, w.n * 13 + d * 3);
        const rows = c.palabras.map((p, i) => `<div class="izq">${silHTML(p)}<span class="pt"></span></div><div></div><div class="der"><span class="pt"></span>${img(der[i])}</div>`).join('');
        return { kid: 'Lee cada palabra y únela con su dibujo.', parent: 'Que lea primero, luego busque el dibujo. Si se equivoca, pídale que vuelva a leer la palabra despacio.', html: `<div class="une">${rows}</div>` };
      }
      case 'vista': {
        const cards = c.palabras.map(p => `<div class="tarjeta">${esc(p)}</div>`).join('');
        const fr = ['El pato y el sapo.', 'El oso es mío.', 'Papá y mamá.'];
        const frs = fr.map(f => `<div style="font-size:9mm;line-height:1.3">${esc(f)}</div>`).join('');
        return { kid: 'Palabras mágicas: se leen de un vistazo. Encuéntralas en las frases y enciérralas.', parent: 'Las palabras mágicas no se leen por sílabas: se reconocen de memoria. Péguenlas en el refri y léanlas cada día.', html: `<div style="display:flex;flex-direction:column;gap:4mm"><div class="vista">${cards}</div><div style="display:flex;justify-content:space-around;flex-wrap:wrap;gap:3mm">${frs}</div></div>` };
      }
      case 'leeNombre': {
        if (NOMBRE) return { kid: '¡Ya puedes leer tu nombre!', parent: 'Que lea su nombre por sílabas y luego completo. Escríbalo en una tarjeta para pegarla en su cuarto.', html: `<div class="tnombre"><div class="n">${esc(NOMBRE)}</div><div class="s">${silHTML(NOMBRE)}</div></div>` };
        return { kid: '¡Ya puedes leer tu nombre!', parent: 'Escriba su nombre en el recuadro con letra script y léanlo por sílabas.', html: `<div class="tnombre" style="height:40mm"></div>` };
      }
      case 'cierre': {
        const cs = c.palabras.map(([a, b, p]) => `<div class="c"><span>${a}</span><span class="op">+</span><span class="ul">${b}</span><span class="op">=</span><b>${p}</b>${img(p)}</div>`).join('');
        return { kid: 'Lee la sílaba y pégale la última letra.', parent: 'Primero la sílaba que ya conoce (so), luego agrega el sonido final (l): "so... l... ¡sol!".', html: `<div class="cierre">${cs}</div>` };
      }
      case 'cuento': {
        const k = C.CUENTOS[c.id];
        const pic = k.monstruo ? mon(k.monstruo, 'linea') : img(k.img);
        const lineas = k.lineas.map(l => `<div>${esc(conNombre(l))}</div>`).join('');
        const preg = k.preguntas.map(q => `<div class="q"><p>${esc(q.q)}</p><div class="opciones">${q.op.map(o => o.startsWith('color:') ? `<span class="col" style="background:${o.slice(6)}"></span>` : img(o)).join('')}</div></div>`).join('');
        return { kid: 'Lee el cuento y luego contesta las preguntas encerrando el dibujo.', parent: 'Lean el cuento tres veces: usted primero, luego él, luego juntos. Para las preguntas, que señale en el texto dónde está la respuesta.', html: `<div class="cuento"><h3>${esc(conNombre(k.titulo))}</h3><div class="cuerpo"><div class="pic">${pic}</div><div class="lineas">${lineas}</div></div><div class="preg">${preg}</div></div>` };
      }
    }
    return { kid: '', parent: '', html: '' };
  }

  // ---------------------------------------------------------------- páginas
  function paginaA(w, d, day) {
    const e = espacio(day.espacio, w, d);
    return `<section class="pagina">${cabecera(w, `Día ${d} · Espacio y escritura`)}
      <div class="antes"><span class="eti">Antes de empezar · 2 min</span><span><b>Con el cuerpo:</b> ${esc(day.cuerpo)}</span></div>
      <div class="mision crece">${tituloMision('espacio', 'Misión 1 · Espacio', 'nubo', e.kid)}${papas(e.parent)}<div class="actividad">${e.html}</div></div>
      <div class="mision">${tituloMision('escribo', 'Misión 2 · Escribo', 'pasti', 'Traza sin salirte. Empieza en el punto verde.')}${papas(textoEscribo(day))}${renglones(w, day.escribo)}</div>
      ${pie(`Leo y escribo · Nivel ${w.n} · Día ${d} · hoja A`)}</section>`;
  }
  function paginaB(w, d, day) {
    const parts = day.leo.map(c => leo(c, w, d));
    const body = parts.map((p, i) => `<div class="mision">${i === 0 ? tituloMision('leo', 'Misión 3 · Leo', 'topi', p.kid) : `<div class="burbuja">${p.kid}</div>`}${papas(p.parent)}${p.html}</div>`).join('');
    return `<section class="pagina">${cabecera(w, `Día ${d} · Lectura`)}
      <div class="antes"><span class="eti">Juego de voz · 2 min</span><span>${esc(day.oral)}</span></div>
      ${body}
      ${pie(`Leo y escribo · Nivel ${w.n} · Día ${d} · hoja B`)}</section>`;
  }

  function mapaNiveles(actual) {
    let s = '';
    const xs = [], y0 = 22;
    for (let i = 0; i < 8; i++) xs.push(14 + i * 23.8);
    s += `<path d="M${xs[0]} ${y0} ${xs.map((x, i) => `L${x} ${y0 + (i % 2 ? -6 : 6)}`).join(' ')}" fill="none" stroke="#888" stroke-width="1.4" stroke-dasharray="3 2"/>`;
    C.WEEKS.forEach((wk, i) => {
      const x = xs[i], y = y0 + (i % 2 ? -6 : 6), on = wk.n === actual;
      s += `<circle cx="${x}" cy="${y}" r="${on ? 11 : 9.5}" fill="#fff" stroke="${on ? '#5b2fa8' : '#111'}" stroke-width="${on ? 2.2 : 0.7}"/>`;
      s += monAt(wk.jefe, x - 7.5, y - 10, 15, 18, actual ? (wk.n <= actual ? 'color' : 'linea') : 'linea');
      s += `<circle cx="${x + 8}" cy="${y + 7}" r="3.6" fill="${on ? '#5b2fa8' : '#111'}"/><text x="${x + 8}" y="${y + 8.8}" font-family="Fredoka" font-size="5" font-weight="600" text-anchor="middle" fill="#fff">${wk.n}</text>`;
    });
    return `<div class="mapa-niveles"><svg viewBox="0 6 194 34">${s}</svg></div>`;
  }
  function qr() { return `<div class="qr"><img src="assets/img/qr-sitio.svg" alt="Código QR"><div><p>Juegos en línea para la tablet o el celular (con voz):</p><div class="url">${SITIO}</div></div></div>`; }

  function portada(w) {
    const rut = w.dias.map((day, i) => {
      const leos = day.leo.map(l => ({ vocales: 'vocales', sonidoInicial: 'sonido inicial', tobogan: 'tobogán ' + (l.silabas || []).join(' '), tren: 'tren de sílabas', tarjetas: 'palabras con dibujo', palabrasSueltas: 'palabras sin dibujo', frases: 'frases', uneDibujo: 'une palabra y dibujo', vista: 'palabras mágicas', leeNombre: 'leer su nombre', cuento: 'cuento', cierre: 'letra al final' }[l.t])).join(', ');
      const escs = day.escribo.map(x => x.g || x.c || (x.p ? x.p.join(', ') : '') || x.f || ({ nombre: 'su nombre', nombreCompleto: 'nombre completo', fraseNombre: 'frase con su nombre' }[x.t] || '')).join(' / ');
      return `<tr><th>Día ${i + 1}</th><td>${esc(escs)}</td><td>${esc(leos)}</td></tr>`;
    }).join('');
    const letras = w.letrasLeo.map(l => `<span>${l === 'cierre' ? 'sol pan mar' : l}</span>`).join('');
    return `<section class="pagina portada">
      <div class="top"><div class="boss">${mon(w.jefe, 'color')}</div><div style="flex:1"><h1>Nivel ${w.n} <span style="color:var(--tinta);font-size:18pt">· ${esc(w.titulo)}</span></h1><div class="mis" style="margin-top:2mm">${esc(w.mision)} <span style="font-family:var(--texto);font-size:10.5pt">(Jefe: <b>${M.CAST[w.jefe].nombre}</b>, se vence el viernes.)</span></div></div></div>
      ${mapaNiveles(w.n)}
      <div class="tres">
        <div class="caja"><h4>Espacio</h4><p>${esc(w.objetivos.espacio)}</p></div>
        <div class="caja"><h4>Escribo</h4><p>${esc(w.objetivos.escribo)}</p></div>
        <div class="caja"><h4>Leo</h4><p>${esc(w.objetivos.leo)}</p></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 84mm;gap:3mm"><div class="caja"><h4>Sonidos de la semana</h4><div class="letras-sem">${letras}</div><p style="margin-top:1.5mm">${sonidoDe(w.letrasLeo)}.</p></div><div class="caja">${qr()}</div></div>
      <div class="caja"><h4>Rutina diaria (15 a 20 minutos, lunes a viernes)</h4>
        <p style="margin-bottom:1.2mm">Cuerpo → <b>Hoja A</b> (Espacio + Escribo) → Juego de voz → <b>Hoja B</b> (Leo). Fin de semana: cuento en voz alta.</p>
        <table class="rutina"><tr><th></th><th>Escribo</th><th>Leo</th></tr>${rut}</table></div>
      <div class="dos">
        <div class="caja"><h4>Consejos de la semana</h4><ul>${w.consejos.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>
        <div class="caja"><h4>${w.n < 8 ? `Pasa al nivel ${w.n + 1} cuando…` : 'Terminó el cuaderno cuando…'}</h4><ul>${w.avanzar.map(t => `<li>${esc(t)}</li>`).join('')}</ul><p style="margin-top:1.5mm">Si no, repitan los días que costaron. Repetir también es avanzar.</p></div>
      </div>
      ${pie(`Leo y escribo · Nivel ${w.n} · Portada`)}</section>`;
  }

  function paginaJefe(w) {
    const r = w.reto;
    const regRows = ['Espacio', 'Escribo', 'Leo'].map(m => `<tr><th>${m}</th>${[1, 2, 3, 4, 5].map(() => `<td>${STAR}</td>`).join('')}</tr>`).join('');
    const nombreRow = (() => {
      const u = 9, W = ANCHO / u;
      const opts = { W, key: true };
      return `<div class="renglon" style="height:${(3.16 * u).toFixed(1)}mm">${G.rowSVG(opts)}</div>`;
    })();
    const sig = w.n < 8 ? `¡Nos vemos en el nivel ${w.n + 1}!` : '¡Gracias por ver mi canal!';
    return `<section class="pagina">${cabecera(w, 'Viernes · ¡Hoja del jefe!')}
      <div class="mision-t"><span class="chip jefe">Jefe del nivel ${w.n}</span><div style="width:14mm;height:16mm">${mon(w.jefe, 'color')}</div><div class="burbuja">Para vencer a <b>${M.CAST[w.jefe].nombre}</b>, lee todo esto. ¡Tú puedes!</div></div>
      ${papas('Que lea las sílabas en desorden (usted señala). Si lee 8 de 10, ¡venció al jefe! Coloree la insignia y desbloqueen el monstruo en el sitio de juegos.')}
      <div class="reto-sil">${r.silabas.map(s => `<div>${esc(s)}</div>`).join('')}</div>
      <div style="display:flex;gap:6mm;align-items:center;justify-content:center;font-size:9.5mm">${r.palabras.map(p => `<span>${silHTML(p)}</span>`).join('')}</div>
      <div style="text-align:center;font-size:9mm;border:0.6mm solid var(--jefe);border-radius:3mm;padding:1mm">${esc(r.frase)}</div>
      <div><div style="font-size:11pt;font-weight:700;margin-bottom:1mm">Escribe tu nombre (compáralo con el del viernes pasado):</div>${nombreRow}</div>
      <div class="dos" style="align-items:start">
        <div class="caja"><h4>Registro del nivel</h4><table class="registro"><tr><th></th><th>L</th><th>M</th><th>M</th><th>J</th><th>V</th></tr>${regRows}</table></div>
        <div class="caja insignia" style="text-align:center"><h4>Insignia del nivel ${w.n}</h4>
          <svg viewBox="0 0 100 100"><path d="M50 4 L61 14 L76 12 L79 27 L92 35 L86 49 L92 63 L79 71 L76 86 L61 84 L50 96 L39 84 L24 86 L21 71 L8 63 L14 49 L8 35 L21 27 L24 12 L39 14 Z" fill="#fff" stroke="#111" stroke-width="1.6"/><circle cx="50" cy="50" r="28" fill="#fff" stroke="#111" stroke-width="1.2"/><text x="50" y="62" font-family="Fredoka" font-size="34" font-weight="700" text-anchor="middle">${w.n}</text></svg></div>
      </div>
      <div class="caja youtuber"><h4>Episodio del viernes (modo youtuber)</h4><p style="margin-bottom:1mm">Graben un video cortito en su celular, solo para la familia:</p>
        <ol><li>"¡Hola! Soy ${NOMBRE ? esc(NOMBRE) : '____'} y hoy les voy a leer…"</li><li>Lee su frase favorita del nivel y muestra su mejor letra a la cámara.</li><li>Cuenta qué monstruo venció.</li><li>Se despide: "${sig}"</li></ol></div>
      ${pie(`Leo y escribo · Nivel ${w.n} · Jefe`)}</section>`;
  }

  function guia() {
    const p1 = `<section class="pagina guia"><h1>Leo y escribo con los monstruos</h1>
      <p style="font-size:13pt">Cuaderno de 8 niveles (8 semanas) para reforzar en casa lo que pidió la escuela: <b>la orientación en el espacio</b> (arriba, abajo, izquierda, derecha), <b>el trazo dentro de los renglones</b> y <b>la lectura de sílabas y palabras</b>.</p>
      <div class="caja"><h3>Cómo funciona</h3><ul>
        <li>Cada semana es un <b>nivel</b> con su <b>monstruo jefe</b>. Cada día tiene 3 misiones cortas y dos hojas (A y B).</li>
        <li><b>Hoja A:</b> Misión 1 Espacio + Misión 2 Escribo. <b>Hoja B:</b> Misión 3 Leo.</li>
        <li>Al terminar cada misión, coloreen una estrella en la parte de arriba. El viernes toca la <b>hoja del jefe</b>: si la vence, colorea su insignia.</li>
        <li>En el sitio de juegos (con voz) se desbloquea cada monstruo jefe: es su colección.</li></ul></div>
      <div class="caja"><h3>Reglas de oro</h3><ol>
        <li><b>Poquito y diario:</b> 15 a 20 minutos de lunes a viernes valen más que una hora el sábado.</li>
        <li><b>Sonidos, no nombres:</b> la m suena "mmm", no "eme". Así puede unir los sonidos para leer.</li>
        <li><b>Estirar y unir:</b> "mmmm-aaaa → ma". Las letras que no se estiran (p, t, d, b, c) se dicen pegadas a la vocal.</li>
        <li><b>El dedo guía:</b> siempre de izquierda a derecha, debajo de lo que lee.</li>
        <li><b>Calidad antes que cantidad:</b> tres letras bien hechas valen más que una hoja llena con prisa.</li>
        <li><b>Festejar el esfuerzo:</b> "¡te esforzaste!" en lugar de "¡qué listo!". No borrar ni corregir de más.</li>
        <li><b>Parar a tiempo:</b> si está cansado o frustrado, terminen con algo que le salga bien y sigan mañana.</li>
        <li><b>Repetir no es retroceder:</b> si un nivel cuesta, repítanlo. Cada niño tiene su ritmo.</li></ol></div>
      <div class="dos">
        <div class="caja"><h3>Material</h3><ul><li>Lápiz grueso o triangular (o crayón triangular).</li><li>Crayolas o colores.</li><li>Una pulsera o listón para la mano derecha (nivel 2).</li><li>Plastilina, una charola con sal o harina para trazar letras con el dedo.</li></ul></div>
        <div class="caja"><h3>Postura y pinza</h3><ul><li>Pies apoyados, espalda recta, la otra mano detiene la hoja.</li><li>Lápiz entre pulgar e índice, apoyado en el dedo medio ("pinza").</li><li>Hoja un poco inclinada; para zurdos, hacia el otro lado.</li></ul></div>
      </div>
      <div class="caja"><h3>Cuándo comentarlo con la maestra o el pediatra</h3><p>Voltear letras (b/d) o escribir en espejo es normal a esta edad. Coméntenlo si después de varias semanas no logra decir los sonidos de las letras, si se queja de la vista, se acerca mucho al papel, no parece oír bien, o si la frustración es muy grande y constante.</p></div>
      ${pie('Leo y escribo · Guía para papás · 1')}</section>`;
    const u = 13, W = ANCHO / u;
    const ej = G.rowSVG({ W, key: true, items: [{ text: 'a', mode: 'model' }, { text: 'l', mode: 'model' }, { text: 'p', mode: 'model' }, { text: 'M', mode: 'model' }, { text: 'a', mode: 'dots' }, { text: 'l', mode: 'dots' }, { text: 'p', mode: 'dots' }, { text: 'M', mode: 'dots' }], itemGap: 1.1 });
    const p2 = `<section class="pagina guia"><h1>La pauta de los monstruos</h1>
      <p>El renglón tiene tres pisos. Cada monstruo vive en uno y cuida a sus letras. Así se entiende de qué tamaño es cada letra y dónde empieza.</p>
      <div class="renglon" style="height:${(3.16 * u).toFixed(1)}mm">${ej}</div>
      <div class="zona-ej"><div class="m">${mon('nubo', 'color')}</div><p><b>Nubo vive en el CIELO</b> (franja azul). Las letras altas suben hasta su línea: <b style="font-size:16pt">b d f h k l t</b> y <b>todas las MAYÚSCULAS</b>. Los puntos de la i y la j también flotan en el cielo.</p></div>
      <div class="zona-ej"><div class="m">${mon('pasti', 'color')}</div><p><b>Pasti vive en el PASTO</b> (franja verde). Las letras pequeñas no salen del pasto: <b style="font-size:16pt">a c e i m n ñ o r s u v w x z</b>. Todas las letras se paran en la línea verde del suelo.</p></div>
      <div class="zona-ej"><div class="m">${mon('topi', 'color')}</div><p><b>Topi vive en la TIERRA</b> (franja café). Las letras con colita bajan a visitarlo: <b style="font-size:16pt">g j p q y</b>.</p></div>
      <div class="caja"><h3>Cómo leer las hojas de trazo</h3><ul>
        <li><b>Letra negra con números y flechas:</b> es el modelo. El círculo verde con número dice qué trazo va primero; la flecha roja, hacia dónde.</li>
        <li><b>Letra de puntitos:</b> para trazar encima. El punto verde marca dónde empezar.</li>
        <li><b>Solo punto verde:</b> ahora la hace él solito.</li>
        <li>Reglas de trazo: de arriba hacia abajo, de izquierda a derecha, y las bolitas (a, c, d, g, o, q) giran hacia la izquierda.</li>
        <li><b>Truco b/d:</b> la b empieza con el bastón (palo) y luego la panza; la d empieza con la bolita, como la a, y luego el palo alto.</li></ul></div>
      ${pie('Leo y escribo · Guía para papás · 2')}</section>`;
    const lista = C.WEEKS.map(wk => `<tr><th>Nivel ${wk.n}</th><td>${esc(wk.titulo)}</td><td>${esc(wk.objetivos.leo.split('.')[0])}.</td><td>${esc(M.CAST[wk.jefe].nombre)}</td></tr>`).join('');
    const p3 = `<section class="pagina guia"><h1>El mapa de los 8 niveles</h1>
      ${mapaNiveles(0)}
      <table class="rutina"><tr><th></th><th>Nivel</th><th>Lectura</th><th>Jefe</th></tr>${lista}</table>
      <div class="dos">
        <div class="caja"><h3>Cómo se gana</h3><ul><li><b>Estrellas:</b> una por misión cumplida (3 por día).</li><li><b>Insignia:</b> al vencer al jefe del viernes.</li><li><b>Colección:</b> en el sitio de juegos se desbloquea cada monstruo.</li><li><b>Diploma:</b> al vencer al Megamonstruo del nivel 8.</li></ul></div>
        <div class="caja"><h3>Modo youtuber</h3><p>Cada viernes graben un "episodio" de un minuto en el que él presenta lo que leyó. Ver sus episodios de la semana 1 a la 8 le muestra cuánto avanzó. Guárdenlos solo para la familia.</p></div>
      </div>
      <div class="caja"><h3>Sitio de juegos (con voz)</h3><p style="margin-bottom:2mm">Para la tablet o el celular. Elijan el nivel en el que van. Úsenlo como premio o los fines de semana, siempre acompañado y por poco tiempo.</p>${qr()}</div>
      ${pie('Leo y escribo · Guía para papás · 3')}</section>`;
    return p1 + p2 + p3;
  }

  function diploma() {
    return `<section class="pagina diploma"><div style="width:44mm;height:52mm;margin:0 auto">${mon('mega', 'color')}</div>
      <h1>¡Venciste al jefe final!</h1>
      <p style="font-size:16pt;margin:3mm 0 0">Este diploma de <b>Gran lector y escritor</b> es para</p>
      <div class="quien">${NOMBRE ? esc(COMPLETO) : '&nbsp;'}</div>
      <p style="font-size:13pt">por completar los 8 niveles de <b>Leo y escribo con los monstruos</b>.</p>
      <div class="bosses">${C.WEEKS.map(wk => `<div>${mon(wk.jefe, 'linea')}</div>`).join('')}</div>
      <p style="font-size:12pt">Colorea a los 8 jefes que venciste.</p>
      <div class="firmas"><div>Mamá</div><div>Papá</div></div>
      <p style="margin-top:8mm;font-size:12pt">Fecha: ______________________</p></section>`;
  }

  function nivel(w) {
    let s = portada(w);
    w.dias.forEach((day, i) => { s += paginaA(w, i + 1, day) + paginaB(w, i + 1, day); });
    s += paginaJefe(w);
    if (w.n === 8) s += diploma();
    return s;
  }

  // ---------------------------------------------------------------- arranque
  const sem = Q.get('semana') || '1';
  const guiaQ = Q.get('guia');
  let html = '';
  if (guiaQ === 'solo') html = guia();
  else {
    const weeks = sem === 'todo' ? C.WEEKS : C.WEEKS.filter(x => String(x.n) === sem);
    if (sem === '1' || sem === 'todo' || guiaQ === '1') html += guia();
    weeks.forEach(w => { html += nivel(w); });
  }
  const barra = document.getElementById('barra');
  if (barra) {
    const qs = (o) => { const p = new URLSearchParams(location.search); Object.entries(o).forEach(([k, v]) => p.set(k, v)); return '?' + p.toString(); };
    barra.innerHTML = '<b>Cuaderno</b> ' + C.WEEKS.map(w => `<a class="${sem === String(w.n) ? 'on' : ''}" href="${qs({ semana: w.n })}">Nivel ${w.n}</a>`).join('') + ` <a href="${qs({ guia: 'solo' })}">Guía</a> <button onclick="window.print()">Imprimir</button>`;
  }
  document.getElementById('libro').innerHTML = html;
  document.title = 'Leo y escribo · ' + (guiaQ === 'solo' ? 'Guía' : (sem === 'todo' ? 'Cuaderno completo' : 'Nivel ' + sem));
  Promise.all([document.fonts.ready, ...Array.from(document.images).map(im => im.complete ? 1 : new Promise(r => { im.onload = im.onerror = r; }))]).then(() => { document.body.dataset.listo = '1'; });
})();
