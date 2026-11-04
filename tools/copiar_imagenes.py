"""Genera los archivos de dibujos a partir del paquete de OpenMoji.

Uso:
  npm pack openmoji && tar -xzf openmoji-*.tgz
  python3 tools/copiar_imagenes.py package

Crea:
  js/imagenes.js       palabra -> código del dibujo
  js/dibujos.js        dibujos a color (sitio de juegos)
  js/dibujos-linea.js  dibujos de contorno para colorear (cuaderno)
"""
import os, re, sys, json
sys.path.insert(0, os.path.dirname(__file__))
from emoji_map import WORDS

base = sys.argv[1]
root = os.path.join(os.path.dirname(__file__), '..')

def hexes(e):
    cps = [f"{ord(c):04X}" for c in e]
    yield '-'.join(cps)
    yield '-'.join(c for c in cps if c != 'FE0F')

def limpio(path):
    s = open(path, encoding='utf-8').read()
    s = re.sub(r'<\?xml[^>]*>', '', s)
    s = re.sub(r'<!--.*?-->', '', s, flags=re.S)
    return re.sub(r'\s+', ' ', s).replace('> <', '><').strip()

mapa, color, linea = {}, {}, {}
for w, e in WORDS.items():
    for h in hexes(e):
        if os.path.exists(f"{base}/black/svg/{h}.svg"):
            mapa[w] = h
            color[h] = limpio(f"{base}/color/svg/{h}.svg")
            linea[h] = limpio(f"{base}/black/svg/{h}.svg")
            break
    else:
        print('FALTA', w, e)

def js(nombre, var, data, nota):
    txt = f"/* {nota} Generado por tools/copiar_imagenes.py */\n(function(root){{root.{var}=" + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ";})(typeof window!=='undefined'?window:globalThis);\n"
    open(os.path.join(root, 'js', nombre), 'w', encoding='utf-8').write(txt)
    print(nombre, len(txt) // 1024, 'KB')

js('imagenes.js', 'IMG', mapa, 'Palabra -> dibujo de OpenMoji (CC BY-SA 4.0, openmoji.org).')
js('dibujos.js', 'DIBUJOS', color, 'Dibujos a color de OpenMoji (CC BY-SA 4.0, openmoji.org).')
js('dibujos-linea.js', 'DIBUJOS_LINEA', linea, 'Dibujos de contorno de OpenMoji (CC BY-SA 4.0, openmoji.org).')
