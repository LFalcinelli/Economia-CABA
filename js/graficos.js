"use strict";
/* Biblioteca de gráficos (d3 v7): formato, ejes, líneas, barras, rankings, apilados, rectángulos, mapas base. */
/* ============ formato ============ */
const LOC = d3.formatLocale({decimal: ",", thousands: ".", grouping: [3], currency: ["$", ""], minus: "\u2212"});
const f0 = LOC.format(",.0f"), f1 = LOC.format(",.1f");
const MINUS = "\u2212";
const sg = (v, f) => (v > 0 ? "+" : v < 0 ? MINUS : "") + f(Math.abs(v));
const pc0 = v => f0(v) + "%", pc1 = v => f1(v) + "%";
const spc0 = v => sg(v, f0) + "%", spc1 = v => sg(v, f1) + "%";
const MES = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
const MESL = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const pd = s => { const [y, m] = String(s).split("-").map(Number); return new Date(y, (m || 1) - 1, 1); };
const mlab = d => MESL[d.getMonth()] + " de " + d.getFullYear();
const mlabS = d => MES[d.getMonth()] + "-" + String(d.getFullYear()).slice(2);

const measureCtx = document.createElement("canvas").getContext("2d");
function textW(s, font) { measureCtx.font = font || "500 13px Montserrat, Arial, sans-serif"; return measureCtx.measureText(s).width; }

/* ============ base ============ */
function base(el, height, m) {
  el.innerHTML = "";
  const W = Math.max(280, el.clientWidth);
  const H = typeof height === "function" ? height(W) : height;
  const fig = el.closest("figure");
  const label = el.dataset.label || (fig && fig.querySelector("h3") ? fig.querySelector("h3").textContent : "Gráfico");
  const desc = fig && fig.querySelector(".sub") ? fig.querySelector(".sub").textContent : "";
  const svg = d3.select(el).append("svg").attr("width", W).attr("height", H).attr("viewBox", `0 0 ${W} ${H}`)
    .attr("role", "img").attr("aria-label", label);
  svg.append("title").text(label);
  if (desc) svg.append("desc").text(desc);
  const g = svg.append("g").attr("transform", `translate(${m.l},${m.t})`);
  const tip = d3.select(el).append("div").attr("class", "tip").attr("aria-hidden", "true");
  return {svg, g, W, H, w: W - m.l - m.r, h: H - m.t - m.b, tip, narrow: W < 560};
}
function showTip(tip, el, html, x, y) {
  tip.html(html).style("opacity", 1);
  const n = tip.node(), tw = n.offsetWidth, th = n.offsetHeight, W = el.clientWidth;
  let lx = x + 16; if (lx + tw > W) lx = x - tw - 16; if (lx < 0) lx = Math.max(0, Math.min(W - tw, x - tw / 2));
  let ly = y - th - 12; if (ly < -8) ly = y + 16;
  tip.style("left", lx + "px").style("top", ly + "px");
}
const hideTip = tip => tip.style("opacity", 0);

function yGrid(g, y, w, ticks, fmt, opt = {}) {
  g.append("g").attr("class", "gl").selectAll("line").data(ticks).join("line")
    .attr("x1", 0).attr("x2", w).attr("y1", d => Math.round(y(d)) + .5).attr("y2", d => Math.round(y(d)) + .5);
  if (opt.labels === false) return;
  g.append("g").attr("class", "tk").selectAll("text").data(ticks).join("text")
    .attr("x", -10).attr("y", d => y(d)).attr("dy", "0.34em").attr("text-anchor", "end").text(fmt);
}
function breakMark(g, h) {
  // eje vertical cortado: dos diagonales sobre la base
  g.append("line").attr("class", "ax").attr("x1", .5).attr("x2", .5).attr("y1", 0).attr("y2", h - 16);
  g.append("rect").attr("class", "brk-bg").attr("x", -7).attr("y", h - 15).attr("width", 14).attr("height", 10);
  [h - 13, h - 7].forEach(yy => g.append("line").attr("class", "brk").attr("x1", -6).attr("x2", 6).attr("y1", yy + 3).attr("y2", yy - 3));
  g.append("line").attr("class", "ax").attr("x1", .5).attr("x2", .5).attr("y1", h - 4).attr("y2", h);
}
function annotate(g, px, py, a) {
  const tx = px + (a.dx || 0), ty = py + (a.dy || 0);
  if (a.dot) g.append("circle").attr("class", `mk s-${a.dot}`).attr("stroke-width", 2.6).attr("cx", px).attr("cy", py).attr("r", a.r || 5.5);
  if (a.lead) g.append("path").attr("class", "ann-line").attr("d", `M${px},${py}L${a.lead[0] + px},${a.lead[1] + py}`);
  const t = g.append("text").attr("class", a.cls || "ann").attr("x", tx).attr("y", ty).attr("text-anchor", a.anchor || "start");
  String(a.text).split("\n").forEach((ln, i) => {
    const s = t.append("tspan").attr("x", tx).attr("dy", i ? "1.3em" : 0).text(ln);
    if (i && a.muted !== false) s.attr("class", "ann-m");
    if (!i && a.tone) s.attr("class", `t-${a.tone}`).style("font-weight", 600);
  });
  return t;
}
function yearTicks(step) {
  return (x, narrow) => {
    const [a, b] = x.domain(); const out = [];
    const st = narrow ? (step || 1) * 2 : (step || 1);
    for (let y = a.getFullYear(); y <= b.getFullYear(); y++) {
      const d = new Date(y, 0, 1);
      if (d >= a && d <= b && (y % st === 0 || st === 1)) out.push({d, label: String(y)});
    }
    return out;
  };
}

