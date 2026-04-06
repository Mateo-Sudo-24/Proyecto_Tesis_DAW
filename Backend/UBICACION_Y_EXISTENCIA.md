# 📍 UBICACIÓN Y EXISTENCIA — Tópicos Mencionados

## ORGANIZADO POR SECCIONES Y TAREAS

---

## 1️⃣ RUTA WEBHOOK N8N: `/api/notificaciones/webhook`

### 🔍 BÚSQUEDA: ¿EXISTE?
✅ **SÍ, EXISTE**

### 📍 UBICACIÓN EXACTA
- **Archivo:** `Backend/src/routers/Notificacion_router.js`
- **Línea:** 17
- **URL Completa:** `https://unitex-backend.onrender.com/api/notificaciones/webhook`

### 📌 USO
```javascript
router.post('/webhook', recibirNotificacion);
```

### 🔐 SEGURIDAD
- Método: POST
- Requiere Header: `x-api-key: unitex_secret_2024`
- Controlador: `recibirNotificacion()` (Notificacion_controller.js)

### ✨ ESTADO
**OPERATIVA Y LISTA**

---

## 2️⃣ VARIABLE: `N8N_WEBHOOK_SECRET`

### 🔍 BÚSQUEDA: ¿EXISTE?
✅ **SÍ, EXISTE**

### 📍 UBICACIÓN EXACTA
- **Archivo:** `Backend/.env`
- **Línea:** 27

### 📌 VALOR ACTUAL
```
N8N_WEBHOOK_SECRET=unitex_secret_2024
```

### ✨ USO
- Validación de peticiones desde n8n
- Header esperado: `x-api-key: unitex_secret_2024`
- Se valida en: `recibirNotificacion()` (Notificacion_controller.js:12)

### ✨ ESTADO
**OPERATIVA Y LISTA**

---

## 3️⃣ CLOUDINARY: CONFIGURACIÓN

### 🔍 BÚSQUEDA: ¿ESTÁ CONFIGURADO?
⚠️ **PARCIALMENTE - Falta credenciales reales**

### 📍 UBICACIÓN EXACTA

#### Imports
- **Archivo:** `Backend/src/server.js`
- **Línea:** 8
```javascript
import cloudinary from 'cloudinary';
```

#### Configuración
- **Archivo:** `Backend/src/server.js`
- **Línea:** 46-51
```javascript
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
```

#### Variables en .env
- **Archivo:** `Backend/.env`
- **Línea:** 29-31
```
CLOUDINARY_CLOUD_NAME=unitex_cloud
CLOUDINARY_API_KEY=your_cloudinary_api_key_here
CLOUDINARY_API_SECRET=your_cloudinary_api_secret_here
```

#### Uso en Controlador
- **Archivo:** `Backend/src/controllers/Producto_controller.js`
- **Línea:** 6 (import)
```javascript
import { v2 as cloudinary } from 'cloudinary';
```

#### Métodos que usan Cloudinary
- **Línea 58:** `registrarProducto()` - Sube imagen
- **Línea 102:** `actualizarProducto()` - Reemplaza imagen
- **Línea 188:** `eliminarProducto()` - Borra imagen

### ✨ ESTADO
**SEMI-OPERATIVA** — Necesita credenciales reales

### 🔑 CÓMO OBTENER CREDENCIALES
1. https://cloudinary.com → Sign up / Login
2. Dashboard → Account Details
3. Copiar Cloud Name, API Key, API Secret
4. Reemplazar valores en `.env`

---

## 4️⃣ RUTAS PARA NOTIFICACIONES — ANTES vs DESPUÉS

### 🔍 BÚSQUEDA: ¿ESTÁN TODAS LAS RUTAS?

#### ANTES (Incompleto)
```
POST   /api/notificaciones/webhook
GET    /api/notificaciones
PATCH  /api/notificaciones/:id/leida
```
❌ **Faltaban 2 rutas**

#### DESPUÉS (Completo) ✅
```
POST   /api/notificaciones/webhook              ← n8n envía alertas
GET    /api/notificaciones                      ← Admin ve todas
GET    /api/notificaciones/no-leidas             ← NUEVO: Dashboard rápido
PATCH  /api/notificaciones/:id/leida             ← Marcar como leída
DELETE /api/notificaciones/:id                   ← NUEVO: Eliminar notificación
```

