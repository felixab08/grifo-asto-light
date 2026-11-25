# SPEC 01 — Revisión y corrección del login con Google

> **Estado:** Borrador
> **Depende de:** —
> **Fecha:** 2026-11-25
> **Objetivo:** Revisar el login con Google existente y corregir el fallback popup/redirect, la persistencia local, los mensajes de error y el texto de acceso.

## Por qué existe esta spec

El login ya está implementado, pero arrastra tres inconsistencias: la pantalla promete una autorización que no existe, el popup no tiene fallback y los errores exponen detalles internos de Firebase. Esta spec corrige esas brechas sin ampliar el alcance del producto.

## Alcance

**In:**

- Fallback automático de popup a redirect cuando el navegador bloquea la ventana.
- Procesamiento del resultado del redirect al iniciar la app.
- Persistencia local explícita de la sesión.
- Mensajes de error en español sin detalles internos; el código técnico queda en la consola.
- Texto del login alineado con la política real: cualquier cuenta de Google puede ingresar y el administrador puede bloquear cuentas.
- Actualización del README en la sección de login y seguridad.
- Verificación manual del flujo y ejecución de las pruebas existentes.

**Out of scope (for future specs):**

- Lista blanca de correos o UID.
- Restricción por dominio de correo.
- Otros proveedores de autenticación (email/password, teléfono, etc.).
- UI de administración de usuarios.
- Emulador de Firebase y pruebas automatizadas nuevas.
- Cambios en `firestore.rules`, en la colección `mediciones` o en el modelo de datos.
- Configuración del proveedor en `firebase.json` o despliegue con Firebase CLI.

## Modelo de datos

Esta spec no introduce estructuras nuevas. Reutiliza el usuario de Firebase Authentication (`uid`, `email`, `displayName`, `photoURL`) y no modifica la colección `mediciones` ni `firestore.rules`.

## Plan de implementación

1. **Persistencia explícita.** En `src/app/core/auth/auth.service.ts`, fijar `browserLocalPersistence` con `setPersistence` antes de iniciar sesión. Prueba manual: iniciar sesión, recargar y cerrar/abrir el navegador; la sesión sigue activa.
2. **Fallback de popup a redirect.** En `iniciarSesionConGoogle()`, capturar `auth/popup-blocked` y `auth/operation-not-supported-in-this-environment` y reintentar con `signInWithRedirect`. Los demás errores se propagan. Prueba manual: bloquear ventanas emergentes e iniciar sesión; la app vuelve autenticada a `/mediciones`.
3. **Resultado del redirect.** En `AuthService`, procesar `getRedirectResult` al construir el servicio y guardar el error en una señal `errorRedirect`. Prueba manual: forzar un redirect fallido y ver el mensaje genérico en `/login`.
4. **Mensajes de error.** En `src/app/features/login/login.page.ts`, reemplazar los mensajes que mencionan Firebase Console, rutas del proyecto o códigos `auth/*` por mensajes genéricos en español. Registrar el código técnico con `console.error`. La pantalla muestra `error()` o `errorRedirect()` usando el mismo traductor. Prueba manual: cancelar el popup y verificar el mensaje y la consola.
5. **Texto de acceso.** En `src/app/features/login/login.page.html`, reemplazar la nota "Solo cuentas autorizadas por el administrador del grifo" por: "Ingresa con tu cuenta de Google. El administrador del grifo puede bloquear el acceso de cuentas no deseadas." Prueba manual: leer la pantalla.
6. **README.** Actualizar la sección de login y seguridad para reflejar la política real, el fallback y la persistencia local. Prueba manual: leer el README.
7. **Verificación final.** Ejecutar `npm run build` y `npx ng test --watch=false`; completar la lista de aceptación.

## Criterios de aceptación

- [ ] El botón "Continuar con Google" abre el selector de cuentas y, al elegir una, navega a `/mediciones`.
- [ ] Con las ventanas emergentes bloqueadas, el login usa redirect y termina autenticado en `/mediciones`.
- [ ] Si el redirect falla, `/login` muestra un mensaje en español sin detalles internos.
- [ ] Recargar la página mantiene la sesión.
- [ ] Cerrar y reabrir el navegador mantiene la sesión.
- [ ] Sin sesión, `/mediciones` redirige a `/login`.
- [ ] Con sesión, `/login` redirige a `/mediciones`.
- [ ] "Salir" cierra la sesión, vuelve a `/login` y recargar no restaura la sesión.
- [ ] Los mensajes de error no mencionan Firebase Console, rutas del proyecto ni códigos `auth/*`.
- [ ] El código técnico del error aparece en la consola del navegador.
- [ ] El texto del login indica que se ingresa con cualquier cuenta de Google y que el administrador puede bloquear cuentas.
- [ ] `npm run build` termina sin errores.
- [ ] `npx ng test --watch=false` pasa con las pruebas existentes.

## Decisiones tomadas y descartadas

- **Sí:** cualquier cuenta de Google puede ingresar. No hay backend ni UI de administración; el bloqueo se hace en Firebase Console. Consecuencia: el texto del login debe dejar de prometer una lista de autorizados.
- **No:** lista blanca por correo o UID en Firestore. Agrega una colección, reglas y administración manual; va en otra spec si se necesita.
- **Sí:** popup con fallback a redirect ante `auth/popup-blocked` y `auth/operation-not-supported-in-this-environment`. Mantiene la buena experiencia en escritorio y cubre móviles.
- **No:** redirect siempre. Es más lento y peor experiencia en escritorio.
- **Sí:** persistencia local explícita. El equipo del grifo no tiene que ingresar en cada visita.
- **Sí:** mensajes genéricos al usuario y detalle técnico en consola. Cumple la regla de AGENTS.md de no exponer detalles internos de Firebase.
- **Sí:** solo prueba manual. El flujo depende del popup de Google; se mantienen las pruebas existentes y no se agregan nuevas.
- **No:** emulador de Firebase. Fuera de alcance; se prueba contra el proyecto real.
- **No:** versionar el proveedor en `firebase.json`. Ya está configurado en la consola y no cambia en esta spec.

## Riesgos identificados

| Riesgo                                                        | Mitigación                                                                       |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| El redirect falla o el navegador bloquea cookies de terceros. | Mensaje genérico en `/login`; probar en Chrome y Safari móvil.                   |
| `getRedirectResult` no se llama al iniciar la app.            | Llamarlo en el constructor de `AuthService`, antes de que el usuario interactúe. |
| Persistencia local en un equipo compartido.                   | El botón "Salir" está siempre visible; el administrador puede cerrar la sesión.  |
| Popup bloqueado y redirect también bloqueado.                 | Mostrar error y pedir habilitar ventanas emergentes y cookies.                   |

## Qué **no** está en esta spec

- Lista blanca de correos o UID.
- Restricción por dominio de correo.
- Otros proveedores de autenticación.
- UI de administración de usuarios.
- Emulador de Firebase y pruebas automatizadas nuevas.
- Cambios en `firestore.rules`, en `mediciones` o en el modelo de datos.
- Configuración del proveedor en `firebase.json` o despliegue con Firebase CLI.
- Reacción global a la pérdida de sesión mientras se está en una ruta protegida.

Cada uno de esos puntos, si llega, va en su propia spec.
