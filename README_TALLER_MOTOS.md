# Taller Motos - Sistema de Gestión v1.0

Sistema completo de gestión para talleres de motocicletas con funcionalidad offline-first.

## 🚀 Características Principales

### Módulos Implementados

1. **Dashboard (Inicio)**
   - KPIs en tiempo real
   - Alertas de stock crítico
   - Deudas vencidas
   - Mantenimientos pendientes
   - Accesos rápidos a funciones clave

2. **Motos**
   - Registro de motocicletas
   - Código interno autogenerado (MT-000001)
   - Historial completo (mantenimientos, ventas, pagos)
   - Generación de código QR para cada moto
   - Búsqueda y filtrado

3. **Mantenimientos (OT)**
   - Crear órdenes de trabajo
   - Estados: Pendiente, En Proceso, Terminado, Entregado
   - Servicios y repuestos por OT
   - Consumo automático de stock

4. **Ventas**
   - Ventas de productos y servicios
   - Validación de stock en tiempo real
   - Generación de notas internas (no fiscales)
   - Historial de ventas

5. **Pagos**
   - Cuentas por cobrar
   - Cálculo automático de intereses (S/10 por día de retraso)
   - Estados: Pendiente, Vencido, Pagado
   - Registro de pagos parciales

6. **KARDEX (Inventario)**
   - Control de productos y repuestos
   - Stock en tiempo real
   - Alertas de stock crítico
   - Movimientos: IN, OUT, ADJUST

7. **Reportes**
   - Gráficos de ventas (últimos 7 días)
   - Estado de órdenes de trabajo
   - Distribución de motos por color
   - Análisis de stock
   - Identificación de productos críticos

8. **Configuración**
   - Ajustes de accesibilidad (tamaño de fuente)
   - Configuración de sonido y vibración
   - Exportar/Importar base de datos
   - Alto contraste

### Funcionalidades Clave

✅ **Offline-First**: Base de datos local con IndexedDB
✅ **Escaneo QR/Barcode**: Integración con cámara para leer códigos
✅ **Resolución Ambigua**: Modal automático cuando un código puede ser moto o producto
✅ **Autoguardado**: Todas las operaciones se guardan automáticamente
✅ **Stock en Tiempo Real**: Validación y alertas de stock crítico
✅ **Intereses Automáticos**: Cálculo de S/10 por día en pagos vencidos
✅ **Responsive**: Funciona en desktop y móvil
✅ **Accesibilidad**: Fuentes grandes, alto contraste, sonido y vibración

## 🛠️ Tecnologías

- **React 18** + **TypeScript**
- **Redux Toolkit** (gestión de estado)
- **IndexedDB** (almacenamiento local vía idb)
- **React Router 7** (navegación)
- **ZXing** (escaneo de códigos QR/barcode)
- **Recharts** (gráficos y visualizaciones)
- **Tailwind CSS v4** (estilos)
- **Radix UI** (componentes UI)
- **Sonner** (notificaciones toast)
- **QRCode** (generación de códigos QR)

## 📱 Identificación y Escaneo

### Códigos Soportados

- **Motos**: `MT-000001` o `moto:MT-000001`
- **Productos**: `prod:<SKU>` o código SKU/EAN directo
- Entrada manual disponible si el código está dañado

### Resolución Ambigua

Cuando un código puede ser tanto moto como producto:
- Modal en pantalla completa
- Timeout de 5 segundos (default: ES MOTO)
- Opciones: ES MOTO | ES PRODUCTO | CANCELAR
- Feedback visual y sonoro

## 💾 Base de Datos

Estructura en 5NF (Quinta Forma Normal):

- **customers**: Clientes del taller
- **motorcycles**: Motos registradas
- **parts**: Productos y repuestos
- **stockBalances**: Saldo de stock por producto
- **inventoryMovements**: Movimientos de inventario
- **inventoryMovementLines**: Líneas de movimiento
- **workOrders**: Órdenes de trabajo
- **workOrderServices**: Servicios por OT
- **workOrderParts**: Repuestos por OT
- **sales**: Ventas realizadas
- **saleItems**: Items de venta
- **accountsReceivable**: Cuentas por cobrar
- **payments**: Pagos registrados
- **sequences**: Secuencias para códigos autogenerados

## 🎨 Interfaz

- **Sidebar**: Navegación principal
- **TopBar**: Búsqueda global + botón de escaneo
- **Dashboard**: Panel de control con KPIs y alertas
- **Páginas específicas**: Cada módulo con su interfaz optimizada
- **Modales**: Scanner, resolución ambigua, formularios
- **Badges**: Indicadores de estado en tiempo real

## 📊 Datos de Ejemplo

El sistema incluye datos de muestra para demostración:
- 5 clientes
- 8 motos registradas
- 8 productos con stock aleatorio
- Códigos autogenerados (MT-000001, MT-000002, etc.)

## 🔐 Seguridad

- Todos los datos se almacenan localmente en IndexedDB
- No hay conexión a servidor (offline-first)
- Exportación de datos para backup
- Sistema diseñado para uso interno (no documentos fiscales)

## 🚧 Pendiente de Implementación

Los siguientes formularios están creados como stubs:
- Nueva Orden de Trabajo (formulario completo)
- Nueva Venta (formulario completo)
- Nuevo Movimiento de Inventario (IN/OUT/ADJUST)
- Detalle de Orden de Trabajo
- Registro de Pago

## 📝 Notas Importantes

1. **Documentos Internos**: El sistema genera "Notas" internas, NO documentos fiscales
2. **Offline**: Funciona completamente sin conexión a internet
3. **Accesibilidad**: Optimizado para usuarios de tercera edad (textos grandes, botones grandes)
4. **Responsive**: Se adapta a desktop y móvil (PWA ready)

## 🎯 Flujos Principales

### Flujo 1: Moto → Mantenimiento → Cobro
1. Escanear/buscar moto
2. Crear orden de trabajo
3. Agregar servicios y repuestos (valida stock)
4. Completar OT
5. Generar cuenta por cobrar o cobrar directo

### Flujo 2: Venta Rápida
1. Nueva venta
2. Agregar productos (valida stock) y/o servicios
3. Generar nota interna
4. Cobrar total o parcial

### Flujo 3: KARDEX
1. Nuevo movimiento (IN/OUT/ADJUST)
2. Agregar productos y cantidades
3. Confirmar (actualiza stock automático)
4. Ver reportes de stock

## 🎨 Tema Visual

- Colores primarios: Azul (#3b82f6), Verde (#10b981)
- Alertas: Naranja (stock crítico), Rojo (sin stock, vencido)
- Fuente: Sans-serif sistema
- Iconos: Lucide React

---

**Versión:** 1.0.0  
**Fecha:** Marzo 2, 2026  
**Modo:** Offline-First (IndexedDB)
