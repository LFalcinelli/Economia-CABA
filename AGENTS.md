# La economía de la Ciudad · guía para agentes

Sitio estático de La Libertad Avanza CABA sobre la economía porteña. No usa frameworks ni paso de compilación: HTML, CSS y JavaScript plano, con d3 7.9.0 desde cdnjs y Montserrat desde Google Fonts.

## Cómo correrlo

```bash
python3 -m http.server 8000   # desde esta carpeta
# abrir http://localhost:8000
```

También funciona abriendo `index.html` directamente en el navegador.

## Archivos y orden de carga

Los scripts comparten variables globales (`const` de nivel superior), así que **el orden de `index.html` es obligatorio**:

| Orden | Archivo | Qué tiene |
|---|---|---|
| 1 | `js/datos/series.js` | `SER`: series mensuales y trimestrales (inflación, riesgo país, alquiler, expensas, hipotecas) |
| 2 | `js/datos/geo.js` | `GEO_AR` (provincias), `GEO_CABA_PT`, `GEO_CB` (comunas): trazados SVG ya proyectados |
| 3 | `js/graficos.js` | Biblioteca: formato (`f0`, `f1`, `pc1`, `spc1`), `base`, `showTip`, `lineChart`, `barChart`, `rankChart`, `stackCols`, `treemapChart`, `dotPlot`, `streetChart` |
| 4 | `js/datos/datos.js` | `D`: datos de rankings, barras y series anuales |
| 5 | `js/config-graficos.js` | Series actualizadas, `CIRCUIT` (mecanismo), `CHARTS` (un gráfico por clave), `TABLES` |
| 6 | `js/app.js` | Tablas desplegables, dibujo y redibujo, pestañas, navegación, relato con gráfico fijo, mapas, efectos al avanzar. Va último |

Los estilos están en `css/estilos.css`.

## Estructura del sitio

- Dos recorridos en la misma página, elegidos con las pestañas de la cabecera:
  - `#p-reforma` · **La reforma**: fondo violeta `#2F0163` (clase `sf-dark`).
  - `#p-ciudad` · **Entender la Ciudad**: fondo papel `#FAF9F5` (clase `sf-paper`).
- Enlaces directos: `#reforma`, `#ciudad` o el `id` de cualquier sección (la pestaña correcta se abre sola).
- La navegación de capítulos de cada recorrido está en `<nav class="nav" data-for="...">`.

## Cómo agregar o cambiar un gráfico

1. En el HTML: `<div class="chart" data-chart="clave"></div>` dentro de una `<figure class="fig">` con `h3`, `.sub` y `.src`.
2. En `js/config-graficos.js`: agregar `clave: el => lineChart(el, {...})` (o `barChart`, `rankChart`, `treemapChart`, `stackCols`) dentro de `CHARTS`.
3. Tabla opcional: `<div data-table="clave"></div>` y una entrada en `TABLES`.
4. Los gráficos se redibujan solos al cambiar el ancho y al mostrar un recorrido.

## Convenciones visuales (no cambiarlas sin pedido)

- **Paleta**: violeta `#2F0163`, oro `#EFB041`, celeste `#39B5E6`, naranja `#E2602F`, violeta medio `#6C4C99`. Los colores de gráfico salen de variables CSS por superficie (`--ch-*`, `--gk`, `--gm`, `--gl`).
- **Colores por gobierno nacional** (roles `k`, `m`, `l`, `o`):
  - `k` kirchnerismo (2003–2015 y 2020–2023): celeste pastel.
  - `m` Macri (2016–2019): amarillo.
  - `l` Milei (desde diciembre de 2023): blanco sobre violeta, violeta sobre papel.
  - `o` gobiernos previos a 2003: gris.
  - Ayudas: `gov(año)`, `GOVSEG`, `govName(fecha)`. El mínimo de una serie va en naranja (`neg`).
- **Líneas**: curva suavizada (`d3.curveMonotoneX`), grosor 3,6 la principal y 2,8 la secundaria, marcadores circulares de centro blanco con borde del color de la línea.
  - `segs` cambia el color por período.
  - `extend` agrega un tramo punteado.
  - `markers` dibuja líneas verticales punteadas («Asume Massa», «Asume Milei»).
  - `xTicks: "months"` muestra la inicial de cada mes y el año debajo.
- **Barras**: colores por gobierno. `shade` sombrea un período (por ejemplo, la Ley de Alquileres, 2020–2023) y `partial` marca un año incompleto.
- **Composiciones**: rectángulos (`treemapChart`) con la etiqueta adentro.
- **Pop-ups**: todo gráfico y mapa muestra su dato al pasar el cursor o tocar (`showTip`).
- **Movimiento**:
  - Los bloques pasan de `.pre` a `.play` al entrar en pantalla, partiendo de un estado visible.
  - Las líneas se dibujan, las barras crecen y las cifras cuentan.
  - Siempre respetar `prefers-reduced-motion`.
- **Ancho**: contenido a 1180 px como máximo. Probar siempre en 390 px de ancho: nada puede generar desplazamiento horizontal de la página.

## Convenciones de texto

- Español rioplatense, voz de LLA a favor de la reforma nacional y crítica de la gestión porteña.
- La interpretación política va siempre separada del dato, con la etiqueta **Lectura LLA**. Etiquetas de procedencia: **Dato oficial**, **Cálculo propio**, **Lectura LLA**.
- No usar «transformación» (término de la gestión Rodríguez Larreta). Usar reforma, estabilización, orden fiscal.
- No usar marcos de desigualdad («tres ciudades en una», «las puntas»). El foco está en la pobreza y el empleo, sin leer las diferencias entre zonas de forma peyorativa.
- Todo gráfico lleva su fuente. No cambiar un dato sin una fuente pública que lo respalde.

## Datos pendientes

1. Superficie publicada en alquiler: reemplazar `D.m2` por la serie de IDECBA (`MI_DAS2_AX02.xlsx`).
2. Ingreso per cápita familiar por comuna (IDECBA, 2008/2025): hoy los ingresos del mapa de comunas se muestran por zona.
3. Patentamientos por provincia enero–agosto de 2026 (DNRPA): hoy `D.autos` y `D.motos` son enero–julio.
4. Riesgo país al cierre de julio y agosto de 2026 (hoy 420, del documento de trabajo).
5. Recaudación de AGIP deflactada: hoy la fuente es Centro CEPA.
