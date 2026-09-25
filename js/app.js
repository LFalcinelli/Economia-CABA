"use strict";
/* Tablas, dibujo y redibujo, recorridos (pestañas), navegación, mecanismo, relato con gráfico fijo, mapas y efectos al avanzar. */
document.querySelectorAll("[data-table]").forEach(host => {
  const t = TABLES[host.dataset.table]; if (!t) return;
  const rows = t.rows();
  const det = document.createElement("details"); det.className = "data";
  det.innerHTML = `<summary>Ver los datos</summary><div class="tw"><table><caption class="sr">${t.cap}</caption><thead><tr>${t.h.map(x => `<th scope="col">${x}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((c, i) => i ? `<td>${c}</td>` : `<th scope="row">${c}</th>`).join("")}</tr>`).join("")}</tbody></table></div><button type="button" class="copy">Copiar tabla</button>`;
  det.querySelector(".copy").addEventListener("click", ev => {
    const btn = ev.currentTarget, txt = [t.h, ...rows].map(r => r.join("\t")).join("\n");
    const done = ok => { btn.textContent = ok ? "Tabla copiada" : "Seleccioná la tabla para copiarla"; setTimeout(() => btn.textContent = "Copiar tabla", 2200); };
    try { navigator.clipboard.writeText(txt).then(() => done(true), () => done(false)); } catch (e) { done(false); }
  });
  host.replaceWith(det);
});


