# Rompecabezas de Adviento 2026 — Guía de puesta en marcha

Dos páginas:

- **`index.html`**: la que abren los participantes con el QR. Arman el rompecabezas y al final obtienen su tarjeta.
- **`admin.html`**: su panel para liberar las piezas. No está enlazada desde ninguna parte. Aunque alguien la encuentre, no puede cambiar nada sin entrar con su cuenta de Google.

Mientras `js/config.js` diga `PEGAR_AQUI`, el sitio funciona en **modo de prueba**: el panel y el rompecabezas se comunican solo entre pestañas del mismo navegador. Sirve para conocerlo antes de configurar Firebase.

---

## Paso 1. Publicar en GitHub Pages (unos 5 minutos)

1. En GitHub cree un repositorio **público**, por ejemplo `adviento2026`.
2. **Add file → Upload files**. Arrastre **todo el contenido** de esta carpeta (`index.html`, `admin.html` y las carpetas `assets`, `css` y `js`). Después pulse **Commit changes**.
3. **Settings → Pages → Build and deployment**: en *Source* elija **Deploy from a branch**, rama **main**, carpeta **/(root)**, y guarde.
4. En uno o dos minutos el sitio quedará en:
   - Participantes: `https://SU-USUARIO.github.io/adviento2026/`
   - Panel: `https://SU-USUARIO.github.io/adviento2026/admin.html`

Para probarlo en modo de prueba, abra las dos direcciones en dos pestañas del mismo navegador. Libere piezas en el panel y ármelas en la otra pestaña.

---

## Paso 2. Crear Firebase (unos 15 minutos, gratis)

1. Entre a **https://console.firebase.google.com** con su cuenta de Google y pulse **Crear un proyecto**. Póngale un nombre, por ejemplo `adviento2026`. Puede desactivar Google Analytics, no se necesita.
2. **Base de datos.** En el menú izquierdo, **Compilación → Firestore Database → Crear base de datos**.
   - Ubicación: cualquiera cercana, por ejemplo `us-central1` o `northamerica-south1`.
   - Elija **modo de producción**.
3. **Reglas.** En Firestore, abra la pestaña **Reglas**. Borre lo que haya y pegue el contenido del archivo **`firestore.rules`** de esta carpeta. **Cambie `su-correo@gmail.com` por su correo real** y pulse **Publicar**.
4. **Inicio de sesión con Google.** En **Compilación → Authentication → Comenzar → Método de acceso**, elija **Google**, actívelo, ponga su correo como correo de asistencia y guarde.
5. **Autorizar su dominio.** En **Authentication → Configuración → Dominios autorizados → Agregar dominio**, escriba `SU-USUARIO.github.io` (sin `https://` y sin el nombre del repositorio).
6. **Obtener la configuración.** Pulse el engrane ⚙ junto a "Descripción general" → **Configuración del proyecto**. En **Tus apps**, pulse el ícono web **`</>`** y registre la app con cualquier nombre. No marque Firebase Hosting. Firebase le mostrará un bloque `const firebaseConfig = { … }`.

## Paso 3. Conectar el sitio con Firebase

1. En GitHub abra **`js/config.js`** y pulse el lápiz ✏️ para editarlo.
2. Reemplace cada `PEGAR_AQUI` con el valor que le dio Firebase (`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId` y `appId`).
3. En `ADMIN_EMAIL` escriba su correo, el mismo que puso en las reglas.
4. Pulse **Commit changes** y espere uno o dos minutos.

Es normal que la `apiKey` quede visible en la página. En Firebase no es una contraseña: la protección la dan las reglas del paso 2.3.

---

## Paso 4. Ensayo general (recomendado el viernes o el sábado)

1. Abra el **panel** en su celular o computadora y pulse **Entrar con Google**. Use Chrome si su iPhone pone problemas con la ventana de inicio de sesión.
2. Abra la página de **participantes** en dos o tres celulares distintos.
3. Libere algunas piezas. Deben aparecer en los celulares en uno o dos segundos. Ármelas y revise las frases.
4. Libere las 7 y revise la tarjeta final: botones **Compartir** y **Descargar**.
5. Al terminar pulse **Reiniciar a 0**. Las piezas de los celulares de prueba también desaparecen.

## El día del retiro

- Proyecte el **QR** que lleva a la página de participantes. Puede generarlo gratis en cualquier generador de códigos QR con la dirección del paso 1.4. Conviene mostrarlo al inicio, para que todos entren antes del primer momento.
- Deje el panel abierto con la sesión iniciada. Al cerrar cada momento, pulse **Liberar pieza N**.
- Quien llegue tarde o recargue la página recibe todas las piezas ya liberadas. Su avance se guarda en su propio celular.
- Si se equivoca, **Quitar la última** retira la pieza más reciente.

## Si algún día lo reutiliza

En `js/config.js` cambie `SALA` (por ejemplo a `retiro-2027`) y empezará desde cero. Para otro rompecabezas basta reemplazar las imágenes de `assets/` y las frases de `js/datos.js`.

## Qué hay en la carpeta

| Archivo | Para qué sirve |
|---|---|
| `index.html`, `js/app.js` | Página de los participantes: rompecabezas, frases y tarjeta final |
| `admin.html`, `js/admin.js` | Panel del administrador |
| `js/estado.js` | Conexión con Firebase (y el modo de prueba) |
| `js/datos.js` | Nombres, frases y posición de cada pieza |
| `js/config.js` | **Lo único que usted edita**: configuración de Firebase y su correo |
| `css/estilo.css` | Colores y diseño |
| `assets/` | Imágenes optimizadas (piezas, imagen completa y logo) |
| `firestore.rules` | Reglas de seguridad para pegar en Firebase. No hace falta subirlo a GitHub |
