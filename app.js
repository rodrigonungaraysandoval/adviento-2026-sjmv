import { MOMENTOS, TABLERO } from "./datos.js";
import { escucharLiberadas, MODO_PRUEBA } from "./estado.js";
import { SALA } from "./config.js";

const $ = id => document.getElementById(id);
const tablero = $("tablero"), bandeja = $("bandeja");
const CLAVE = "rompecabezas:" + SALA + ":colocadas";
const TOLERANCIA = 110;        // en unidades del tablero (1000): ~11 %
const ELEVAR = 36;             // px: la pieza flota un poco arriba del dedo

let liberadas = 0;
let colocadas = leerColocadas();
let fallos = {};
let tarjetaURL = null, tarjetaBlob = null;

if (MODO_PRUEBA) $("avisoPrueba").hidden = false;

function leerColocadas() {
  try { return new Set(JSON.parse(localStorage.getItem(CLAVE) || "[]")); }
  catch { return new Set(); }
}
function guardarColocadas() {
  try { localStorage.setItem(CLAVE, JSON.stringify([...colocadas])); } catch {}
}

/* ---------- Dibujo ---------- */
function pct(v) { return (v / TABLERO * 100) + "%"; }

function dibujarTablero(recien) {
  tablero.querySelectorAll(".pieza, .pista").forEach(e => e.remove());
  const ref = tablero.querySelector(".completo");
  for (const m of MOMENTOS) {
    if (!colocadas.has(m.n)) continue;
    const img = document.createElement("img");
    img.className = "pieza" + (m.n === recien ? " recien" : "");
    img.src = m.img; img.alt = m.nombre;
    Object.assign(img.style, { left: pct(m.x), top: pct(m.y), width: pct(m.w), height: pct(m.h), zIndex: m.n });
    tablero.insertBefore(img, ref);
  }
}

function dibujarBandeja() {
  const ya = new Set([...bandeja.querySelectorAll(".ficha")].map(f => +f.dataset.n));
  bandeja.querySelectorAll(".ficha, .vacia").forEach(f => {
    const n = +f.dataset.n;
    if (f.classList.contains("vacia") || colocadas.has(n) || n > liberadas) f.remove();
  });
  let nuevas = 0;
  for (const m of MOMENTOS) {
    if (m.n > liberadas || colocadas.has(m.n) || ya.has(m.n)) continue;
    const f = document.createElement("div");
    f.className = "ficha"; f.dataset.n = m.n;
    f.innerHTML = `<img src="${m.img}" alt=""><span>${m.n}. ${m.nombre}</span>`;
    f.addEventListener("pointerdown", e => iniciarArrastre(e, m, f));
    bandeja.appendChild(f); nuevas++;
  }
  if (!bandeja.querySelector(".ficha")) {
    const v = document.createElement("div"); v.className = "vacia";
    v.textContent = colocadas.size === 7 ? "¡Completaste el rompecabezas!"
      : liberadas === 0 ? "Tu primera pieza llegará al terminar el primer momento."
      : "Espera la siguiente pieza: llegará al terminar el próximo momento.";
    bandeja.appendChild(v);
  }
  if (nuevas && ya.size + colocadas.size > 0 && navigator.vibrate) navigator.vibrate(90);
}

function dibujarEstado() {
  const t = $("textoEstado");
  if (colocadas.size === 7) t.textContent = "Rompecabezas completo";
  else if (liberadas === 0) t.textContent = "Esperando el primer momento…";
  else t.textContent = `Piezas liberadas: ${liberadas} de 7`;
  $("progreso").innerHTML = MOMENTOS.map(m =>
    `<i class="${colocadas.has(m.n) ? "col" : m.n <= liberadas ? "lib" : ""}"></i>`).join("");
}

function dibujarFrases() {
  $("frases").innerHTML = MOMENTOS.filter(m => colocadas.has(m.n))
    .map(m => `<li><b>${m.n}. ${m.nombre}.</b> ${m.frase}</li>`).join("")
    || `<li style="border-color:#e5dccb;color:#7a6d80">Aquí irán apareciendo las frases de cada momento.</li>`;
}

function dibujarTodo(recien) {
  dibujarTablero(recien); dibujarBandeja(); dibujarEstado(); dibujarFrases();
  if (colocadas.size === 7) terminar();
}

