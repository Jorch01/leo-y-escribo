/*
 * Letras script (molde) de un solo trazo, para trazar en la pauta
 * cielo / pasto / tierra.
 *
 * Coordenadas de cada letra (y crece hacia abajo):
 *   y = 0  línea del cielo (arriba)
 *   y = 1  línea punteada (techo del pasto)
 *   y = 2  línea del suelo (donde se "paran" las letras)
 *   y = 3  línea de la tierra (hasta donde bajan las colitas)
 * Las minúsculas cortas viven entre 1 y 2; las altas y las mayúsculas
 * entre 0 y 2; las de colita entre 1 y 3.
 */
(function (root) {
  'use strict';

  // ---------- constructor de trazos ----------
  function S() {
    const pts = [];
    const api = {
      m(x, y) { pts.push([x, y]); return api; },
      l(x, y) { pts.push([x, y]); return api; },
      // arco elíptico; ángulos en grados (0 = derecha, 90 = arriba).
      // a1 > a0 gira en contra de las manecillas del reloj.
      a(cx, cy, rx, ry, a0, a1) {
        const n = Math.max(2, Math.ceil(Math.abs(a1 - a0) / 6));
        for (let i = 0; i <= n; i++) {
          const t = (a0 + (a1 - a0) * i / n) * Math.PI / 180;
          const p = [cx + rx * Math.cos(t), cy - ry * Math.sin(t)];
          if (i === 0 && pts.length) {
            const q = pts[pts.length - 1];
            if (Math.hypot(q[0] - p[0], q[1] - p[1]) < 1e-4) continue;
          }
          pts.push(p);
        }
        return api;
      },
      pts
    };
    return api;
  }
  const DOT = (x, y) => ({ dot: [x, y] });
  const wave = (x0, x1, y, amp) => {
    const s = S();
    const n = 24;
    for (let i = 0; i <= n; i++) {
      const x = x0 + (x1 - x0) * i / n;
      s.l(x, y - amp * Math.sin(Math.PI * 2 * i / n));
    }
    return s;
  };
  const ACUTE = (x) => S().m(x + 0.32, 0.38).l(x + 0.06, 0.78);

  // ---------- tabla de letras ----------
  const G = {};
  function def(ch, w, zone, ...strokes) {
    G[ch] = { w, zone, strokes: strokes.map(s => (s.dot ? s : { pts: s.pts })) };
  }
  const ball = (cx) => S().a(cx, 1.5, 0.5, 0.5, 35, 395);       // bolita (c mágica)
  const bump = (cx) => S().a(cx, 1.5, 0.5, 0.5, 180, -180);     // panza hacia la derecha

  // minúsculas
  def('a', 1, 'pasto', ball(0.5), S().m(1, 1).l(1, 2));
  def('b', 1, 'cielo', S().m(0, 0).l(0, 2), bump(0.5));
  def('c', 0.95, 'pasto', S().a(0.5, 1.5, 0.5, 0.5, 40, 320));
  def('d', 1, 'cielo', ball(0.5), S().m(1, 0).l(1, 2));
  def('e', 1, 'pasto', S().m(0, 1.5).l(1, 1.5).a(0.5, 1.5, 0.5, 0.5, 0, 320));
  def('f', 0.85, 'cielo', S().a(0.62, 0.32, 0.3, 0.32, 25, 180).l(0.32, 2), S().m(0, 1).l(0.78, 1));
  def('g', 1, 'tierra', ball(0.5), S().m(1, 1).l(1, 2.6).a(0.6, 2.6, 0.4, 0.4, 0, -160));
  def('h', 1, 'cielo', S().m(0, 0).l(0, 2), S().m(0, 1.5).a(0.5, 1.5, 0.5, 0.5, 180, 0).l(1, 2));
  def('i', 0.5, 'pasto', S().m(0.25, 1).l(0.25, 2), DOT(0.25, 0.55));
  def('j', 0.8, 'tierra', S().m(0.65, 1).l(0.65, 2.6).a(0.3, 2.6, 0.35, 0.4, 0, -165), DOT(0.65, 0.55));
  def('k', 0.95, 'cielo', S().m(0, 0).l(0, 2), S().m(0.85, 1).l(0.04, 1.55).l(0.92, 2));
  def('l', 0.5, 'cielo', S().m(0.25, 0).l(0.25, 2));
  def('m', 1.5, 'pasto', S().m(0, 1).l(0, 2),
    S().m(0, 1.42).a(0.375, 1.42, 0.375, 0.42, 180, 0).l(0.75, 2),
    S().m(0.75, 1.42).a(1.125, 1.42, 0.375, 0.42, 180, 0).l(1.5, 2));
  def('n', 1, 'pasto', S().m(0, 1).l(0, 2), S().m(0, 1.5).a(0.5, 1.5, 0.5, 0.5, 180, 0).l(1, 2));
  def('ñ', 1, 'pasto', S().m(0, 1).l(0, 2), S().m(0, 1.5).a(0.5, 1.5, 0.5, 0.5, 180, 0).l(1, 2), wave(0.08, 0.92, 0.6, 0.12));
  def('o', 1, 'pasto', S().a(0.5, 1.5, 0.5, 0.5, 80, 440));
  def('p', 1, 'tierra', S().m(0, 1).l(0, 3), bump(0.5));
  def('q', 1, 'tierra', ball(0.5), S().m(1, 1).l(1, 3));
  def('r', 0.8, 'pasto', S().m(0, 1).l(0, 2), S().m(0, 1.5).a(0.45, 1.5, 0.45, 0.5, 180, 35));
  def('s', 0.9, 'pasto', S().a(0.45, 1.25, 0.4, 0.25, 35, 270).a(0.45, 1.75, 0.42, 0.25, 90, -150));
  def('t', 0.8, 'cielo', S().m(0.4, 0).l(0.4, 2), S().m(0, 1).l(0.8, 1));
  def('u', 1, 'pasto', S().m(0, 1).l(0, 1.5).a(0.5, 1.5, 0.5, 0.5, 180, 360).l(1, 1), S().m(1, 1).l(1, 2));
  def('v', 1, 'pasto', S().m(0, 1).l(0.5, 2).l(1, 1));
  def('w', 1.5, 'pasto', S().m(0, 1).l(0.375, 2).l(0.75, 1).l(1.125, 2).l(1.5, 1));
  def('x', 1, 'pasto', S().m(0, 1).l(1, 2), S().m(1, 1).l(0, 2));
  def('y', 1, 'tierra', S().m(0, 1).l(0.5, 2), S().m(1, 1).l(0, 3));
  def('z', 1, 'pasto', S().m(0, 1).l(1, 1).l(0, 2).l(1, 2));
  // con acento
  def('á', 1, 'pasto', ball(0.5), S().m(1, 1).l(1, 2), ACUTE(0.3));
  def('é', 1, 'pasto', S().m(0, 1.5).l(1, 1.5).a(0.5, 1.5, 0.5, 0.5, 0, 320), ACUTE(0.3));
  def('í', 0.5, 'pasto', S().m(0.25, 1).l(0.25, 2), ACUTE(0.02));
  def('ó', 1, 'pasto', S().a(0.5, 1.5, 0.5, 0.5, 80, 440), ACUTE(0.3));
  def('ú', 1, 'pasto', S().m(0, 1).l(0, 1.5).a(0.5, 1.5, 0.5, 0.5, 180, 360).l(1, 1), S().m(1, 1).l(1, 2), ACUTE(0.3));

  // mayúsculas (todas son de cielo)
  def('A', 1.3, 'cielo', S().m(0.65, 0).l(0, 2), S().m(0.65, 0).l(1.3, 2), S().m(0.25, 1.3).l(1.05, 1.3));
  def('B', 1.05, 'cielo', S().m(0, 0).l(0, 2),
    S().m(0, 0).l(0.5, 0).a(0.5, 0.5, 0.45, 0.5, 90, -90).l(0, 1),
    S().m(0, 1).l(0.55, 1).a(0.55, 1.5, 0.5, 0.5, 90, -90).l(0, 2));
  def('C', 1.7, 'cielo', S().a(0.88, 1, 0.85, 1, 40, 320));
  def('D', 1.3, 'cielo', S().m(0, 0).l(0, 2), S().m(0, 0).l(0.35, 0).a(0.35, 1, 0.92, 1, 90, -90).l(0, 2));
  def('E', 0.95, 'cielo', S().m(0, 0).l(0, 2), S().m(0, 0).l(0.95, 0), S().m(0, 1).l(0.8, 1), S().m(0, 2).l(0.95, 2));
  def('F', 0.95, 'cielo', S().m(0, 0).l(0, 2), S().m(0, 0).l(0.95, 0), S().m(0, 1).l(0.8, 1));
  def('G', 1.75, 'cielo', S().a(0.88, 1, 0.85, 1, 40, 360).l(1.05, 1));
  def('H', 1.2, 'cielo', S().m(0, 0).l(0, 2), S().m(1.2, 0).l(1.2, 2), S().m(0, 1).l(1.2, 1));
  def('I', 0.7, 'cielo', S().m(0.35, 0).l(0.35, 2), S().m(0, 0).l(0.7, 0), S().m(0, 2).l(0.7, 2));
  def('J', 1.0, 'cielo', S().m(0.9, 0).l(0.9, 1.45).a(0.47, 1.45, 0.43, 0.55, 0, -170));
  def('K', 1.1, 'cielo', S().m(0, 0).l(0, 2), S().m(1.05, 0).l(0.03, 1.05).l(1.1, 2));
  def('L', 0.95, 'cielo', S().m(0, 0).l(0, 2).l(0.95, 2));
  def('M', 1.5, 'cielo', S().m(0, 0).l(0, 2), S().m(0, 0).l(0.75, 1.4).l(1.5, 0).l(1.5, 2));
  def('N', 1.2, 'cielo', S().m(0, 0).l(0, 2), S().m(0, 0).l(1.2, 2).l(1.2, 0));
  def('O', 1.75, 'cielo', S().a(0.875, 1, 0.875, 1, 85, 445));
  def('P', 1.05, 'cielo', S().m(0, 0).l(0, 2), S().m(0, 0).l(0.5, 0).a(0.5, 0.55, 0.5, 0.55, 90, -90).l(0, 1.1));
  def('Q', 1.8, 'cielo', S().a(0.875, 1, 0.875, 1, 85, 445), S().m(1.1, 1.4).l(1.8, 2.15));
  def('R', 1.1, 'cielo', S().m(0, 0).l(0, 2), S().m(0, 0).l(0.5, 0).a(0.5, 0.55, 0.5, 0.55, 90, -90).l(0, 1.1), S().m(0.45, 1.1).l(1.1, 2));
  def('S', 1.4, 'cielo', S().a(0.7, 0.5, 0.6, 0.5, 35, 270).a(0.7, 1.5, 0.65, 0.5, 90, -150));
  def('T', 1.3, 'cielo', S().m(0, 0).l(1.3, 0), S().m(0.65, 0).l(0.65, 2));
  def('U', 1.3, 'cielo', S().m(0, 0).l(0, 1.35).a(0.65, 1.35, 0.65, 0.65, 180, 360).l(1.3, 0));
  def('V', 1.3, 'cielo', S().m(0, 0).l(0.65, 2).l(1.3, 0));
  def('W', 1.9, 'cielo', S().m(0, 0).l(0.475, 2).l(0.95, 0).l(1.425, 2).l(1.9, 0));
  def('X', 1.3, 'cielo', S().m(0, 0).l(1.3, 2), S().m(1.3, 0).l(0, 2));
  def('Y', 1.3, 'cielo', S().m(0, 0).l(0.65, 1), S().m(1.3, 0).l(0.65, 1).l(0.65, 2));
  def('Z', 1.2, 'cielo', S().m(0, 0).l(1.2, 0).l(0, 2).l(1.2, 2));
  def('.', 0.3, 'pasto', DOT(0.15, 1.9));
  def(' ', 0.7, 'pasto');

  // trazos de preparación (semana 1)
  const P = {};
  function pat(key, w, name, ...strokes) {
    P[key] = { w, name, zone: 'pasto', strokes: strokes.map(s => (s.dot ? s : { pts: s.pts })) };
  }
  pat('palo', 0.4, 'palo de cielo', S().m(0.2, 0).l(0.2, 2));
  pat('palito', 0.4, 'palito de pasto', S().m(0.2, 1).l(0.2, 2));
  pat('acostada', 0.9, 'línea acostada', S().m(0, 1.5).l(0.9, 1.5));
  pat('cruz', 0.9, 'cruz', S().m(0.45, 1).l(0.45, 2), S().m(0, 1.5).l(0.9, 1.5));
  pat('bolita', 1, 'bolita', S().a(0.5, 1.5, 0.5, 0.5, 80, 440));
  pat('puente', 1, 'puente', S().m(0, 2).l(0, 1.5).a(0.5, 1.5, 0.5, 0.5, 180, 0).l(1, 2));
  pat('taza', 1, 'taza', S().m(0, 1).l(0, 1.5).a(0.5, 1.5, 0.5, 0.5, 180, 360).l(1, 1));
  pat('pico', 0.9, 'pico', S().m(0, 1).l(0.45, 2).l(0.9, 1));
  pat('baja', 0.7, 'resbaladilla', S().m(0, 1).l(0.7, 2));
  pat('raiz', 0.4, 'raíz', S().m(0.2, 1).l(0.2, 3));

  // patrones continuos (llenan todo el renglón)
  const CONT = {
    olas(W) { const s = S(); const n = Math.floor(W * 10); for (let i = 0; i <= n; i++) { const x = W * i / n; s.l(x, 1.5 - 0.42 * Math.sin(x * Math.PI * 1.6)); } return [{ pts: s.pts }]; },
    picos(W) { const s = S(); let x = 0, up = true; s.m(0, 2); while (x + 0.5 <= W) { x += 0.5; s.l(x, up ? 1 : 2); up = !up; } return [{ pts: s.pts }]; },
    montes(W) { const s = S(); s.m(0, 2); let x = 0; while (x + 1.2 <= W) { s.l(x, 2).l(x, 1.6).a(x + 0.5, 1.6, 0.5, 0.6, 180, 0).l(x + 1, 2).l(x + 1.2, 2); x += 1.2; } return [{ pts: s.pts }]; },
    escalones(W) { const s = S(); s.m(0, 2); let x = 0, y = 2; while (x + 0.6 <= W) { y = (y === 2 ? 1 : 2); s.l(x, y); x += 0.6; s.l(x, y); } return [{ pts: s.pts }]; },
  };

  // ---------- utilidades geométricas ----------
  function lengthOf(pts) {
    let L = 0;
    for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    return L;
  }
  function pointAt(pts, frac) {
    const total = lengthOf(pts);
    let target = total * frac, acc = 0;
    for (let i = 1; i < pts.length; i++) {
      const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      if (acc + seg >= target && seg > 0) {
        const t = (target - acc) / seg;
        const x = pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t;
        const y = pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t;
        const ang = Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]);
        return { x, y, ang };
      }
      acc += seg;
    }
    const n = pts.length - 1;
    return { x: pts[n][0], y: pts[n][1], ang: Math.atan2(pts[n][1] - pts[n - 1][1], pts[n][0] - pts[n - 1][0]) };
  }
  const f2 = (v) => (Math.round(v * 1000) / 1000);
  function d(pts, ox, oy) {
    return pts.map((p, i) => (i ? 'L' : 'M') + f2(p[0] + ox) + ' ' + f2(p[1] + oy)).join('');
  }

  function get(ch) { return G[ch] || P[ch] || null; }

  // Convierte un texto en letras colocadas. gap = espacio entre letras.
  function layout(text, gap) {
    const out = [];
    let x = 0;
    gap = gap == null ? 0.32 : gap;
    const tokens = P[text] ? [text] : Array.from(text);
    for (const ch of tokens) {
      const g = get(ch);
      if (!g) continue;
      out.push({ ch, g, x });
      x += g.w + gap;
    }
    return { items: out, w: Math.max(0, x - gap) };
  }

  // ---------- dibujo SVG ----------
  // estilos en unidades de letra (se escalan con el renglón)
  const STY = {
    dots: { color: '#3d3d3d', w: 0.11, gap: 0.235 },
    model: { color: '#1a1a1a', w: 0.15 },
    start: { color: '#1b7f3b', r: 0.1 },
    arrow: { color: '#d32f2f' }
  };

  function strokeSVG(st, ox, oy, mode, num) {
    let s = '';
    if (st.dot) {
      const [x, y] = st.dot;
      if (mode === 'model') s += `<circle cx="${f2(x + ox)}" cy="${f2(y + oy)}" r="0.11" fill="${STY.model.color}"/>`;
      else if (mode === 'dots') s += `<circle cx="${f2(x + ox)}" cy="${f2(y + oy)}" r="0.09" fill="none" stroke="${STY.dots.color}" stroke-width="0.045"/>`;
      else if (mode === 'start') s += `<circle cx="${f2(x + ox)}" cy="${f2(y + oy)}" r="0.07" fill="${STY.start.color}"/>`;
      return s;
    }
    const pts = st.pts;
    if (mode === 'model') {
      s += `<path d="${d(pts, ox, oy)}" fill="none" stroke="${STY.model.color}" stroke-width="${STY.model.w}" stroke-linecap="round" stroke-linejoin="round"/>`;
    } else if (mode === 'dots' || mode === 'ghost') {
      s += `<path d="${d(pts, ox, oy)}" fill="none" stroke="${STY.dots.color}" stroke-width="${STY.dots.w}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="0 ${STY.dots.gap}"/>`;
    }
    return s;
  }

  function arrowHead(pts, ox, oy, frac, size) {
    const p = pointAt(pts, frac);
    const a = p.ang, s = size;
    const tip = [p.x + ox + Math.cos(a) * s * 0.6, p.y + oy + Math.sin(a) * s * 0.6];
    const l = [p.x + ox + Math.cos(a + 2.5) * s, p.y + oy + Math.sin(a + 2.5) * s];
    const r = [p.x + ox + Math.cos(a - 2.5) * s, p.y + oy + Math.sin(a - 2.5) * s];
    return `<path d="M${f2(tip[0])} ${f2(tip[1])}L${f2(l[0])} ${f2(l[1])}L${f2(r[0])} ${f2(r[1])}Z" fill="${STY.arrow.color}"/>`;
  }

  function startBadge(st, ox, oy, num, withNum) {
    let x, y;
    if (st.dot) { [x, y] = st.dot; } else { [x, y] = st.pts[0]; }
    x += ox; y += oy;
    if (!withNum) return `<circle cx="${f2(x)}" cy="${f2(y)}" r="${STY.start.r}" fill="${STY.start.color}"/>`;
    return `<circle cx="${f2(x)}" cy="${f2(y)}" r="0.16" fill="${STY.start.color}" stroke="#fff" stroke-width="0.03"/>` +
      `<text x="${f2(x)}" y="${f2(y + 0.075)}" font-size="0.22" font-family="Fredoka, Andika, sans-serif" font-weight="700" text-anchor="middle" fill="#fff">${num}</text>`;
  }

  // Dibuja una letra en modo: model (con flechas y números), dots, start, ghostStart (punteada con punto de inicio)
  function glyphSVG(g, ox, oy, mode) {
    let s = '';
    const strokes = g.strokes || [];
    if (mode === 'model') {
      strokes.forEach((st) => { s += strokeSVG(st, ox, oy, 'model'); });
      strokes.forEach((st) => {
        if (st.pts && lengthOf(st.pts) > 0.5) {
          s += arrowHead(st.pts, ox, oy, 0.5, 0.2);
        }
      });
      const used = [];
      strokes.forEach((st, i) => {
        let p = st.dot ? st.dot.slice() : st.pts[0].slice();
        let off = [0, 0];
        if (used.some(q => Math.hypot(q[0] - p[0], q[1] - p[1]) < 0.3) && st.pts) {
          const a = pointAt(st.pts, 0.02).ang;
          off = [Math.cos(a) * 0.34, Math.sin(a) * 0.34];
        }
        used.push([p[0] + off[0], p[1] + off[1]]);
        s += startBadge(st, ox + off[0], oy + off[1], i + 1, true);
      });
    } else if (mode === 'dots') {
      strokes.forEach((st) => { s += strokeSVG(st, ox, oy, 'dots'); });
      strokes.forEach((st, i) => { if (i === 0 && !st.dot) s += startBadge(st, ox, oy, 1, false); });
    } else if (mode === 'start') {
      strokes.forEach((st, i) => { if (i === 0) s += startBadge(st, ox, oy, 1, false); });
    } else if (mode === 'solid') {
      strokes.forEach((st) => { s += strokeSVG(st, ox, oy, 'model'); });
    }
    return s;
  }

  // Fondo de la pauta (cielo / pasto / tierra). W en unidades de letra.
  function pautaSVG(W, opts) {
    opts = opts || {};
    const fills = opts.color === false ? ['#fff', '#fff', '#fff'] : ['#d6e9fb', '#d5f0c9', '#efe1cc'];
    let s = '';
    s += `<rect x="0" y="0" width="${W}" height="1" fill="${fills[0]}"/>`;
    s += `<rect x="0" y="1" width="${W}" height="1" fill="${fills[1]}"/>`;
    s += `<rect x="0" y="2" width="${W}" height="1" fill="${fills[2]}"/>`;
    s += `<line x1="0" y1="0" x2="${W}" y2="0" stroke="#1d5fa8" stroke-width="0.04"/>`;
    s += `<line x1="0" y1="1" x2="${W}" y2="1" stroke="#1d5fa8" stroke-width="0.035" stroke-dasharray="0.16 0.12"/>`;
    s += `<line x1="0" y1="2" x2="${W}" y2="2" stroke="#2e7d32" stroke-width="0.07"/>`;
    s += `<line x1="0" y1="3" x2="${W}" y2="3" stroke="#7a4e2a" stroke-width="0.04"/>`;
    return s;
  }

  // Íconos de zona en el margen izquierdo del renglón (nube, pasto, tierra)
  function zoneKeySVG() {
    let s = '';
    // nube
    s += `<g transform="translate(0.12 0.5)"><path d="M0.05 0.12 a0.12 0.12 0 0 1 0.1 -0.2 a0.16 0.16 0 0 1 0.3 0 a0.12 0.12 0 0 1 0.08 0.2 Z" fill="#fff" stroke="#1d5fa8" stroke-width="0.035"/></g>`;
    // pasto
    s += `<g transform="translate(0.14 1.62)" stroke="#2e7d32" stroke-width="0.05" stroke-linecap="round" fill="none"><path d="M0.05 0.3 L0.1 0 M0.18 0.3 L0.2 -0.1 M0.31 0.3 L0.36 0.02"/></g>`;
    // tierra (piedritas)
    s += `<g transform="translate(0.14 2.5)" fill="#7a4e2a"><circle cx="0.08" cy="0.05" r="0.05"/><circle cx="0.24" cy="0.12" r="0.06"/><circle cx="0.36" cy="0" r="0.04"/></g>`;
    return s;
  }

  /*
   * Renglón completo.
   *  items: lista de { text, mode } colocados de izquierda a derecha
   *  opts: { W (ancho en unidades), fill: {text, mode} para repetir hasta llenar,
   *          key: true para íconos de zona, cont: nombre de patrón continuo }
   * Devuelve SVG con viewBox en unidades; el que lo llama fija el tamaño en mm.
   */
  function rowSVG(opts) {
    const W = opts.W;
    const padL = opts.key ? 0.75 : 0.35;
    let body = '';
    let x = padL;
    const gapItems = opts.itemGap == null ? 0.7 : opts.itemGap;
    const letterGap = opts.letterGap == null ? 0.32 : opts.letterGap;
    const place = (text, mode) => {
      const L = layout(text, letterGap);
      if (x + L.w > W - 0.2) return false;
      L.items.forEach(it => { body += glyphSVG(it.g, x + it.x, 0, mode); });
      x += L.w + gapItems;
      return true;
    };
    if (opts.cont && CONT[opts.cont]) {
      const strokes = CONT[opts.cont](W - padL - 0.4);
      const g = { strokes };
      body += glyphSVG(g, padL, 0, opts.contMode || 'dots');
    }
    (opts.items || []).forEach(it => place(it.text, it.mode));
    if (opts.fill) {
      let guard = 0;
      const seq = Array.isArray(opts.fill) ? opts.fill : [opts.fill];
      let k = 0;
      while (guard++ < 60) {
        const it = seq[k % seq.length];
        if (!place(it.text, it.mode)) break;
        k++;
      }
    }
    const pauta = pautaSVG(W, opts);
    const key = opts.key ? zoneKeySVG() : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-0.05 -0.08 ${W + 0.1} 3.16" preserveAspectRatio="xMinYMid meet">${pauta}${key}${body}</svg>`;
  }

  root.Glyphs = { G, P, CONT, get, layout, glyphSVG, rowSVG, pautaSVG, lengthOf, pointAt, pathD: d };
})(typeof window !== 'undefined' ? window : globalThis);
