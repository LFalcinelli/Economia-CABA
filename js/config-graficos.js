"use strict";
/* Series actualizadas, mecanismo y configuración de cada gráfico (clave data-chart del HTML). */

/* ============ series actualizadas ============ */
// Inflación mensual, ago-2022 a ago-2026: [mes, Ciudad (IPCBA), Nación (IPC)]
const CABA_M = [6.2,5.6,7.0,5.8,5.8, 7.3,6.0,7.1,7.8,7.5,7.1,7.3,10.8,12.0,9.4,11.9,21.1, 21.7,14.1,13.2,9.8,4.4,4.8,5.1,4.2,4.0,3.2,3.2,3.3, 3.1,2.1,3.2,2.3,1.6,2.1,2.5,1.6,2.2,2.2,2.4,2.7, 3.1,2.6,3.0,2.5,2.1,1.8,2.9,1.7];
const NAC_M = [7.0,6.2,6.3,4.9,5.1, 6.0,6.6,7.7,8.4,7.8,6.0,6.3,12.4,12.7,8.3,12.8,25.5, 20.6,13.2,11.0,8.8,4.2,4.6,4.0,4.2,3.5,2.7,2.4,2.7, 2.2,2.4,3.7,2.8,1.5,1.6,1.9,1.9,2.1,2.3,2.5,2.9, 2.9,2.9,3.4,2.6,2.1,1.9,2.1,1.7];
const monthsFrom = (y, m, n) => Array.from({length: n}, (_, i) => { const d = new Date(y, m - 1 + i, 1); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0"); });
SER.infl = monthsFrom(2022, 8, CABA_M.length).map((k, i) => [k, CABA_M[i], NAC_M[i]]);
// Riesgo país: documento de trabajo hasta may-2023; planilla de coyuntura (fin de mes) desde jun-2023
const RP_PL = {"2023-06":2037,"2023-07":1980,"2023-08":2105,"2023-09":2543,"2023-10":2577,"2023-11":1982,"2023-12":1906,"2024-01":1950,"2024-02":1705,"2024-03":1439,"2024-04":1216,"2024-05":1312,"2024-06":1456,"2024-07":1507,"2024-08":1433,"2024-09":1290,"2024-10":984,"2024-11":752,"2024-12":635,"2025-01":618,"2025-02":780,"2025-03":816,"2025-04":726,"2025-05":663,"2025-06":701,"2025-07":730,"2025-08":829,"2025-09":1222,"2025-10":657,"2025-11":648,"2025-12":571,"2026-01":496,"2026-02":572,"2026-03":617,"2026-04":567,"2026-05":493,"2026-06":435,"2026-07":420,"2026-08":420,"2026-09":556};
SER.rp = SER.rp.filter(r => r[0] < "2023-06").concat(Object.entries(RP_PL));
// Alquiler de 2 ambientes, llevado a pesos de agosto de 2026 (IPCBA jul 2,9% y ago 1,7%)
const K_AGO = 1.029 * 1.017;
SER.alqAgo = SER.alq.map(([k, v]) => [k, v * K_AGO]);
const BRECHA = {"2023-01":94.8,"2023-02":89.7,"2023-03":81.9,"2023-04":89.8,"2023-05":99.3,"2023-06":87.9,"2023-07":85.6,"2023-08":102.4,"2023-09":101.7,"2023-10":156.8,"2023-11":171.3,"2023-12":61.3,"2024-01":33.9,"2024-02":26.1,"2024-03":13.7,"2024-04":11.8,"2024-05":22.5,"2024-06":37.6,"2024-07":48.8,"2024-08":38.1,"2024-09":26.9,"2024-10":19.2,"2024-11":10.3,"2024-12":7.7,"2025-01":14.7,"2025-02":12.5,"2025-03":14.8,"2025-04":10.6,"2025-05":0.1,"2025-06":-0.6,"2025-07":0.5,"2025-08":-0.4,"2025-09":-0.2,"2025-10":0.4,"2025-11":-1.2,"2025-12":0.3,"2026-01":2.1,"2026-02":0.3,"2026-03":0.1,"2026-04":0.1,"2026-05":0.0,"2026-06":-0.6};

const gov = y => y < 2003 ? "o" : y <= 2015 ? "k" : y <= 2019 ? "m" : y <= 2023 ? "k" : "l";
const GOVSEG = [{until: "2016-01", role: "k"}, {until: "2020-01", role: "m"}, {until: "2024-01", role: "k"}, {role: "l"}];
Object.assign(D, {
  usd2: [["2022","1er",17.6],["2022","2do",17.4],["2022","3er",22.6],["2022","4to",24.3],["2023","1er",34.4],["2023","2do",50.7],["2023","3er",66.5],["2023","4to",29.0],["2024","1er",30.9],["2024","2do",25.4],["2024","3er",29.2],["2024","4to",20.9],["2025","1er",22.6],["2025","2do",20.1],["2025","3er",22.6,1],["2025","4to",24.8,1],["2026","1er",27.6,1],["2026","2do",25.4,1]],
  desocQ2: [[2015,8.6],[2016,10.5],[2017,10.5],[2018,10.3],[2019,10.9],[2020,14.7],[2021,9.4],[2022,8.1],[2023,6.8],[2024,7.3],[2025,7.7],[2026,7.2]],
  pob31: [["2016-1",32.2],["2016-2",30.3],["2017-1",28.6],["2017-2",25.7],["2018-1",27.3],["2018-2",32.0],["2019-1",35.4],["2019-2",35.5],["2020-1",40.9],["2020-2",42.0],["2021-1",40.6],["2021-2",37.3],["2022-1",36.5],["2022-2",39.2],["2023-1",40.1],["2023-2",41.7],["2024-1",52.9],["2024-2",38.1],["2025-1",31.6],["2025-2",28.2],["2026-1",32.3]],
  etoi: [[2015,10.3],[2016,13.0],[2017,11.8],[2018,14.9],[2019,15.5],[2020,21.1],[2021,16.2],[2022,17.2],[2023,22.1],[2024,20.7],[2025,14.7]],
  escrA: [[1994,70091],[1995,56292],[1996,64360],[1997,76416],[1998,74359],[1999,62680],[2000,64892],[2001,52332],[2002,53632],[2003,60554],[2004,60836],[2005,71074],[2006,70240],[2007,73569],[2008,69108],[2009,51672],[2010,62290],[2011,64040],[2012,46631],[2013,35911],[2014,33695],[2015,37392],[2016,44984],[2017,63393],[2018,55588],[2019,33411],[2020,18764],[2021,28832],[2022,33753],[2023,40539],[2024,54770],[2025,69461],[2026,41583]],
  rigi: [["San Juan",13600],["Neuquén",9071],["Río Negro",7000],["Salta",3482],["Mendoza",1379],["Catamarca",1229],["Jujuy",1166],["Buenos Aires",562],["Santa Fe",277]],
  alqCom: {1:702922,2:800626,3:681859,4:649494,5:728541,6:767392,7:684567,9:694176,10:704743,11:717302,12:810740,13:833491,14:839053,15:791520}
});
const semD = k => { const [y, s] = k.split("-"); return y + (s === "1" ? "-04" : "-10"); };
const semLab = d => (d.getMonth() < 6 ? "1er" : "2do") + " semestre de " + d.getFullYear();

const CIRCUIT = [
  {t: "Previsibilidad", k: "Condición de entrada", p: "Con déficit cero y sin emisión para financiar al Tesoro, la inflación baja y el dólar deja de tener varios precios. La brecha entre el dólar libre y el oficial pasó de 171% en noviembre de 2023 a cero.", c: "circ0", src: "Brecha entre el dólar blue y el oficial mayorista, promedio mensual. Planilla de coyuntura, sobre BCRA y Ámbito."},
  {t: "Ahorro", k: "Mecanismo", p: "Cuando la moneda deja de perder valor, el ahorro vuelve a los bancos. Los depósitos privados en dólares casi se triplicaron desde diciembre de 2023: el dólar del colchón volvió al sistema.", c: "circ1", src: "Depósitos del sector privado, en miles de millones de dólares; los depósitos en pesos, convertidos a dólares. BCRA, vía <a href=\"https://www.infobae.com/economia/2026/08/24/los-depositos-en-dolares-crecieron-10-veces-mas-que-en-pesos-que-puede-pasar-con-el-credito-segun-un-informe-privado/\" target=\"_blank\" rel=\"noopener\">Infobae</a>."},
  {t: "Crédito", k: "Mecanismo", p: "Los depósitos se convierten en préstamos a plazos largos. Los bancos prestan el doble de lo que captan que a comienzos de 2024, y la hipoteca volvió a existir.", c: "circ2", src: "Préstamos sobre depósitos: BCRA, vía <a href=\"https://dolarhoy.com/economia/credito-al-sector-privado-alcanza-maximo-en-ocho-anos-pese-a-aumento-de-morosidad-2026528113426\" target=\"_blank\" rel=\"noopener\">Dolarhoy</a>. Compraventas con hipoteca: Colegio de Escribanos de la Ciudad."},
  {t: "Inversión", k: "Mecanismo", p: "Con crédito y reglas estables se decide invertir. El Régimen de Incentivo para Grandes Inversiones ya aprobó 20 proyectos en nueve provincias. La Ciudad no tiene ninguno: su economía de servicios necesita su propia baja de impuestos.", c: "circ3", src: "Inversión comprometida en proyectos RIGI aprobados, en millones de dólares, por provincia. <a href=\"https://www.infobae.com/economia/2026/07/11/el-mapa-del-rigi-como-avanzan-las-20-iniciativas-que-comprometieron-usd-57000-millones-en-inversiones-y-prometen-100000-empleos/\" target=\"_blank\" rel=\"noopener\">Infobae, julio de 2026</a>. Proyectos y montos oficiales: <a href=\"https://www.argentina.gob.ar/economia/rigi\" target=\"_blank\" rel=\"noopener\">web del RIGI, Ministerio de Economía</a>."},
  {t: "Ingresos", k: "Retroalimentación", p: "La inversión puede generar empleo e ingresos que vuelven al ahorro. La pobreza en los 31 aglomerados bajó de 41,7% en el segundo semestre de 2023 a 28,2% en el de 2025, pero repuntó a 32,3% en el primero de 2026. El eslabón que controla la Ciudad es la inversión local.", c: "circ4", src: "Personas bajo las líneas de pobreza e indigencia, 31 aglomerados urbanos. INDEC, EPH, primer semestre de 2026."}
];

/* ============ configuración de cada gráfico ============ */
const bandOf = el => el.dataset.band ? el.dataset.band.split(",") : null;
const CHARTS = {
  inflacion: el => lineChart(el, {
    series: [
      {name: "Nación", role: "l", w: 2.8, values: SER.infl.map(r => [r[0], r[2]])},
      {name: "Ciudad", role: "hi", w: 3.6, values: SER.infl.map(r => [r[0], r[1]])}
    ],
    y: {domain: [0, 27], ticks: [0, 5, 10, 15, 20, 25], fmt: pc0}, xTicks: "months", band: bandOf(el),
    endFmt: pc1, tipFmt: pc1, endLabels: true, tipNote: d => govName(d),
    markers: [{d: "2022-08", label: "Asume Massa", short: "Massa"}, {d: "2023-12", label: "Asume Milei", short: "Milei"}],
    ann: [{d: "2023-12", v: 25.5, text: "25,5%", dx: 10, dy: 4, cls: "ann", hideNarrow: true}]
  }),
  riesgo: el => lineChart(el, {
    series: [{name: "Riesgo país", role: "l", w: 3, segs: [{until: "2019-12", role: "m"}, {until: "2023-12", role: "k"}, {role: "l"}], values: SER.rp, endName: "23-sep"}],
    y: {domain: [0, 4000], ticks: [0, 1000, 2000, 3000, 4000], fmt: f0},
    endFmt: v => f0(v), tipFmt: v => f0(v) + " pb", endLabels: true, xTicks: yearTicks(1), tipNote: d => govName(d),
    markers: [{d: "2019-12", label: "Asume Fernández", short: "Fernández", anchor: "end"}, {d: "2023-12", label: "Asume Milei", short: "Milei"}],
    ann: [{d: "2020-04", v: 3758, text: "Pandemia", dx: 12, dy: 4, hideNarrow: true}, {d: "2026-07", v: 420, text: "Mínimo: 402\nmediados de julio", dx: -8, dy: 44, anchor: "end", hideNarrow: true}]
  }),
  m2: el => barChart(el, {
    data: D.m2.map(([y, v]) => ({label: y === 2026 ? "2026*" : String(y), v, role: y === 2023 ? "neg" : y <= 2015 ? "k" : y <= 2019 ? "m" : y <= 2022 ? "k" : "l"})),
    values: (d, i, n) => !n || [0, 9, 12].includes(i), vfmt: (v, n) => n ? f0(v / 1000) + " mil" : f0(v),
    xlab: (d, i, n) => n ? (i % 2 === 0 || i === 12 ? "’" + d.label.slice(2) : "") : d.label,
    shade: {from: 6, to: 9, label: "Ley de Alquileres", short: "Ley 27.551", sub: "julio 2020 a diciembre 2023", subShort: "2020–2023"},
    bracket: {from: 9, to: 12, text: "×5,7"}, tipFmt: v => f0(v) + " m²", tipLabel: d => "Junio de " + d.label.replace("*", ""), tipName: "Superficie"
  }),
  alquiler: el => lineChart(el, {
    series: [{name: "Alquiler", role: "l", w: 3.2, segs: [{until: "2023-12", role: "k"}, {role: "l"}], values: SER.alqAgo, noEnd: true}],
    y: {domain: [400000, 1050000], ticks: [400000, 600000, 800000, 1000000], fmt: v => f0(v / 1000) + " mil"},
    tipFmt: v => "$ " + f0(Math.round(v / 1000) * 1000), m: {l: 58, r: 22, b: 50}, xTicks: "months",
    breakAxis: true, height: W => Math.max(300, Math.min(420, W * .62)),
    markers: [{d: "2023-12", label: "DNU 70/2023", short: "DNU"}],
    ann: [
      {d: "2023-11", v: 908240 * K_AGO, text: "$ " + f0(Math.round(908240 * K_AGO / 1000) * 1000), dx: -6, dy: -14, anchor: "end"},
      {d: "2026-06", v: 512380 * K_AGO, text: "$ " + f0(Math.round(512380 * K_AGO / 1000) * 1000) + "\njun-26", dx: 0, dy: -46, anchor: "end"},
      {d: "2025-02", v: 740000, text: "−43,6%", cls: "ann", anchor: "middle", tone: "l"}
    ]
  }),
  usd: el => stackCols(el, {
    data: D.usd2.map(([y, q, v, p]) => ({y, q, v, prov: !!p})),
    groups: [{from: 0, to: 3, label: "2022"}, {from: 4, to: 7, label: "2023"}, {from: 8, to: 11, label: "2024"}, {from: 12, to: 15, label: "2025"}, {from: 16, to: 17, label: "2026"}],
    mark: (d, i) => [6, 17].includes(i)
  }),
  hipProv: el => rankChart(el, {data: D.hipProv.map(([l, v]) => ({label: l, v, role: l === "CABA" ? "hi" : "ctx"})), fmt: v => f1(v), rowH: 24}),
  hipq: el => barChart(el, {
    data: SER.hipq.map(([y, q, v]) => ({label: q + " trim. " + y, v, role: gov(+y)})),
    values: (d, i) => [0, 24, 49, 52].includes(i), vfmt: v => v + "%", max: 42, pad: .18, tipName: "Con hipoteca", tipExtra: d => govName(new Date(+d.label.slice(-4), 5, 1)),
    groups: n => d3.range(2012, 2026).map((yr, k) => ({from: k * 4, to: Math.min(k * 4 + 3, 53), label: n ? (yr % 2 === 0 ? "’" + String(yr).slice(2) : "") : String(yr)})),
    height: W => Math.max(240, Math.min(320, W * .44))
  }),
  escr: el => barChart(el, {
    data: D.escr.map(([y, v]) => ({label: String(y), v, role: gov(y)})),
    values: (d, i, n) => !n ? [0, 8, 10, 14, 16].includes(i) : [8, 10, 16].includes(i),
    vfmt: (v, n) => n ? f1(v / 1000) + " mil" : f0(v),
    xlab: (d, i, n) => n ? (i % 4 === 0 || i === 16 ? "’" + d.label.slice(2) : "") : (i % 2 === 0 ? d.label : ""),
    height: W => Math.max(240, Math.min(320, W * .44)), tipFmt: v => f0(v) + " escrituras", tipLabel: d => "Enero a abril de " + d.label, tipName: "Escrituras"
  }),
  pob: el => rankChart(el, {data: D.pob.map(([l, v]) => ({label: l, v, role: l === "CABA" ? "hi" : "ctx"})), fmt: spc0}),
  ind: el => rankChart(el, {data: D.ind.map(([l, v]) => ({label: l, v, role: l === "CABA" ? "hi" : v > 0 ? "neg" : "ctx"})), fmt: spc0}),
  pob31: el => lineChart(el, {
    series: [{name: "Pobreza", role: "l", w: 3.2, segs: [{until: "2020-04", role: "m"}, {until: "2024-04", role: "k"}, {role: "l"}], values: D.pob31.map(([k, v]) => [semD(k), v]), endName: "I-26"}],
    y: {domain: [0, 60], ticks: [0, 15, 30, 45, 60], fmt: pc0}, endLabels: true, endFmt: pc1, tipFmt: pc1, tipDate: semLab, tipNote: d => govName(d),
    xTicks: yearTicks(1), xDomain: ["2016-01", "2026-12"], markers: [{d: "2023-12", label: "Asume Milei", short: "Milei"}],
    ann: [{d: "2024-04", v: 52.9, text: "52,9%", dx: 10, dy: 2}], height: W => Math.max(270, Math.min(400, W * .42))
  }),
  delitos: el => dotPlot(el, {data: D.delitos, domain: [-25, 0], ticks: [-25, -20, -15, -10, -5, 0]}),
  robos: el => rankChart(el, {data: D.robos.map(([l, v]) => ({label: l, v, role: l === "CABA" ? "hi" : l === "Total nacional" ? "ctx2" : "ctx"})), fmt: spc1, rowH: 32, barH: 16}),
  autos: el => rankChart(el, {data: D.autos.map(([l, v]) => ({label: l, v, role: l === "CABA" ? "hi" : v < 0 ? "neg" : "ctx"})), fmt: spc0, rowH: 24}),
  motos: el => rankChart(el, {data: D.motos.map(([l, v]) => ({label: l, v, role: l === "CABA" ? "hi" : v < 0 ? "neg" : "ctx"})), fmt: spc0, rowH: 24}),
  act: el => lineChart(el, {
    series: D.act.map(([n, r, v, sh]) => ({name: n, endShort: sh, role: r === "ctx2" ? "l" : r, w: r === "hi" ? 3.6 : 2.8, values: ["2023-01", "2024-01", "2025-01", "2026-01"].map((d, i) => [d, v[i]])})),
    y: {domain: [93, 104.5], ticks: [94, 96, 98, 100, 102, 104], fmt: v => f0(v)},
    endLabels: true, endFmt: v => f1(v), tipFmt: v => f1(v), endGap: 32,
    xDomain: ["2023-01", "2026-01"], breakAxis: true, ref: {v: 100, label: "Base 100", x: "2024-02"},
    xTicks: (x, n) => ["2023-01", "2024-01", "2025-01", "2026-01"].map((d, i) => ({d: pd(d), label: (n ? "I-" : "I trim. ") + (2023 + i), anchor: i === 0 ? "start" : i === 3 ? "end" : "middle"})),
    tipDate: d => "Primer trimestre de " + d.getFullYear(), m: {l: 40, t: 22}, height: W => Math.max(290, Math.min(420, W * .62))
  }),
  pbg: el => rankChart(el, {data: D.pbg.map(([l, v]) => ({label: l, v, role: v > 0 ? "2" : v < 0 ? "neg" : "ctx"})), fmt: spc0, rowH: 26}),
  food: el => rankChart(el, {data: D.food.map(([l, v]) => ({label: l, v, role: l === "Expensas" ? "neg" : v > 0 ? "ctx2" : "2", bold: l === "Expensas"})), fmt: spc0, rowH: 30, barH: 16, gapAfter: 7}),
  exp: el => lineChart(el, {
    series: [{name: "Expensas", role: "neg", w: 3.4, values: SER.exp, endName: "jun-26"}],
    y: {domain: [-25, 30], ticks: [-20, -10, 0, 10, 20, 30], fmt: v => v === 0 ? "0" : spc0(v)}, xTicks: "months",
    zero: 0, endLabels: true, endFmt: v => spc0(v), tipFmt: spc1, m: {l: 44, b: 50}, height: W => Math.max(280, Math.min(400, W * .6))
  }),
  calle: el => streetChart(el, {data: D.calle}),
  nacimiento: el => treemapChart(el, {data: [
    {label: "Provincia de Buenos Aires", v: 39.5, n: 247, color: "#EFB041", ink: "#2F0163"},
    {label: "Ciudad de Buenos Aires", v: 31.9, n: 200, color: "#FFFFFF", ink: "#2F0163"},
    {label: "Otra provincia", v: 19.3, n: 121, color: "#A8DDF2", ink: "#2F0163"},
    {label: "Otro país", v: 8.3, n: 52, color: "#E2602F", ink: "#fff"},
    {label: "No sabe o no contesta", v: 1.0, color: "rgba(255,255,255,.3)"}
  ], height: W => Math.max(240, Math.min(340, W * .4))}),
  cities: el => rankChart(el, {data: D.cities.map(([l, v]) => ({label: l, v, role: l === "CABA" ? "hi" : "ctx"})), fmt: v => "USD " + f0(v), rowH: 42, barH: 22}),

  /* ---- mecanismo ---- */
  circ0: el => lineChart(el, {
    series: [{name: "Brecha", role: "l", w: 3, segs: [{until: "2023-12", role: "k"}, {role: "l"}], values: Object.entries(BRECHA), endName: "jun-26"}],
    y: {domain: [-10, 180], ticks: [0, 50, 100, 150], fmt: pc0}, zero: 0, endLabels: true, endFmt: v => (Math.abs(v) < 1 ? "0" : f0(v)) + "%", tipFmt: pc1, xTicks: yearTicks(1),
    markers: [{d: "2023-12", label: "Asume Milei", short: "Milei"}], ann: [{d: "2023-11", v: 171.3, text: "171%", dx: -10, dy: 4, anchor: "end"}],
    height: W => Math.max(220, Math.min(300, W * .36))
  }),
  circ1: el => barChart(el, {
    data: [{label: "dic-23", v: 14.1, role: "k"}, {label: "ago-26", v: 40.7, role: "l"}, {label: "dic-23", v: 76.6, role: "k"}, {label: "ago-26", v: 79.2, role: "l"}],
    values: true, vfmt: v => "USD " + f1(v), max: 90, xlab: d => d.label, pad: .35, tipName: "Miles de millones", tipFmt: v => "USD " + f1(v),
    groups: () => [{from: 0, to: 1, label: "Depósitos en dólares"}, {from: 2, to: 3, label: "Depósitos en pesos, en USD"}], height: W => Math.max(220, Math.min(290, W * .36))
  }),
  circ2: el => barChart(el, {
    data: [{label: "ini-24", v: 30, role: "k"}, {label: "may-26", v: 60, role: "l"}, {label: "I-24", v: 3, role: "k"}, {label: "II-25", v: 22, role: "l"}],
    values: true, vfmt: v => v + "%", max: 70, xlab: d => d.label, pad: .35, tipFmt: v => v + "%",
    groups: () => [{from: 0, to: 1, label: "Préstamos sobre depósitos"}, {from: 2, to: 3, label: "Compraventas con hipoteca"}], height: W => Math.max(220, Math.min(290, W * .36))
  }),
  circ3: el => rankChart(el, {data: D.rigi.map(([l, v]) => ({label: l, v, role: "l"})).concat([{label: "Ciudad de Buenos Aires", v: 0, role: "hi", bold: true}]), fmt: v => v ? "USD " + f0(v) + " M" : "sin proyectos", rowH: 26}),
  circ4: el => barChart(el, {
    data: [{label: "II-23", v: 41.7, role: "k"}, {label: "II-25", v: 28.2, role: "l"}, {label: "I-26", v: 32.3, role: "hi"}, {label: "II-23", v: 11.9, role: "k"}, {label: "II-25", v: 6.3, role: "l"}, {label: "I-26", v: 7.5, role: "hi"}],
    values: true, vfmt: v => pc1(v), max: 48, xlab: d => d.label, pad: .35, tipFmt: pc1,
    groups: () => [{from: 0, to: 2, label: "Pobreza"}, {from: 3, to: 5, label: "Indigencia"}], height: W => Math.max(220, Math.min(290, W * .36))
  }),

  /* ---- Entender la Ciudad ---- */
  estructura: el => treemapChart(el, {data: [
    {label: "Servicios, sin comercio: finanzas, inmobiliarias, profesionales, salud, educación", v: 62.52, color: "#2F0163", ink: "#fff"},
    {label: "Comercio", v: 20.66, color: "#39B5E6", ink: "#1D1D1D"},
    {label: "Industria manufacturera", v: 10.77, color: "#EFB041", ink: "#1D1D1D"},
    {label: "Resto: construcción, energía, agro", v: 6.05, color: "#CFCAC1", ink: "#1D1D1D"}
  ]}),
  pgbSerie: el => lineChart(el, {
    series: [{name: "PGB", role: "l", w: 3.4, segs: GOVSEG, values: D.pgb.map(([y, v]) => [y + "-01", v / 155183 * 100]), extend: [["2026-01", 153023 * 1.007 / 155183 * 100]], endName: "I trim. 2026*", endShort: "I-26*"}],
    y: {domain: [55, 105], ticks: [60, 70, 80, 90, 100], fmt: v => f0(v)},
    endLabels: true, endFmt: v => f1(v), tipFmt: v => f1(v), tipDate: d => d.getFullYear() === 2026 ? "2026 (referencia: I trimestre)" : String(d.getFullYear()), tipNote: d => govName(new Date(d.getFullYear(), 5, 1)),
    breakAxis: true, ref: {v: 100, label: "2023 = 100", x: "2004-06"}, xTicks: yearTicks(3), m: {l: 40},
    ann: [{d: "2017-01", v: 150659 / 155183 * 100, text: "2017: 97,1", dx: 0, dy: -16, anchor: "middle", hideNarrow: true}, {d: "2020-01", v: 130515 / 155183 * 100, text: "Pandemia", dx: 0, dy: 24, anchor: "middle"}],
    height: W => Math.max(280, Math.min(420, W * .42))
  }),
  sect: el => rankChart(el, {data: D.sect.map(([l, v]) => ({label: l, v, role: v > 0 ? "2" : "neg"})), fmt: spc1, rowH: 28, barH: 15}),
  desoc: el => barChart(el, {
    data: D.desocQ2.map(([y, v]) => ({label: String(y), v, role: gov(y)})), values: (d, i, n) => !n || [0, 5, 8, 11].includes(i), vfmt: v => f1(v), max: 16,
    xlab: (d, i, n) => n ? (i % 3 === 0 || i === 11 ? "’" + d.label.slice(2) : "") : d.label, pad: .28, height: W => Math.max(240, Math.min(320, W * .5)), tipFmt: pc1, tipLabel: d => "II trimestre de " + d.label, tipName: "Desocupación"
  }),
  desocZona: el => rankChart(el, {data: D.desocZona.map(([l, v, r]) => ({label: l, v, role: r, bold: l === "Ciudad"})), fmt: pc1, rowH: 44, barH: 22, domain: [0, 10]}),
  itfReal: el => rankChart(el, {data: D.itfReal.map(([l, v, r]) => ({label: l, v, role: r, bold: l === "Sur"})), fmt: spc1, rowH: 44, barH: 22}),
  etoi: el => barChart(el, {
    data: D.etoi.map(([y, v]) => ({label: String(y), v, role: gov(y)})), values: true, vfmt: v => f1(v), max: 25, xlab: (d, i, n) => n ? (i % 2 === 0 ? "’" + d.label.slice(2) : "") : d.label,
    pad: .3, height: W => Math.max(240, Math.min(320, W * .44)), tipFmt: pc1, tipLabel: d => "2do semestre de " + d.label, tipName: "Hogares pobres"
  }),
  estratos: el => treemapChart(el, {data: [
    {label: "Sector medio", v: 51.75, color: "#6C4C99", ink: "#fff"},
    {label: "Sectores acomodados", v: 15.68, color: "#2F0163", ink: "#fff"},
    {label: "Hogares pobres", v: 14.67, color: "#E2602F", ink: "#fff"},
    {label: "No pobres vulnerables", v: 9.06, color: "#EFB041", ink: "#1D1D1D"},
    {label: "Sector medio frágil", v: 8.86, color: "#A8DDF2", ink: "#1D1D1D"}
  ]}),
  escrAnual: el => barChart(el, {
    data: D.escrA.map(([y, v]) => ({label: y === 2026 ? "2026*" : String(y), v, role: gov(y), partial: y === 2026})),
    values: (d, i, n) => n ? [3, 31].includes(i) : [3, 13, 26, 31, 32].includes(i), vfmt: (v, n) => n ? f0(v / 1000) + " mil" : f1(v / 1000) + " mil", max: 82000, pad: .18,
    xlab: (d, i, n) => (n ? i % 8 === 0 : i % 4 === 0) || i === 31 ? (n ? "’" + d.label.slice(2, 4) : d.label.slice(0, 4)) : "",
    height: W => Math.max(250, Math.min(340, W * .42)), tipFmt: v => f0(v) + " escrituras", tipName: "Escrituras",
    tipLabel: d => d.partial ? "2026, enero a agosto" : "Año " + d.label, tipExtra: d => govName(new Date(+d.label.slice(0, 4), 5, 1))
  })
};

/* ============ tablas de datos ============ */
const TABLES = {
  inflacion: {cap: "Inflación mensual, en %", h: ["Mes", "Ciudad", "Nación"], rows: () => SER.infl.map(r => [mlabS(pd(r[0])), f1(r[1]), f1(r[2])])},
  escr: {cap: "Escrituras de compraventa, enero a abril", h: ["Año", "Escrituras"], rows: () => D.escr.map(r => [r[0], f0(r[1])])},
  act: {cap: "Actividad, I trim. 2023 = 100", h: ["Serie", "I-23", "I-24", "I-25", "I-26"], rows: () => D.act.map(r => [r[0], ...r[2].map(f1)])},
  calle: {cap: "Personas en situación de calle", h: ["Relevamiento", "Centros de Inclusión", "Vía pública", "Total"], rows: () => D.calle.map(r => [mlabS(pd(r[0])), f0(r[1]), f0(r[2]), f0(r[1] + r[2])])},
  pgbSerie: {cap: "PGB porteño, millones de pesos de 2004", h: ["Año", "PGB", "Índice 2023 = 100", "Var. anual"], rows: () => D.pgb.map((r, i) => [r[0], f0(r[1]), f1(r[1] / 155183 * 100), i ? spc1((r[1] / D.pgb[i - 1][1] - 1) * 100) : "–"])},
  sect: {cap: "Variación por sector, 2025 contra 2023", h: ["Sector (peso 2025)", "Variación"], rows: () => D.sect.map(r => [r[0], spc1(r[1])])},
  pob31: {cap: "Pobreza, 31 aglomerados", h: ["Semestre", "Personas (%)"], rows: () => D.pob31.map(([k, v]) => [k.replace("-1", " I").replace("-2", " II"), f1(v)])},
  etoi: {cap: "Hogares pobres, ETOI", h: ["2do semestre", "Hogares (%)"], rows: () => D.etoi.map(([y, v]) => [y, f1(v)])},
  escrAnual: {cap: "Escrituras de compraventa por año", h: ["Año", "Escrituras"], rows: () => D.escrA.map(([y, v]) => [y === 2026 ? "2026 (ene–ago)" : y, f0(v)])}
};