/* ---------- Arrastre ---------- */
function iniciarArrastre(e, m, ficha) {
  e.preventDefault();
  const r = tablero.getBoundingClientRect();
  const esc = r.width / TABLERO;
  const w = m.w * esc, h = m.h * esc;
  const flot = document.createElement("img");
  flot.src = m.img; flot.className = "flotante";
  flot.style.width = w + "px"; flot.style.height = h + "px";
  document.body.appendChild(flot);
  ficha.classList.add("arrastrando");
  ficha.setPointerCapture(e.pointerId);

  let px = e.clientX, py = e.clientY;
  const mover = () => { flot.style.transform = `translate(${px - w / 2}px, ${py - h / 2 - ELEVAR}px)`; };
  mover();

  const onMove = ev => { px = ev.clientX; py = ev.clientY; requestAnimationFrame(mover); };
  const onUp = () => {
    ficha.removeEventListener("pointermove", onMove);
    ficha.removeEventListener("pointerup", onUp);
    ficha.removeEventListener("pointercancel", onUp);
    flot.remove();
    ficha.classList.remove("arrastrando");
    const rr = tablero.getBoundingClientRect();
    const e2 = rr.width / TABLERO;
    const bx = (px - w / 2 - rr.left) / e2, by = (py - h / 2 - ELEVAR - rr.top) / e2;
    if (Math.abs(bx - m.x) < TOLERANCIA && Math.abs(by - m.y) < TOLERANCIA) colocar(m);
    else fallar(m, rr, px, py);
  };
  ficha.addEventListener("pointermove", onMove);
  ficha.addEventListener("pointerup", onUp);
  ficha.addEventListener("pointercancel", onUp);
}

function fallar(m, rr, px, py) {
  const dentro = px > rr.left && px < rr.right && py > rr.top && py < rr.bottom;
  if (!dentro) return;
  fallos[m.n] = (fallos[m.n] || 0) + 1;
  if (fallos[m.n] >= 2 && !tablero.querySelector(".pista")) {
    const p = document.createElement("img");
    p.className = "pista"; p.src = m.img; p.alt = "";
    Object.assign(p.style, { left: pct(m.x), top: pct(m.y), width: pct(m.w), height: pct(m.h), zIndex: 20 });
    tablero.appendChild(p);
  }
}

function colocar(m) {
  colocadas.add(m.n); guardarColocadas();
  delete fallos[m.n];
  dibujarTablero(m.n); dibujarBandeja(); dibujarEstado(); dibujarFrases();
  if (navigator.vibrate) navigator.vibrate([30, 40, 30]);
  mostrarFrase(m);
}

/* ---------- Frase ---------- */
function mostrarFrase(m) {
  $("vNum").textContent = `Momento ${m.n} de 7`;
  $("vNombre").textContent = m.nombre;
  $("vFrase").textContent = m.frase;
  $("velo").classList.add("abierto");
}
$("vCerrar").addEventListener("click", () => {
  $("velo").classList.remove("abierto");
  if (colocadas.size === 7) terminar(true);
});

/* ---------- Final y tarjeta ---------- */
let terminado = false;
async function terminar(desplazar) {
  tablero.classList.add("terminado");
  if (!terminado) {
    terminado = true;
    try {
      tarjetaBlob = await crearTarjeta();
      tarjetaURL = URL.createObjectURL(tarjetaBlob);
      $("imgFinal").src = tarjetaURL;
    } catch (err) { console.error(err); }
    $("resultado").classList.add("visible");
  }
  if (desplazar) setTimeout(() => $("resultado").scrollIntoView({ behavior: "smooth", block: "start" }), 400);
}

function cargarImg(src) {
  return new Promise((ok, mal) => { const i = new Image(); i.onload = () => ok(i); i.onerror = mal; i.src = src; });
}

function envolver(ctx, texto, ancho) {
  const palabras = texto.split(" "), lineas = []; let l = "";
  for (const p of palabras) {
    const prueba = l ? l + " " + p : p;
    if (ctx.measureText(prueba).width > ancho && l) { lineas.push(l); l = p; } else l = prueba;
  }
  if (l) lineas.push(l);
  return lineas;
}

function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

