/*
 * Plan de 8 niveles (semanas) — "Leo y escribo con los monstruos".
 * Una sola fuente de datos para el cuaderno imprimible y para los juegos.
 *
 * Cada día tiene tres misiones cortas:
 *   espacio  -> orientación (arriba/abajo, izquierda/derecha, cuadrícula)
 *   escribo  -> trazo en la pauta cielo/pasto/tierra
 *   leo      -> unir sonidos y leer
 * más un calentamiento con el cuerpo y un juego de voz (sin papel).
 */
(function (root) {
  'use strict';

  const SILABAS = (c) => ['a', 'e', 'i', 'o', 'u'].map(v => c + v);

  const WEEKS = [
    // ------------------------------------------------------------------ 1
    {
      n: 1, jefe: 'gloton', unidad: 10.5,
      titulo: '¡Arriba y abajo!',
      mision: 'Glotón se comió las vocales. ¡Ayuda a Nubo, Pasti y Topi a recuperarlas!',
      objetivos: {
        espacio: 'Arriba y abajo con su cuerpo y en el papel.',
        escribo: 'Trazos básicos dentro de la pauta: palos, líneas acostadas, bolitas, puentes y tazas. Respetar cielo, pasto y tierra.',
        leo: 'Sonido de las vocales y de la M. Unir "mmm" + vocal para leer ma, me, mi, mo, mu.'
      },
      letrasLeo: ['a', 'e', 'i', 'o', 'u', 'm'],
      letrasEscribo: ['trazos'],
      consejos: [
        'Diga los SONIDOS, no los nombres: la M suena "mmm" (como cuando algo está rico), no "eme".',
        'Sesiones cortas: 15 a 20 minutos. Paren antes de que se canse; es mejor quedarse con ganas.',
        'Lápiz grueso o triangular, pies en el piso y la hoja un poquito inclinada.',
        'Si un trazo sale chueco, no lo borren: festejen el que salió mejor y sigan.'
      ],
      avanzar: [
        'Dice el sonido de las 5 vocales y de la M sin ayuda.',
        'Lee ma, me, mi, mo, mu en desorden (4 de 5).',
        'Sus palos empiezan arriba y bajan hasta el suelo verde.'
      ],
      reto: { silabas: ['ma', 'mo', 'mi', 'me', 'mu', 'am', 'a', 'o', 'e', 'u'], palabras: ['mamá', 'mimo', 'ama'], frase: 'Mi mamá me ama.' },
      dias: [
        {
          cuerpo: 'Simón dice: manos ARRIBA, manos ABAJO, salta hacia arriba, agáchate hasta abajo. Luego, que él dé las órdenes.',
          oral: 'El robot que habla lento: diga "ma... sa" y él adivina la palabra ("¡masa!"). Pruebe con me-sa, lu-na, pa-to, ma-no.',
          espacio: { t: 'dibujaDonde', centro: 'casa', ins: [['sol', 'ARRIBA de la casa'], ['flor', 'ABAJO, junto a la puerta'], ['nube', 'ARRIBA, en el cielo']] },
          escribo: [{ t: 'trazo', g: 'palo' }, { t: 'trazo', g: 'palito' }],
          escriboTip: 'El palo de cielo baja desde la nube hasta el suelo verde. El palito de pasto solo vive en el pasto.',
          leo: [{ t: 'vocales' }, { t: 'sonidoInicial', items: [['abeja', ['a', 'o']], ['oso', ['u', 'o']], ['uva', ['u', 'e']], ['elefante', ['e', 'i']]] }]
        },
        {
          cuerpo: 'El elevador: se hace grande, grande (arriba) y chiquito, chiquito (abajo) cuando usted lo diga.',
          oral: 'Aplaudan las sílabas de su nombre y de 4 cosas de la casa: ven-ta-na, me-sa, so-fá, re-fri.',
          espacio: { t: 'colorea', ins: 'Colorea el monstruo que está ARRIBA.', esc: [['v', 'pasti', 'nubo'], ['v', 'topi', 'bombo'], ['v', 'chispa', 'gloton'], ['v', 'zigzag', 'pasti']] },
          escribo: [{ t: 'trazo', g: 'acostada' }, { t: 'trazo', g: 'cruz' }],
          escriboTip: 'La línea acostada siempre va de izquierda a derecha, como cuando leemos.',
          leo: [{ t: 'tobogan', silabas: ['ma', 'me'] }, { t: 'tren', filas: [['ma', 'me', 'ma', 'me', 'ma']] }, { t: 'tarjetas', palabras: ['mamá'] }]
        },
        {
          cuerpo: 'Brinca la escalera imaginaria: un escalón ARRIBA (brinca), dos ABAJO (agáchate).',
          oral: 'Veo veo algo que empieza con "mmm"... (mano, mesa, mamá, mochila).',
          espacio: { t: 'escalera', pasos: [['↑', '↑', '↓'], ['↑', '↑', '↑', '↓', '↑']] },
          escribo: [{ t: 'trazo', g: 'bolita' }, { t: 'continuo', c: 'olas' }],
          escriboTip: 'La bolita empieza arriba y gira hacia la izquierda, como si diera la vuelta a la manzana al revés.',
          leo: [{ t: 'tobogan', silabas: ['mi', 'mo', 'mu'] }, { t: 'tren', filas: [['ma', 'me', 'mi', 'mo', 'mu'], ['mu', 'mo', 'mi', 'me', 'ma']] }]
        },
        {
          cuerpo: 'Avioncito: estira los brazos y "vuela" de un lado del cuarto al otro siguiendo una cinta en el piso.',
          oral: 'Rimas: ¿qué rima con gato? (pato, zapato). ¿Con mano? (enano, hermano). Inventen rimas tontas.',
          espacio: { t: 'caminos', tipos: ['recto', 'olas', 'picos'], de: ['pasti', 'nubo', 'topi'], a: ['galleta', 'manzana', 'dulce'] },
          escribo: [{ t: 'trazo', g: 'puente' }, { t: 'trazo', g: 'taza' }],
          escriboTip: 'El puente sube y baja en el pasto; la taza baja y sube. Sin salirse del pasto.',
          leo: [{ t: 'tren', filas: [['mo', 'mi', 'ma', 'mu', 'me'], ['ma', 'mu', 'me', 'mo', 'mi']] }, { t: 'palabrasSueltas', palabras: ['mamá', 'mimo', 'ama', 'amo', 'mía', 'mío', 'Memo', 'Mimí'] }]
        },
        {
          cuerpo: 'Letras en la espalda: dibuje con su dedo un palo o una bolita en su espalda y que adivine cuál fue.',
          oral: 'El robot que habla lento con palabras largas: ma-ri-po-sa, mo-chi-la, pe-lo-ta.',
          espacio: { t: 'dibujaMonstruo', ins: ['Dibuja 2 ojos ARRIBA.', 'Dibuja una boca ABAJO de los ojos.', 'Dibuja 2 cuernos ARRIBA de la cabeza.', 'Dibuja 2 patas ABAJO.'] },
          escribo: [{ t: 'continuo', c: 'picos' }, { t: 'continuo', c: 'montes' }, { t: 'nombre' }],
          escriboTip: 'Hoy toca su nombre: que lo escriba como pueda, sin corregir. Lo comparamos cada viernes.',
          leo: [{ t: 'frases', frases: [['Mi mamá.', 'mamá'], ['Mi mamá me ama.', 'corazón'], ['Amo a mi mamá.', 'mamá']] }]
        }
      ]
    },
    // ------------------------------------------------------------------ 2
    {
      n: 2, jefe: 'zigzag', unidad: 10.5,
      titulo: 'Izquierda y derecha',
      mision: 'Zigzag revuelve todo de un lado al otro. ¡Encuentra la izquierda y la derecha!',
      objetivos: {
        espacio: 'Distinguir izquierda y derecha en su cuerpo y en la hoja. Pónganle una pulsera o listón en la mano DERECHA toda la semana.',
        escribo: 'Vocales a, e, i, o, u, más c, m y n, todas letras de PASTO.',
        leo: 'Sonidos S ("sss", serpiente) y L ("lll"). Primeras palabras de 2 sílabas.'
      },
      letrasLeo: ['s', 'l'],
      letrasEscribo: ['i', 'u', 'o', 'a', 'e', 'c', 'm', 'n'],
      consejos: [
        'La pulsera en la mano derecha es la ayuda secreta: "derecha es la de la pulsera".',
        'Para la a, la d, la g y la q: empiecen con la "c mágica" y luego el palito.',
        'Al leer, que pase el dedo debajo de las letras de izquierda a derecha.',
        'Si adivina una palabra por el dibujo, tápelo y pídale que la lea otra vez.'
      ],
      avanzar: [
        'Señala su mano derecha y su mano izquierda sin dudar.',
        'Lee sílabas con m, s y l en desorden (8 de 10).',
        'Hace la a "bolita y palito" empezando por la bolita.'
      ],
      reto: { silabas: ['sa', 'lo', 'mi', 'le', 'su', 'ma', 'li', 'se', 'lu', 'so'], palabras: ['oso', 'mesa', 'Lola'], frase: 'Lola ama a su oso.' },
      dias: [
        {
          cuerpo: 'Con la pulsera puesta: "levanta la mano derecha, toca tu oreja izquierda, pie derecho adelante".',
          oral: 'Serpiente: alarguen el sonido inicial: "ssssol", "sssopa", "ssssapo". ¿Cuál empieza con sss: sapo o mapa?',
          espacio: { t: 'manos' },
          escribo: [{ t: 'letra', g: 'i' }, { t: 'letra', g: 'u' }],
          escriboTip: 'La i y la u son de pasto. El puntito de la i va en el cielo, solito.',
          leo: [{ t: 'tobogan', silabas: ['sa', 'se', 'si', 'so', 'su'] }, { t: 'tren', filas: [['sa', 'so', 'si', 'se', 'su']] }]
        },
        {
          cuerpo: 'El semáforo: diga "derecha" y él da un paso a la derecha; "izquierda", a la izquierda. Cada vez más rápido.',
          oral: 'El robot que habla lento: "o... so", "me... sa", "ma... sa", "su... ma".',
          espacio: { t: 'colorea', ins: 'Colorea el monstruo que está a la IZQUIERDA.', esc: [['h', 'pasti', 'topi'], ['h', 'nubo', 'chispa'], ['h', 'bombo', 'pasti'], ['h', 'gloton', 'nubo']] },
          escribo: [{ t: 'letra', g: 'o' }, { t: 'letra', g: 'a' }],
          escriboTip: 'La o empieza arriba y gira hacia la izquierda. La a es una bolita y luego un palito pegado a la derecha.',
          leo: [{ t: 'tren', filas: [['sa', 'ma', 'so', 'mo', 'si'], ['mi', 'su', 'mu', 'se', 'me']] }, { t: 'tarjetas', palabras: ['oso', 'ola', 'lima'] }]
        },
        {
          cuerpo: 'Espejo: usted se pone enfrente y mueve un brazo; él lo copia con su mismo lado (no como espejo).',
          oral: 'Cantar con "la": la-la-la con cualquier canción y luego con le, li, lo, lu.',
          espacio: { t: 'carril', pasos: [['→', '→', '←'], ['←', '←', '→', '←']] },
          escribo: [{ t: 'letra', g: 'e' }, { t: 'letra', g: 'c' }],
          escriboTip: 'La e empieza con una línea acostada en medio del pasto y luego da la vuelta como la c.',
          leo: [{ t: 'tobogan', silabas: ['la', 'le', 'li', 'lo', 'lu'] }, { t: 'tren', filas: [['la', 'lo', 'li', 'le', 'lu'], ['lu', 'la', 'le', 'lo', 'li']] }]
        },
        {
          cuerpo: 'Twister casero: "mano derecha en el cojín rojo, pie izquierdo en el azul".',
          oral: '¿Qué palabra es más larga? Comparen "sol" y "mariposa" aplaudiendo.',
          espacio: { t: 'dibujaDonde', centro: 'árbol', ins: [['casa', 'a la IZQUIERDA del árbol'], ['flor', 'a la DERECHA del árbol'], ['sol', 'ARRIBA del árbol']] },
          escribo: [{ t: 'letra', g: 'm' }, { t: 'letra', g: 'n' }],
          escriboTip: 'La n baja, sube por el mismo camino y hace un puente. La m hace dos puentes.',
          leo: [{ t: 'uneDibujo', palabras: ['oso', 'ola', 'ala', 'mamá'] }, { t: 'palabrasSueltas', palabras: ['Lola', 'Lalo', 'sala', 'mula', 'loma', 'lima', 'masa', 'suma'] }]
        },
        {
          cuerpo: 'Baile de lados: muevan la cadera a la derecha, a la izquierda, brazo derecho arriba, brazo izquierdo abajo.',
          oral: 'Veo veo algo que empieza con "lll"... (lámpara, libro, leche, lápiz).',
          espacio: { t: 'caminos', tipos: ['montes', 'escalones', 'olas'], de: ['topi', 'pasti', 'nubo'], a: ['pizza', 'helado', 'pastel'] },
          escribo: [{ t: 'palabras', p: ['mamá', 'ama'] }, { t: 'nombre' }],
          escriboTip: 'Entre letra y letra deja un espacio chiquito; las letras de una palabra son amigas que van juntas.',
          leo: [{ t: 'frases', frases: [['Mi oso.', 'oso'], ['La ola.', 'ola'], ['Lola ama a su oso.', 'oso'], ['Mi mamá sala la masa.', 'sal']] }]
        }
      ]
    },
    // ------------------------------------------------------------------ 3
    {
      n: 3, jefe: 'bombo', unidad: 10,
      titulo: 'El código de flechas',
      mision: 'Bombo escondió la comida en un laberinto. ¡Sigue las flechas para encontrarla!',
      objetivos: {
        espacio: 'Seguir y dar instrucciones con flechas en una cuadrícula (arriba, abajo, izquierda, derecha).',
        escribo: 'Letras de pasto que faltan: r, s, v, w, x, z. Primeras palabras en la pauta.',
        leo: 'Sonidos P y T (no se estiran: se dicen pegaditos a la vocal). Palabras mágicas: el, y, es.'
      },
      letrasLeo: ['p', 't'],
      letrasEscribo: ['r', 's', 'v', 'w', 'x', 'z'],
      consejos: [
        'La P y la T no se pueden estirar: "p" es como soplar una vela. Díganlas siempre junto a la vocal: pa, pe, pi...',
        'Si se atora en una palabra, tape la segunda sílaba con el dedo y vayan de una en una.',
        'Las palabras mágicas (el, y, es) se aprenden de memoria: péguenlas en la puerta del refri.',
        'En la cuadrícula, la flecha manda: primero mira la flecha y luego mueve el dedo.'
      ],
      avanzar: [
        'Sigue 4 o 5 flechas en la cuadrícula sin ayuda.',
        'Lee palabras de 2 sílabas con m, s, l, p y t (pato, mesa, sopa).',
        'Reconoce "el", "y", "es" en una frase.'
      ],
      reto: { silabas: ['pa', 'to', 'pi', 'te', 'pu', 'ta', 'po', 'ti', 'pe', 'tu'], palabras: ['pato', 'papá', 'tomate'], frase: 'Mi papá pela la papa.' },
      dias: [
        {
          cuerpo: 'Robot humano: usted dice "un paso adelante, gira a la derecha" y él camina como robot.',
          oral: 'Sopla la vela: digan "pa, pe, pi, po, pu" sintiendo el aire en la mano.',
          espacio: { t: 'flechas', n: 4, inicio: [0, 0], pasos: '→→↓', meta: 'galleta' },
          escribo: [{ t: 'letra', g: 'r' }, { t: 'letra', g: 's' }],
          escriboTip: 'La r es un palito con una ramita. La s es una serpiente: empieza arriba a la derecha.',
          leo: [{ t: 'tobogan', silabas: ['pa', 'pe', 'pi', 'po', 'pu'] }, { t: 'tren', filas: [['pa', 'pi', 'po', 'pe', 'pu'], ['ma', 'pa', 'sa', 'pe', 'la']] }]
        },
        {
          cuerpo: 'Tesoro en la casa: esconda un juguete y guíelo solo con "derecha, izquierda, adelante, atrás".',
          oral: 'El robot que habla lento: "pa... to", "sa... po", "ma... pa", "pe... lo... ta".',
          espacio: { t: 'flechas', n: 4, inicio: [3, 0], pasos: '↓↓←←', meta: 'manzana' },
          escribo: [{ t: 'letra', g: 'v' }, { t: 'letra', g: 'w' }],
          escriboTip: 'La v baja y sube como un pico. La w son dos picos juntos.',
          leo: [{ t: 'tarjetas', palabras: ['papá', 'mapa', 'sapo', 'pila', 'lupa', 'papa'] }]
        },
        {
          cuerpo: 'Reloj: tic-tac con la lengua; muévanse como manecillas: brazos arriba, a la derecha, abajo, a la izquierda.',
          oral: 'Tic-tac: digan ta, te, ti, to, tu como un reloj.',
          espacio: { t: 'flechasInversa', n: 4, inicio: [0, 3], meta: [3, 1], comida: 'pastel' },
          escribo: [{ t: 'letra', g: 'x' }, { t: 'letra', g: 'z' }],
          escriboTip: 'La z: línea acostada, resbaladilla hacia abajo y otra línea acostada.',
          leo: [{ t: 'tobogan', silabas: ['ta', 'te', 'ti', 'to', 'tu'] }, { t: 'tren', filas: [['ta', 'to', 'tu', 'ti', 'te'], ['pa', 'ta', 'pe', 'te', 'po']] }]
        },
        {
          cuerpo: 'Gatea por un camino de cojines siguiendo las flechas de papel que usted pegue en el piso.',
          oral: 'Palabras mágicas: diga una frase y que aplauda cuando oiga "el": "el perro y el gato".',
          espacio: { t: 'flechas', n: 5, inicio: [0, 4], pasos: '↑↑→→↑', meta: 'helado' },
          escribo: [{ t: 'palabras', p: ['oso', 'mesa'] }],
          escriboTip: 'Primero la palabra en puntitos, luego él solito. Las letras de pasto no tocan el cielo.',
          leo: [{ t: 'vista', palabras: ['el', 'y', 'es'] }, { t: 'uneDibujo', palabras: ['pato', 'tomate', 'moto', 'pelota'] }]
        },
        {
          cuerpo: 'Ahora él es el que da las órdenes de robot y usted las sigue (equivocándose a propósito para que lo corrija).',
          oral: '¿Cuántas sílabas tiene? to-ma-te (3), pa-to (2), sol (1). Que salte una vez por sílaba.',
          espacio: { t: 'dictado', n: 6, inicio: [1, 1], dicta: '→ → → ↓ ↓ ↓ ← ← ← ↑ ↑ ↑', forma: 'un cuadrado (¡dibújale ojos y es un monstruo!)' },
          escribo: [{ t: 'palabras', p: ['rana', 'suma'] }, { t: 'nombre' }],
          escriboTip: 'Compare el nombre de hoy con el del viernes pasado. ¡Muéstrele lo que avanzó!',
          leo: [{ t: 'frases', frases: [['El pato.', 'pato'], ['Papá y mamá.', 'papá'], ['Mi papá pela la papa.', 'papa'], ['El tomate es mío.', 'tomate']] }]
        }
      ]
    },
    // ------------------------------------------------------------------ 4
    {
      n: 4, jefe: 'chispa', unidad: 10,
      titulo: 'Copia el dibujo',
      mision: 'Chispa hizo dibujos con puntos. ¡Cópialos igualito para ganar su chispa!',
      objetivos: {
        espacio: 'Copiar figuras en una cuadrícula de puntos (la base para que las letras salgan del tamaño correcto).',
        escribo: 'Letras de CIELO: l, t, h, k, b, d, f. La b y la d no se confunden: la d empieza como la a.',
        leo: 'Sonidos N ("nnn") y D. Palabras de 3 sílabas y frases con "un", "una", "de".'
      },
      letrasLeo: ['n', 'd'],
      letrasEscribo: ['l', 't', 'h', 'k', 'b', 'd', 'f'],
      consejos: [
        'Truco b/d: la b empieza con el BASTÓN (palo) y luego la panza; la d empieza con la bolita como la a, y luego el palo alto.',
        'Las letras de cielo tocan la línea azul de arriba y se paran en el suelo verde.',
        'Ya puede leer su nombre: hagan una tarjeta con su nombre y léanla separando sílabas.',
        'Si confunde letras, regresen 1 día; no pasa nada por repetir.'
      ],
      avanzar: [
        'Copia figuras de 3 o 4 líneas en la cuadrícula.',
        'Lee palabras de 3 sílabas despacito (paloma, moneda).',
        'Escribe l, t, b, d tocando el cielo.'
      ],
      reto: { silabas: ['na', 'do', 'ni', 'de', 'nu', 'da', 'no', 'di', 'ne', 'du'], palabras: ['luna', 'dado', 'moneda'], frase: 'El nido es de la paloma.' },
      dias: [
        {
          cuerpo: 'Formas con el cuerpo: hagan una línea acostados en el piso, una T con los brazos, una L sentados.',
          oral: 'Mosquito: "nnnnn". ¿Qué empieza con nnn? nube, nariz, naranja, nido.',
          espacio: { t: 'copia', n: 5, fig: [[[0, 4], [4, 4]], [[1, 0], [1, 2], [3, 2], [3, 0], [1, 0]]] },
          escribo: [{ t: 'letra', g: 'l' }, { t: 'letra', g: 't' }],
          escriboTip: 'La l es un palo de cielo. La t también, con una línea acostada en el techo del pasto.',
          leo: [{ t: 'tobogan', silabas: ['na', 'ne', 'ni', 'no', 'nu'] }, { t: 'tarjetas', palabras: ['mano', 'luna', 'mono', 'pino', 'nena', 'tina'] }]
        },
        {
          cuerpo: 'Letras gigantes: con cinta en el piso hagan una L y una T gigantes y que camine encima en la dirección del trazo.',
          oral: 'El robot ahora separa sonidos: "s... o... l" → ¡sol! "m... a... r" → ¡mar!',
          espacio: { t: 'copia', n: 5, fig: [[[0, 0], [0, 4], [3, 4]], [[2, 0], [4, 0]], [[3, 0], [3, 3]]] },
          escribo: [{ t: 'letra', g: 'h' }, { t: 'letra', g: 'k' }],
          escriboTip: 'La h: palo de cielo, sube por el mismo camino y hace un puente en el pasto.',
          leo: [{ t: 'tren', filas: [['na', 'mo', 'ni', 'pe', 'nu'], ['no', 'sa', 'ne', 'ti', 'la']] }, { t: 'uneDibujo', palabras: ['mano', 'luna', 'mono', 'pino'] }]
        },
        {
          cuerpo: 'Brazos b y d: puño cerrado con el pulgar arriba en cada mano. La izquierda forma la b, la derecha la d (como una cama: b-d).',
          oral: 'Dedo, dado, dona: digan palabras con "d" y que toque su dedo cada vez.',
          espacio: { t: 'copia', n: 5, fig: [[[0, 4], [0, 3], [1, 3], [1, 2], [2, 2], [2, 1], [3, 1], [3, 0], [4, 0]]] },
          escribo: [{ t: 'letra', g: 'b' }, { t: 'letra', g: 'd' }],
          escriboTip: 'b: primero el BASTÓN y luego la panza. d: primero la bolita (como la a) y luego el palo alto.',
          leo: [{ t: 'tobogan', silabas: ['da', 'de', 'di', 'do', 'du'] }, { t: 'tarjetas', palabras: ['dado', 'dedo', 'nido', 'dona', 'moneda', 'dino'] }]
        },
        {
          cuerpo: 'Dibujen letras en el aire con el codo, luego con el pie, luego con la nariz.',
          oral: 'Aplaudan palabras de 3 sílabas: pa-lo-ma, pe-lo-ta, to-ma-te, mo-ne-da.',
          espacio: { t: 'copia', n: 5, fig: [[[0, 1], [0, 4], [4, 4], [4, 1], [0, 1]], [[1, 2], [1, 2.01]], [[3, 2], [3, 2.01]], [[1, 3], [3, 3]], [[1, 1], [1, 0]], [[3, 1], [3, 0]]] },
          escribo: [{ t: 'letra', g: 'f' }, { t: 'palabras', p: ['luna'] }],
          escriboTip: 'La f empieza como un bastón al revés, arriba a la derecha.',
          leo: [{ t: 'tarjetas', palabras: ['paloma', 'pelota', 'tomate', 'moneda', 'maleta', 'paleta'] }]
        },
        {
          cuerpo: 'Escultura: él se queda quieto como estatua y usted le dice "mano derecha arriba, pie izquierdo atrás".',
          oral: 'Su nombre en sílabas, aplaudiendo cada una. ¿Cuántas tiene? ¿Con qué sonido empieza? ¿Cuántas sílabas? ¿Con qué sonido empieza?',
          espacio: { t: 'copia', n: 6, fig: [[[1, 1], [2, 0], [3, 1], [3, 4], [1, 4], [1, 1]], [[1, 3], [0, 4], [1, 4]], [[3, 3], [4, 4], [3, 4]], [[2, 4], [2, 5]]] },
          escribo: [{ t: 'palabras', p: ['dedo', 'lata'] }, { t: 'nombre' }],
          escriboTip: 'Fíjense que las letras altas (d, l, t) toquen el cielo y las de pasto no.',
          leo: [{ t: 'leeNombre' }, { t: 'frases', frases: [['La luna.', 'luna'], ['Dani tiene un dado.', 'dado'], ['El mono toma una dona.', 'dona'], ['El nido es de la paloma.', 'paloma']] }]
        }
      ]
    },
    // ------------------------------------------------------------------ 5
    {
      n: 5, jefe: 'espejo', unidad: 10,
      titulo: 'El monstruo Espejo',
      mision: 'Espejo voltea las letras: la b parece d y la p parece q. ¡No te dejes engañar!',
      objetivos: {
        espacio: 'Distinguir b, d, p y q por hacia dónde miran (la panza) y completar dibujos simétricos.',
        escribo: 'Letras de TIERRA (con colita): p, q, g, j, y, y la ñ.',
        leo: 'Sonidos C (ca, co, cu) y B/V (suenan igual). Frases con "come", "tiene", "es".'
      },
      letrasLeo: ['c', 'b', 'v'],
      letrasEscribo: ['p', 'q', 'g', 'j', 'y', 'ñ'],
      consejos: [
        'Voltear b/d es normal hasta los 7 años. Recuérdele el truco del bastón (b) y la bolita (d) sin regañar.',
        'La c solo suena "k" con a, o, u: ca, co, cu. (ce y ci vendrán en primaria.)',
        'La b y la v suenan igual; por ahora basta con leerlas.',
        'Las colitas bajan a la tierra, donde vive Topi.'
      ],
      avanzar: [
        'Encuentra la b entre varias d (y la p entre q) casi sin errores.',
        'Lee ca, co, cu, ba, ve... en palabras (casa, vaca, boca).',
        'Las colitas de p, g, j, y bajan a la tierra.'
      ],
      reto: { silabas: ['ca', 'bo', 'cu', 've', 'co', 'bi', 'ba', 'vu', 'be', 'va'], palabras: ['vaca', 'casa', 'bebé'], frase: 'Beto come un taco.' },
      dias: [
        {
          cuerpo: 'Mano b, mano d: que forme la b con la mano izquierda (pulgar arriba) y la d con la derecha.',
          oral: 'Tos de monstruo: "k, k, k". Digan ca, co, cu tosiendo bajito.',
          espacio: { t: 'busca', letra: 'b', otra: 'd' },
          escribo: [{ t: 'letra', g: 'p' }, { t: 'letra', g: 'q' }],
          escriboTip: 'La p: palo que baja hasta la tierra y luego la panza arriba. La q: bolita y palo que baja a la tierra.',
          leo: [{ t: 'tobogan', silabas: ['ca', 'co', 'cu'] }, { t: 'tarjetas', palabras: ['casa', 'cama', 'taco', 'coco', 'copa', 'camote'] }]
        },
        {
          cuerpo: 'Burbujas: soplen burbujas imaginarias diciendo "b, b, b" con los labios.',
          oral: 'El robot que separa sonidos: "b... o... t... a" → ¡bota!',
          espacio: { t: 'busca', letra: 'd', otra: 'b' },
          escribo: [{ t: 'letra', g: 'g' }, { t: 'letra', g: 'j' }],
          escriboTip: 'La g empieza como la a y la colita baja a la tierra y da la vuelta a la izquierda.',
          leo: [{ t: 'tobogan', silabas: ['ba', 'be', 'bo', 'va', 'vi'] }, { t: 'tarjetas', palabras: ['boca', 'bota', 'bebé', 'lobo', 'vaca', 'uva'] }]
        },
        {
          cuerpo: 'Espejo de verdad: frente a un espejo, que levante la mano derecha y vea qué hace "el otro".',
          oral: 'Rimas con monstruos: Bombo-tombo-combo; Pasti-masti-tasti. Inventen nombres de monstruos que rimen.',
          espacio: { t: 'simetria', fig: [[[3, 0], [1, 1], [0, 3], [1, 5], [3, 6]], [[3, 2], [2, 2], [2, 3], [3, 3]]] },
          escribo: [{ t: 'letra', g: 'y' }, { t: 'letra', g: 'ñ' }],
          escriboTip: 'La ñ es una n con su gorrito ondulado en el cielo.',
          leo: [{ t: 'uneDibujo', palabras: ['vaca', 'casa', 'boca', 'nube'] }, { t: 'palabrasSueltas', palabras: ['cuna', 'codo', 'bata', 'bola', 'Beto', 'vela', 'cubo', 'bonito'] }]
        },
        {
          cuerpo: 'Saltos en espejo: usted salta a SU derecha; él tiene que saltar a SU derecha (no copiarlo).',
          oral: 'Quita una sílaba: "camote sin ca" (mote), "pelota sin pe" (lota).',
          espacio: { t: 'busca', letra: 'p', otra: 'q' },
          escribo: [{ t: 'palabras', p: ['pato', 'gato'] }],
          escriboTip: 'Revise juntos: ¿la colita de la p bajó a la tierra? ¿La t tocó el cielo?',
          leo: [{ t: 'tarjetas', palabras: ['vela', 'nube', 'camote', 'cama', 'lobo', 'copa'] }]
        },
        {
          cuerpo: 'Letras con plastilina: hagan b, d, p, q con churritos y pónganlas en fila de izquierda a derecha.',
          oral: '¿Qué sonido falta? "_aca" (v), "_asa" (c), "_ebé" (b).',
          espacio: { t: 'clasifica', letras: ['b', 'd', 'p', 'q'] },
          escribo: [{ t: 'palabras', p: ['jugo', 'niño'] }, { t: 'nombre' }],
          escriboTip: 'Hoy su nombre con la primera letra GRANDE (mayúscula) si ya la conoce.',
          leo: [{ t: 'frases', frases: [['La vaca come.', 'vaca'], ['Beto come un taco.', 'taco'], ['El bebé come papa.', 'bebé'], ['El lobo tiene una bota.', 'lobo']] }]
        }
      ]
    },
    // ------------------------------------------------------------------ 6
    {
      n: 6, jefe: 'trueno', unidad: 9.5,
      titulo: 'Mayúsculas gigantes',
      mision: 'Trueno hace todo GRANDE. ¡Aprende las mayúsculas que tocan el cielo!',
      objetivos: {
        espacio: 'Grande y pequeño, patrones y simetría.',
        escribo: 'Mayúsculas de líneas rectas: L, T, I, E, F, H, A, M, N, V, W, Y, X, Z, K. La mayúscula ocupa cielo y pasto; la minúscula, solo pasto.',
        leo: 'Sonidos F ("fff"), J ("jjj") y G suave (ga, go, gu).'
      },
      letrasLeo: ['f', 'j', 'g'],
      letrasEscribo: ['L', 'T', 'I', 'E', 'F', 'H', 'A', 'M', 'N', 'V', 'W', 'Y', 'X', 'Z', 'K'],
      consejos: [
        'Mayúscula = letra grande que toca el cielo. Se usa al empezar un nombre o una frase.',
        'La g solo suena suave con a, o, u (gato, gota, gusano).',
        'Lean juntos un cuento cada noche y pídale que encuentre las mayúsculas.',
        'Si ya lee frases, que lea él una y usted la siguiente.'
      ],
      avanzar: [
        'Escribe mayúsculas de líneas tocando el cielo.',
        'Une mayúscula con minúscula (A-a, M-m...).',
        'Lee frases cortas con f, j, g.'
      ],
      reto: { silabas: ['fa', 'jo', 'ga', 'fi', 'ju', 'go', 'fe', 'ja', 'gu', 'fo'], palabras: ['gato', 'jugo', 'foca'], frase: 'El gato toma jugo.' },
      dias: [
        {
          cuerpo: 'Gigante y enano: cuando diga GRANDE se estira como gigante, cuando diga pequeño se hace bolita.',
          oral: 'Gato enojado: "ffff". ¿Qué empieza con fff? foca, foco, fiesta, fideo.',
          espacio: { t: 'tamano' },
          escribo: [{ t: 'letra', g: 'L' }, { t: 'letra', g: 'T' }],
          escriboTip: 'Las mayúsculas empiezan en la línea del cielo y bajan hasta el suelo.',
          leo: [{ t: 'tobogan', silabas: ['fa', 'fe', 'fi', 'fo', 'fu'] }, { t: 'tarjetas', palabras: ['foca', 'sofá', 'café', 'foco', 'fideo', 'foto'] }]
        },
        {
          cuerpo: 'Letras con el cuerpo: E (acostado con brazos y piernas), T (brazos abiertos), L (sentado).',
          oral: 'Suspiro cansado: "jjjj". ja, je, ji, jo, ju como risa de monstruo.',
          espacio: { t: 'une', izq: ['A', 'M', 'T', 'E'], der: ['m', 'e', 'a', 't'] },
          escribo: [{ t: 'letra', g: 'E' }, { t: 'letra', g: 'F' }],
          escriboTip: 'La E y la F se parecen: la F no tiene el piso.',
          leo: [{ t: 'tobogan', silabas: ['ja', 'je', 'ji', 'jo', 'ju'] }, { t: 'tarjetas', palabras: ['jugo', 'ojo', 'ajo', 'caja'] }]
        },
        {
          cuerpo: 'Patrones con el cuerpo: aplauso, rodillas, aplauso, rodillas... ¿qué sigue?',
          oral: 'Gárgaras: "g, g, g". ga, go, gu. ¿Qué empieza con ga? gato, gallina, galleta.',
          espacio: { t: 'patron', seq: ['pasti', 'nubo', 'topi', 'pasti', 'nubo', 'topi', null, null, null] },
          escribo: [{ t: 'letra', g: 'A' }, { t: 'letra', g: 'M' }],
          escriboTip: 'La A es una montaña con un puente en medio.',
          leo: [{ t: 'tobogan', silabas: ['ga', 'go', 'gu'] }, { t: 'tarjetas', palabras: ['gato', 'gota', 'mago', 'gusano'] }]
        },
        {
          cuerpo: 'Mariposa: brazos iguales de los dos lados (simétricos); luego que haga una pose y usted la copie del otro lado.',
          oral: 'Quita una sílaba: "gusano sin gu" (sano), "foca sin fo" (ca).',
          espacio: { t: 'simetria', fig: [[[3, 0], [2, 1], [2, 2], [1, 2], [0, 3], [1, 4], [2, 4], [2, 6], [3, 6]], [[3, 2], [3, 2.01]]] },
          escribo: [{ t: 'letra', g: 'N' }, { t: 'letra', g: 'H' }],
          escriboTip: 'La N: palo, resbaladilla hacia abajo y sube derechito.',
          leo: [{ t: 'uneDibujo', palabras: ['foca', 'gato', 'jugo', 'mago'] }, { t: 'palabrasSueltas', palabras: ['Jimena', 'Gabi', 'Fito', 'jefe', 'goma', 'lago', 'amigo', 'fila'] }]
        },
        {
          cuerpo: 'Robot de mayúsculas: dicte flechas y en cada parada dibuje una mayúscula en el aire.',
          oral: '¿Cómo se llaman sus amigos? ¿Con qué letra GRANDE empiezan sus nombres?',
          espacio: { t: 'dictado', n: 6, inicio: [1, 0], dicta: '↓ ↓ ↓ ↓ ↓ → → →', forma: 'la letra L' },
          escribo: [{ t: 'palabras', p: ['Ana', 'Lola'] }, { t: 'nombre' }],
          escriboTip: 'Los nombres empiezan con mayúscula y siguen con minúsculas.',
          leo: [{ t: 'frases', frases: [['El gato toma jugo.', 'gato'], ['La foca come fideo.', 'foca'], ['Mi amigo tiene un foco.', 'foco'], ['La gota cae.', 'gota']] }]
        }
      ]
    },
    // ------------------------------------------------------------------ 7
    {
      n: 7, jefe: 'rugido', unidad: 9.5,
      titulo: 'Primero, en medio y al final',
      mision: 'Rugido desordenó las palabras. ¡Ponlas en orden de izquierda a derecha!',
      objetivos: {
        espacio: 'Orden y secuencias: primero, en medio, último; antes y después.',
        escribo: 'Mayúsculas curvas: O, C, G, Q, S, U, J, D, P, B, R. Nombres propios.',
        leo: 'Sonidos R (suave entre vocales, fuerte al inicio), RR (motor) y Ñ. Primer cuento.'
      },
      letrasLeo: ['r', 'rr', 'ñ'],
      letrasEscribo: ['O', 'C', 'G', 'Q', 'S', 'U', 'J', 'D', 'P', 'B', 'R'],
      consejos: [
        'La r suena suave en medio (pera, loro) y fuerte al empezar (rana, rosa). La rr siempre es fuerte, como motor.',
        'Para el cuento: primero usted lo lee, luego él lo lee, al final lo leen a coro.',
        'Pregúntele qué pasó primero, qué pasó después y cómo terminó.',
        'Si una palabra es difícil, léanla por sílabas y luego "rápido como un tren".'
      ],
      avanzar: [
        'Ordena 3 dibujos de una historia.',
        'Lee palabras con r, rr y ñ (perro, piña, rana).',
        'Lee un cuento corto y contesta quién y qué.'
      ],
      reto: { silabas: ['ra', 'rro', 'ñi', 're', 'rru', 'ño', 'ri', 'rra', 'ña', 'ro'], palabras: ['perro', 'rana', 'piña'], frase: 'La niña come piña.' },
      dias: [
        {
          cuerpo: 'Carrera de 3 juguetes en fila: ¿cuál llegó primero, cuál en medio, cuál al último?',
          oral: 'Motor: "rrrrr". ¿Qué empieza con rrr? rana, rosa, ratón, regalo.',
          espacio: { t: 'colorea', ins: 'Colorea el PRIMERO de la fila. Encierra el ÚLTIMO.', esc: [['fila', 'pasti', 'nubo', 'topi', 'bombo'], ['fila', 'chispa', 'gloton', 'pasti', 'zigzag']] },
          escribo: [{ t: 'letra', g: 'O' }, { t: 'letra', g: 'C' }],
          escriboTip: 'La O grande empieza en el cielo y gira hacia la izquierda hasta tocar el suelo.',
          leo: [{ t: 'tobogan', silabas: ['ra', 're', 'ri', 'ro', 'ru'] }, { t: 'tarjetas', palabras: ['rana', 'rosa', 'ropa', 'rata', 'regalo', 'toro'] }]
        },
        {
          cuerpo: 'Historia con el cuerpo: primero me levanto, después me lavo los dientes, al final desayuno. Actúenlo.',
          oral: 'Suave y fuerte: pera (suave) / perro (fuerte). Que diga cuál suena como motor: caro o carro.',
          espacio: { t: 'secuencia', items: [['huevo', 'pollito', 'gallina'], ['semilla', 'planta', 'flor']] },
          escribo: [{ t: 'letra', g: 'G' }, { t: 'letra', g: 'S' }],
          escriboTip: 'La S grande es la serpiente gigante que va del cielo al suelo.',
          leo: [{ t: 'tren', filas: [['pera', 'loro', 'toro'], ['perro', 'burro', 'gorro']] }, { t: 'uneDibujo', palabras: ['pera', 'loro', 'perro', 'burro'] }]
        },
        {
          cuerpo: 'Tren humano: él es la locomotora (primero), un peluche en medio y usted el último vagón.',
          oral: 'ña, ñe, ñi, ño, ñu. ¿Qué tiene ñ? niño, piña, araña, moño.',
          espacio: { t: 'patron', seq: ['nubo', 'nubo', 'pasti', 'nubo', 'nubo', 'pasti', null, null, null] },
          escribo: [{ t: 'letra', g: 'U' }, { t: 'letra', g: 'D' }],
          escriboTip: 'La D grande: palo y una panza gigante que va del cielo al suelo.',
          leo: [{ t: 'tobogan', silabas: ['ña', 'ñe', 'ñi', 'ño', 'ñu'] }, { t: 'tarjetas', palabras: ['niño', 'niña', 'piña', 'araña', 'moño', 'leña'] }]
        },
        {
          cuerpo: 'Ordena a la familia por estatura: del más alto (izquierda) al más bajito (derecha).',
          oral: 'Frases locas: diga palabras en desorden ("come el perro") y él las acomoda ("el perro come").',
          espacio: { t: 'ordena', frases: [['perro', 'El', 'corre.'], ['piña.', 'La', 'niña', 'come']] },
          escribo: [{ t: 'letra', g: 'P' }, { t: 'letra', g: 'B' }, { t: 'palabras', p: ['Rita'] }],
          escriboTip: 'P, B y R empiezan igual: un palo y una panza arriba.',
          leo: [{ t: 'frases', frases: [['El perro corre.', 'perro'], ['La niña come piña.', 'piña'], ['El loro mira la rana.', 'loro'], ['Mi perro tiene un moño.', 'moño']] }]
        },
        {
          cuerpo: 'Él dicta flechas para que usted llegue al tesoro (un dulce escondido).',
          oral: 'Cuéntame tu día en 3 partes: primero..., después..., al final...',
          espacio: { t: 'flechas', n: 6, inicio: [0, 5], pasos: '↑↑→→→↑↑→', meta: 'pastel' },
          escribo: [{ t: 'nombreCompleto' }],
          escriboTip: 'Hoy su nombre con mayúscula al inicio. Si quiere, también el segundo nombre.',
          leo: [{ t: 'cuento', id: 'rufo' }]
        }
      ]
    },
    // ------------------------------------------------------------------ 8
    {
      n: 8, jefe: 'mega', unidad: 8.5,
      titulo: '¡Jefe final!',
      mision: 'El Megamonstruo es el jefe final. ¡Lee cuentos y escribe frases para vencerlo!',
      objetivos: {
        espacio: 'Juntar todo: mapas, instrucciones de varios pasos y copiar figuras.',
        escribo: 'Frases en la pauta: mayúscula al inicio, espacio de un dedo entre palabras y punto al final. Renglón más pequeño.',
        leo: 'LL, CH y palabras con letra al final (sol, pan, mar). Cuentos cortos y preguntas.'
      },
      letrasLeo: ['ll', 'ch', 'cierre'],
      letrasEscribo: ['frases'],
      consejos: [
        'Espacio de un dedo: que ponga su dedito después de cada palabra antes de escribir la siguiente.',
        'Letra al final: "so" + "l" = sol. Primero la sílaba conocida y luego pega la última letra.',
        'Lo que sigue en primaria: que, qui, ce, ci, ge, gi y las trabadas (pl, tr, br). No hace falta adelantarlas.',
        'Guarden este cuaderno: comparen la primera y la última hoja de su nombre.'
      ],
      avanzar: [
        'Lee un cuento corto de 4 o 5 renglones con ayuda mínima.',
        'Copia una frase con mayúscula, espacios y punto.',
        'Sigue un mapa de 3 instrucciones.'
      ],
      reto: { silabas: ['lla', 'cho', 'lle', 'chi', 'llo', 'cha', 'sol', 'pan', 'mar', 'sal'], palabras: ['llave', 'leche', 'tamal'], frase: 'El pan tiene miel.' },
      dias: [
        {
          cuerpo: 'Búsqueda del tesoro por la casa con 3 pistas: "camina 3 pasos a la derecha, busca abajo del sillón...".',
          oral: 'lla, lle, lli, llo, llu. ¿Qué tiene ll? llave, pollo, silla, galleta.',
          espacio: { t: 'mapa' },
          escribo: [{ t: 'frase', f: 'Mi oso.' }, { t: 'frase', f: 'La luna.' }],
          escriboTip: 'Mayúscula al empezar, espacio de un dedo entre palabras y punto al final.',
          leo: [{ t: 'tobogan', silabas: ['lla', 'lle', 'lli', 'llo', 'llu'] }, { t: 'tarjetas', palabras: ['llave', 'pollo', 'silla', 'galleta', 'llama', 'gallo'] }]
        },
        {
          cuerpo: 'Estornudo de monstruo: "¡aaa-CHÚ!" cada vez que oiga una palabra con ch (chile, leche, coche).',
          oral: 'Une los sonidos: "ch... i... l... e" → ¡chile!',
          espacio: { t: 'dibujaDonde', centro: 'castillo', ins: [['sol', 'ARRIBA a la DERECHA'], ['árbol', 'a la IZQUIERDA del castillo'], ['flor', 'ABAJO a la DERECHA'], ['nube', 'ARRIBA a la IZQUIERDA']] },
          escribo: [{ t: 'frase', f: 'El gato.' }, { t: 'frase', f: 'Mi papá.' }],
          escriboTip: 'Revisen juntos: ¿empezó con mayúscula? ¿dejó espacios? ¿puso punto?',
          leo: [{ t: 'tobogan', silabas: ['cha', 'che', 'chi', 'cho', 'chu'] }, { t: 'tarjetas', palabras: ['chile', 'leche', 'coche', 'noche', 'mochila', 'cuchara'] }]
        },
        {
          cuerpo: 'Laberinto de cojines: armen un camino con vueltas y que lo recorra contando las vueltas a la derecha y a la izquierda.',
          oral: 'Pega la última letra: "so" + "l" = sol; "pa" + "n" = pan; "ma" + "r" = mar.',
          espacio: { t: 'flechas', n: 6, inicio: [0, 0], pasos: '→→↓↓→→↓↓←', meta: 'tesoro' },
          escribo: [{ t: 'frase', f: 'Amo a mamá.' }],
          escriboTip: 'Una frase completa: que la lea en voz alta cuando la termine.',
          leo: [{ t: 'cierre', palabras: [['so', 'l', 'sol'], ['pa', 'n', 'pan'], ['ma', 'r', 'mar'], ['sa', 'l', 'sal']] }, { t: 'tarjetas', palabras: ['miel', 'tamal', 'nopal', 'limón', 'avión', 'camión'] }]
        },
        {
          cuerpo: 'Monstruo come-palabras: usted dice una palabra y él la "come" si tiene ll o ch (llave sí, mesa no).',
          oral: 'Cuéntame un cuento de monstruos inventado, con principio, en medio y final.',
          espacio: { t: 'copia', n: 6, fig: [[[1, 1], [4, 1], [4, 4], [1, 4], [1, 1]], [[2, 2], [2, 2.01]], [[3, 2], [3, 2.01]], [[2, 3], [3, 3]], [[1, 1], [0, 0]], [[4, 1], [5, 0]], [[2, 4], [2, 5]], [[3, 4], [3, 5]]] },
          escribo: [{ t: 'frase', f: 'El sol sale.' }],
          escriboTip: 'Ya escribe frases: pídale que le lea lo que escribió.',
          leo: [{ t: 'cuento', id: 'nam' }]
        },
        {
          cuerpo: 'Desfile de campeón: caminata de victoria por la casa con música. ¡Venció al jefe final!',
          oral: 'Que le cuente a alguien de la familia lo que aprendió en los 8 niveles.',
          espacio: { t: 'flechasInversa', n: 6, inicio: [0, 5], meta: [5, 0], comida: 'corona' },
          escribo: [{ t: 'fraseNombre' }],
          escriboTip: 'La frase final con su nombre. ¡Para enmarcar!',
          leo: [{ t: 'cuento', id: 'mochila' }]
        }
      ]
    }
  ];

  // Cuentos (con {N} = nombre del niño o "Beto")
  const CUENTOS = {
    rufo: {
      titulo: 'El perro Rufo',
      img: 'perro',
      lineas: ['Rufo es el perro de {N}.', 'Rufo corre y corre.', 'Rufo mira una rana.', 'La rana se va.', 'Rufo come su comida.'],
      preguntas: [
        { q: '¿Quién es Rufo?', op: ['gato', 'perro', 'loro'], ok: 1 },
        { q: '¿Qué mira Rufo?', op: ['luna', 'pato', 'rana'], ok: 2 }
      ]
    },
    nam: {
      titulo: 'Ñam, el monstruo',
      monstruo: 'nam',
      lineas: ['Ñam es un monstruo.', 'Ñam es morado.', 'A Ñam le gusta comer.', 'Ñam come una galleta.', 'Ñam come un tamal.', '¡Ñam, ñam! ¡Está rico!'],
      preguntas: [
        { q: '¿De qué color es Ñam?', op: ['color:#c8b0ff', 'color:#86d97f', 'color:#ffb74d'], ok: 0 },
        { q: '¿Qué come Ñam?', op: ['pera', 'galleta', 'uva'], ok: 1 }
      ]
    },
    mochila: {
      titulo: 'La mochila de {N}',
      img: 'mochila',
      lineas: ['{N} tiene una mochila.', 'En la mochila tiene un lápiz.', 'También tiene una galleta.', '{N} va a la escuela.', 'En la escuela lee y pinta.', '¡{N} ya sabe leer!'],
      preguntas: [
        { q: '¿Qué tiene en la mochila?', op: ['pelota', 'lápiz', 'helado'], ok: 1 },
        { q: '¿A dónde va?', op: ['escuela', 'mar', 'casa'], ok: 0 }
      ]
    }
  };

  // Vocales con dibujo
  const VOCALES = [['a', 'abeja'], ['e', 'elefante'], ['i', 'iguana'], ['o', 'oso'], ['u', 'uva']];

  // Palabras por nivel para los juegos (solo las que tienen dibujo)
  const JUEGO_PALABRAS = {
    1: ['mamá'],
    2: ['oso', 'ola', 'ala', 'lima', 'mamá', 'loma'],
    3: ['pato', 'papá', 'mapa', 'sapo', 'pila', 'lupa', 'sopa', 'papa', 'tomate', 'moto', 'pelota', 'maleta', 'paleta', 'seta'],
    4: ['mano', 'luna', 'mono', 'pino', 'nena', 'tina', 'dado', 'dedo', 'nido', 'dona', 'moneda', 'dino', 'paloma'],
    5: ['casa', 'cama', 'taco', 'coco', 'copa', 'camote', 'boca', 'bota', 'bebé', 'lobo', 'vaca', 'uva', 'vela', 'nube'],
    6: ['foca', 'sofá', 'café', 'foco', 'fideo', 'foto', 'jugo', 'ojo', 'ajo', 'caja', 'gato', 'gota', 'mago', 'gusano'],
    7: ['rana', 'rosa', 'ropa', 'rata', 'regalo', 'pera', 'loro', 'toro', 'perro', 'burro', 'gorro', 'niño', 'niña', 'piña', 'araña', 'moño'],
    8: ['llave', 'pollo', 'silla', 'galleta', 'llama', 'gallo', 'chile', 'leche', 'coche', 'mochila', 'cuchara', 'sol', 'pan', 'sal', 'miel', 'tamal', 'nopal', 'limón', 'avión', 'camión']
  };

  // Consonantes acumuladas por nivel (para el tobogán y Ñam)
  const CONSONANTES = { 1: ['m'], 2: ['m', 's', 'l'], 3: ['m', 's', 'l', 'p', 't'], 4: ['m', 's', 'l', 'p', 't', 'n', 'd'], 5: ['m', 's', 'l', 'p', 't', 'n', 'd', 'c', 'b', 'v'], 6: ['m', 's', 'l', 'p', 't', 'n', 'd', 'c', 'b', 'v', 'f', 'j', 'g'], 7: ['m', 's', 'l', 'p', 't', 'n', 'd', 'c', 'b', 'v', 'f', 'j', 'g', 'r', 'ñ'], 8: ['m', 's', 'l', 'p', 't', 'n', 'd', 'c', 'b', 'v', 'f', 'j', 'g', 'r', 'ñ', 'll', 'ch'] };
  function silabasDe(c) {
    if (c === 'c') return ['ca', 'co', 'cu'];
    if (c === 'g') return ['ga', 'go', 'gu'];
    return SILABAS(c);
  }

  // Cómo suena cada letra (para los papás)
  const SONIDOS = {
    m: '"mmm", como cuando algo está rico', s: '"sss", como serpiente', l: '"lll", con la lengua arriba',
    p: '"p", como soplar una vela (no se estira)', t: '"t", como el tic-tac del reloj (no se estira)',
    n: '"nnn", como mosquito', d: '"d", con la lengua detrás de los dientes',
    c: '"k", como tos de monstruo (solo con a, o, u)', b: '"b", como burbuja', v: 'igual que la b',
    f: '"fff", como gato enojado', j: '"jjj", como suspiro de cansado', g: '"g", como hacer gárgaras (con a, o, u)',
    r: 'suave en medio (pera) y fuerte al inicio (rana)', rr: '"rrr", como motor', ñ: '"ñññ", como en niño',
    ll: '"y", como en llave', ch: '"ch", como estornudo: ¡aaa-chú!', cierre: 'sílaba + última letra: so + l = sol'
  };

  root.CURRICULUM = { WEEKS, CUENTOS, VOCALES, JUEGO_PALABRAS, CONSONANTES, silabasDe, SONIDOS, SITE: 'https://jorch01.github.io/leo-y-escribo/' };
})(typeof window !== 'undefined' ? window : globalThis);