/* ============ render y resize ============ */
const nodes = Array.from(document.querySelectorAll("[data-chart]"));
const lastW = new WeakMap();
function draw(el) {
  const fn = CHARTS[el.dataset.chart]; if (!fn) return;
  if (!el.clientWidth) return; // panel oculto: se dibuja al mostrarse
  try { fn(el); lastW.set(el, el.clientWidth); }
  catch (e) { console.error(el.dataset.chart, e); el.innerHTML = '<p class="chart-err">No se pudo dibujar este gráfico.</p>'; }
}
function start() {
  nodes.forEach(draw);
  if ("ResizeObserver" in window) {
    let raf = 0; const pending = new Set();
    const ro = new ResizeObserver(entries => {
      entries.forEach(en => { const el = en.target; if (Math.abs((lastW.get(el) || 0) - el.clientWidth) > 3) pending.add(el); });
      cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { pending.forEach(draw); pending.clear(); });
    });
    nodes.forEach(n => ro.observe(n));
  }
}
if (window.d3) (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(start);
else nodes.forEach(n => n.innerHTML = '<p class="chart-err">No se pudo cargar la librería de gráficos.</p>');

/* ============ recorridos, navegación y progreso ============ */
(function () {
  const panels = {reforma: document.getElementById("p-reforma"), ciudad: document.getElementById("p-ciudad")};
  const tabs = Array.from(document.querySelectorAll(".tabs [role=tab]"));
  const navs = Array.from(document.querySelectorAll(".nav"));
  const bar = document.querySelector(".progress"), head = document.querySelector(".site-head");
  let current = "reforma";
  new ResizeObserver(() => document.documentElement.style.setProperty("--headH", head.offsetHeight + "px")).observe(head);

  function setTab(name, opts = {}) {
    if (!panels[name]) return;
    const changed = name !== current; current = name;
    Object.entries(panels).forEach(([k, p]) => p.hidden = k !== name);
    tabs.forEach(t => { const on = t.dataset.tab === name; t.setAttribute("aria-selected", String(on)); t.tabIndex = on ? 0 : -1; });
    navs.forEach(n => n.hidden = n.dataset.for !== name);
    try { localStorage.setItem("eco-tab", name); } catch (e) {}
    if (changed && !opts.keep) window.scrollTo({top: 0, behavior: "auto"});
    requestAnimationFrame(() => { panels[name].querySelectorAll("[data-chart]").forEach(el => { if (Math.abs((lastW.get(el) || 0) - el.clientWidth) > 3) draw(el); }); progress(); });
  }
  function goTo(id) {
    const el = document.getElementById(id); if (!el) return false;
    const p = el.closest("[data-panel]"); if (p) setTab(p.dataset.panel, {keep: true});
    requestAnimationFrame(() => el.scrollIntoView({behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"}));
    return true;
  }
  tabs.forEach(t => t.addEventListener("click", () => { setTab(t.dataset.tab); history.replaceState(null, "", "#" + (t.dataset.tab === "reforma" ? "reforma" : "ciudad")); }));
  document.querySelector(".tabs").addEventListener("keydown", e => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const i = tabs.findIndex(t => t.dataset.tab === current), n = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
    n.click(); n.focus();
  });
  document.addEventListener("click", e => {
    const go = e.target.closest("[data-go]");
    if (go) { e.preventDefault(); setTab(go.dataset.go); history.replaceState(null, "", "#" + (go.dataset.go === "reforma" ? "reforma" : "ciudad")); return; }
    const gt = e.target.closest("[data-goto]");
    if (gt) { e.preventDefault(); goTo(gt.dataset.goto); return; }
    const a = e.target.closest('a[href^="#"]');
    if (a && a.getAttribute("href").length > 1) {
      const id = a.getAttribute("href").slice(1), el = document.getElementById(id);
      if (el) { e.preventDefault(); goTo(id); history.replaceState(null, "", "#" + id); }
    }
  });

  function progress() {
    const p = panels[current], r = p.getBoundingClientRect(), total = p.offsetHeight - innerHeight;
    bar.style.transform = `scaleX(${total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0})`;
  }
  let q = false; addEventListener("scroll", () => { if (!q) { q = true; requestAnimationFrame(() => { progress(); q = false; }); } }, {passive: true});

  const secMap = new Map();
  navs.forEach(n => n.querySelectorAll("a").forEach(a => secMap.set(a.getAttribute("href").slice(1), a)));
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      const a = secMap.get(e.target.id); if (!a) return;
      const nav = a.closest(".nav");
      nav.querySelectorAll("a").forEach(l => l.removeAttribute("aria-current"));
      a.setAttribute("aria-current", "true");
      nav.scrollTo({left: Math.max(0, a.offsetLeft - nav.clientWidth / 2 + a.offsetWidth / 2), behavior: "smooth"});
    }), {rootMargin: "-45% 0px -50% 0px"});
    document.querySelectorAll("main section[id]").forEach(s => io.observe(s));
  }

  const h = decodeURIComponent(location.hash.slice(1));
  let saved = null; try { saved = localStorage.getItem("eco-tab"); } catch (e) {}
  if (h === "ciudad" || h === "reforma") setTab(h, {keep: true});
  else if (h && document.getElementById(h)) goTo(h);
  else setTab(saved === "ciudad" ? "ciudad" : "reforma", {keep: true});
  addEventListener("hashchange", () => { const k = location.hash.slice(1); if (k === "ciudad" || k === "reforma") setTab(k); else goTo(k); });
})();


/* ============ circuito con visualización ============ */
document.querySelectorAll("[data-circuit]").forEach(box => {
  const ol = box.querySelector(".nodes"), ex = box.querySelector(".explain");
  ol.innerHTML = CIRCUIT.map((c, i) => `<li><button type="button" aria-pressed="${i === 0}" data-i="${i}"><small>0${i + 1}</small>${c.t}</button></li>`).join("");
  const show = i => {
    const c = CIRCUIT[i];
    ex.innerHTML = `<div class="ex-text"><span class="t">${c.k}</span><p><b>${c.t}.</b> ${c.p}</p></div><figure class="ex-fig"><div class="chart mini" data-chart="${c.c}"></div><p class="src">${c.src}</p></figure>`;
    ol.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.i === i)));
    const ch = ex.querySelector(".chart");
    requestAnimationFrame(() => { draw(ch); ch.classList.add("play"); animateLines(ch); if ("ResizeObserver" in window) new ResizeObserver(() => { if (Math.abs((lastW.get(ch) || 0) - ch.clientWidth) > 3) draw(ch); }).observe(ch); });
  };
  ol.addEventListener("click", e => { const b = e.target.closest("button"); if (b) show(+b.dataset.i); });
  box._show = show;
  show(0);
});

