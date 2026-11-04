# Leo y escribo con los monstruos

Plan de 8 semanas para practicar en casa la **lectoescritura de preescolar** (3.º de kínder, 5 a 6 años), con monstruos y formato de videojuego. Tiene tres partes:

- **Espacio:** arriba, abajo, izquierda, derecha y cuadrículas con flechas.
- **Escribo:** letra script dentro de la pauta *cielo / pasto / tierra*, con punto verde de inicio y flechas de dirección.
- **Leo:** unir sonidos (tobogán de sonidos), sílabas, palabras, frases y cuentos cortos.

**Sitio de juegos:** https://jorch01.github.io/leo-y-escribo/

## Qué incluye

| Archivo | Qué es |
|---|---|
| `index.html` | Juegos con voz para tablet o celular: ¿Dónde está?, Código de flechas, Traza letras, Tobogán de sonidos, Dale de comer a Ñam, Lee y elige y Arma la palabra. También tiene la colección de monstruos y la sección Para papás. |
| `cuaderno.html` | Cuaderno imprimible en tamaño carta. Se puede abrir con `?semana=1` (del 1 al 8, o `todo`), `&nombre=` y `&completo=` para personalizarlo. El nombre no se guarda en ningún lado. |
| `pdf/` | Cuadernos ya generados: guía para papás, nivel 1 a 8 y el cuaderno completo. |
| `js/curriculum.js` | El plan completo: un solo archivo de datos que alimenta tanto el cuaderno como los juegos. |

## Cómo se usa

De lunes a viernes, 15 a 20 minutos al día: un calentamiento con el cuerpo, la hoja A (Espacio + Escribo), un juego de voz y la hoja B (Leo). El viernes toca la hoja del jefe: si el niño la vence, colorea su insignia y en el sitio se desbloquea el monstruo. La guía para papás (`pdf/guia-para-papas.pdf`) explica el método.

## Volver a generar los PDF

Requiere Node y Playwright con Chromium.

```bash
node tools/build-pdf.mjs pdf                         # versión sin nombre
node tools/build-pdf.mjs salida "Nombre" "Nombre completo"   # versión personalizada
```

Los dibujos vienen de OpenMoji. Para regenerarlos se usan `npm pack openmoji` y `python3 tools/copiar_imagenes.py <carpeta del paquete>`.

## Créditos

- Dibujos de objetos: [OpenMoji](https://openmoji.org), licencia CC BY-SA 4.0.
- Fuentes: Andika (SIL International) y Fredoka, licencia SIL Open Font License 1.1 (ver `assets/fonts`).
- Monstruos, letras de trazo y plan de trabajo: originales de este proyecto.

## Privacidad

El sitio no usa cuentas, cookies de terceros ni analítica. El progreso (estrellas y monstruos) se guarda solo en el navegador del dispositivo.
