// =====================================================================
//  CONFIGURACIÓN — lo único que hay que editar antes de publicar.
// =====================================================================

// 1) Pegue aquí el objeto "firebaseConfig" que le da Firebase
//    (Configuración del proyecto → Tus apps → App web).
//    Mientras diga "PEGAR_AQUI", la página funciona en MODO PRUEBA:
//    todo ocurre dentro de un mismo navegador, sin internet.
export const firebaseConfig = {
  apiKey: "PEGAR_AQUI",
  authDomain: "PEGAR_AQUI",
  projectId: "PEGAR_AQUI",
  storageBucket: "PEGAR_AQUI",
  messagingSenderId: "PEGAR_AQUI",
  appId: "PEGAR_AQUI"
};

// 2) El correo de Google con el que usted entrará al panel de administrador.
//    Debe ser el mismo que ponga en las reglas de la base de datos.
export const ADMIN_EMAIL = "su-correo@gmail.com";

// Nombre del "canal" en la base de datos. Cámbielo (p. ej. "retiro-2027")
// si algún día reutiliza el sitio para otro retiro y quiere empezar de cero.
export const SALA = "retiro-adviento-2026";