/* ============ animaciones de líneas y cifras ============ */
function animateLines(el) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  el.querySelectorAll("path.ln").forEach(p => {
    const L = p.getTotalLength(); if (!L) return;
    const dash = p.style.strokeDasharray;
    p.style.strokeDasharray = L; p.style.strokeDashoffset = L; p.getBoundingClientRect();
    p.style.transition = "stroke-dashoffset 1.3s cubic-bezier(.3,.6,.2,1)"; p.style.strokeDashoffset = 0;
    setTimeout(() => { p.style.strokeDasharray = dash; p.style.transition = ""; p.style.strokeDashoffset = ""; }, 1400);
  });
  el.querySelectorAll("circle.mk").forEach((c, i) => { c.style.animationDelay = Math.min(1.2, i * .02) + "s"; });
}
function countUp(el) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  el.querySelectorAll(".n, .num, .recap b").forEach(n => {
    const txt = n.textContent, mm = txt.match(/^([^\d−+-]*)([−+-]?)([\d.]+(?:,\d+)?)(.*)$/);
    if (!mm) return;
    const [, pre, sign, numS, post] = mm, dec = (numS.split(",")[1] || "").length, target = parseFloat(numS.replace(/\./g, "").replace(",", "."));
    if (!isFinite(target) || target === 0) return;
    const fmt = LOC.format(",." + dec + "f"), t0 = performance.now(), dur = 1100;
    const tick = t => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); n.textContent = pre + sign + fmt(target * e) + post; if (k < 1) requestAnimationFrame(tick); else n.textContent = txt; };
    requestAnimationFrame(tick);
  });
}

/* ============ relato con gráfico fijo ============ */
document.querySelectorAll("[data-scrolly]").forEach(box => {
  const chart = box.querySelector(".chart"), steps = Array.from(box.querySelectorAll(".step"));
  if (!("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    steps.forEach(s => s.classList.toggle("on", s === e.target));
    if (chart.dataset.band !== e.target.dataset.band) { chart.dataset.band = e.target.dataset.band; draw(chart); }
  }), {rootMargin: "-40% 0px -45% 0px"});
  steps.forEach(s => io.observe(s));
});


