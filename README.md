# Vexora Sites

Vexora Sites es un SaaS no-code para crear, animar y publicar experiencias web premium multipágina con un editor visual estructurado. Permite elegir una dirección visual, administrar páginas, editar y reordenar secciones, configurar movimiento, previsualizar, guardar y publicar.

> Estado: primera versión funcional. Incluye un modo demo local para probar el producto sin credenciales y una integración preparada para Supabase.

## Requisitos

- Node.js 22.13 o superior.
- npm 10 o superior.
- Una cuenta de Supabase para autenticación y persistencia real.
- Opcional: una cuenta de Vercel si se despliega fuera de OpenAI Sites.

## Instalación

```bash
npm install
cp .env.example .env.local
npm run dev
```

En Windows PowerShell, copia el entorno con:

```powershell
Copy-Item .env.example .env.local
npm run dev
```

Abre `http://localhost:3000`.

## Variables de entorno

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_EMAILS=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
NODE_ENV=development
```

- `NEXT_PUBLIC_SUPABASE_URL`: URL del proyecto Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: clave pública anon.
- `SUPABASE_SERVICE_ROLE_KEY`: solo servidor; nunca debe llegar al navegador.
- `NEXT_PUBLIC_APP_URL`: origen público de la aplicación.
- `ADMIN_EMAILS`: correos administradores separados por coma.
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`: nombre público del entorno de Cloudinary.
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`: preset unsigned restringido para el Upload Widget.

No incluyas valores reales en `.env.example` ni confirmes archivos de entorno al repositorio.

## Configurar Supabase

1. Crea un proyecto nuevo en Supabase.
2. En **Authentication → URL Configuration**, agrega `http://localhost:3000` como Site URL y en Redirect URLs.
3. Abre el SQL Editor y ejecuta, en este orden:

```text
supabase/migrations/202608020001_initial_schema.sql
supabase/migrations/202608030002_publish_site_function.sql
supabase/seed.sql
```

4. Copia la URL y la clave anon a `.env.local`.
5. Reinicia `npm run dev`.
6. Registra un usuario desde `/register`.

La migración crea perfiles, espacios, miembros, sitios, páginas, versiones, plantillas, activos, publicaciones, planes, suscripciones y actividad. Row Level Security restringe los proyectos a propietarios y miembros autorizados. La ruta pública solo puede leer sitios con `status = 'published'` y `published_schema` disponible.

## Modo demo

Si las variables de Supabase están vacías, el producto entra en modo demo:

- El acceso acepta cualquier correo válido y contraseña de seis caracteres.
- Los proyectos y borradores se guardan en el navegador actual.
- La publicación genera una versión local separada del borrador.
- Las estadísticas del dashboard y admin están marcadas como `DEMO`.

Este modo sirve para validar la experiencia, no para producción ni colaboración entre dispositivos.

## Rutas principales

| Ruta | Función |
|---|---|
| `/` | Landing pública |
| `/login`, `/register`, `/forgot-password` | Autenticación |
| `/dashboard` | Proyectos y uso |
| `/dashboard/new` | Asistente de creación |
| `/account/media` | Biblioteca Cloudinary y tutorial permanente |
| `/templates` | Biblioteca de nueve sistemas visuales |
| `/features` | Producto y capacidades |
| `/pricing` | Planes y beneficios de beta |
| `/showcase` | Galería de direcciones visuales |
| `/editor/[id]` | Editor visual |
| `/site/[slug]` | Sitio publicado |
| `/admin` | Administración básica |

## Arquitectura del editor

Los sitios no generan código por cliente. Se guardan como JSON validable y tipado:

```text
Sitio
└── Página
    └── Secciones
        ├── contenido
        ├── estilos
        ├── responsive
        └── animación
```

La primera versión evita el posicionamiento absoluto libre. El mismo `SiteRenderer` se usa en el lienzo, la vista previa y las rutas publicadas para evitar diferencias visuales. Cada proyecto puede tener múltiples páginas; la portada se publica en `/site/[slug]` y las páginas secundarias en `/site/[slug]/[page]`.

Piezas principales:

- `types/site.ts`: esquema Zod y tipos estrictos.
- `lib/templates.ts`: nueve sistemas visuales originales, cada uno con tres páginas iniciales.
- `stores/editor-store.ts`: estado, historial local y operaciones del editor.
- `components/renderer/site-renderer.tsx`: registro y renderizado compartido.
- `components/editor/editor-shell.tsx`: selección, drag-and-drop, estilos, motion y responsive.
- `supabase/migrations`: esquema PostgreSQL y políticas RLS.

## Registro de bloques

El registro central está en `components/renderer/site-renderer.tsx`. Para añadir un bloque:

1. Agrega el tipo a `blockTypeSchema` en `types/site.ts`.
2. Implementa el componente de render.
3. Añádelo a `registry` y `blockLabels`.
4. Define valores por defecto en `addBlock` del store.
5. Ejecuta lint, tipos y build.

