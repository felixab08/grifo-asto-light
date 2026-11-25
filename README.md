# Grifo Asto Light

Aplicación Angular para registrar las medidas de los tanques del grifo. El acceso es con Google
(Firebase Authentication) y las medidas se guardan en Cloud Firestore.

## Alcance

- Inicio de sesión con Google. No hay registro público de cuentas.
- Registro de la medida de los tanques de diésel, regular y premium.
- Historial de las últimas 30 medidas con fecha y usuario.
- Sin backend propio: Firebase es la única persistencia.

## Requisitos

- Node.js 20 o superior (probado con Node 24).
- Una cuenta y un proyecto de Firebase.

## Instalación

```bash
npm install
```

### ¿Por qué falla `ng add @angular/fire`?

La última versión **estable** publicada de `@angular/fire` es `21.0.0` y exige Angular
`^21.2.0`. Este proyecto usa Angular `22.3`, por lo que npm responde con `ERESOLVE`.

La versión compatible con Angular 22 es la release candidate `22.0.0-rc.1`:

```bash
npm install @angular/fire@22.0.0-rc.1
```

Cuando se publique una versión estable 22, actualiza con:

```bash
npm install @angular/fire@22
```

Además, el schematic de `ng add` inicia sesión con Firebase CLI y pide seleccionar un proyecto
existente. Por eso la configuración de este repositorio se hizo manualmente con los mismos
providers (`provideFirebaseApp`, `provideAuth`, `provideFirestore`).

## Configurar Firebase

1. Crea un proyecto en la [consola de Firebase](https://console.firebase.google.com/).
2. Agrega una **app web** al proyecto y copia el objeto de configuración del SDK.
3. Pega los valores en `src/environments/environment.ts`. Para producción usa
   `src/environments/environment.production.ts`.
4. En **Authentication → Sign-in method**, habilita el proveedor **Google**.
5. En **Authentication → Settings → Authorized domains**, agrega `localhost` y el dominio donde
   publicarás la app.
6. En **Firestore Database**, crea la base de datos en modo producción y elige la región.
7. Copia el contenido de `firestore.rules` en la pestaña **Rules** de Firestore y publica.
   También puedes desplegarlas con Firebase CLI:

   ```bash
   npx firebase-tools deploy --only firestore:rules
   ```

8. Ejecuta la app y prueba el login con una cuenta de Google autorizada.

> Los valores web de Firebase (`apiKey`, `authDomain`, etc.) son públicos: identifican el
> proyecto, no autorizan operaciones. La seguridad real está en `firestore.rules`.

## Ejecutar

```bash
npm start
```

Abre `http://localhost:4200/`. La ruta `/mediciones` está protegida: sin sesión redirige a
`/login`.

## Estructura

```
src/app/
├── core/
│   ├── auth/
│   │   ├── auth.service.ts      # login/logout con Google y estado del usuario
│   │   ├── auth.guard.ts        # protege /mediciones
│   │   └── public.guard.ts      # evita volver a /login con sesión activa
│   └── mediciones/
│       ├── medicion.model.ts    # modelo de la colección
│       └── mediciones.service.ts
├── features/
│   ├── login/                   # pantalla de inicio de sesión
│   └── mediciones/              # formulario + historial
├── app.config.ts                # providers de Angular y Firebase
├── app.routes.ts                # rutas lazy
└── app.ts                       # shell con cabecera y router-outlet
```

## Modelo de datos

Colección `mediciones`:

| Campo           | Tipo                     | Descripción                                |
| --------------- | ------------------------ | ------------------------------------------ |
| `diesel`        | number                   | Medida del tanque de diésel (0 a 230).     |
| `regular`       | number                   | Medida del tanque regular (0 a 230).       |
| `premium`       | number                   | Medida del tanque premium (0 a 230).       |
| `observacion`   | string \| null           | Nota opcional, máximo 300 caracteres.      |
| `fecha`         | Timestamp                | `serverTimestamp()` al crear el documento. |
| `registradoPor` | `{ uid, email, nombre }` | Datos del usuario autenticado.             |

La escala 0–230 es la misma que usa la aplicación anterior (`grifo-asto-app`) para las medidas de
tanque.

## Seguridad

- Las reglas permiten leer a cualquier usuario autenticado.
- Solo se pueden crear medidas a nombre del propio usuario.
- No se permite editar ni borrar desde el cliente.
- La gestión de usuarios (altas, bloqueos) se hace en Firebase Console, no desde la app.

## Build

```bash
npm run build
```

El resultado queda en `dist/grifo-asto-light`. La configuración de producción reemplaza
`environment.ts` por `environment.production.ts`.

## Scripts

| Comando                     | Descripción                  |
| --------------------------- | ---------------------------- |
| `npm start`                 | Servidor de desarrollo       |
| `npm run build`             | Build de producción          |
| `npm run watch`             | Build en modo watch          |
| `npx ng test --watch=false` | Pruebas unitarias con Vitest |