### 📍 UBICACIÓN DE CAMBIOS
- **Archivo:** `Backend/src/routers/Notificacion_router.js`
- **Cambios realizados:** 
  - Línea 3-8: Importación de nuevos controladores
  - Línea 32-35: Nuevas rutas agregadas

### ✨ ESTADO
**OPERATIVAS Y LISTAS**

---

## 5️⃣ HERRAMIENTAS HTTP PARA N8N

### 🔍 BÚSQUEDA: ¿DOCUMENTACIÓN DISPONIBLE?
✅ **SÍ, DOCUMENTACIÓN COMPLETA CREADA**

### 📍 UBICACIÓN EXACTA
- **Archivo 1:** `Backend/docs/N8N_HERRAMIENTAS_HTTP.md`
- **Archivo 2:** `Backend/docs/N8N_EJEMPLOS_PAYLOADS.md`

### 📋 CONTENIDO

#### Herramienta 1: GET `/api/productos/stock-critico`
- **Ubicación:** `N8N_HERRAMIENTAS_HTTP.md` → Sección "Herramienta 1"
- **Contenido:** URL, headers, response esperada, lógica condicional

#### Herramienta 2: POST `/api/notificaciones/webhook`
- **Ubicación:** `N8N_HERRAMIENTAS_HTTP.md` → Sección "Herramienta 2"
- **Contenido:** URL, headers, body JSON, manejo de errores

#### Herramienta 3: Send Email
- **Ubicación:** `N8N_HERRAMIENTAS_HTTP.md` → Sección "Herramienta 3"
- **Contenido:** Configuración SMTP, template HTML del email

#### Herramienta 4: PATCH `/api/notificaciones/:id/leida`
- **Ubicación:** `N8N_HERRAMIENTAS_HTTP.md` → Sección "Herramienta 4"
- **Contenido:** URL con ID dinámico, headers, response esperada

### ✨ ESTADO
**DOCUMENTACIÓN LISTA**

---

## 6️⃣ TAREAS COMPLETADAS

### TAREA 1: Rutas Faltantes ✅
- **Archivo:** `Backend/src/routers/Notificacion_router.js`
- **Rutas Agregadas:**
  - [x] GET `/no-leidas` - Obtener notificaciones sin leer
  - [x] DELETE `/:id` - Eliminar notificación
- **Estado:** COMPLETA

### TAREA 2: Variables Cloudinary ✅
- **Archivo:** `Backend/.env`
- **Variables Agregadas:**
  - [x] CLOUDINARY_CLOUD_NAME
  - [x] CLOUDINARY_API_KEY
  - [x] CLOUDINARY_API_SECRET
- **Herramientas Generadas:**
  - [x] `N8N_HERRAMIENTAS_HTTP.md` - Documentación completa HTTP
  - [x] `N8N_EJEMPLOS_PAYLOADS.md` - Ejemplos JSON reales
  - [x] `TAREA_COMPLETADA.md` - Resumen de todo
- **Estado:** COMPLETA

---

## 7️⃣ PRODUCTOS: UPLOAD DE IMÁGENES

### 🔍 BÚSQUEDA: ¿ESTÁ CONFIGURADO CLOUDINARY?
✅ **SÍ - Sistema completamente implementado**

### 📍 UBICACIÓN EXACTA

#### Controlador
- **Archivo:** `Backend/src/controllers/Producto_controller.js`

#### Métodos Implementados

| Método | Línea | Función |
|--------|-------|---------|
| `registrarProducto()` | 49 | Sube imagen a Cloudinary + guarda en BDD |
| `actualizarProducto()` | 87 | Elimina imagen antigua + sube nueva |
| `eliminarProducto()` | 176 | Borra producto y su imagen de Cloudinary |

#### Flujo de Upload
1. **Recibe:** `req.files.imagen.tempFilePath`
2. **Sube a:** Carpeta `Productos` en Cloudinary
3. **Guarda:** 
   - `imagenUrl` → Enlace HTTPS seguro
   - `imagenID` → ID para futuras operaciones

### 📌 SCHEMA DE PRODUCTO
- **Archivo:** `Backend/src/models/Producto.js`
- **Campos:** imagenUrl, imagenID (ambos requeridos)

### ✨ ESTADO
**OPERATIVA - Solo faltan credenciales reales en .env**

