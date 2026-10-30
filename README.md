# Frontend de la pizzería — TP DSW

Aplicación web desarrollada con **React, TypeScript y Vite** para el sistema de gestión de una pizzería. Se conecta a la API REST del [backend](https://github.com/jcolumbich/tp-dsw-pizzeria-backend) para consultar el catálogo, registrar pedidos y administrar los datos del negocio.

Incluye registro e inicio de sesión, permisos de cliente y administrador, catálogo de pizzas, carrito de compras, pedidos, seguimiento de estados y pantallas de administración.

## Requisitos

- Node.js 22.16 o superior.
- pnpm 11.20.0 o una versión compatible superior (se recomienda 11.25.0).
- Backend de la pizzería disponible para utilizar las funciones conectadas a la API.

Para instalar pnpm 11.25.0:

```powershell
npm install --global pnpm@11.25.0
```

## Instalación local

Desde la raíz del repositorio:

```powershell
pnpm install --frozen-lockfile
if (!(Test-Path .env)) { Copy-Item .env.example .env }
```

En Bash, para crear el archivo de configuración por primera vez:

```bash
cp -n .env.example .env
```

El frontend utiliza la variable `VITE_API_URL` para conectarse al backend. Para desarrollo local, el archivo `.env.example` incluye:

```env
VITE_API_URL=/api
```

Con esta configuración, Vite redirige las solicitudes a `/api` y `/uploads` hacia `http://localhost:3000`. Para probar las funciones de la aplicación con datos reales, el backend debe estar iniciado y conectado a MySQL.

### Variables de entorno

| Variable | Uso |
| --- | --- |
| `VITE_API_URL` | Dirección base de la API. En desarrollo se utiliza `/api`; en producción, la URL pública del backend terminada en `/api`. |

El archivo `.env.production` contiene la dirección del backend desplegado en Render. Si el backend cambia de dominio, se debe actualizar `VITE_API_URL` antes de compilar o configurar su valor en el entorno de despliegue.

## Ejecución

Iniciar el servidor de desarrollo:

```powershell
pnpm run dev
```

La aplicación se abre en `http://localhost:5173`.

Para compilar el proyecto:

```powershell
pnpm run build
```

Para visualizar localmente la versión compilada:

```powershell
pnpm run preview
```

## Funcionalidades

### Acceso público

- Consulta del catálogo de pizzas con sus imágenes, descripciones y precios.
- Registro de clientes e inicio de sesión.

### Cliente

- Selección de pizzas y cantidades para armar un pedido.
- Conservación del carrito al navegar por el catálogo.
- Elección entre retiro en el local y envío a domicilio.
- Costo de envío y propina opcional.
- Pago en efectivo o inicio del checkout de Mercado Pago en modo prueba.
- Consulta de pedidos propios, estados y detalles.

### Administrador

- Gestión de ingredientes, pizzas, recetas, repartidores y clientes.
- Listados con búsquedas, filtros y paginación según el módulo.
- Consulta y gestión de pedidos con acceso a sus detalles.
- Asignación de repartidores y envíos desde el detalle del pedido.

Las pantallas se muestran de acuerdo con el nivel de permisos del usuario. La validación de los permisos y las reglas de negocio también se realiza en el backend.

## Pruebas

### Pruebas de componentes y lógica

El proyecto utiliza **Vitest** y **Testing Library** para las pruebas de componentes y lógica. Se pueden ejecutar sin tener el backend iniciado:

```powershell
pnpm test
```

Para ejecutarlas en modo observación:

```powershell
pnpm run test:watch
```

### Pruebas end-to-end

Las pruebas de navegador utilizan **Playwright** con Chromium. La API se simula dentro de los tests, por lo que no se necesitan cuentas reales ni pagos en Mercado Pago.

Instalar el navegador de Playwright si todavía no está disponible:

```powershell
pnpm exec playwright install chromium
```

Ejecutar las pruebas:

```powershell
pnpm run test:e2e
```

Playwright inicia el servidor de Vite automáticamente cuando es necesario. Estas pruebas cubren distintos flujos de navegación y compra con una API simulada. Las pruebas de integración del backend con MySQL se ejecutan en el otro repositorio.

### Revisión de código

```powershell
pnpm run lint
pnpm run build
```

## Despliegue

El frontend está preparado para desplegarse en **Vercel** como aplicación de una sola página (SPA). El archivo `vercel.json` configura la redirección de las rutas al `index.html`.

Comando de instalación y compilación:

```bash
pnpm install --frozen-lockfile && pnpm run build
```

Directorio de salida:

```text
dist
```

En producción, `VITE_API_URL` debe apuntar a la API pública del backend e incluir `/api`. El backend debe permitir el origen del frontend mediante su configuración de CORS.

**Aplicación desplegada:** [Pizzería — Vercel](https://tp-dsw-pizzeria-frontend.vercel.app/).

## Repositorios y material

- [Backend de la pizzería](https://github.com/jcolumbich/tp-dsw-pizzeria-backend).
- [Propuesta del TP](https://github.com/jcolumbich/tp-dsw-pizzeria-backend/blob/main/proposal.md).
- [Consigna del TP](https://github.com/utnfrrodsw/tp).
- [Material de frontend de la cátedra](https://github.com/aotaduy/curso-frontend-react/blob/main/index.md).