/* ============ mapas ============ */
const strip = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
const provKey = n => n.startsWith("CIUDAD") ? "CABA" : strip(n);
const toMap = rows => new Map(rows.map(([l, v]) => [l === "CABA" ? "CABA" : strip(l), {label: l, v}]));
const AR_IND = {
  hip: {t: "Nuevos deudores hipotecarios, 2025", u: "créditos cada 10.000 adultos", rows: D.hipProv, fmt: v => f1(v), seq: true},
  autos: {t: "Patentamientos de autos, ene–jul 2026 contra 2023", u: "variación, en %", rows: D.autos, fmt: spc0},
  motos: {t: "Patentamientos de motos, ene–jul 2026 contra 2023", u: "variación, en %", rows: D.motos, fmt: spc0}
};
const BARRIOS = {1: "Retiro, San Nicolás, Puerto Madero, San Telmo, Montserrat y Constitución", 2: "Recoleta", 3: "Balvanera y San Cristóbal", 4: "La Boca, Barracas, Parque Patricios y Nueva Pompeya", 5: "Almagro y Boedo", 6: "Caballito", 7: "Flores y Parque Chacabuco", 8: "Villa Soldati, Villa Riachuelo y Villa Lugano", 9: "Liniers, Mataderos y Parque Avellaneda", 10: "Villa Real, Monte Castro, Versalles, Floresta, Vélez Sarsfield y Villa Luro", 11: "Villa General Mitre, Villa Devoto, Villa del Parque y Villa Santa Rita", 12: "Coghlan, Saavedra, Villa Urquiza y Villa Pueyrredón", 13: "Núñez, Belgrano y Colegiales", 14: "Palermo", 15: "Chacarita, Villa Crespo, La Paternal, Villa Ortúzar, Agronomía y Parque Chas"};
const ZONA = {2: "N", 13: "N", 14: "N", 4: "S", 8: "S", 9: "S", 10: "S"};
const zonaDe = c => ZONA[c] || "C";
const ZN = {N: {n: "Norte", ipcf: 1709320, des: 5.6, real: -6.0, c: "#6C4C99"}, C: {n: "Centro", ipcf: 1361180, des: 7.0, real: -5.1, c: "#39B5E6"}, S: {n: "Sur", ipcf: 976909, des: 9.1, real: 2.0, c: "#E2602F"}};
const FICHA = {
  1: "EAH 2024: 25,7% de población migrante y 2,7% de hacinamiento crítico.",
  2: "EAH 2024: más de 15 años de estudio promedio; 64,1% con estudios terciarios o universitarios.",
  4: "EAH 2024: 32,4% de menores de 20 años; 4,8% de hacinamiento crítico, el más alto de la Ciudad.",
  8: "EAH 2024: desocupación de 10,0%; 37,6% de menores de 20 años; 11 años de estudio promedio.",
  14: "EAH 2024: 64,4% con estudios terciarios o universitarios; 25,5% tiene 60 años o más."
};
const CB_IND = {
  zona: {t: "Zonas estadísticas", u: "agrupamiento de IDECBA"},
  ipcf: {t: "Ingreso per cápita familiar, II trim. 2026", u: "pesos por mes, promedio de la zona", fmt: v => "$ " + f0(v)},
  des: {t: "Desocupación, II trim. 2026", u: "% de la población activa, promedio de la zona", fmt: pc1},
  real: {t: "Ingreso del hogar contra la inflación, II trim. 2026", u: "variación real interanual, promedio de la zona", fmt: spc1},
  alq: {t: "Alquiler de 2 ambientes usado, II trim. 2026", u: "precio publicado por mes, dato de cada comuna", fmt: v => v ? "$ " + f0(v) : "sin registros suficientes"}
};

function mapBase(el, vb) {
  el.innerHTML = "";
  const svg = d3.select(el).append("svg").attr("viewBox", vb).attr("width", "100%").attr("role", "group").style("height", "auto").style("overflow", "visible");
  const tip = d3.select(el).append("div").attr("class", "tip").attr("aria-hidden", "true");
  return {svg, tip};
}
function bindTip(sel, el, tip, html) {
  const pos = (ev, d) => { const r = el.getBoundingClientRect(); showTip(tip, el, html(d), ev.clientX - r.left, ev.clientY - r.top); };
  sel.on("pointermove pointerdown", function (ev, d) { d3.select(this).classed("hov", true).raise(); pos(ev, d); })
    .on("pointerleave", function () { d3.select(this).classed("hov", false); hideTip(tip); })
    .on("focus", function (ev, d) { const b = this.getBBox(), s = el.clientWidth / this.ownerSVGElement.viewBox.baseVal.width; showTip(tip, el, html(d), (b.x + b.width / 2) * s, (b.y + b.height / 2) * s); })
    .on("blur", () => hideTip(tip));
}