/* ============ ranking horizontal ============ */
function rankChart(el, o) {
  const W0 = el.clientWidth, narrow = W0 < 520;
  const D = o.data;
  const font = "500 13px Montserrat, Arial, sans-serif", bold = "700 13px Montserrat, Arial, sans-serif";
  const maxL = d3.max(D, d => textW(d.label, d.role === "hi" || d.bold ? bold : font));
  const stacked = narrow && maxL + 14 > W0 * .46;
  const labelW = stacked ? 0 : Math.min(maxL + 14, W0 * (narrow ? .46 : .42));
  const rowH = stacked ? 42 : (o.rowH || (narrow ? 25 : 27));
  const gaps = o.gapAfter != null ? 16 : 0;
  const m = {t: 4, r: 4, b: 6, l: labelW};
  const H = D.length * rowH + m.t + m.b + gaps;
  const {g, w, h} = base(el, H, m);
  const vf = o.fmt || spc0;
  const vfont = "600 12.5px Montserrat, Arial, sans-serif";
  let lo = Math.min(0, d3.min(D, d => d.v)), hi = Math.max(0, d3.max(D, d => d.v));
  if (o.domain) [lo, hi] = o.domain;
  const padL = lo < 0 ? d3.max(D.filter(d => d.v < 0), d => textW(vf(d.v), vfont)) + 12 : 0;
  const padR = hi > 0 ? d3.max(D.filter(d => d.v >= 0), d => textW(vf(d.v), vfont)) + 12 : (D.some(d => d.v === 0) ? 24 : 0);
  const x = d3.scaleLinear().domain([lo, hi]).range([padL, w - padR]);
  const yy = i => i * rowH + (o.gapAfter != null && i > o.gapAfter ? gaps : 0);
  const bh = Math.min(o.barH || 15, stacked ? 14 : rowH * .62);
  const by = stacked ? 21 : (rowH - bh) / 2, cyv = by + bh / 2;
  const rows = g.selectAll("g.r").data(D).join("g").attr("class", "r").attr("transform", (d, i) => `translate(0,${yy(i)})`);
  rows.append("rect").attr("class", d => `b f-${d.role || "ctx"}`)
    .attr("x", d => x(Math.min(0, d.v))).attr("width", d => Math.max(d.v === 0 ? 0 : 1.5, Math.abs(x(d.v) - x(0))))
    .attr("y", by).attr("height", bh);
  rows.append("text").attr("class", d => "row-l" + (d.role === "hi" || d.bold ? " is-hi" : ""))
    .attr("x", stacked ? 0 : -12).attr("y", stacked ? 12 : rowH / 2).attr("dy", "0.34em").attr("text-anchor", stacked ? "start" : "end").text(d => d.label);
  rows.append("text").attr("class", d => "lbl" + (d.role === "hi" ? " t-hi" : "")).attr("y", cyv).attr("dy", "0.34em")
    .attr("x", d => d.v < 0 ? x(d.v) - 6 : x(d.v) + 6).attr("text-anchor", d => d.v < 0 ? "end" : "start").text(d => vf(d.v));
  const z = Math.round(x(0)) + .5;
  g.append("line").attr("class", "zero").attr("x1", z).attr("x2", z).attr("y1", stacked ? 16 : -2).attr("y2", h + 2);
  if (o.gapAfter != null) {
    const yl = yy(o.gapAfter + 1) - gaps / 2;
    g.append("line").attr("class", "ax").attr("x1", -labelW).attr("x2", w).attr("y1", Math.round(yl) + .5).attr("y2", Math.round(yl) + .5).style("stroke", "var(--ch-grid)");
  }
}

