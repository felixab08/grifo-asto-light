# AGENTS.md — Grifo Asto Light

## Contexto del producto

Aplicación web para el grifo Asto. El alcance es deliberadamente pequeño:

- Inicio de sesión con **Google** mediante Firebase Authentication.
- Registro y consulta de las **medidas de los tanques** (diésel, regular y premium).
- Sin backend propio: Firebase es la única persistencia.
- Interfaz en español (Perú), locale `es-PE`.

No agregar módulos de turnos, ventas, instituciones, reportes ni administración de usuarios sin
un pedido explícito. La app completa con backend Spring vive en el proyecto hermano
`../grifo-asto-app`.

## Stack

- Angular 22.3, standalone components, signals y zoneless por defecto.
- TypeScript 6.0 en modo estricto.
- Tailwind CSS 4 para estilos.
- `@angular/fire` `22.0.0-rc.1` con Firebase JS SDK 13.
- Vitest para pruebas unitarias.

### Versiones de Firebase

- `ng add @angular/fire` instala la última versión estable (21.x), que exige Angular `^21.2.0` y
  falla con `ERESOLVE` en este proyecto.
- La versión compatible es `@angular/fire@22.0.0-rc.1`. No bajar Angular para complacer a
  AngularFire.
- El schematic de `ng add` además requiere Firebase CLI y un proyecto ya creado; la configuración
  de este repo se hizo manualmente.

## Comandos

| Comando                     | Uso                                                        |
| --------------------------- | ---------------------------------------------------------- |
| `npm start`                 | Servidor de desarrollo en `http://localhost:4200/`.        |
| `npm run build`             | Build de producción. Debe pasar antes de cerrar un cambio. |
| `npx ng test --watch=false` | Pruebas unitarias.                                         |
| `npx prettier --write .`    | Formato del código.                                        |

## Arquitectura

- `src/app/core/auth`: `AuthService` (Google, estado del usuario), `authGuard` y `publicGuard`.
- `src/app/core/mediciones`: modelo `Medicion` y `MedicionesService` (Firestore).
- `src/app/features/login`: pantalla pública de inicio de sesión.
- `src/app/features/mediciones`: formulario Signal Forms e historial de medidas.
- `src/environments`: configuración de Firebase por entorno.
- Rutas lazy: `/login` (pública) y `/mediciones` (protegida). La raíz redirige a `/mediciones`.
- Aliases de importación: `@core/*` y `@features/*`.

Los componentes no acceden a Firestore directamente: usan `MedicionesService`. El estado se
modela con signals y `rxResource`.

## Modelo de datos

Colección `mediciones`:

| Campo           | Tipo                     | Regla                                                     |
| --------------- | ------------------------ | --------------------------------------------------------- |
| `diesel`        | number                   | Obligatorio, entre 0 y 230.                               |
| `regular`       | number                   | Obligatorio, entre 0 y 230.                               |
| `premium`       | number                   | Obligatorio, entre 0 y 230.                               |
| `observacion`   | string \| null           | Opcional, máximo 300 caracteres.                          |
| `fecha`         | Timestamp                | `serverTimestamp()`; nunca usar la fecha del cliente.     |
| `registradoPor` | `{ uid, email, nombre }` | Se toma del usuario autenticado, no de un campo del form. |

Reglas de negocio:

- Tres tanques: diésel, regular y premium. La escala 0–230 es la misma que la app anterior.
- Solo usuarios autenticados con Google; no hay registro público.
- El historial es inmutable desde el cliente: solo se crea y se lee.
- Cualquier usuario autenticado puede ver el historial del grifo.

## Firebase

- Configuración en `src/environments/environment.ts` (desarrollo) y
  `src/environments/environment.production.ts`.
- Providers en `src/app/app.config.ts`: `provideFirebaseApp`, `provideAuth`, `provideFirestore`.
- Las reglas están versionadas en `firestore.rules`. Si cambia el esquema, actualizar reglas,
  modelo y documentación a la vez.
- Nunca incluir service accounts, Admin SDK ni claves privadas en el cliente.
- Los valores web de Firebase son públicos; la seguridad depende de las reglas.

## Convenciones Angular

### TypeScript

- Usar tipado estricto.
- Preferir inferencia cuando el tipo es obvio.
- Evitar `any`; usar `unknown` cuando el tipo es incierto.

### Componentes y estado

- Usar componentes standalone; no declarar `standalone: true` (es el valor por defecto).
- No declarar `changeDetection: OnPush` (es el comportamiento por defecto en Angular 22).
- Usar `input()` / `output()` y `model()` en lugar de decoradores.
- Usar `computed()` para estado derivado y `linkedSignal()` cuando corresponda.
- No usar `mutate` en signals; usar `set` o `update`.
- Mantener componentes pequeños y con una sola responsabilidad.
- Preferir plantillas inline para componentes pequeños.