---

## 8️⃣ FLUJO COMPLETO N8N

### 🔍 BÚSQUEDA: ¿El workflow está listo?
⚠️ **CASI LISTO - Falta crear en n8n**

### 📋 PASOS DEL WORKFLOW

```
┌──────────────────┐
│ 1. CRON TRIGGER  │ Cada 4 horas
└────────┬─────────┘
         ↓
┌──────────────────────────────────────┐
│ 2. HTTP GET: Stock Crítico           │ Herramienta 1
│    /api/productos/stock-critico?...  │ ✅ LISTA
└────────┬─────────────────────────────┘
         ↓
    ¿Hay productos?
         │
    ┌────┴────┐
    ↓         ↓
   NO        SÍ
  (FIN)   ┌──────────────────────────────────┐
          │ 3. HTTP POST: Notificación        │ Herramienta 2
          │    /api/notificaciones/webhook   │ ✅ LISTA
          └────────┬─────────────────────────┘
                   ↓
          ┌──────────────────────────┐
          │ 4. WAIT: Aprobación      │ ✅ IMPLEMENTAR
          │    Timeout: 24h          │
          └────────┬─────────────────┘
                   ↓
         ¿Admin aprobó?
            │
         ┌──┴──┐
         ↓     ↓
        NO    SÍ
       (FIN) ┌──────────────────────────┐
             │ 5. SEND EMAIL            │ Herramienta 3
             │    Al proveedor          │ ✅ LISTA (template)
             └────────┬─────────────────┘
                      ↓
             ┌──────────────────────────────────────┐
             │ 6. HTTP PATCH: Marcar como leída     │ Herramienta 4
             │    /api/notificaciones/:id/leida     │ ✅ LISTA
             └────────┬─────────────────────────────┘
                      ↓
                  (FIN - COMPLETADO)
```

### 📌 ESTADO ACTUAL
| Componente | Estado | Ubicación |
|-----------|--------|-----------|
| Herramienta 1 (GET stock) | ✅ Backend + Doc | Endpoint `/api/productos/stock-critico` |
| Herramienta 2 (POST notif) | ✅ Backend + Doc | Endpoint `/api/notificaciones/webhook` |
| Herramienta 3 (Email) | ✅ Doc completa | `N8N_HERRAMIENTAS_HTTP.md` → Sec 3 |
| Herramienta 4 (PATCH) | ✅ Backend + Doc | Endpoint `/api/notificaciones/:id/leida` |
| Workflow en n8n | ⚠️ Listo para crear | Ver `N8N_HERRAMIENTAS_HTTP.md` |

---

## 📊 RESUMEN FINAL

| Tópico | ¿Existe? | ¿Está Configurado? | ¿Documentado? | ✨ Estado |
|--------|---------|---|---|---|
| Ruta `/api/notificaciones/webhook` | ✅ | ✅ | ✅ | OPERATIVA |
| Variable `N8N_WEBHOOK_SECRET` | ✅ | ✅ | ✅ | OPERATIVA |
| Cloudinary Config | ✅ | ⚠️ (falta credenciales) | ✅ | SEMI-OPERATIVA |
| Rutas de notificaciones | ✅ (todas) | ✅ | ✅ | OPERATIVA |
| Herramientas HTTP n8n | ❌ (en backend) | ✅ | ✅ | LISTA |
| Upload de imágenes | ✅ | ⚠️ (falta credenciales) | ✅ | SEMI-OPERATIVA |
| Flujo n8n completo | ❌ (crear en n8n) | ❌ (crear en n8n) | ✅ | DOCUMENTADO |

---

## 🚀 QUÉ FALTA

1. **Credenciales de Cloudinary** en `.env`
   - CLOUDINARY_CLOUD_NAME (valor real)
   - CLOUDINARY_API_KEY (valor real)
   - CLOUDINARY_API_SECRET (valor real)

2. **Crear workflow en n8n** siguiendo la documentación de:
   - `Backend/docs/N8N_HERRAMIENTAS_HTTP.md`
   - `Backend/docs/N8N_EJEMPLOS_PAYLOADS.md`

3. **Implementar Send Email node** en n8n
   - Configurar SMTP (Gmail o SendGrid)

---

**Generado:** 06/04/2026  
**Versión:** 1.0  
**Responsable:** Sistema de Documentación Automática