/* ============ puntos (delitos) ============ */
function dotPlot(el, o) {
  const W0 = el.clientWidth, narrow = W0 < 520;
  const rowH = narrow ? 64 : 70;
  const m = {t: 30, r: 16, b: 8, l: 12};
  const {g, w, h, tip} = base(el, o.data.length * rowH + 38, m);
  const x = d3.scaleLinear().domain(o.domain).range([0, w]);
  const ticks = o.ticks;
  g.append("g").attr("class", "gl").selectAll("line").data(ticks).join("line").attr("x1", d => Math.round(x(d)) + .5).attr("x2", d => Math.round(x(d)) + .5).attr("y1", 0).attr("y2", h);
  g.append("g").attr("class", "tk").selectAll("text").data(ticks).join("text").attr("x", d => x(d)).attr("y", -12).attr("text-anchor", "middle").text(d => d === 0 ? "0" : spc0(d));
  const rows = g.selectAll("g.r").data(o.data).join("g").attr("transform", (d, i) => `translate(0,${i * rowH})`);
  rows.append("text").attr("class", "row-l is-hi").attr("x", 0).attr("y", 18).text(d => d[0]);
  const cy = 44;
  rows.append("line").attr("class", "ax").attr("x1", d => x(Math.min(d[1], d[2]))).attr("x2", d => x(Math.max(d[1], d[2]))).attr("y1", cy).attr("y2", cy).style("stroke", "var(--ch-ctx2)").style("stroke-width", 2);
  rows.append("circle").attr("class", "ring").attr("cx", d => x(d[1])).attr("cy", cy).attr("r", 7);
  rows.append("circle").attr("class", "f-hi dotbg").attr("cx", d => x(d[2])).attr("cy", cy).attr("r", 7.5);
  rows.each(function (d) {
    const r = d3.select(this); const cabaLeft = d[2] < d[1];
    r.append("text").attr("class", "lbl t-hi").attr("x", x(d[2]) + (cabaLeft ? -13 : 13)).attr("y", cy).attr("dy", "0.34em").attr("text-anchor", cabaLeft ? "end" : "start").text(spc0(d[2]));
    r.append("text").attr("class", "lbl-m").attr("x", x(d[1]) + (cabaLeft ? 13 : -13)).attr("y", cy).attr("dy", "0.34em").attr("text-anchor", cabaLeft ? "start" : "end").text(spc0(d[1]));
  });
}

/* ============ situación de calle ============ */
function streetChart(el, o) {
  const W0 = el.clientWidth, narrow = W0 < 560;
  const m = {t: 40, r: narrow ? 14 : 24, b: 34, l: 46};
  const {g, w, h, tip} = base(el, W => Math.max(320, Math.min(470, W * .44)), m);
  const D = o.data.map(r => ({k: r[0], d: pd(r[0]), cis: r[1], calle: r[2], tot: r[1] + r[2]}));
  const x = d3.scaleTime().domain([pd("2017-07"), pd("2026-03")]).range([0, w]);
  const y = d3.scaleLinear().domain([0, 6000]).range([h, 0]);
  yGrid(g, y, w, [0, 2000, 4000, 6000], v => f0(v));
  g.append("line").attr("class", "ax").attr("x1", 0).attr("x2", w).attr("y1", h + .5).attr("y2", h + .5);
  const xt = yearTicks()(x, narrow);
  const tk = g.append("g").attr("class", "tk");
  tk.selectAll("text").data(xt).join("text").attr("x", d => x(d.d)).attr("y", h + 21).attr("text-anchor", "middle").text(d => d.label);
  tk.selectAll("line").data(xt).join("line").attr("class", "ax").attr("x1", d => Math.round(x(d.d)) + .5).attr("x2", d => Math.round(x(d.d)) + .5).attr("y1", h).attr("y2", h + 5);
  const bw = Math.max(7, Math.min(30, (x(pd("2018-05")) - x(pd("2017-11"))) * .6));
  const mk = Math.round(x(pd("2023-12"))) + .5;
  g.append("line").attr("class", "vm").attr("x1", mk).attr("x2", mk).attr("y1", -26).attr("y2", h);
  g.append("text").attr("class", "ann-m").attr("x", mk - 7).attr("y", -16).attr("text-anchor", "end").text(narrow ? "Dic-23" : "Diciembre de 2023: asume Jorge Macri");
  const bars = g.append("g");
  const bg = bars.selectAll("g").data(D).join("g").attr("class", "b");
  bg.append("rect").attr("class", "f-ctx2").attr("x", d => x(d.d) - bw / 2).attr("width", bw).attr("y", d => y(d.cis)).attr("height", d => h - y(d.cis));
  bg.append("rect").attr("class", "f-2").attr("x", d => x(d.d) - bw / 2).attr("width", bw).attr("y", d => y(d.tot)).attr("height", d => y(d.cis) - y(d.tot));
  const line = d3.line().x(d => x(d.d)).y(d => y(d.tot));
  g.append("path").attr("class", "ln s-hi").attr("stroke-width", 3.5).attr("d", line.curve(d3.curveMonotoneX)(D));
  g.selectAll(null).data(D).join("circle").attr("class", "mk s-hi").attr("stroke-width", 2.6).attr("cx", d => x(d.d)).attr("cy", d => y(d.tot)).attr("r", d => ["2019-11", "2023-11", "2025-11"].includes(d.k) ? 7 : 4.5);
  const lab = narrow ? ["2019-11", "2023-11", "2025-11"] : ["2017-11", "2019-11", "2023-11", "2025-11"];
  D.filter(d => lab.includes(d.k)).forEach(d => {
    g.append("text").attr("class", "lbl t-hi lbl-big").attr("x", x(d.d)).attr("y", y(d.tot) - 14).attr("text-anchor", d.k === "2025-11" ? "end" : "middle").attr("dx", d.k === "2025-11" ? 8 : 0).text(f0(d.tot));
  });
  const seg = (a, b, txt, dy) => {
    const A = D.find(d => d.k === a), B = D.find(d => d.k === b);
    const xm = (x(A.d) + x(B.d)) / 2, ym = (y(A.tot) + y(B.tot)) / 2;
    g.append("text").attr("class", "ann").attr("x", xm).attr("y", ym + dy).attr("text-anchor", "middle").style("font-weight", 600).text(txt);
  };
  seg("2019-11", "2023-11", narrow ? "+90%" : "+90% en cuatro años", -26);
  seg("2023-11", "2025-11", "+57%", -30);
  bg.on("pointerenter pointermove", function (ev, d) {
    bars.classed("dim", true); d3.select(this).classed("on", true);
    showTip(tip, el, `<span class="th">${mlab(d.d)}</span><span class="tr"><i class="sw-2"></i>Vía pública<b>${f0(d.calle)}</b></span><span class="tr"><i class="sw-ctx2"></i>Centros de Inclusión<b>${f0(d.cis)}</b></span><span class="tr"><i class="sw-hi"></i>Total<b>${f0(d.tot)}</b></span>`, x(d.d) + m.l, y(d.tot) + m.t);
  }).on("pointerleave", function () { bars.classed("dim", false); d3.select(this).classed("on", false); hideTip(tip); });
}


