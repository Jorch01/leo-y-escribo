/* Leo y escribo — juegos en línea (sin servidor, todo se queda en el dispositivo). */
(function () {
  'use strict';
  const C = window.CURRICULUM, G = window.Glyphs, M = window.Monsters, IMG = window.IMG, DIB = window.DIBUJOS || {};
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const app = $('#app');
  const EN_GITHUB = location.hostname.endsWith('github.io') || location.protocol === 'file:' || /^(localhost|127\.)/.test(location.hostname);
  const SITIO = C.SITE;

  // ------------------------------------------------------------ estado
  const S = {
    st: { nivel: 1, estrellas: {}, jefes: {}, voz: true, vel: 0.85 },
    load() { try { const j = JSON.parse(localStorage.getItem('leo-y-escribo') || 'null'); if (j) Object.assign(this.st, j); } catch (e) { /* sin almacenamiento */ } },
    save() { try { localStorage.setItem('leo-y-escribo', JSON.stringify(this.st)); } catch (e) { /* sin almacenamiento */ } }
  };
  S.load();
  const nivel = () => Math.min(8, Math.max(1, S.st.nivel | 0));
  const semana = () => C.WEEKS[nivel() - 1];
  const totalEstrellas = () => Object.values(S.st.estrellas).reduce((a, b) => a + b, 0);
  const META = 20;

  // ------------------------------------------------------------ voz y sonidos
  const Voz = (() => {
    let voz = null;
    const ok = 'speechSynthesis' in window;
    function elegir() {
      if (!ok) return;
      const vs = speechSynthesis.getVoices();
      voz = vs.find(v => /es[-_]MX/i.test(v.lang)) || vs.find(v => /es[-_](US|419)/i.test(v.lang)) || vs.find(v => /^es/i.test(v.lang)) || null;
    }
    if (ok) { elegir(); speechSynthesis.onvoiceschanged = elegir; }
    function di(t, rate, hablado) {
      const g = $('#globo'); if (g && t) g.textContent = t;
      if (!ok || !S.st.voz) return;
      try {
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(hablado || t);
        u.lang = voz ? voz.lang : 'es-MX'; if (voz) u.voice = voz;
        u.rate = rate || S.st.vel; u.pitch = 1.1;
        speechSynthesis.speak(u);
      } catch (e) { /* sin voz */ }
    }
    return { di, ok, nombre: () => (voz ? voz.name : '') };
  })();
  const Sfx = (() => {
    let ctx = null;
    function c() { if (!ctx) { const A = window.AudioContext || window.webkitAudioContext; if (!A) return null; ctx = new A(); } return ctx; }
    function t(f, t0, d, type, vol) {
      const a = c(); if (!a) return;
      const o = a.createOscillator(), g = a.createGain();
      o.type = type || 'triangle'; o.frequency.value = f;
      g.gain.setValueAtTime(vol || 0.14, a.currentTime + t0);
      g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + t0 + d);
      o.connect(g); g.connect(a.destination); o.start(a.currentTime + t0); o.stop(a.currentTime + t0 + d + 0.05);
    }
    return {
      ok() { t(660, 0, 0.12); t(880, 0.1, 0.2); },
      no() { t(220, 0, 0.22, 'sawtooth', 0.05); },
      tap() { t(540, 0, 0.05, 'square', 0.04); },
      nam() { t(170, 0, 0.08, 'square', 0.08); t(130, 0.13, 0.09, 'square', 0.08); },
      gana() { [523, 659, 784, 1046].forEach((f, i) => t(f, i * 0.11, 0.24)); }
    };
  })();

  // ------------------------------------------------------------ utilidades visuales
  const mon = (k, mode) => M.svg(k, { mode: mode || 'color' });
  function pic(word, alt) {
    const h = IMG[word]; const svg = h && DIB[h];
    const src = svg ? 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) : '';
    return `<img src="${src}" alt="${alt === false ? '' : word}" draggable="false">`;
  }
  const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2l2.9 6.6 7.1.7-5.4 4.8 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.5l7.1-.7z" fill="#ffcf3f" stroke="#1a1a1a" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  const ROT = { '↑': 0, '→': 90, '↓': 180, '←': 270 };
  const flecha = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true"><g transform="rotate(${ROT[d]} 12 12)"><path d="M12 2 L21 12 L15.5 12 L15.5 22 L8.5 22 L8.5 12 L3 12 Z" fill="#1a1a1a"/></g></svg>`;
  const rnd = (n) => Math.floor(Math.random() * n);
  const pick = (a) => a[rnd(a.length)];
  const mezcla = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = rnd(i + 1); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // sílabas (misma regla que el cuaderno)
  const VOC = 'aeiouáéíóúü', FUERTE = 'aeoáéóíú', INSEP = ['pl', 'bl', 'cl', 'gl', 'fl', 'pr', 'br', 'tr', 'dr', 'cr', 'gr', 'fr'];
  function silabear(w) {
    const lw = w.toLowerCase(), u = []; let i = 0;
    while (i < lw.length) { const two = lw.slice(i, i + 2); if (['ch', 'll', 'rr'].includes(two) || ((two === 'qu' || two === 'gu') && 'eiéí'.includes(lw[i + 2] || ''))) { u.push(w.slice(i, i + 2)); i += 2; } else { u.push(w[i]); i++; } }
    const esV = (x) => x.length === 1 && VOC.includes(x.toLowerCase());
    const nuc = []; i = 0;
    while (i < u.length) { if (esV(u[i])) { let j = i + 1; while (j < u.length && esV(u[j]) && !(FUERTE.includes(u[j - 1].toLowerCase()) && FUERTE.includes(u[j].toLowerCase()))) j++; nuc.push([i, j]); i = j; } else i++; }
    if (nuc.length <= 1) return [w];
    const cuts = [];
    for (let k = 1; k < nuc.length; k++) { const s = nuc[k - 1][1], e = nuc[k][0], n = e - s; cuts.push(n === 0 ? e : n === 1 ? s : n === 2 ? (INSEP.includes((u[s] + u[s + 1]).toLowerCase()) ? s : s + 1) : (INSEP.includes((u[e - 2] + u[e - 1]).toLowerCase()) ? e - 2 : e - 1)); }
    const out = []; let p = 0; cuts.forEach(c => { out.push(u.slice(p, c).join('')); p = c; }); out.push(u.slice(p).join(''));
    return out;
  }
  const silHTML = (w) => silabear(w).map((s, i) => `<span class="sil${i % 2 ? ' alt' : ''}">${esc(s)}</span>`).join('');

  // ------------------------------------------------------------ contenidos por nivel
  function consNuevas(n) { const a = C.CONSONANTES[n] || [], b = C.CONSONANTES[n - 1] || []; return a.filter(x => !b.includes(x)); }
  function silabasNivel(n) { return consNuevas(n).flatMap(c => C.silabasDe(c)); }
  function silabasHasta(n) { return (C.CONSONANTES[n] || []).flatMap(c => C.silabasDe(c)); }
  function palabrasHasta(n) { const out = []; for (let i = 1; i <= n; i++) (C.JUEGO_PALABRAS[i] || []).forEach(p => { if (IMG[p] && !out.includes(p)) out.push(p); }); return out; }
  function palabrasPreferidas(n) { const nuevas = (C.JUEGO_PALABRAS[n] || []).filter(p => IMG[p]); const todas = palabrasHasta(n); return Math.random() < 0.65 && nuevas.length ? pick(nuevas) : pick(todas); }
  const TRAZOS1 = ['palo', 'palito', 'acostada', 'cruz', 'bolita', 'puente', 'taza', 'pico', 'baja', 'raiz'];
  function letrasTraza(n) { if (n === 1) return TRAZOS1; if (n === 8) return ['sol', 'oso', 'mamá', 'papá', 'luna', 'gato', 'Ana']; return C.WEEKS[n - 1].letrasEscribo; }

  // ------------------------------------------------------------ estrellas y celebración
  function ganaEstrella(desde) {
    const n = nivel();
    S.st.estrellas[n] = (S.st.estrellas[n] || 0) + 1; S.save();
    const star = document.createElement('div'); star.className = 'estrella-vuela'; star.innerHTML = STAR;
    const r = desde ? desde.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
    const meta = $('#hud-estrellas').getBoundingClientRect();
    star.style.left = (r.left + r.width / 2 - 27) + 'px'; star.style.top = (r.top + r.height / 2 - 27) + 'px';
    star.style.setProperty('--dx', (meta.left - r.left - r.width / 2 + 20) + 'px'); star.style.setProperty('--dy', (meta.top - r.top - r.height / 2 + 6) + 'px');
    document.body.appendChild(star); setTimeout(() => star.remove(), 1100);
    setTimeout(hud, 900);
    if ((S.st.estrellas[n] || 0) === META) setTimeout(() => { Sfx.gana(); confeti(); Voz.di(`¡Llenaste la barra del nivel ${n}! Ya puedes pelear contra ${M.CAST[semana().jefe].nombre} en tu cuaderno.`); }, 1000);
  }
  function confeti() {
    const cols = ['#ffcf3f', '#86d97f', '#8ec5ff', '#ff8a80', '#b99cff'];
    for (let i = 0; i < 40; i++) {
      const c = document.createElement('div'); c.className = 'confeti';
      c.style.left = Math.random() * 100 + 'vw'; c.style.background = pick(cols); c.style.animationDelay = Math.random() * 0.5 + 's';
      document.body.appendChild(c); setTimeout(() => c.remove(), 2400);
    }
  }

  // ------------------------------------------------------------ modales
  function modal(html, alAbrir) {
    const v = document.createElement('div'); v.className = 'velo'; v.innerHTML = `<div class="tarjeta" role="dialog" aria-modal="true">${html}</div>`;
    document.body.appendChild(v);
    const cerrar = () => v.remove();
    v.addEventListener('click', (e) => { if (e.target === v || e.target.closest('[data-cerrar]')) cerrar(); });
    if (alAbrir) alAbrir(v, cerrar);
    return cerrar;
  }
  function puertaPapas(titulo, siOk) {
    const a = 3 + rnd(6), b = 4 + rnd(6);
    modal(`<h3>${esc(titulo)}</h3><p>Solo para papás: ¿cuánto es ${a} + ${b}?</p><form id="pp"><input id="pp-r" inputmode="numeric" autocomplete="off" aria-label="Respuesta"><div class="fila-btns"><button type="button" class="btn" data-cerrar>Cancelar</button><button class="btn verde">Aceptar</button></div></form>`, (v, cerrar) => {
      const inp = $('#pp-r', v); setTimeout(() => inp.focus(), 50);
      $('#pp', v).addEventListener('submit', (e) => { e.preventDefault(); if (parseInt(inp.value, 10) === a + b) { cerrar(); siOk(); } else { inp.value = ''; inp.classList.add('sacude'); setTimeout(() => inp.classList.remove('sacude'), 400); } });
    });
  }
  function elegirNivel() {
    const items = C.WEEKS.map(w => `<button class="btn${w.n === nivel() ? ' sol' : ''}" data-n="${w.n}" style="justify-content:flex-start;width:100%"><span style="width:34px;height:40px;display:inline-block">${mon(w.jefe)}</span>Nivel ${w.n} · ${esc(w.titulo)}</button>`).join('');
    modal(`<h3>¿En qué nivel vas?</h3><p>Es la semana del cuaderno en la que van.</p><div style="display:grid;gap:8px;max-height:60vh;overflow:auto;padding:4px 4px 8px">${items}</div><button class="btn" data-cerrar style="margin-top:8px">Cerrar</button>`, (v, cerrar) => {
      $$('[data-n]', v).forEach(b => b.addEventListener('click', () => { S.st.nivel = +b.dataset.n; S.save(); cerrar(); hud(); render(); }));
    });
  }

  // ------------------------------------------------------------ barra
  function hud() {
    $('#hud').innerHTML = `<button class="pill nivel" id="hud-nivel" aria-label="Cambiar nivel">Nivel ${nivel()}</button><span class="pill" id="hud-estrellas" aria-label="Estrellas">${STAR}${totalEstrellas()}</span>`;
    $('#hud-nivel').addEventListener('click', elegirNivel);
    $('#logo-m').innerHTML = mon(semana().jefe);
  }

  // ------------------------------------------------------------ juegos
  const JUEGOS = [
    { id: 'donde', mision: 'espacio', titulo: '¿Dónde está?', desc: 'Arriba, abajo, izquierda y derecha', m: 'nubo', desde: 1 },
    { id: 'flechas', mision: 'espacio', titulo: 'Código de flechas', desc: 'Lleva al monstruo a su comida', m: 'bombo', desde: 1 },
    { id: 'traza', mision: 'escribo', titulo: 'Traza letras', desc: 'Con el dedo, sin salirte de la pauta', m: 'pasti', desde: 1 },
    { id: 'tobogan', mision: 'leo', titulo: 'Tobogán de sonidos', desc: 'La letra resbala hasta la vocal', m: 'topi', desde: 1 },
    { id: 'nam', mision: 'leo', titulo: 'Dale de comer a Ñam', desc: 'Escucha y busca la sílaba', m: 'nam', desde: 1 },
    { id: 'lee', mision: 'leo', titulo: 'Lee y elige', desc: 'Lee la palabra y toca su dibujo', m: 'chispa', desde: 1 },
    { id: 'arma', mision: 'leo', titulo: 'Arma la palabra', desc: 'Pon las sílabas en orden', m: 'zigzag', desde: 2 }
  ];
  let limpiar = [];
  const later = (fn, ms) => { const t = setTimeout(() => { try { fn(); } catch (e) { /* la vista ya cambió */ } }, ms); limpiar.push(() => clearTimeout(t)); return t; };
  function cabJuego(titulo) {
    return `<div class="cab-juego"><a class="btn" href="#mapa">← Mapa</a><h2>${esc(titulo)}</h2></div>`;
  }
  function indicacion(m) { return `<div class="indicacion"><div class="m">${mon(m)}</div><div class="globo" id="globo" aria-live="polite"></div></div>`; }

  // ---------- mapa (inicio)
  function vistaMapa() {
    const w = semana(), n = nivel(), est = S.st.estrellas[n] || 0;
    const nodos = C.WEEKS.map(wk => {
      const vencido = !!S.st.jefes[wk.n];
      return `<button class="nodo${wk.n === n ? ' on' : ''}${vencido ? '' : ' bloq'}" data-n="${wk.n}" aria-label="Nivel ${wk.n}"><span class="c">${mon(wk.jefe)}${vencido ? '<span class="v">✓</span>' : ''}</span><span class="n">${wk.n}</span></button>`;
    }).join('');
    const tarjetas = (mis) => JUEGOS.filter(j => j.mision === mis).map(j => {
      const bloq = n < j.desde;
      return `<button class="tarjeta juego${bloq ? ' bloq' : ''}" data-j="${j.id}"><span class="ic">${mon(j.m)}</span><span><b>${esc(j.titulo)}</b><small>${bloq ? `Se desbloquea en el nivel ${j.desde}` : esc(j.desc)}</small></span></button>`;
    }).join('');
    app.innerHTML = `
      <section class="hola">
        <div><h1>¡A jugar con los monstruos!</h1><p>Cada juego te da estrellas. Llena la barra y luego vence al jefe en tu cuaderno.</p>
          <div class="trio"><div>${mon('nubo')}</div><div>${mon('pasti')}</div><div>${mon('topi')}</div></div></div>
        <div class="tarjeta nivel-actual"><div class="boss">${mon(w.jefe)}</div><div>
          <div class="eti">Nivel ${n} · Jefe: ${M.CAST[w.jefe].nombre}</div><h2>${esc(w.titulo)}</h2>
          <div class="xp" role="img" aria-label="${Math.min(est, META)} de ${META} estrellas"><i style="width:${Math.min(100, est / META * 100)}%"></i><b>${Math.min(est, META)} / ${META} ⭐</b></div>
          <div class="acciones"><button class="btn sol" id="cambiar">Cambiar nivel</button><button class="btn morado" id="vencer">${S.st.jefes[n] ? '¡Jefe vencido!' : '¡Vencí al jefe!'}</button></div>
        </div></div>
      </section>
      <div class="tarjeta camino" aria-label="Mapa de niveles">${nodos}</div>
      <section class="seccion"><h3><span class="chip espacio">Misión 1 · Espacio</span></h3><div class="juegos">${tarjetas('espacio')}</div></section>
      <section class="seccion"><h3><span class="chip escribo">Misión 2 · Escribo</span></h3><div class="juegos">${tarjetas('escribo')}</div></section>
      <section class="seccion"><h3><span class="chip leo">Misión 3 · Leo</span></h3><div class="juegos">${tarjetas('leo')}</div></section>`;
    $('#cambiar').addEventListener('click', elegirNivel);
    $('#vencer').addEventListener('click', () => puertaPapas(`¿Venció a ${M.CAST[w.jefe].nombre}?`, () => {
      S.st.jefes[n] = true; S.save(); Sfx.gana(); confeti();
      Voz.di(`¡Venciste a ${M.CAST[w.jefe].nombre}! Ya está en tu colección.`);
      modal(`<div style="width:140px;margin:0 auto">${mon(w.jefe)}</div><h3>¡Venciste a ${M.CAST[w.jefe].nombre}!</h3><p>Ya está en tu colección de monstruos.</p><div class="fila-btns">${n < 8 ? `<button class="btn verde" id="sig">Ir al nivel ${n + 1}</button>` : ''}<button class="btn" data-cerrar>Seguir aquí</button></div>`, (v, cerrar) => {
        const s = $('#sig', v); if (s) s.addEventListener('click', () => { S.st.nivel = n + 1; S.save(); cerrar(); hud(); render(); });
      });
      render();
    }));
    $$('.nodo').forEach(b => b.addEventListener('click', () => { S.st.nivel = +b.dataset.n; S.save(); hud(); render(); }));
    $$('.juego').forEach(b => b.addEventListener('click', () => {
      const j = JUEGOS.find(x => x.id === b.dataset.j);
      if (nivel() < j.desde) { Voz.di(`Este juego se desbloquea en el nivel ${j.desde}.`); b.classList.add('sacude'); setTimeout(() => b.classList.remove('sacude'), 400); return; }
      location.hash = j.id;
    }));
  }

  // ---------- ¿Dónde está?
  function vistaDonde() {
    const n = nivel();
    const dirs = n === 1 ? ['arriba', 'abajo'] : ['arriba', 'abajo', 'izquierda', 'derecha'];
    const comidas = [['galleta', 'la'], ['manzana', 'la'], ['pastel', 'el'], ['helado', 'el'], ['dulce', 'el'], ['pizza', 'la'], ['plátano', 'el']];
    const amigos = ['pasti', 'nubo', 'topi', 'nam', 'chispa', 'bombo'];
    const celda = { arriba: 1, abajo: 7, izquierda: 3, derecha: 5 };
    const frase = { arriba: 'arriba', abajo: 'abajo', izquierda: 'a la izquierda', derecha: 'a la derecha' };
    const ico = { arriba: '↑', abajo: '↓', izquierda: '←', derecha: '→' };
    app.innerHTML = cabJuego('¿Dónde está?') + `<div class="tarjeta escenario">${indicacion('nubo')}<div class="cuadro3" id="c"></div>
      <div class="flechas4">${dirs.map(d => `<button class="btn grande" data-d="${d}">${flecha(ico[d])}${d.toUpperCase()}${d === 'derecha' ? ' <small style="font-size:.7em">(pulsera)</small>' : ''}</button>`).join('')}</div>
      <div class="fila-btns"><button class="btn" id="rep">🔊 Repetir</button></div></div>`;
    let actual = null, bloqueado = false;
    function nueva() {
      bloqueado = false;
      const d = pick(dirs), [com, art] = pick(comidas), am = pick(amigos);
      actual = { d, com, art, am };
      const cells = new Array(9).fill('');
      cells[4] = mon(am); cells[celda[d]] = pic(com);
      $('#c').innerHTML = cells.map(x => `<div>${x}</div>`).join('');
      pregunta();
    }
    function pregunta() {
      const nom = M.CAST[actual.am].nombre;
      Voz.di(n === 1 ? `¿Dónde está ${actual.art} ${actual.com}? ¿Arriba o abajo de ${nom}?` : `¿Dónde está ${actual.art} ${actual.com}? ¿Arriba, abajo, a la izquierda o a la derecha de ${nom}?`);
    }
    $$('[data-d]').forEach(b => b.addEventListener('click', () => {
      if (bloqueado) return;
      if (b.dataset.d === actual.d) {
        bloqueado = true; Sfx.ok(); ganaEstrella(b);
        Voz.di(`¡Sí! Está ${frase[actual.d]} de ${M.CAST[actual.am].nombre}.`);
        $$('#c div')[celda[actual.d]].classList.add('salta');
        later(nueva, 2200);
      } else { Sfx.no(); b.classList.add('sacude'); later(() => b.classList.remove('sacude'), 400); Voz.di('Mmm... mira otra vez.'); }
    }));
    $('#rep').addEventListener('click', pregunta);
    nueva();
  }

  // ---------- Código de flechas
  function vistaFlechas() {
    const n = nivel();
    const N = n <= 2 ? 4 : (n <= 5 ? 5 : 6), maxP = n <= 2 ? 3 : (n <= 5 ? 5 : 7);
    const teclas = n === 1 ? ['↑', '↓'] : ['↑', '←', '↓', '→'];
    const premios = ['galleta', 'manzana', 'pastel', 'helado', 'pizza', 'dulce', 'tesoro'];
    app.innerHTML = cabJuego('Código de flechas') + `<div class="tarjeta escenario">${indicacion('bombo')}
      <div class="tablero" id="t" style="grid-template-columns:repeat(${N},1fr);position:relative"></div>
      <div class="codigo" id="cod" aria-label="Código"></div>
      <div class="teclas">${teclas.map(d => `<button class="btn azul" data-k="${d}" aria-label="Flecha">${flecha(d)}</button>`).join('')}<button class="btn" id="borra" aria-label="Borrar">⌫</button></div>
      <div class="fila-btns"><button class="btn verde grande" id="vamos">▶ ¡Vamos!</button><button class="btn" id="otro">Otro tablero</button></div></div>`;
    let ini, meta, pos, codigo = [], corriendo = false;
    const t = $('#t');
    function colocar(el, p) { el.style.left = (p[0] * 100 / N) + '%'; el.style.top = (p[1] * 100 / N) + '%'; }
    function nuevo() {
      codigo = []; corriendo = false;
      for (let k = 0; k < 200; k++) {
        ini = [rnd(N), rnd(N)];
        meta = n === 1 ? [ini[0], rnd(N)] : (n === 2 && Math.random() < 0.5 ? [rnd(N), ini[1]] : (n === 2 ? [ini[0], rnd(N)] : [rnd(N), rnd(N)]));
        const dist = Math.abs(meta[0] - ini[0]) + Math.abs(meta[1] - ini[1]);
        if (dist >= 2 && dist <= maxP) break;
      }
      pos = ini.slice();
      t.innerHTML = new Array(N * N).fill('<div></div>').join('') + `<span class="ficha" id="premio" style="width:${100 / N}%;height:${100 / N}%;inset:auto;display:grid;place-items:center">${pic(pick(premios))}</span><span class="ficha" id="mon" style="width:${100 / N}%;height:${100 / N}%;inset:auto;transition:left .3s,top .3s">${mon('bombo')}</span>`;
      ['premio', 'mon'].forEach(id => { const e = $('#' + id); e.style.position = 'absolute'; });
      colocar($('#premio'), meta); colocar($('#mon'), pos);
      pintar();
      Voz.di('Lleva a Bombo a su comida. Toca las flechas para hacer el código y luego, ¡vamos!');
    }
    function pintar(act) { $('#cod').innerHTML = codigo.length ? codigo.map((d, i) => `<span class="${i === act ? 'activa' : ''}">${flecha(d)}</span>`).join('') : '<em style="align-self:center;color:#5b6472">Tu código aparece aquí</em>'; }
    $$('[data-k]').forEach(b => b.addEventListener('click', () => { if (corriendo || codigo.length >= 12) return; Sfx.tap(); codigo.push(b.dataset.k); pintar(); }));
    $('#borra').addEventListener('click', () => { if (corriendo) return; codigo.pop(); pintar(); });
    $('#otro').addEventListener('click', nuevo);
    $('#vamos').addEventListener('click', () => {
      if (corriendo || !codigo.length) { if (!codigo.length) Voz.di('Primero haz tu código con las flechas.'); return; }
      corriendo = true; pos = ini.slice(); colocar($('#mon'), pos);
      let i = 0;
      const paso = () => {
        if (i >= codigo.length) {
          if (pos[0] === meta[0] && pos[1] === meta[1]) { Sfx.gana(); ganaEstrella($('#mon')); Voz.di('¡Lo lograste! ¡Ñam!'); later(nuevo, 2200); }
          else { Sfx.no(); Voz.di('Casi. Cambia tu código y vuelve a intentar.'); corriendo = false; later(() => { pos = ini.slice(); colocar($('#mon'), pos); pintar(); }, 900); }
          return;
        }
        const d = codigo[i], q = pos.slice();
        if (d === '→') q[0]++; if (d === '←') q[0]--; if (d === '↓') q[1]++; if (d === '↑') q[1]--;
        pintar(i);
        if (q[0] < 0 || q[1] < 0 || q[0] >= N || q[1] >= N) { Sfx.no(); $('#mon').classList.add('sacude'); Voz.di('¡Uy! Se salió del tablero.'); corriendo = false; later(() => { $('#mon').classList.remove('sacude'); pos = ini.slice(); colocar($('#mon'), pos); pintar(); }, 900); return; }
        pos = q; colocar($('#mon'), pos); Sfx.tap(); i++;
        later(paso, 420);
      };
      paso();
    });
    nuevo();
  }

  // ---------- Traza letras
  function vistaTraza() {
    const n = nivel(), lista = letrasTraza(n);
    const etiqueta = (x) => G.P[x] ? G.P[x].name : x;
    app.innerHTML = cabJuego('Traza letras') + `<div class="tarjeta escenario">${indicacion('pasti')}
      <div class="selector" id="sel">${lista.map((x, i) => `<button data-i="${i}" style="${G.P[x] ? 'font-family:var(--f-titulo);font-size:1rem' : ''}">${esc(etiqueta(x))}</button>`).join('')}</div>
      <div class="lienzo-traza"><canvas id="cv" aria-label="Zona para trazar"></canvas></div>
      <div class="fila-btns"><button class="btn sol" id="ver">👀 Ver cómo se hace</button><button class="btn" id="borrar">Borrar</button><button class="btn verde" id="sig">Siguiente ▶</button></div></div>`;
    const cv = $('#cv'), ctx = cv.getContext('2d');
    let idx = 0, g, W, H, u, ox, oy, trazos = [], actual = null, ganado = false, anim = null;
    function medir() {
      const box = cv.parentElement.getBoundingClientRect();
      W = Math.max(280, box.width); H = Math.round(W * 0.62);
      const dpr = window.devicePixelRatio || 1;
      cv.width = W * dpr; cv.height = H * dpr; cv.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const L = G.layout(lista[idx], 0.32);
      g = L; u = Math.min(H / 3.5, (W * 0.84) / Math.max(1, L.w));
      ox = (W - L.w * u) / 2; oy = (H - 3 * u) / 2;
      dibujar();
    }
    const P = (p) => [ox + p[0] * u, oy + p[1] * u];
    function guiaTrazos() { const out = []; g.items.forEach(it => it.g.strokes.forEach(st => { out.push(st.dot ? { dot: [st.dot[0] + it.x, st.dot[1]] } : { pts: st.pts.map(p => [p[0] + it.x, p[1]]) }); })); return out; }
    function dibujar(progreso) {
      ctx.clearRect(0, 0, W, H);
      const zonas = [['#d6e9fb', 0], ['#d5f0c9', 1], ['#efe1cc', 2]];
      zonas.forEach(([c, k]) => { ctx.fillStyle = c; ctx.fillRect(0, oy + k * u, W, u); });
      ctx.fillStyle = '#d6e9fb'; ctx.fillRect(0, 0, W, oy);
      ctx.fillStyle = '#efe1cc'; ctx.fillRect(0, oy + 3 * u, W, H);
      const linea = (y, c, w, dash) => { ctx.beginPath(); ctx.setLineDash(dash || []); ctx.strokeStyle = c; ctx.lineWidth = w; ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); };
      linea(oy, '#1d5fa8', 2); linea(oy + u, '#1d5fa8', 1.5, [10, 8]); linea(oy + 2 * u, '#2e7d32', 4); linea(oy + 3 * u, '#7a4e2a', 2);
      ctx.setLineDash([]);
      const gt = guiaTrazos();
      // guía punteada
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      gt.forEach(st => {
        if (st.dot) { const [x, y] = P(st.dot); ctx.beginPath(); ctx.arc(x, y, u * 0.09, 0, 7); ctx.strokeStyle = '#555'; ctx.lineWidth = 2; ctx.stroke(); return; }
        ctx.beginPath(); ctx.setLineDash([0.1, u * 0.2]); ctx.strokeStyle = '#555'; ctx.lineWidth = Math.max(4, u * 0.08);
        st.pts.forEach((p, i) => { const [x, y] = P(p); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
      });
      ctx.setLineDash([]);
      // modelo animado
      if (progreso) {
        ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = u * 0.14;
        progreso.forEach(({ pts }) => { ctx.beginPath(); pts.forEach((p, i) => { const [x, y] = P(p); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke(); });
      }
      // puntos de inicio con número
      gt.forEach((st, i) => {
        const p0 = st.dot ? st.dot : st.pts[0]; const [x, y] = P(p0);
        ctx.beginPath(); ctx.arc(x, y, Math.max(11, u * 0.14), 0, 7); ctx.fillStyle = '#1b7f3b'; ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = `700 ${Math.max(13, u * 0.17)}px Fredoka, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(i + 1), x, y + 1);
      });
      // tinta del niño
      ctx.strokeStyle = '#6a3fb5'; ctx.lineWidth = Math.max(8, u * 0.13);
      trazos.concat(actual ? [actual] : []).forEach(tr => { ctx.beginPath(); tr.forEach((p, i) => { const [x, y] = P(p); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); if (tr.length === 1) { const [x, y] = P(tr[0]); ctx.lineTo(x + 0.1, y); } ctx.stroke(); });
    }
    function aUnidades(e) { const r = cv.getBoundingClientRect(); return [((e.clientX - r.left) * (W / r.width) - ox) / u, ((e.clientY - r.top) * (H / r.height) - oy) / u]; }
    cv.addEventListener('pointerdown', (e) => { e.preventDefault(); if (anim) return; cv.setPointerCapture(e.pointerId); actual = [aUnidades(e)]; dibujar(); });
    cv.addEventListener('pointermove', (e) => { if (!actual) return; e.preventDefault(); actual.push(aUnidades(e)); dibujar(); });
    const fin = () => { if (!actual) return; trazos.push(actual); actual = null; dibujar(); evaluar(); };
    cv.addEventListener('pointerup', fin); cv.addEventListener('pointercancel', fin);
    function muestras() {
      const out = [];
      guiaTrazos().forEach(st => {
        if (st.dot) { out.push(st.dot); return; }
        for (let i = 1; i < st.pts.length; i++) { const a = st.pts[i - 1], b = st.pts[i], d = Math.hypot(b[0] - a[0], b[1] - a[1]), k = Math.max(1, Math.ceil(d / 0.08)); for (let j = 0; j < k; j++) out.push([a[0] + (b[0] - a[0]) * j / k, a[1] + (b[1] - a[1]) * j / k]); }
      });
      return out;
    }
    function evaluar() {
      if (ganado) return;
      const gm = muestras(), um = trazos.flat();
      if (!um.length) return;
      const cerca = (p, arr, r) => arr.some(q => Math.hypot(p[0] - q[0], p[1] - q[1]) < r);
      const cov = gm.filter(p => cerca(p, um, 0.3)).length / gm.length;
      const prec = um.filter(p => cerca(p, gm, 0.45)).length / um.length;
      if (cov >= 0.85 && prec >= 0.7) { ganado = true; Sfx.gana(); ganaEstrella(cv); Voz.di(pick(['¡Excelente trazo!', '¡Muy bien, sin salirte!', '¡Qué bonita te quedó!'])); }
      else if (trazos.length >= guiaTrazos().length + 2) Voz.di(prec < 0.7 ? 'Intenta ir encima de los puntitos.' : 'Te falta un pedacito. ¡Sigue los puntitos!');
    }
    function cargar(i) {
      idx = (i + lista.length) % lista.length; trazos = []; ganado = false;
      $$('#sel button').forEach((b, k) => b.classList.toggle('on', k === idx));
      medir();
      const x = lista[idx], z = G.get(x) ? G.get(x).zone : 'pasto';
      const txt = G.P[x] ? `Traza el ${etiqueta(x)}. Empieza en el punto verde.` : (x.length > 1 ? `Escribe ${x}. Empieza en el punto verde.` : `Traza la ${x}. ${z === 'cielo' ? 'Es letra de cielo: toca la línea azul.' : z === 'tierra' ? 'Tiene colita: baja a la tierra.' : 'Es letra de pasto: no sale del pasto.'}`);
      Voz.di(txt, null, txt.replace(/^Traza la \S+\. /, 'Traza esta letra. '));
    }
    function verComo() {
      if (anim) return;
      const gt = guiaTrazos().filter(s => s.pts); let si = 0, t0 = performance.now(); const hechos = [];
      trazos = [];
      const paso = (now) => {
        if (si >= gt.length) { anim = null; dibujar(hechos); later(() => dibujar(), 900); return; }
        const pts = gt[si].pts, k = Math.min(1, (now - t0) / 900), m = Math.max(2, Math.ceil(pts.length * k));
        dibujar(hechos.concat([{ pts: pts.slice(0, m) }]));
        if (k >= 1) { hechos.push({ pts }); si++; t0 = now + 200; }
        anim = requestAnimationFrame(paso);
      };
      anim = requestAnimationFrame(paso);
      limpiar.push(() => { if (anim) cancelAnimationFrame(anim); anim = null; });
    }
    $$('#sel button').forEach(b => b.addEventListener('click', () => cargar(+b.dataset.i)));
    $('#borrar').addEventListener('click', () => { trazos = []; ganado = false; dibujar(); });
    $('#sig').addEventListener('click', () => cargar(idx + 1));
    $('#ver').addEventListener('click', verComo);
    const onR = () => medir(); window.addEventListener('resize', onR); limpiar.push(() => window.removeEventListener('resize', onR));
    cargar(0);
  }

  // ---------- Tobogán de sonidos
  function vistaTobogan() {
    const n = nivel(), sils = silabasNivel(n).length ? silabasNivel(n) : silabasHasta(n);
    app.innerHTML = cabJuego('Tobogán de sonidos') + `<div class="tarjeta escenario">${indicacion('topi')}
      <div class="tobo"><svg viewBox="0 0 320 200" id="tb">
        <rect x="18" y="64" width="86" height="10" rx="5" fill="#7a4e2a"/><rect x="24" y="74" width="8" height="110" fill="#7a4e2a"/><rect x="90" y="74" width="8" height="110" fill="#7a4e2a"/>
        <path id="rampa" d="M104 68 C 160 68, 170 168, 250 168" fill="none" stroke="#2e7d32" stroke-width="16" stroke-linecap="round"/>
        <path d="M104 68 C 160 68, 170 168, 250 168" fill="none" stroke="#86d97f" stroke-width="6" stroke-dasharray="8 8" stroke-linecap="round"/>
        <rect x="0" y="186" width="320" height="14" fill="#c9996b"/>
        <text id="voc" x="282" y="180" font-family="Andika" font-size="58" text-anchor="middle" font-weight="700">a</text>
        <text id="con" x="61" y="56" font-family="Andika" font-size="58" text-anchor="middle" font-weight="700" fill="#6a3fb5">m</text>
      </svg></div>
      <div class="resultado" id="res" aria-live="polite"></div>
      <div class="fila-btns"><button class="btn verde grande" id="resb">¡Resbala!</button><button class="btn" id="oir">🔊 Oír</button><button class="btn" id="sig">Siguiente ▶</button></div></div>`;
    let i = 0, sil = '', hecho = false, raf = null;
    const partes = (s) => { const m = s.match(/^(ll|ch|rr|[^aeiouáéíóú]*)(.*)$/i); return [m[1], m[2]]; };
    function cargar() {
      sil = sils[i % sils.length]; const [c, v] = partes(sil); hecho = false;
      $('#con').textContent = c; $('#voc').textContent = v; $('#con').setAttribute('x', 61); $('#con').setAttribute('y', 56); $('#con').style.opacity = 1; $('#voc').style.opacity = 1;
      $('#res').textContent = '';
      const son = C.SONIDOS[c];
      Voz.di(son ? `Pon tu dedo en la ${c}. Suena ${son.replace(/"/g, '')}. ¡Resbala hasta la ${v}!` : `¡Resbala hasta la ${v}!`, null, `Pon tu dedo en la letra de arriba y di su sonido. ¡Ahora resbala hasta la ${v}!`);
    }
    function resbalar() {
      if (raf) return;
      const path = $('#rampa'), L = path.getTotalLength(), con = $('#con'); let t0 = null;
      const paso = (now) => {
        if (!t0) t0 = now; const k = Math.min(1, (now - t0) / 1300);
        const p = path.getPointAtLength(L * k);
        con.setAttribute('x', p.x); con.setAttribute('y', p.y - 10);
        if (k < 1) raf = requestAnimationFrame(paso);
        else { raf = null; con.style.opacity = 0; $('#voc').style.opacity = 0.25; $('#res').textContent = sil; $('#res').classList.add('salta'); later(() => $('#res').classList.remove('salta'), 600); Voz.di(sil, 0.7); if (!hecho) { hecho = true; Sfx.ok(); ganaEstrella($('#res')); } }
      };
      raf = requestAnimationFrame(paso);
      limpiar.push(() => { if (raf) cancelAnimationFrame(raf); raf = null; });
    }
    $('#resb').addEventListener('click', resbalar);
    $('#oir').addEventListener('click', () => Voz.di(sil, 0.7));
    $('#sig').addEventListener('click', () => { i++; cargar(); });
    cargar();
  }

  // ---------- Dale de comer a Ñam
  function vistaNam() {
    const n = nivel(), nuevas = silabasNivel(n), todas = silabasHasta(n);
    app.innerHTML = cabJuego('Dale de comer a Ñam') + `<div class="tarjeta escenario">${indicacion('nam')}
      <div class="nam-zona"><div class="nam-m" id="nm">${mon('nam')}</div><div class="galletas" id="gs"></div></div>
      <div class="fila-btns"><button class="btn" id="rep">🔊 Repetir</button></div></div>`;
    let meta = '', bloq = false;
    const partes = (s) => { const m = s.match(/^(ll|ch|rr|[^aeiouáéíóú]*)(.*)$/i); return [m[1], m[2]]; };
    function nueva() {
      bloq = false;
      meta = (nuevas.length && Math.random() < 0.65) ? pick(nuevas) : pick(todas);
      const [c, v] = partes(meta);
      const mismaC = todas.filter(s => s !== meta && partes(s)[0] === c), mismaV = todas.filter(s => s !== meta && partes(s)[1] === v);
      const ops = [meta];
      if (mismaC.length) ops.push(pick(mismaC));
      if (mismaV.length) ops.push(pick(mismaV.filter(s => !ops.includes(s))) || pick(todas.filter(s => !ops.includes(s))));
      while (ops.length < 3) { const s = pick(todas.filter(x => !ops.includes(x))); if (!s) break; ops.push(s); }
      $('#gs').innerHTML = mezcla(ops.filter(Boolean)).map(s => `<button class="galleta" data-s="${esc(s)}"><span>${esc(s)}</span></button>`).join('');
      $$('.galleta').forEach(b => b.addEventListener('click', () => comer(b)));
      pedir();
    }
    function pedir() { Voz.di(`¡Tengo hambre! Quiero la galleta que dice: ${meta}. ¡${meta}!`, 0.8); }
    function comer(b) {
      if (bloq) return;
      if (b.dataset.s === meta) {
        bloq = true; b.classList.add('vuela'); Sfx.nam(); $('#nm').classList.add('come');
        later(() => $('#nm').classList.remove('come'), 300);
        ganaEstrella($('#nm')); Voz.di(pick(['¡Ñam, ñam! ¡Qué rico!', '¡Delicioso! Gracias.', '¡Ñam! ¡Esa era!']));
        later(nueva, 2000);
      } else { Sfx.no(); b.classList.add('sacude'); later(() => b.classList.remove('sacude'), 400); Voz.di(`¡Guácala! Esa dice ${b.dataset.s}. Yo quiero ${meta}.`, 0.8); }
    }
    $('#rep').addEventListener('click', pedir);
    nueva();
  }

  // ---------- Lee y elige
  function vistaLee() {
    const n = nivel();
    app.innerHTML = cabJuego(n === 1 ? '¿Con qué empieza?' : 'Lee y elige') + `<div class="tarjeta escenario">${indicacion('chispa')}
      <div class="palabra" id="p"></div><div class="opciones" id="ops"></div>
      <div class="fila-btns"><button class="btn" id="ayuda">🔊 Ayuda</button><button class="btn" id="otra">Otra ▶</button></div></div>`;
    let meta = '', bloq = false, ultima = '';
    function nueva() {
      bloq = false;
      let ops;
      if (n === 1) {
        const [v, w] = pick(C.VOCALES); meta = w;
        ops = mezcla([w, ...mezcla(C.VOCALES.filter(x => x[0] !== v)).slice(0, 2).map(x => x[1])]);
        $('#p').innerHTML = `<span class="letra-grande">${v}</span>`;
        Voz.di(`¿Qué dibujo empieza con ${v}?`);
      } else {
        let k = 0; do { meta = palabrasPreferidas(n); } while (meta === ultima && k++ < 10);
        ultima = meta;
        const otras = mezcla(palabrasHasta(n).filter(x => x !== meta && IMG[x] !== IMG[meta])).slice(0, 2);
        ops = mezcla([meta, ...otras]);
        $('#p').innerHTML = silHTML(meta);
        Voz.di('Lee la palabra y toca su dibujo.');
      }
      $('#ops').innerHTML = ops.map(o => `<button class="opcion" data-o="${esc(o)}" aria-label="${n === 1 ? esc(o) : 'dibujo'}">${pic(o, false)}</button>`).join('');
      $$('.opcion').forEach(b => b.addEventListener('click', () => elegir(b)));
    }
    function elegir(b) {
      if (bloq) return;
      if (b.dataset.o === meta) { bloq = true; b.classList.add('bien', 'salta'); Sfx.ok(); ganaEstrella(b); Voz.di(`¡${meta}!`); later(nueva, 1800); }
      else { Sfx.no(); b.classList.add('sacude'); later(() => b.classList.remove('sacude'), 400); Voz.di(n === 1 ? `Eso es ${b.dataset.o}. Busca otro.` : 'Mmm, esa no. Lee otra vez, despacito.'); }
    }
    $('#ayuda').addEventListener('click', () => Voz.di(n === 1 ? `${meta.slice(0, 1)}... ${meta}` : silabear(meta).join('... '), 0.6));
    $('#otra').addEventListener('click', nueva);
    nueva();
  }

  // ---------- Arma la palabra
  function vistaArma() {
    const n = nivel();
    app.innerHTML = cabJuego('Arma la palabra') + `<div class="tarjeta escenario">${indicacion('zigzag')}
      <div class="dibujo-grande" id="d"></div><div class="huecos" id="h"></div><div class="fichas" id="f"></div>
      <div class="fila-btns"><button class="btn" id="oir">🔊 Oír la palabra</button><button class="btn" id="otra">Otra ▶</button></div></div>`;
    let meta = '', sils = [], k = 0, ultima = '';
    function nueva() {
      let g = 0; do { meta = palabrasPreferidas(n); } while ((silabear(meta).length < 2 || meta === ultima) && g++ < 30);
      ultima = meta; sils = silabear(meta); k = 0;
      const extra = pick(silabasHasta(n).filter(s => !sils.includes(s)));
      $('#d').innerHTML = pic(meta, false);
      $('#h').innerHTML = sils.map(() => '<div class="hueco"></div>').join('');
      $('#f').innerHTML = mezcla(sils.concat(extra ? [extra] : [])).map(s => `<button class="btn" data-s="${esc(s)}">${esc(s)}</button>`).join('');
      $$('#f .btn').forEach(b => b.addEventListener('click', () => poner(b)));
      Voz.di('¿Qué es? Pon las sílabas en orden para armar su nombre.');
    }
    function poner(b) {
      if (k >= sils.length) return;
      if (b.dataset.s === sils[k]) {
        Sfx.tap(); const h = $$('#h .hueco')[k]; h.textContent = sils[k]; h.classList.add('lleno'); b.disabled = true; k++;
        if (k === sils.length) { Sfx.gana(); ganaEstrella($('#h')); Voz.di(`¡${meta}! ¡Muy bien!`); later(nueva, 2200); }
      } else { Sfx.no(); b.classList.add('sacude'); later(() => b.classList.remove('sacude'), 400); Voz.di(k === 0 ? '¿Con qué sílaba empieza?' : '¿Qué sílaba sigue?'); }
    }
    $('#oir').addEventListener('click', () => Voz.di(meta, 0.75));
    $('#otra').addEventListener('click', nueva);
    nueva();
  }

  // ---------- Colección
  function vistaColeccion() {
    const amigos = [['nubo', 'Vive en el cielo'], ['pasti', 'Vive en el pasto'], ['topi', 'Vive en la tierra'], ['nam', 'Come sílabas']];
    const jefes = C.WEEKS.map(w => [w.jefe, `Jefe del nivel ${w.n}`, w.n]);
    const ficha = (k, sub, bloq) => `<button class="tarjeta ficha-m${bloq ? ' bloq' : ''}" data-k="${k}" data-b="${bloq ? 1 : 0}">${mon(k)}<b>${bloq ? '???' : M.CAST[k].nombre}</b><small>${esc(sub)}</small></button>`;
    const vencidos = Object.keys(S.st.jefes).length;
    app.innerHTML = `<div class="cab-juego"><a class="btn" href="#mapa">← Mapa</a><h2>Mi colección · ${vencidos + 4} de 12</h2></div>
      <div class="coleccion">${amigos.map(([k, s]) => ficha(k, s, false)).join('')}${jefes.map(([k, s, n]) => ficha(k, s, !S.st.jefes[n])).join('')}</div>
      <p style="font-family:var(--f-letra);font-size:1.05rem;margin-top:16px">Cada jefe aparece cuando lo vences en la hoja del viernes de tu cuaderno.</p>`;
    $$('.ficha-m').forEach(b => b.addEventListener('click', () => {
      const k = b.dataset.k;
      if (b.dataset.b === '1') { Voz.di('Este monstruo todavía está escondido. ¡Vence a su jefe para conocerlo!'); b.classList.add('sacude'); later(() => b.classList.remove('sacude'), 400); return; }
      b.classList.add('salta'); later(() => b.classList.remove('salta'), 600);
      const w = C.WEEKS.find(x => x.jefe === k);
      Voz.di(w ? `¡Hola! Soy ${M.CAST[k].nombre}, el jefe del nivel ${w.n}. ¡Me venciste!` : `¡Hola! Soy ${M.CAST[k].nombre}.`);
    }));
  }

  // ---------- Para papás
  function vistaPapas() {
    const niveles = C.WEEKS.map(w => `<details${w.n === nivel() ? ' open' : ''}><summary>${mon(w.jefe)}Nivel ${w.n} · ${esc(w.titulo)}</summary>
      <p><b>Espacio:</b> ${esc(w.objetivos.espacio)}<br><b>Escribo:</b> ${esc(w.objetivos.escribo)}<br><b>Leo:</b> ${esc(w.objetivos.leo)}</p>
      <p><b>Consejos:</b></p><ul>${w.consejos.map(c => `<li>${esc(c)}</li>`).join('')}</ul>
      <p><b>Pasen al siguiente nivel cuando:</b></p><ul>${w.avanzar.map(c => `<li>${esc(c)}</li>`).join('')}</ul>
      ${EN_GITHUB ? `<div class="descargas"><a class="btn" href="pdf/nivel-${w.n}.pdf" target="_blank" rel="noopener">PDF nivel ${w.n}</a></div>` : ''}</details>`).join('');
    const descargas = EN_GITHUB
      ? `<div class="descargas"><a class="btn sol" href="pdf/guia-para-papas.pdf" target="_blank" rel="noopener">Guía para papás (PDF)</a><a class="btn" href="pdf/cuaderno-completo.pdf" target="_blank" rel="noopener">Cuaderno completo (PDF)</a></div>
         <p style="margin-top:14px"><b>Con el nombre de su hijo:</b> escriba su nombre y se abre el cuaderno listo para imprimir. El nombre no se guarda ni se envía a ningún lado.</p>
         <form id="imp" class="ajuste"><input id="imp-n" placeholder="Nombre" style="font:inherit;padding:8px 10px;border:3px solid #1a1a1a;border-radius:10px;width:160px" aria-label="Nombre"><input id="imp-c" placeholder="Nombre completo (opcional)" style="font:inherit;padding:8px 10px;border:3px solid #1a1a1a;border-radius:10px;width:220px" aria-label="Nombre completo"><select id="imp-s" style="font:inherit;padding:8px;border:3px solid #1a1a1a;border-radius:10px" aria-label="Nivel">${C.WEEKS.map(w => `<option value="${w.n}"${w.n === nivel() ? ' selected' : ''}>Nivel ${w.n}</option>`).join('')}<option value="todo">Todos</option></select><button class="btn verde">Abrir para imprimir</button></form>`
      : `<p>Los PDF para imprimir están en el sitio de GitHub: <a href="${SITIO}" target="_blank" rel="noopener">${SITIO.replace(/^https?:\/\//, '')}</a></p>`;
    app.innerHTML = `<div class="cab-juego"><a class="btn" href="#mapa">← Mapa</a><h2>Para papás</h2></div><div class="papas">
      <div class="tarjeta"><h2>Cómo usar los juegos</h2><p>Son el complemento del cuaderno impreso, no lo reemplazan. Úsenlos 10 a 15 minutos, acompañados, de preferencia después de las hojas del día o el fin de semana. Elijan arriba el nivel en el que van: los juegos usan las letras y palabras de ese nivel.</p>
        <ul><li><b>¿Dónde está? y Código de flechas:</b> orientación espacial (misión 1).</li><li><b>Traza letras:</b> trazo en la pauta con el dedo; "Ver cómo se hace" muestra el orden de los trazos (misión 2).</li><li><b>Tobogán, Ñam, Lee y elige, Arma la palabra:</b> unir sonidos, leer sílabas y palabras (misión 3).</li><li>Cuando venza al jefe del viernes en el cuaderno, toquen "¡Vencí al jefe!" en el mapa para desbloquear el monstruo en su colección.</li></ul></div>
      <div class="tarjeta"><h2>Cuadernos para imprimir</h2>${descargas}</div>
      <div class="tarjeta"><h2>Los 8 niveles</h2><div class="niveles-lista">${niveles}</div></div>
      <div class="tarjeta"><h2>Ajustes</h2>
        <div class="ajuste"><label><input type="checkbox" id="aj-voz"${S.st.voz ? ' checked' : ''}> Voz activada</label><button class="btn" id="aj-prueba">🔊 Probar voz</button><span id="aj-nv" style="color:#5b6472"></span></div>
        <div class="ajuste"><label for="aj-vel">Velocidad de la voz</label><input type="range" id="aj-vel" min="0.6" max="1.1" step="0.05" value="${S.st.vel}"></div>
        <div class="ajuste"><button class="btn" id="aj-reset">Reiniciar progreso</button></div>
        <p>El progreso (estrellas y monstruos) se guarda solo en este dispositivo. No hay cuentas ni se envía información. Si la voz no suena, revisen que el dispositivo tenga una voz en español instalada.</p></div>
      <div class="tarjeta"><h2>Créditos</h2><p>Dibujos de objetos: <a href="https://openmoji.org" target="_blank" rel="noopener">OpenMoji</a> (CC BY-SA 4.0). Letras: Andika (SIL) y Fredoka, licencia OFL. Monstruos y letras de trazo: originales de este proyecto.</p></div></div>`;
    const f = $('#imp');
    if (f) f.addEventListener('submit', (e) => { e.preventDefault(); const q = new URLSearchParams({ semana: $('#imp-s').value }); const nm = $('#imp-n').value.trim(), cp = $('#imp-c').value.trim(); if (nm) q.set('nombre', nm); if (cp) q.set('completo', cp); window.open('cuaderno.html?' + q.toString(), '_blank', 'noopener'); });
    $('#aj-voz').addEventListener('change', (e) => { S.st.voz = e.target.checked; S.save(); });
    $('#aj-vel').addEventListener('input', (e) => { S.st.vel = +e.target.value; S.save(); });
    $('#aj-prueba').addEventListener('click', () => { Voz.di('¡Hola! Soy Pasti. ¿Leemos juntos?'); $('#aj-nv').textContent = Voz.ok ? (Voz.nombre() || 'voz del sistema') : 'Este navegador no tiene voz'; });
    $('#aj-reset').addEventListener('click', () => puertaPapas('¿Borrar estrellas y monstruos?', () => { S.st.estrellas = {}; S.st.jefes = {}; S.save(); hud(); render(); }));
  }

  // ------------------------------------------------------------ rutas
  const VISTAS = { mapa: vistaMapa, donde: vistaDonde, flechas: vistaFlechas, traza: vistaTraza, tobogan: vistaTobogan, nam: vistaNam, lee: vistaLee, arma: vistaArma, coleccion: vistaColeccion, papas: vistaPapas };
  function render() {
    limpiar.forEach(f => { try { f(); } catch (e) { /* nada */ } }); limpiar = [];
    try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch (e) { /* nada */ }
    const id = (location.hash || '#mapa').slice(1);
    const v = VISTAS[id] || vistaMapa;
    const j = JUEGOS.find(x => x.id === id);
    if (j && nivel() < j.desde) { location.hash = 'mapa'; return; }
    v();
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', render);
  hud();
  render();
})();
