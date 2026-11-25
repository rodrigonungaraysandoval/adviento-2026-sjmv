// Conexión con el "marcador compartido": cuántas piezas ha liberado el administrador.
// Con Firebase configurado usa Cloud Firestore (documento retiros/<SALA>, campo "liberadas").
// Sin configurar, un modo de prueba local (localStorage) que sincroniza pestañas del mismo navegador.
import { firebaseConfig, ADMIN_EMAIL, SALA } from "./config.js";

const FB = "https://www.gstatic.com/firebasejs/10.12.2/";
export const MODO_PRUEBA =
  firebaseConfig.apiKey === "PEGAR_AQUI" || new URLSearchParams(location.search).has("prueba");

let _fs = null, _auth = null, _mods = null;

async function fb() {
  if (_mods) return _mods;
  const [app, fs, auth] = await Promise.all([
    import(FB + "firebase-app.js"),
    import(FB + "firebase-firestore.js"),
    import(FB + "firebase-auth.js")
  ]);
  const a = app.initializeApp(firebaseConfig);
  _fs = fs.getFirestore(a);
  _auth = auth.getAuth(a);
  _mods = { app, fs, auth };
  return _mods;
}

const CLAVE_PRUEBA = "prueba:" + SALA + ":liberadas";

/** Llama a cb(n) cada vez que cambia el número de piezas liberadas (0–7).
 *  cbConexion(true|false) indica si hay conexión con el servidor. */
export async function escucharLiberadas(cb, cbConexion) {
  if (MODO_PRUEBA) {
    const leer = () => cb(parseInt(localStorage.getItem(CLAVE_PRUEBA) || "0", 10));
    window.addEventListener("storage", e => { if (e.key === CLAVE_PRUEBA) leer(); });
    leer();
    cbConexion && cbConexion(true);
    return;
  }
  const { fs } = await fb();
  fs.onSnapshot(fs.doc(_fs, "retiros", SALA), { includeMetadataChanges: true }, s => {
    cb(Number(s.exists() ? s.data().liberadas : 0) || 0);
    cbConexion && cbConexion(!s.metadata.fromCache);
  }, err => { console.error(err); cbConexion && cbConexion(false); });
  if (cbConexion) {
    addEventListener("offline", () => cbConexion(false));
  }
}

/** Solo administrador. */
export async function fijarLiberadas(n) {
  n = Math.max(0, Math.min(7, n));
  if (MODO_PRUEBA) {
    localStorage.setItem(CLAVE_PRUEBA, String(n));
    window.dispatchEvent(new StorageEvent("storage", { key: CLAVE_PRUEBA }));
    return;
  }
  const { fs } = await fb();
  await fs.setDoc(fs.doc(_fs, "retiros", SALA), { liberadas: n });
}

/** Inicio de sesión del administrador con Google. cb(usuario|null, esAdmin) */
export async function vigilarSesion(cb) {
  if (MODO_PRUEBA) { cb({ email: "modo de prueba" }, true); return; }
  const { auth } = await fb();
  auth.onAuthStateChanged(_auth, u =>
    cb(u, !!u && (u.email || "").toLowerCase() === ADMIN_EMAIL.toLowerCase()));
}
export async function entrar() {
  const { auth } = await fb();
  await auth.signInWithPopup(_auth, new auth.GoogleAuthProvider());
}
export async function salir() {
  if (MODO_PRUEBA) return;
  const { auth } = await fb();
  await auth.signOut(_auth);
}