Los bloques actuales son hero, storytelling, servicios, galería, testimonio, estadísticas, CTA y contacto.

## Crear plantillas

Cada plantilla vive en `lib/templates.ts` y contiene una paleta, categoría, metadatos y un `SiteSchema` completo. No debe ser solo un cambio de color: combina estructura, copy, ritmo, alineación y presets de animación distintos.

## Guardado, historial y publicación

- El autoguardado usa un debounce de 650 ms.
- `Ctrl/Cmd + S` fuerza un guardado manual.
- `Ctrl/Cmd + Z` deshace.
- `Ctrl/Cmd + Shift + Z` rehace.
- El historial conserva hasta 30 estados.
- Publicar crea una copia separada para la ruta `/site/[slug]`; el borrador posterior no modifica automáticamente lo publicado.

Con Supabase configurado, el dashboard, el asistente, el editor y la ruta pública usan persistencia remota. El autoguardado actualiza `sites.site_schema`; el guardado manual crea una entrada en `site_versions`; y la publicación ejecuta una función transaccional que actualiza `sites.published_schema`, crea una versión y registra la publicación. Una copia local permite recuperar el último borrador si la red falla.

## Fotos y videos con Cloudinary

La ruta `/account/media` carga imágenes y videos directamente a Cloudinary mediante su Upload Widget. Vexora solo conserva el catálogo y las URLs en `assets`; no transporta ni almacena los archivos.

1. Crea una cuenta de Cloudinary.
2. En **Settings → Upload → Upload presets**, crea un preset `Unsigned` y limita formatos y tamaño.
3. Configura `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` y `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`.
4. Reinicia la aplicación y abre **Fotos y medios** en el dashboard.

La interfaz admite hasta 10 MB por archivo y muestra siempre un tutorial, acceso al panel de Cloudinary y botones para copiar enlaces. Las imágenes Cloudinary se sirven con `f_auto,q_auto` y dimensiones reservadas para reducir peso y saltos de diseño.

## Usuario administrador

Agrega uno o más correos en `.env.local`:

```env
ADMIN_EMAILS=admin@ejemplo.com,producto@ejemplo.com
```

Con Supabase configurado, `/admin` exige una sesión válida y un correo incluido en esa lista. En modo demo la pantalla permanece accesible para facilitar la revisión visual.

## Validación

```bash
npm run lint
npx tsc --noEmit
npm run build
npm test
```

Checklist manual recomendada:

1. Registrar e iniciar sesión.
2. Crear un proyecto mediante los cuatro pasos.
3. Abrir el editor y seleccionar una sección.
4. Editar título, color y espaciado.
5. Reordenar con arrastre y con los botones alternativos.
6. Cambiar entre escritorio, tablet y móvil.
7. Aplicar una animación y abrir Vista previa.
8. Comprobar autoguardado, deshacer y rehacer.
9. Publicar y abrir `/site/[slug]`.
10. Crear, duplicar, renombrar y eliminar una página secundaria.
11. Publicar y recorrer la navegación multipágina.
12. Revisar foco visible y reducción de movimiento.

## Despliegue en Vercel

1. Sube el repositorio a GitHub.
2. Importa el proyecto en Vercel.
3. Configura todas las variables de entorno.
4. Usa `npm run build` como comando de compilación.
5. Actualiza `NEXT_PUBLIC_APP_URL` con el dominio final.
6. Agrega el dominio final a las Redirect URLs de Supabase.

La plantilla incluida también produce una salida compatible con OpenAI Sites/Cloudflare Workers mediante Vinext.

## Solución de problemas

- **La sesión vuelve a login:** verifica URL, anon key y Redirect URLs de Supabase.
- **El dashboard usa datos demo:** faltan variables públicas o no se reinició el servidor.
- **El sitio publicado no aparece en otro navegador:** verifica que Supabase esté configurado, que ambas migraciones estén aplicadas y que la publicación haya finalizado sin error.
- **Una animación no se reproduce:** revisa `prefers-reduced-motion`; Vexora lo respeta de forma intencional.
- **El build falla en Windows por variables inline:** el proyecto usa `cross-env`; ejecuta `npm install` nuevamente.

## Limitaciones actuales y siguiente fase

- Sin credenciales de Supabase, la persistencia del modo demo permanece limitada al navegador actual.
- El editor reordena secciones completas; mover elementos internos entre contenedores queda para la siguiente fase.
- Motion Composer está representado por presets, intensidad y scrub; falta la composición visual de pasos/eventos.
- Formularios reales, dominios, pagos, colaboradores y analíticas reales no están activos.
- El panel admin permite revisar el sistema, pero sus mutaciones son demostrativas.

La siguiente fase recomendada es añadir almacenamiento de medios con validación, formularios reales y ampliar el registro a elementos internos y storytelling por escenas.
