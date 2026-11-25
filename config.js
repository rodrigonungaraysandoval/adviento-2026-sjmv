// =====================================================================
//  CONFIGURACIÓN — lo único que hay que editar antes de publicar.
// =====================================================================

// 1) Pegue aquí el objeto "firebaseConfig" que le da Firebase
//    (Configuración del proyecto → Tus apps → App web).
//    Mientras diga "PEGAR_AQUI", la página funciona en MODO PRUEBA:
//    todo ocurre dentro de un mismo navegador, sin internet.
export const firebaseConfig = {
  apiKey: "AIzaSyBb1SJQp5kucLHELwR1frod07MdHNuQ_IA",
  authDomain: "adviento-2026-sjmv.firebaseapp.com",
  projectId: "adviento-2026-sjmv",
  storageBucket: "adviento-2026-sjmv.firebasestorage.app",
  messagingSenderId: "944024145969",
  appId: "1:944024145969:web:e5e74c1ae1dffa619ac510"
};

// 2) El correo de Google con el que usted entrará al panel de administrador.
//    Debe ser el mismo que ponga en las reglas de la base de datos.
export const ADMIN_EMAIL = "rodnunga@gmail.com";

// Nombre del "canal" en la base de datos. Cámbielo (p. ej. "retiro-2027")
// si algún día reutiliza el sitio para otro retiro y quiere empezar de cero.
export const SALA = "retiro-adviento-2026";
