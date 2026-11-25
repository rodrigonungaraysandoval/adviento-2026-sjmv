import { MOMENTOS } from "./datos.js?v=9";
import { escucharLiberadas, fijarLiberadas, vigilarSesion, entrar, salir, MODO_PRUEBA } from "./estado.js?v=9";
import { ADMIN_EMAIL } from "./config.js?v=9";

const $ = id => document.getElementById(id);
let liberadas = 0, ocupado = false, iniciado = false;

if (MODO_PRUEBA) $("avisoPrueba").hidden = false;

function dibujar() {
  $("lista").innerHTML = MOMENTOS.map(m => {
    const cls = m.n <= liberadas ? "lib" : m.n === liberadas + 1 ? "sig" : "";
    const est = m.n <= liberadas ? "Liberada" : m.n === liberadas + 1 ? "Siguiente" : "";
    return `<li class="${cls}"><span class="marca">${m.n <= liberadas ? "✓" : m.n}</span>
            <span class="txt"><span class="nom">${m.nombre}</span><span class="fr">${m.frase}</span></span>
            <span class="est">${est}</span></li>`;
  }).join("");
  const sig = MOMENTOS[liberadas];
  const b = $("btnSiguiente");
  b.textContent = sig ? `Liberar pieza ${sig.n}: ${sig.nombre}` : "Las 7 piezas están liberadas";
  b.disabled = !sig || ocupado;
  $("btnAtras").disabled = liberadas === 0 || ocupado;
  $("btnReiniciar").disabled = liberadas === 0 || ocupado;
  $("textoEstado").textContent = `Piezas liberadas: ${liberadas} de 7`;
}

async function cambiar(n) {
  ocupado = true; dibujar();
  try { await fijarLiberadas(n); }
  catch (e) { alert("No se pudo guardar el cambio. ¿Entró con la cuenta correcta?\n\n" + e.message); }
  ocupado = false; dibujar();
}

$("btnSiguiente").addEventListener("click", () => cambiar(liberadas + 1));
$("btnAtras").addEventListener("click", () => {
  const m = MOMENTOS[liberadas - 1];
  if (confirm(`¿Quitar la pieza ${m.n} (${m.nombre})? Desaparecerá de los celulares.`)) cambiar(liberadas - 1);
});
$("btnReiniciar").addEventListener("click", () => {
  if (confirm("¿Reiniciar a 0? Todos los participantes perderán sus piezas. Úselo solo después de un ensayo.")) cambiar(0);
});
$("btnEntrar").addEventListener("click", async () => {
  $("msgLogin").textContent = "";
  try { await entrar(); } catch (e) { $("msgLogin").textContent = "No se pudo iniciar sesión: " + e.message; }
});

vigilarSesion((u, esAdmin) => {
  $("cajaLogin").hidden = esAdmin;
  $("panel").hidden = !esAdmin;
  if (u && !esAdmin) {
    $("msgLogin").innerHTML = `Entró como <b>${u.email}</b>, pero el panel solo acepta ${ADMIN_EMAIL}. `
      + `<a href="#" id="lnkSalir">Cambiar de cuenta</a>`;
    $("lnkSalir").onclick = e => { e.preventDefault(); salir(); };
  }
  if (esAdmin) {
    $("sesion").innerHTML = MODO_PRUEBA ? "" : `Sesión: ${u.email} · <a href="#" id="lnkSalir2">Salir</a>`;
    const l = $("lnkSalir2"); if (l) l.onclick = e => { e.preventDefault(); salir(); };
    if (!iniciado) {
      iniciado = true;
      escucharLiberadas(n => { liberadas = n; dibujar(); },
        ok => { $("punto").className = "punto " + (ok ? "ok" : "no"); });
    }
  }
}).catch(e => { $("cajaLogin").hidden = false; $("msgLogin").textContent = "Error al cargar: " + e.message; });