function arMap(el) {
  const k = el.dataset.ind || "hip", I = AR_IND[k], M = toMap(I.rows);
  const vals = I.rows.map(r => r[1]);
  const dark = !!el.closest(".sf-dark");
  const pos = d3.scaleSequential([0, d3.max(vals)], t => d3.interpolateRgb(dark ? "#3E1874" : "#E9E3F0", "#EFB041")(Math.pow(t, .7)));
  const neg = d3.scaleSequential([0, Math.min(-1, d3.min(vals))], t => d3.interpolateRgb("#3E1874", "#E2602F")(.35 + .65 * t));
  const col = v => v == null ? "rgba(255,255,255,.08)" : v < 0 ? neg(v) : pos(v);
  const ranked = I.rows.slice().sort((a, b) => b[1] - a[1]).map(r => r[0]);
  const {svg, tip} = mapBase(el, "-10 -6 320 632");
  const html = key => { const r = M.get(key), nm = r ? r.label : key; return `<span class="th">${nm === "CABA" ? "Ciudad de Buenos Aires" : nm}</span>${r ? `<span class="tr">${I.u}<b>${I.fmt(r.v)}</b></span><span class="tr mut">Puesto ${ranked.indexOf(r.label) + 1} de ${I.rows.length}</span>` : `<span class="tr mut">Sin dato</span>`}`; };
  const g = svg.append("g");
  const ps = g.selectAll("path").data(GEO_AR.filter(p => provKey(p[0]) !== "CABA")).join("path").attr("class", "reg").attr("d", p => p[1])
    .attr("fill", p => col(M.get(provKey(p[0]))?.v)).attr("tabindex", 0).attr("aria-label", p => { const r = M.get(provKey(p[0])); return `${r ? r.label : p[0]}: ${r ? I.fmt(r.v) : "sin dato"}`; });
  bindTip(ps.datum(p => provKey(p[0])), el, tip, html);
  const [cx, cy] = GEO_CABA_PT, c = M.get("CABA");
  svg.append("path").attr("class", "ann-line").attr("d", `M${cx},${cy}L${cx + 58},${cy - 34}`);
  const cab = svg.append("circle").attr("class", "reg caba-pt").attr("cx", cx).attr("cy", cy).attr("r", 7).attr("fill", col(c?.v)).attr("tabindex", 0).attr("aria-label", `Ciudad de Buenos Aires: ${c ? I.fmt(c.v) : "sin dato"}`);
  bindTip(cab.datum("CABA"), el, tip, html);
  const t = svg.append("text").attr("class", "lbl").attr("x", cx + 62).attr("y", cy - 40);
  t.append("tspan").text("CABA");
  t.append("tspan").attr("x", cx + 62).attr("dy", "1.25em").attr("class", "t-hi lbl-big").text(c ? I.fmt(c.v) : "s/d");
  const legend = el.closest("figure").querySelector(".map-leg");
  if (legend) legend.innerHTML = `<span>${I.fmt(I.seq ? 0 : Math.min(0, d3.min(vals)))}</span><i style="background:linear-gradient(90deg,${I.seq ? "" : "#E2602F," + col(-0.1) + " 18%,"}${col(0.001)},${col(d3.max(vals) / 2)},${col(d3.max(vals))})"></i><span>${I.fmt(d3.max(vals))}</span>`;
}

