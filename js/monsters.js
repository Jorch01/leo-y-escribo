/*
 * Monstruos originales de "Leo y escribo".
 * Se dibujan con SVG para que se vean igual en pantalla y en papel.
 * mode: 'color' (pantalla) o 'linea' (para imprimir y colorear).
 */
(function (root) {
  'use strict';

  const INK = '#1a1a1a';

  const CAST = {
    nubo:   { nombre: 'Nubo',   zona: 'cielo',  body: 'cloud',  color: '#8ec5ff', eyes: 2, top: 'antennae', mouth: 'smile', arms: true },
    pasti:  { nombre: 'Pasti',  zona: 'pasto',  body: 'round',  color: '#86d97f', eyes: 1, top: 'tuft', mouth: 'teeth', feet: true },
    topi:   { nombre: 'Topi',   zona: 'tierra', body: 'drop',   color: '#d2a477', eyes: 2, top: 'horns', mouth: 'tongue', tail: true, feet: true },
    nam:    { nombre: 'Ñam',    body: 'round',  color: '#b99cff', eyes: 3, top: 'spikes', mouth: 'open', feet: true, arms: true },
    gloton: { nombre: 'Glotón', body: 'blob',   color: '#ffb74d', eyes: 2, top: 'horns', mouth: 'open', arms: true, feet: true },
    zigzag: { nombre: 'Zigzag', body: 'square', color: '#ffe066', eyes: 1, top: 'spikes', mouth: 'zig', feet: true },
    bombo:  { nombre: 'Bombo',  body: 'round',  color: '#ff8a80', eyes: 2, top: 'antennae', mouth: 'fangs', arms: true, feet: true, spots: true },
    chispa: { nombre: 'Chispa', body: 'drop',   color: '#80deea', eyes: 3, top: 'tuft', mouth: 'grin', arms: true },
    espejo: { nombre: 'Espejo', body: 'tall',   color: '#d7c8f5', eyes: 2, top: 'horns', mouth: 'smile', arms: true, feet: true, mirror: true },
    trueno: { nombre: 'Trueno', body: 'cloud',  color: '#9fa8f0', eyes: 2, top: 'spikes', mouth: 'fangs', arms: true },
    rugido: { nombre: 'Rugido', body: 'blob',   color: '#5fc9b8', eyes: 1, top: 'horns', mouth: 'open', feet: true, spots: true },
    mega:   { nombre: 'Megamonstruo', body: 'tall', color: '#c77ddb', eyes: 3, top: 'crown', mouth: 'teeth', arms: true, feet: true, spots: true }
  };

  function shade(hex, k) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    r = Math.round(r * k); g = Math.round(g * k); b = Math.round(b * k);
    return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
  }

  // cuerpo: devuelve {path, top (y del borde superior en el centro), eyeY, mouthY, half (medio ancho a la altura de los brazos), bottom}
  function bodyShape(kind) {
    switch (kind) {
      case 'cloud': return {
        d: 'M26 98 C12 98 10 78 22 72 C14 58 26 42 40 46 C42 30 62 24 72 36 C84 26 104 36 98 54 C112 58 112 80 98 84 C102 96 90 102 82 98 Z',
        top: 32, eyeY: 60, mouthY: 80, armY: 72, half: 44, bottom: 98 };
      case 'tall': return {
        d: 'M60 18 C84 18 92 32 92 52 L92 92 C92 102 86 106 76 106 L44 106 C34 106 28 102 28 92 L28 52 C28 32 36 18 60 18 Z',
        top: 18, eyeY: 50, mouthY: 78, armY: 72, half: 32, bottom: 106 };
      case 'blob': return {
        d: 'M60 24 C92 22 104 50 102 74 C100 98 82 106 60 106 C38 106 18 98 18 74 C18 48 30 26 60 24 Z',
        top: 24, eyeY: 56, mouthY: 82, armY: 74, half: 42, bottom: 106 };
      case 'drop': return {
        d: 'M60 16 C76 36 98 56 98 78 C98 98 82 106 60 106 C38 106 22 98 22 78 C22 56 44 36 60 16 Z',
        top: 16, eyeY: 62, mouthY: 86, armY: 80, half: 38, bottom: 106 };
      case 'square': return {
        d: 'M34 28 L86 28 C94 28 98 32 98 40 L98 94 C98 102 94 106 86 106 L34 106 C26 106 22 102 22 94 L22 40 C22 32 26 28 34 28 Z',
        top: 28, eyeY: 56, mouthY: 82, armY: 74, half: 38, bottom: 106 };
      default: return {
        d: 'M60 26 C84 26 100 44 100 68 C100 92 84 106 60 106 C36 106 20 92 20 68 C20 44 36 26 60 26 Z',
        top: 26, eyeY: 58, mouthY: 82, armY: 74, half: 40, bottom: 106 };
    }
  }

  function svg(key, opts) {
    opts = opts || {};
    const c = typeof key === 'string' ? CAST[key] : key;
    if (!c) return '';
    const mode = opts.mode || 'color';
    const color = mode === 'linea' ? '#ffffff' : c.color;
    const dark = mode === 'linea' ? '#ffffff' : shade(c.color, 0.82);
    const sw = opts.stroke || 3.2;
    const B = bodyShape(c.body);
    let s = '';
    const st = `stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"`;

    // cola (detrás del cuerpo)
    if (c.tail) {
      s += `<path d="M86 96 C104 102 108 112 98 118 C92 121 86 116 90 112" fill="none" ${st}/>`;
    }
    // patas
    if (c.feet) {
      s += `<ellipse cx="44" cy="${B.bottom + 2}" rx="11" ry="6" fill="${dark}" ${st}/>`;
      s += `<ellipse cx="76" cy="${B.bottom + 2}" rx="11" ry="6" fill="${dark}" ${st}/>`;
    }
    // brazos
    if (c.arms) {
      const y = B.armY, xl = 60 - B.half, xr = 60 + B.half;
      s += `<path d="M${xl + 4} ${y} C${xl - 8} ${y - 2} ${xl - 12} ${y - 12} ${xl - 8} ${y - 18}" fill="none" ${st}/>`;
      s += `<path d="M${xr - 4} ${y} C${xr + 8} ${y - 2} ${xr + 12} ${y - 12} ${xr + 8} ${y - 18}" fill="none" ${st}/>`;
    }
    // adornos de arriba (detrás)
    const t = B.top;
    if (c.top === 'antennae') {
      s += `<path d="M50 ${t + 6} L42 ${t - 10}" ${st} fill="none"/><circle cx="42" cy="${t - 12}" r="5" fill="${dark}" ${st}/>`;
      s += `<path d="M70 ${t + 6} L78 ${t - 10}" ${st} fill="none"/><circle cx="78" cy="${t - 12}" r="5" fill="${dark}" ${st}/>`;
    } else if (c.top === 'horns') {
      s += `<path d="M44 ${t + 10} C38 ${t - 2} 36 ${t - 8} 32 ${t - 12} C42 ${t - 10} 50 ${t - 2} 54 ${t + 6} Z" fill="${dark}" ${st}/>`;
      s += `<path d="M76 ${t + 10} C82 ${t - 2} 84 ${t - 8} 88 ${t - 12} C78 ${t - 10} 70 ${t - 2} 66 ${t + 6} Z" fill="${dark}" ${st}/>`;
    } else if (c.top === 'spikes') {
      s += `<path d="M38 ${t + 12} L44 ${t - 6} L52 ${t + 6} L60 ${t - 10} L68 ${t + 6} L76 ${t - 6} L82 ${t + 12} Z" fill="${dark}" ${st}/>`;
    } else if (c.top === 'tuft') {
      s += `<path d="M60 ${t + 4} C56 ${t - 8} 50 ${t - 12} 44 ${t - 12} M60 ${t + 4} C60 ${t - 10} 62 ${t - 16} 66 ${t - 18} M60 ${t + 4} C64 ${t - 6} 70 ${t - 8} 76 ${t - 6}" fill="none" ${st}/>`;
    } else if (c.top === 'crown') {
      s += `<path d="M42 ${t + 6} L42 ${t - 12} L51 ${t - 4} L60 ${t - 16} L69 ${t - 4} L78 ${t - 12} L78 ${t + 6} Z" fill="${mode === 'linea' ? '#fff' : '#ffd54f'}" ${st}/>`;
    }
    // cuerpo
    s += `<path d="${B.d}" fill="${color}" ${st}/>`;
    // manchas
    if (c.spots) {
      s += `<circle cx="36" cy="${B.mouthY + 4}" r="4" fill="${dark}" stroke="none"/>`;
      s += `<circle cx="86" cy="${B.eyeY + 18}" r="3" fill="${dark}" stroke="none"/>`;
      s += `<circle cx="80" cy="${B.bottom - 10}" r="4.5" fill="${dark}" stroke="none"/>`;
    }
    // ojos
    const ey = B.eyeY;
    const eye = (x, r) => `<circle cx="${x}" cy="${ey}" r="${r}" fill="#fff" ${st}/><circle cx="${x + r * 0.18}" cy="${ey + r * 0.15}" r="${r * 0.48}" fill="${INK}"/><circle cx="${x + r * 0.32}" cy="${ey - r * 0.05}" r="${r * 0.16}" fill="#fff"/>`;
    if (c.eyes === 1) s += eye(60, 15);
    else if (c.eyes === 3) s += eye(42, 9) + eye(60, 11) + eye(78, 9);
    else s += eye(47, 10) + eye(73, 10);
    // cachetes
    if (mode === 'color') {
      s += `<ellipse cx="34" cy="${B.mouthY - 6}" rx="6" ry="3.5" fill="#ff8fa3" opacity="0.75"/><ellipse cx="86" cy="${B.mouthY - 6}" rx="6" ry="3.5" fill="#ff8fa3" opacity="0.75"/>`;
    }
    // boca
    const my = B.mouthY;
    switch (c.mouth) {
      case 'open':
        s += `<path d="M42 ${my - 6} C46 ${my + 14} 74 ${my + 14} 78 ${my - 6} Z" fill="${mode === 'linea' ? '#fff' : '#5a1f2a'}" ${st}/>`;
        s += `<path d="M52 ${my + 5} C56 ${my + 1} 64 ${my + 1} 68 ${my + 5} C64 ${my + 8} 56 ${my + 8} 52 ${my + 5} Z" fill="${mode === 'linea' ? '#fff' : '#ff7a90'}" stroke="none"/>`;
        s += `<path d="M48 ${my - 5} L51 ${my} L54 ${my - 5} M66 ${my - 5} L69 ${my} L72 ${my - 5}" fill="#fff" ${st} stroke-width="${sw * 0.7}"/>`;
        break;
      case 'fangs':
        s += `<path d="M44 ${my - 4} C52 ${my + 6} 68 ${my + 6} 76 ${my - 4}" fill="none" ${st}/>`;
        s += `<path d="M50 ${my - 1} L53 ${my + 7} L56 ${my + 1.5} Z M64 ${my + 1.5} L67 ${my + 7} L70 ${my - 1} Z" fill="#fff" ${st} stroke-width="${sw * 0.7}"/>`;
        break;
      case 'teeth':
        s += `<path d="M44 ${my - 4} C52 ${my + 8} 68 ${my + 8} 76 ${my - 4}" fill="none" ${st}/>`;
        s += `<rect x="54" y="${my + 1}" width="6" height="7" fill="#fff" ${st} stroke-width="${sw * 0.7}"/><rect x="60" y="${my + 1}" width="6" height="7" fill="#fff" ${st} stroke-width="${sw * 0.7}"/>`;
        break;
      case 'zig':
        s += `<path d="M42 ${my} L48 ${my - 5} L54 ${my + 3} L60 ${my - 5} L66 ${my + 3} L72 ${my - 5} L78 ${my}" fill="none" ${st}/>`;
        break;
      case 'grin':
        s += `<path d="M42 ${my - 6} C46 ${my + 10} 74 ${my + 10} 78 ${my - 6} Z" fill="#fff" ${st}/><path d="M43 ${my - 2} L77 ${my - 2}" ${st}/>`;
        break;
      case 'tongue':
        s += `<path d="M46 ${my - 4} C52 ${my + 6} 68 ${my + 6} 74 ${my - 4}" fill="none" ${st}/>`;
        s += `<path d="M58 ${my + 1.5} C58 ${my + 10} 68 ${my + 10} 68 ${my + 0.5}" fill="${mode === 'linea' ? '#fff' : '#ff7a90'}" ${st} stroke-width="${sw * 0.8}"/>`;
        break;
      default:
        s += `<path d="M46 ${my - 4} C52 ${my + 6} 68 ${my + 6} 74 ${my - 4}" fill="none" ${st}/>`;
    }
    const title = opts.title === false ? '' : `<title>${c.nombre || ''}</title>`;
    const flip = c.mirror && opts.flip ? ' transform="translate(120 0) scale(-1 1)"' : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -24 120 150" class="monstruo" role="img" aria-label="${c.nombre || 'monstruo'}">${title}<g${flip}>${s}</g></svg>`;
  }

  root.Monsters = { CAST, svg };
})(typeof window !== 'undefined' ? window : globalThis);