/* ============ líneas suavizadas con marcadores ============ */
const LETRA = ["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
function roleAt(s, d) {
  if (!s.segs) return s.role;
  for (const sg of s.segs) if (!sg.until || d < pd(sg.until)) return sg.role;
  return s.segs[s.segs.length - 1].role;
}
function monthAxis(g, x, h, narrow, w) {
  const [a, b] = x.domain();
  const months = d3.timeMonth.range(d3.timeMonth.floor(a), d3.timeMonth.offset(b, 1)).filter(d => d >= a && d <= b);
  const px = w / Math.max(1, months.length - 1);
  const step = px >= 13 ? 1 : px >= 7 ? 3 : 0;
  const tk = g.append("g").attr("class", "tk");
  months.forEach((d, i) => {
    const xx = Math.round(x(d)) + .5, jan = d.getMonth() === 0;
    if (step && d.getMonth() % step === 0) tk.append("text").attr("class", "mo").attr("x", xx).attr("y", h + 16).attr("text-anchor", "middle").text(LETRA[d.getMonth()]);
    if (jan || i === 0) {
      tk.append("line").attr("class", "ax").attr("x1", xx).attr("x2", xx).attr("y1", h).attr("y2", h + (step ? 40 : 22));
      if (!(i === 0 && months.length > 1 && months[1].getMonth() === 0 && px < 30) && !(i === 0 && d.getMonth() > 8 && px * (12 - d.getMonth()) < 34))
        tk.append("text").attr("class", "yr").attr("x", xx + 5).attr("y", h + (step ? 37 : 19)).text(narrow && !jan ? "’" + String(d.getFullYear()).slice(2) : d.getFullYear());
    }
  });
}
function lineChart(el, o) {
  const W0 = el.clientWidth, narrow = W0 < 560, monthly = o.xTicks === "months";
  const m = Object.assign({t: 24, r: o.endLabels ? (narrow ? 70 : 104) : 20, b: monthly ? 50 : 34, l: 46}, o.m || {});
  const heightFn = o.height || (W => Math.max(280, Math.min(460, W * .46)));
  const {g, w, h, tip} = base(el, heightFn, m);
  const S = o.series.map(s => Object.assign({}, s, {
    pts: s.values.filter(v => v[1] != null).map(v => ({d: pd(v[0]), v: v[1]})),
    ext: (s.extend || []).map(v => ({d: pd(v[0]), v: v[1]}))
  }));
  const all = S.flatMap(s => s.pts.concat(s.ext));
  const x = d3.scaleTime().domain(o.xDomain ? o.xDomain.map(pd) : d3.extent(all, p => p.d)).range([0, w]);
  const y = d3.scaleLinear().domain(o.y.domain).range([h, 0]);
  if (o.band) {
    const [a, b] = o.band.map(pd);
    g.append("rect").attr("class", "band").attr("x", x(a) - 5).attr("width", Math.max(10, x(b) - x(a) + 10)).attr("y", -m.t + 4).attr("height", h + m.t - 4).attr("rx", 4);
  }
  yGrid(g, y, w, o.y.ticks, o.y.fmt);
  g.append("line").attr("class", "ax").attr("x1", 0).attr("x2", w).attr("y1", h + .5).attr("y2", h + .5);
  if (monthly) monthAxis(g, x, h, narrow, w);
  else {
    const xt = (o.xTicks || yearTicks())(x, narrow);
    const tk = g.append("g").attr("class", "tk");
    tk.selectAll("line").data(xt).join("line").attr("class", "ax").attr("x1", d => Math.round(x(d.d)) + .5).attr("x2", d => Math.round(x(d.d)) + .5).attr("y1", h).attr("y2", h + 5);
    tk.selectAll("text").data(xt).join("text").attr("x", d => x(d.d)).attr("y", h + 21).attr("text-anchor", d => d.anchor || "middle").text(d => d.label);
  }
  if (o.breakAxis) breakMark(g, h);
  if (o.zero != null) g.append("line").attr("class", "zero").attr("x1", 0).attr("x2", w).attr("y1", Math.round(y(o.zero)) + .5).attr("y2", Math.round(y(o.zero)) + .5);
  if (o.ref != null) {
    g.append("line").attr("class", "ref").attr("x1", 0).attr("x2", w).attr("y1", y(o.ref.v)).attr("y2", y(o.ref.v));
    if (o.ref.label) g.append("text").attr("class", "ann-m").attr("x", o.ref.x ? x(pd(o.ref.x)) : 6).attr("y", y(o.ref.v) - 7).text(o.ref.label);
  }
  (o.markers || []).forEach(mk => {
    const xx = Math.round(x(pd(mk.d))) + .5, top = mk.top != null ? mk.top : -m.t + 6;
    g.append("line").attr("class", "vm").attr("x1", xx).attr("x2", xx).attr("y1", top + 4).attr("y2", h);
    if (mk.label && !(narrow && mk.hideNarrow)) g.append("text").attr("class", "ann-m vm-l").attr("x", xx + (mk.anchor === "end" ? -7 : 7)).attr("y", top + 12)
      .attr("text-anchor", mk.anchor || "start").text(narrow && mk.short ? mk.short : mk.label);
  });
  const line = d3.line().curve(d3.curveMonotoneX).x(p => x(p.d)).y(p => y(p.v));
  const widthOf = s => s.w || (s.role === "hi" ? 3.6 : 2.8);
  S.forEach(s => {
    const sw = widthOf(s);
    if (s.segs) {
      s.segs.forEach((sg, i) => {
        const lo = i ? pd(s.segs[i - 1].until) : null, hi = sg.until ? pd(sg.until) : null;
        const part = s.pts.filter(p => (!lo || p.d >= lo) && (!hi || p.d <= hi));
        if (part.length > 1) g.append("path").attr("class", `ln s-${sg.role}`).attr("stroke-width", sw).attr("d", line(part));
      });
    } else g.append("path").attr("class", `ln s-${s.role}`).attr("stroke-width", sw).attr("d", line(s.pts)).style("stroke-dasharray", s.dash || null);
    if (s.ext.length) {
      const lp = s.pts[s.pts.length - 1];
      g.append("path").attr("class", `ln ext s-${roleAt(s, lp.d)}`).attr("stroke-width", sw * .8).style("stroke-dasharray", "2 6").attr("d", line([lp].concat(s.ext)));
    }
  });
  // marcadores: círculo de centro blanco, borde del color de la línea
  S.forEach(s => {
    if (s.dots === false) return;
    const sw = widthOf(s), n = s.pts.length, sp = w / Math.max(1, n - 1), k = sp < 10 ? Math.ceil(10 / sp) : 1;
    const pts = s.pts.filter((p, i) => i % k === 0 || i === n - 1).concat(s.ext);
    g.append("g").selectAll("circle").data(pts).join("circle").attr("class", p => `mk s-${roleAt(s, p.d)}${s.ext.includes(p) ? " ext" : ""}`)
      .attr("cx", p => x(p.d)).attr("cy", p => y(p.v)).attr("r", sw * .85 + 1.4).attr("stroke-width", Math.max(1.8, sw * .72));
  });
  (o.ann || []).forEach(a0 => { if (narrow && a0.hideNarrow) return; const a = narrow && a0.narrow ? Object.assign({}, a0, a0.narrow) : a0; annotate(g, x(pd(a.d)), y(a.v), a); });
  if (o.endLabels) {
    const items = S.filter(s => !s.noEnd).map(s => { const p = s.ext.length ? s.ext[s.ext.length - 1] : s.pts[s.pts.length - 1]; return {s, p, y: y(p.v)}; }).sort((a, b) => b.y - a.y);
    const gap = o.endGap || 34;
    items.forEach((it, i) => { if (i === 0) it.y = Math.min(it.y, h - 18); else if (items[i - 1].y - it.y < gap) it.y = items[i - 1].y - gap; });
    items.forEach(it => {
      const xx = x(it.p.d), role = roleAt(it.s, it.p.d), sw = widthOf(it.s);
      if (o.endDot !== false) g.append("circle").attr("class", `mk s-${role}`).attr("cx", xx).attr("cy", y(it.p.v)).attr("r", sw + 2.6).attr("stroke-width", sw * .8);
      const t = g.append("text").attr("class", "lbl").attr("x", xx + 12).attr("y", it.y);
      t.append("tspan").attr("x", xx + 12).attr("dy", it.s.endName === false ? "0.34em" : "-0.15em").attr("class", `t-${role} lbl-big`).text((o.endFmt || o.y.fmt)(it.p.v));
      if (it.s.endName !== false) t.append("tspan").attr("x", xx + 12).attr("dy", "1.3em").attr("class", "lbl-m").text((narrow && it.s.endShort) || it.s.endName || it.s.name);
    });
  }
  if (o.tip !== false) hoverTime(g, el, tip, x, y, S, w, h, o, m);
}
function hoverTime(g, el, tip, x, y, S, w, h, o, m) {
  const times = Array.from(new Set(S.flatMap(s => s.pts.concat(s.ext).map(p => +p.d)))).sort((a, b) => a - b);
  const rule = g.append("line").attr("class", "hov-rule").attr("y1", 0).attr("y2", h).style("opacity", 0);
  const dots = S.map(() => g.append("circle").attr("r", 6.5).attr("stroke-width", 3).style("opacity", 0).style("pointer-events", "none"));
  const ov = g.append("rect").attr("width", w).attr("height", h).attr("fill", "transparent").style("touch-action", "pan-y");
  const bis = d3.bisector(d => d).center;
  const fmt = o.tipFmt || o.y.fmt, dfmt = o.tipDate || mlab;
  function mv(ev) {
    const [mx] = d3.pointer(ev, ov.node());
    const t = times[bis(times, +x.invert(mx))], xx = x(new Date(t));
    rule.attr("x1", xx).attr("x2", xx).style("opacity", 1);
    const rows = []; let ty = h;
    S.forEach((s, k) => {
      const p = s.pts.concat(s.ext).find(p => +p.d === t);
      if (p) {
        const role = roleAt(s, p.d);
        dots[k].attr("cx", xx).attr("cy", y(p.v)).attr("class", `mk s-${role}`).style("opacity", 1);
        ty = Math.min(ty, y(p.v));
        rows.push(`<span class="tr"><i class="sw-${role}"></i>${s.name}<b>${fmt(p.v)}</b></span>`);
      } else dots[k].style("opacity", 0);
    });
    const note = o.tipNote ? o.tipNote(new Date(t)) : "";
    showTip(tip, el, `<span class="th">${dfmt(new Date(t))}</span>${rows.join("")}${note ? `<span class="tr mut">${note}</span>` : ""}`, xx + m.l, ty + m.t);
  }
  ov.on("pointermove", mv).on("pointerdown", mv).on("pointerleave", () => { rule.style("opacity", 0); dots.forEach(d => d.style("opacity", 0)); hideTip(tip); });
}
const govName = d => d < new Date(2003, 4, 25) ? "" : d < new Date(2015, 11, 10) ? "Kirchnerismo" : d < new Date(2019, 11, 10) ? "Gobierno de Macri" : d < new Date(2023, 11, 10) ? "Kirchnerismo (Fernández)" : "Gobierno de Milei";

/* ============ barras verticales ============ */
function barChart(el, o) {
  const W0 = el.clientWidth, narrow = W0 < 560;
  const m = Object.assign({t: (o.bracket || o.shade) ? 62 : 26, r: 6, b: o.groups ? 50 : 30, l: o.axis ? 40 : 6}, o.m || {});
  const {g, w, h, tip} = base(el, o.height || (W => Math.max(250, Math.min(400, W * .4))), m);
  const D = o.data;
  const x = d3.scaleBand().domain(D.map((d, i) => i)).range([0, w]).paddingInner(o.pad != null ? o.pad : .26).paddingOuter(.08);
  const y = d3.scaleLinear().domain([0, o.max || d3.max(D, d => d.v) * 1.06]).range([h, 0]);
  const cx = i => x(i) + x.bandwidth() / 2;
  if (o.shade) {
    const s = o.shade, x0 = x(s.from) - x.step() * x.paddingInner() / 2, x1 = x(s.to) + x.bandwidth() + x.step() * x.paddingInner() / 2;
    g.append("rect").attr("class", "shade").attr("x", x0).attr("width", x1 - x0).attr("y", -m.t + 6).attr("height", h + m.t - 6).attr("rx", 4);
    const t = g.append("text").attr("class", "ann shade-l").attr("x", (x0 + x1) / 2).attr("y", -m.t + 22).attr("text-anchor", "middle");
    t.append("tspan").attr("x", (x0 + x1) / 2).style("font-weight", 700).text(narrow ? s.short || s.label : s.label);
    if (s.sub) t.append("tspan").attr("x", (x0 + x1) / 2).attr("dy", "1.3em").attr("class", "ann-m").text(narrow ? s.subShort || s.sub : s.sub);
  }
  if (o.axis) yGrid(g, y, w, o.axis.ticks, o.axis.fmt);
  const bars = g.append("g");
  bars.selectAll("rect").data(D).join("rect").attr("class", d => `b f-${d.role || "ctx"}${d.partial ? " partial" : ""}`)
    .attr("x", (d, i) => x(i)).attr("width", x.bandwidth()).attr("y", d => y(d.v)).attr("height", d => Math.max(0, h - y(d.v))).attr("rx", Math.min(3, x.bandwidth() / 4));
  g.append("line").attr("class", "ax").attr("x1", 0).attr("x2", w).attr("y1", h + .5).attr("y2", h + .5);
  if (o.values) {
    const show = typeof o.values === "function" ? o.values : () => true;
    const vf = o.vfmt || (v => f0(v));
    g.append("g").selectAll("text").data(D.map((d, i) => [d, i]).filter(([d, i]) => show(d, i, narrow))).join("text")
      .attr("class", "lbl").attr("x", ([d, i]) => cx(i)).attr("y", ([d]) => y(d.v) - 7)
      .attr("text-anchor", "middle").style("font-size", narrow ? "11px" : null).text(([d]) => vf(d.v, narrow));
  }
  if (o.xlab) {
    g.append("g").attr("class", "tk").selectAll("text").data(D.map((d, i) => [d, i]).filter(([d, i]) => o.xlab(d, i, narrow))).join("text")
      .attr("x", ([d, i]) => cx(i)).attr("y", h + 19).attr("text-anchor", "middle").text(([d, i]) => o.xlab(d, i, narrow));
  }
  if (o.groups) {
    const G = o.groups(narrow), tk = g.append("g").attr("class", "tk");
    G.forEach(gr => {
      const x0 = x(gr.from) - x.step() * x.paddingInner() / 2, x1 = x(gr.to) + x.bandwidth() + x.step() * x.paddingInner() / 2;
      tk.append("line").attr("class", "ax").attr("x1", Math.round(x0) + .5).attr("x2", Math.round(x0) + .5).attr("y1", h).attr("y2", h + (o.xlab ? 40 : 8));
      if (gr.label) tk.append("text").attr("x", (x0 + x1) / 2).attr("y", h + (o.xlab ? 40 : 20)).attr("text-anchor", "middle").text(gr.label);
    });
  }
  if (o.bracket) {
    const b = o.bracket, yb = y(d3.max(D.slice(b.from, b.to + 1), d => d.v)) - 30;
    const xa = cx(b.from), xb = cx(b.to);
    g.append("path").attr("class", "ann-line").attr("d", `M${xa},${y(D[b.from].v) - 20}V${yb}H${xb}V${yb + 8}`).style("stroke-dasharray", "3 3");
    g.append("text").attr("class", "ann").attr("x", (xa + xb) / 2).attr("y", yb - 8).attr("text-anchor", "middle").style("font-weight", 700).text(b.text);
  }
  if (o.tip !== false) {
    bars.selectAll("rect").on("pointerenter pointermove", function (ev, d) {
      const i = D.indexOf(d); bars.classed("dim", true); d3.select(this).classed("on", true);
      const extra = o.tipExtra ? o.tipExtra(d) : "";
      showTip(tip, el, `<span class="th">${o.tipLabel ? o.tipLabel(d) : d.label}</span><span class="tr"><i class="sw-${d.role || "ctx"}"></i>${o.tipName || "Valor"}<b>${(o.tipFmt || o.vfmt || f0)(d.v, false)}</b></span>${extra ? `<span class="tr mut">${extra}</span>` : ""}`, cx(i) + m.l, y(d.v) + m.t);
    }).on("pointerleave", function () { bars.classed("dim", false); d3.select(this).classed("on", false); hideTip(tip); });
  }
}

/* ============ columnas apiladas 100% ============ */
function stackCols(el, o) {
  const W0 = el.clientWidth, narrow = W0 < 560;
  const m = {t: 10, r: 4, b: 50, l: 4};
  const {g, w, h, tip} = base(el, W => Math.max(260, Math.min(380, W * .5)), m);
  const D = o.data, x = d3.scaleBand().domain(D.map((d, i) => i)).range([0, w]).paddingInner(.2).paddingOuter(.04);
  const y = d3.scaleLinear().domain([0, 100]).range([h, 0]);
  const cols = g.append("g");
  const gg = cols.selectAll("g").data(D).join("g").attr("class", "b");
  gg.append("rect").attr("class", "f-neg").attr("x", (d, i) => x(i)).attr("width", x.bandwidth()).attr("y", d => y(d.v)).attr("height", d => h - y(d.v)).attr("rx", 2);
  gg.append("rect").attr("class", "f-pale").attr("x", (d, i) => x(i)).attr("width", x.bandwidth()).attr("y", 0).attr("height", d => y(d.v) - 1.5).attr("rx", 2);
  if (x.bandwidth() > 24) {
    gg.append("text").attr("class", "in-l").attr("x", (d, i) => x(i) + x.bandwidth() / 2).attr("y", d => y(d.v / 2)).attr("dy", ".35em").attr("text-anchor", "middle").text(d => f1(d.v));
    gg.append("text").attr("class", "in-l dk").attr("x", (d, i) => x(i) + x.bandwidth() / 2).attr("y", d => y(d.v + (100 - d.v) / 2)).attr("dy", ".35em").attr("text-anchor", "middle").text(d => f1(100 - d.v));
  } else gg.filter((d, i) => o.mark(d, i)).append("text").attr("class", "lbl").attr("x", (d, i) => x(i) + x.bandwidth() / 2).attr("y", d => y(d.v) + 14).attr("text-anchor", "middle").style("font-size", "11px").text(d => f0(d.v));
  const tk = g.append("g").attr("class", "tk");
  if (!narrow) tk.selectAll("text.q").data(D).join("text").attr("class", "q").attr("x", (d, i) => x(i) + x.bandwidth() / 2).attr("y", h + 17).attr("text-anchor", "middle").text(d => d.q);
  o.groups.forEach(gr => {
    const x0 = x(gr.from) - x.step() * .1, x1 = x(gr.to) + x.bandwidth() + x.step() * .1;
    tk.append("line").attr("class", "ax").attr("x1", Math.round(x0) + .5).attr("x2", Math.round(x0) + .5).attr("y1", h).attr("y2", h + 42);
    tk.append("text").attr("class", "yr").attr("x", (x0 + x1) / 2).attr("y", h + (narrow ? 22 : 38)).attr("text-anchor", "middle").text(narrow ? "’" + gr.label.slice(2) : gr.label);
  });
  gg.on("pointerenter pointermove", function (ev, d) {
    cols.classed("dim", true); d3.select(this).classed("on", true); const i = D.indexOf(d);
    showTip(tip, el, `<span class="th">${d.q} trimestre de ${d.y}${d.prov ? "*" : ""}</span><span class="tr"><i class="sw-neg"></i>En dólares<b>${pc1(d.v)}</b></span><span class="tr"><i class="sw-pale"></i>En pesos<b>${pc1(100 - d.v)}</b></span>`, x(i) + x.bandwidth() / 2 + m.l, y(d.v) + m.t);
  }).on("pointerleave", function () { cols.classed("dim", false); d3.select(this).classed("on", false); hideTip(tip); });
}

/* ============ rectángulos de composición ============ */
function treemapChart(el, o) {
  el.innerHTML = "";
  const W = Math.max(280, el.clientWidth), narrow = W < 560, H = o.height ? o.height(W) : Math.max(240, Math.min(380, W * .42));
  const root = d3.hierarchy({children: o.data}).sum(d => d.v).sort((a, b) => b.value - a.value);
  d3.treemap().size([W, H]).paddingInner(3).round(true).tile(d3.treemapSquarify.ratio(1.2))(root);
  const svg = d3.select(el).append("svg").attr("width", W).attr("height", H).attr("viewBox", `0 0 ${W} ${H}`).attr("role", "img")
    .attr("aria-label", o.data.map(d => `${d.label}: ${f1(d.v)}%`).join("; "));
  const tip = d3.select(el).append("div").attr("class", "tip").attr("aria-hidden", "true");
  const leaf = svg.selectAll("g").data(root.leaves()).join("g").attr("class", "tm").attr("transform", d => `translate(${d.x0},${d.y0})`);
  leaf.append("rect").attr("width", d => d.x1 - d.x0).attr("height", d => d.y1 - d.y0).attr("rx", 5).attr("fill", d => d.data.color);
  leaf.each(function (d) {
    const tw = d.x1 - d.x0, th = d.y1 - d.y0, gg = d3.select(this), ink = d.data.ink || "#fff";
    if (tw < 54 || th < 40) return;
    const big = Math.max(14, Math.min(narrow ? 26 : 36, Math.sqrt(tw * th) / 6, (tw - 20) / 3.4));
    const longest = d3.max(d.data.label.split(" "), wd => textW(wd, "600 13px Montserrat, Arial, sans-serif"));
    gg.append("text").attr("x", 12).attr("y", 12 + big * .85).attr("fill", ink).attr("class", "tm-v").style("font-size", big + "px").text(f1(d.data.v) + "%");
    const words = d.data.label.split(" "), lines = []; let cur = "";
    words.forEach(wd => { const t = cur ? cur + " " + wd : wd; if (textW(t, "600 13px Montserrat") > tw - 24 && cur) { lines.push(cur); cur = wd; } else cur = t; });
    lines.push(cur);
    const maxL = longest > tw - 22 ? 0 : Math.floor((th - big - 24) / 17);
    lines.slice(0, Math.max(0, maxL)).forEach((ln, i) => gg.append("text").attr("x", 12).attr("y", 18 + big + 14 + i * 17).attr("fill", ink).attr("class", "tm-l").text(i === maxL - 1 && lines.length > maxL ? ln + "…" : ln));
  });
  leaf.on("pointermove", function (ev, d) {
    const r = el.getBoundingClientRect();
    svg.selectAll("g.tm").classed("dim-t", true); d3.select(this).classed("dim-t", false);
    showTip(tip, el, `<span class="th">${d.data.label}</span><span class="tr">Participación<b>${pc1(d.data.v)}</b></span>${d.data.n ? `<span class="tr mut">${f0(d.data.n)} personas</span>` : ""}${d.data.note ? `<span class="tr mut">${d.data.note}</span>` : ""}`, ev.clientX - r.left, ev.clientY - r.top);
  }).on("pointerleave", () => { svg.selectAll("g.tm").classed("dim-t", false); hideTip(tip); });
}