### Formularios

- Preferir **Signal Forms** (`@angular/forms/signals`) para formularios nuevos.
- Las validaciones viven en el schema (`required`, `min`, `max`, `maxLength`), no en atributos
  HTML. `[formField]` prohíbe `min`, `max`, `maxlength`, `required`, etc. en el template.
- Mostrar errores solo después de `touched()` y con `role="alert"` o `aria-live`.
- Si se usa un formulario reactivo, preferirlo sobre template-driven.

### Plantillas

- Usar control flow nativo (`@if`, `@for`, `@switch`).
- No usar `ngClass` ni `ngStyle`; usar bindings `class` y `style`.
- Mantener la lógica fuera de la plantilla.
- Usar `NgOptimizedImage` para imágenes estáticas (no aplica a SVG inline).

### Servicios

- Usar `@Service()` para singletons nuevos (Angular 22+).
- Usar `inject()` en lugar de inyección por constructor.
- Una responsabilidad por servicio.

### Accesibilidad

- Debe cumplir WCAG AA y las comprobaciones de AXE.
- Etiquetas asociadas a cada control, foco visible, contraste suficiente y mensajes anunciados.
- Mantener estados de carga, vacío y error visibles y comprensibles.

## UI

- Tailwind utilitario; no agregar librerías de componentes sin necesidad.
- Fechas en formato `dd/MM/yyyy HH:mm`.
- Mensajes al usuario en español, sin detalles internos de Firebase.

## Verificación

- Antes de cerrar un cambio: `npm run build` y `npx ng test --watch=false`.
- No afirmar que el login o Firestore funcionan sin probarlos contra un proyecto real o el
  emulador. Con la configuración placeholder la app muestra un aviso y el login falla.
- Al cambiar reglas, probarlas en el emulador o en la consola antes de publicarlas.

## Skills instaladas

Las skills del proyecto viven en `.agents/skills/` y se registran en `skills-lock.json`. No
editarlas a mano: se actualizan desde su repositorio de origen.

| Skill                  | Cuándo usarla                                                                    | Referencias                                                                  |
| ---------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `angular-developer`    | Crear o modificar componentes, servicios, rutas, formularios, pruebas o estilos. | `references/` (signals, Signal Forms, DI, routing, Tailwind, a11y, testing). |
| `firebase-auth-basics` | Configurar o cambiar el login con Google y las reglas de autenticación.          | `references/` (SDK web, provisioning, security rules).                       |
| `firebase-firestore`   | Modelar datos, consultar Firestore, definir índices o ajustar `firestore.rules`. | `references/standard/` y `references/enterprise/`.                           |

- Antes de escribir código Angular, consultar `angular-developer` y la referencia del tema.
- Antes de tocar Authentication o Firestore, consultar la skill de Firebase correspondiente.
- El código y las specs deben respetar estas guías; si contradicen una costumbre, gana la skill.

## Flujo de trabajo obligatorio (specs)

- **Antes de diseñar o implementar una spec, leer en este orden:**
  1. `.agents/skills/angular-developer/SKILL.md`
  2. `.agents/skills/firebase-auth-basics/SKILL.md`
  3. `.agents/skills/firebase-firestore/SKILL.md`

  Las decisiones de la spec y del plan deben respetar esas guías.

- Skills instaladas en `.agents/skills/` con lock en `skills-lock.json`:
  - `/spec <descripción>` — diseña y guarda una spec. **Nunca escribe código.**
  - `/spec-impl <NN-slug>` — implementa una spec. Solo si su estado es `Aprobado`.
- Las specs viven en `specs/` con nombre `NN-slug.md` (numeración secuencial desde `01-`, slug kebab-case).
- Estados de spec: `Borrador` → `Aprobado` → `Implementado` (solo el usuario cambia el estado).
- `/spec-impl` crea una rama git `spec-NN-slug` (controlado por `specs/.spec-config.yml`, `AutoCreateBranch: true` por defecto) e implementa paso a paso con pausas; **nunca commitea por su cuenta**.
- Plantilla y reglas del documento: `.agents/skills/spec/template.md` (encabezado en blockquote, alcance In/Out, plan numerado con pasos que dejan el juego funcionando, criterios de aceptación verificables, decisiones tomadas/descartadas).
- No implementes nada sin una spec aprobada; si piden un cambio pequeño fuera del flujo, proporle crear una spec primero.

## Reglas de código

- usar código limpio. nombres, funciones y variables, etc en ingles.
- las variables declaradas deben tener un significado y ser coherentes con el nombre.
- No repetir código.