function cabaMap(el) {
  const k = el.dataset.ind || "zona", I = CB_IND[k];
  const val = c => k === "zona" ? null : k === "alq" ? D.alqCom[c] : ZN[zonaDe(c)][k];
  const seq = k === "ipcf" ? d3.scaleSequential([900000, 1800000], d3.interpolateRgb("#E9E3F0", "#2F0163"))
    : k === "des" ? d3.scaleSequential([5, 9.5], d3.interpolateRgb("#F6E3D8", "#E2602F"))
    : k === "alq" ? d3.scaleSequential([640000, 850000], d3.interpolateRgb("#EAF6FB", "#1E7FA6"))
    : d3.scaleDiverging([-7, 0, 3], t => t < .5 ? d3.interpolateRgb("#E2602F", "#F1EEE6")(t * 2) : d3.interpolateRgb("#F1EEE6", "#6C4C99")((t - .5) * 2));
  const col = c => k === "zona" ? ZN[zonaDe(c)].c : val(c) == null ? "#E6E2DA" : seq(val(c));
  const {svg, tip} = mapBase(el, "-4 -4 528 528");
  const html = c => `<span class="th">Comuna ${c}</span><span class="tr mut" style="white-space:normal;max-width:240px">${BARRIOS[c]}</span><span class="tr">Zona<b>${ZN[zonaDe(c)].n}</b></span>${k !== "zona" ? `<span class="tr">${CB_IND[k].t.split(",")[0]}<b>${I.fmt(val(c))}</b></span>` : ""}${FICHA[c] ? `<span class="tr mut" style="white-space:normal;max-width:240px;margin-top:4px">${FICHA[c]}</span>` : ""}`;
  const ps = svg.selectAll("path").data(GEO_CB).join("path").attr("class", "reg").attr("d", d => d[1]).attr("fill", d => col(d[0]))
    .attr("tabindex", 0).attr("aria-label", d => `Comuna ${d[0]}, zona ${ZN[zonaDe(d[0])].n}${k !== "zona" ? ": " + I.fmt(val(d[0])) : ""}`);
  bindTip(ps.datum(d => d[0]), el, tip, html);
  svg.append("g").attr("pointer-events", "none").selectAll("text").data(GEO_CB).join("text").attr("class", "cm-n")
    .attr("x", d => d[2][0]).attr("y", d => d[2][1]).attr("dy", ".35em").attr("text-anchor", "middle")
    .attr("fill", d => { const f = d3.color(col(d[0])); return f && d3.hsl(f).l < .55 ? "#fff" : "#1D1D1D"; }).text(d => d[0]);
  const legend = el.closest("figure").querySelector(".map-leg");
  if (legend) legend.innerHTML = k === "zona" ? Object.values(ZN).map(z => `<span class="zk"><i style="background:${z.c}"></i>${z.n}</span>`).join("")
    : `<span>${I.fmt(seq.domain()[0])}</span><i style="background:linear-gradient(90deg,${seq.domain().length === 3 ? [seq(-7), seq(0), seq(3)] : [seq(seq.domain()[0]), seq(seq.domain()[1])]})"></i><span>${I.fmt(seq.domain().at(-1))}</span>`;
}
CHARTS.ar = arMap; CHARTS.cb = cabaMap;
document.querySelectorAll("[data-switch]").forEach(grp => {
  const target = document.getElementById(grp.dataset.switch), cap = grp.closest("figure").querySelector(".map-t");
  const sets = target.dataset.chart === "ar" ? AR_IND : CB_IND;
  grp.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    grp.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
    target.dataset.ind = b.dataset.ind; if (cap) cap.textContent = sets[b.dataset.ind].t + " · " + sets[b.dataset.ind].u;
    draw(target);
    const side = grp.closest("figure").querySelector("[data-rank]");
    if (side) { side.dataset.chart = "rank_" + b.dataset.ind; draw(side); }
  });
});
CHARTS.rank_hip = CHARTS.hipProv; CHARTS.rank_autos = CHARTS.autos; CHARTS.rank_motos = CHARTS.motos;

/* ============ efectos al avanzar ============ */
(function () {
  if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target; io.unobserve(el);
    el.classList.add("play");
    const z = el.querySelector("line.zero"); const zx = z ? +z.getAttribute("x1") : null;
    el.querySelectorAll("g.r rect.b").forEach(r => { r.style.transformOrigin = zx != null && +r.getAttribute("x") < zx - 1 ? "100% 50%" : "0% 50%"; });
    if (el.classList.contains("chart")) animateLines(el);
    if (el.matches(".tiles, .recap")) countUp(el);
  }), {rootMargin: "0px 0px -10% 0px"});
  const SEL = ".chart:not(.mini), .sec .kicker, .sec h2, .part h2, .part .intro, .dek, .read, .tiles, .zones, .timeline, .obst, .recap, .pair, .scope, .calc, .nodes, .map-t, .switch, .closing, .step";
  const arm = () => document.querySelectorAll(SEL).forEach(el => {
    if (el.dataset.armed) return;
    const r = el.getBoundingClientRect();
    if (el.offsetParent === null) return; // se arma cuando su recorrido se muestra
    el.dataset.armed = 1;
    if (r.top > innerHeight * .92) { el.classList.add("pre"); io.observe(el); }
  });
  setTimeout(arm, 350);
  document.addEventListener("click", e => { if (e.target.closest("[role=tab],[data-go],a[href^='#']")) setTimeout(arm, 450); });
  addEventListener("scroll", () => { if (!arm.q) { arm.q = 1; setTimeout(() => { arm(); arm.q = 0; }, 400); } }, {passive: true});
})();