async function crearTarjeta() {
  const W = 2000, H = 1125, M = 62;
  const SERIF = 'Georgia, "Times New Roman", "Noto Serif", serif';
  const [foto, logo] = await Promise.all([cargarImg("completo.jpg"), cargarImg("logo.png")]);
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const ctx = c.getContext("2d");

  // Fondo
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#fffaf1"); g.addColorStop(1, "#f3e9d6");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "#c49a3c"; ctx.lineWidth = 3; ctx.strokeRect(22, 22, W - 44, H - 44);

  // Rompecabezas
  const S = H - 2 * M;
  ctx.save(); ctx.shadowColor = "rgba(61,33,80,.35)"; ctx.shadowBlur = 30; ctx.shadowOffsetY = 8;
  rrect(ctx, M, M, S, S, 18); ctx.fillStyle = "#fff"; ctx.fill(); ctx.restore();
  ctx.save(); rrect(ctx, M, M, S, S, 18); ctx.clip(); ctx.drawImage(foto, M, M, S, S); ctx.restore();
  rrect(ctx, M, M, S, S, 18); ctx.lineWidth = 5; ctx.strokeStyle = "#c49a3c"; ctx.stroke();

  // Columna derecha
  const X = M + S + 64, AN = W - X - M - 10;
  const LG = 150;
  ctx.drawImage(logo, X, M + 4, LG, LG);
  ctx.fillStyle = "#3d2150"; ctx.textBaseline = "alphabetic";
  ctx.font = `76px ${SERIF}`;
  ctx.fillText("Adviento 2026", X + LG + 34, M + 108);
  ctx.fillStyle = "#c49a3c"; ctx.fillRect(X + LG + 36, M + 132, 230, 4);

  // Frases (ajusta el tamaño para que quepan)
  const top = M + LG + 46, bottom = H - M;
  let fs = 29, bloques;
  for (; fs >= 20; fs--) {
    ctx.font = `${fs}px ${SERIF}`;
    bloques = MOMENTOS.map(m => envolver(ctx, m.frase, AN - 56));
    const alto = bloques.reduce((a, b) => a + (fs * 1.2) + b.length * fs * 1.28, 0) + 6 * fs * .62;
    if (alto <= bottom - top) break;
  }
  let y = top;
  MOMENTOS.forEach((m, i) => {
    // número en círculo
    ctx.fillStyle = "#3d2150";
    ctx.beginPath(); ctx.arc(X + 20, y + fs * .55, fs * .72, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = `bold ${Math.round(fs * .85)}px ${SERIF}`; ctx.textAlign = "center";
    ctx.fillText(String(m.n), X + 20, y + fs * .55 + fs * .3);
    ctx.textAlign = "left";
    ctx.fillStyle = "#8a6a1f"; ctx.font = `bold ${fs}px ${SERIF}`;
    ctx.fillText(m.nombre, X + 56, y + fs * .9);
    y += fs * 1.2;
    ctx.fillStyle = "#2b2230"; ctx.font = `${fs}px ${SERIF}`;
    for (const l of bloques[i]) { y += fs * 1.28; ctx.fillText(l, X + 56, y - fs * .28); }
    y += fs * .62;
  });

  return new Promise(ok => c.toBlob(ok, "image/png"));
}

$("btnCompartir").addEventListener("click", async () => {
  if (!tarjetaBlob) return;
  const archivo = new File([tarjetaBlob], "Adviento-2026.png", { type: "image/png" });
  try {
    if (navigator.canShare && navigator.canShare({ files: [archivo] })) {
      await navigator.share({ files: [archivo], title: "Adviento 2026" });
      return;
    }
  } catch (e) { if (e.name === "AbortError") return; }
  descargar();
});
$("btnDescargar").addEventListener("click", descargar);
function descargar() {
  if (!tarjetaURL) return;
  const a = document.createElement("a");
  a.href = tarjetaURL; a.download = "Adviento-2026.png";
  document.body.appendChild(a); a.click(); a.remove();
}
if (!navigator.share) $("btnCompartir").hidden = true;

/* ---------- Conexión con el administrador ---------- */
dibujarTodo();
escucharLiberadas(n => {
  liberadas = n;
  // Si el administrador reinicia (p. ej. tras un ensayo), se quitan las piezas no liberadas.
  let cambio = false;
  for (const k of [...colocadas]) if (k > n) { colocadas.delete(k); cambio = true; }
  if (cambio) {
    guardarColocadas();
    terminado = false; tablero.classList.remove("terminado"); $("resultado").classList.remove("visible");
  }
  dibujarTodo();
}, ok => {
  $("punto").className = "punto " + (ok ? "ok" : "no");
  if (!ok) $("textoEstado").textContent = "Sin conexión… reintentando";
  else dibujarEstado();
}).catch(err => {
  console.error(err);
  $("punto").className = "punto no";
  $("textoEstado").textContent = "No se pudo conectar. Revisa tus datos y recarga.";
});
