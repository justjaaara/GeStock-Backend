# GeStock - Sistema de Gestión de Inventario

## Índice

1. [Descripción del Objetivo](#descripción-del-objetivo)
   - [Objetivo Principal (MVP)](#objetivo-principal-mvp)
   - [Alcance Definido](#alcance-definido)
2. [Funcionamiento de la Aplicación](#funcionamiento-de-la-aplicación)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Flujos Desarrollados al momento](#flujos-desarrollados-al-momento)
   - [1. Sistema de Autenticación Completo](#1-sistema-de-autenticación-completo)
   - [2. Arquitectura de Navegación](#2-arquitectura-de-navegación)
5. [Flujos Pendientes (Entrega Final)](#flujos-pendientes-entrega-final)
   - [1. Administración de Usuarios y Roles](#1-administración-de-usuarios-y-roles-ges-112-ges-117-ges-152-ges-201)
   - [2. Gestión Completa de Productos](#2-gestión-completa-de-productos-ges-47-ges-58-ges-69-ges-77-ges-85-ges-94-ges-103-ges-131)
   - [3. Sistema RFID y Control de Lotes](#3-sistema-rfid-y-control-de-lotes-ges-159-ges-160)
   - [4. Sistema de Alertas y Trazabilidad](#4-sistema-de-alertas-y-trazabilidad-ges-118-ges-119-ges-203)
   - [5. Módulo de Ventas Básico](#5-módulo-de-ventas-básico-ges-162-ges-164-ges-204-ges-205)
   - [6. Sistema de Reportes y Consolidados](#6-sistema-de-reportes-y-consolidados-ges-166-ges-167-ges-168-ges-206-ges-211-ges-212)
   - [7. Cierres Mensuales](#7-cierres-mensuales-ges-213-ges-214-ges-215)
6. [Modelo de Datos](#modelo-de-datos)
   - [Entidades del Sistema](#entidades-del-sistema)
     - [Usuarios y Autenticación](#-usuarios-y-autenticación)
     - [Productos](#-productos)
     - [Sistema RFID y Lotes](#-sistema-rfid-y-lotes)
     - [Control de Inventario](#-control-de-inventario)
     - [Sistema de Ventas](#-sistema-de-ventas)
   - [Diagrama de Entidad-Relación](#diagrama-de-entidad-relación)

---

## Descripción del Objetivo

GeStock es un MVP de sistema web de gestión de inventario diseñado para empresas que necesitan controlar y administrar sus productos de manera eficiente mediante tecnología RFID. La aplicación permite a los usuarios gestionar el inventario en tiempo real, realizar carga masiva de productos, recibir alertas automáticas de stock bajo, y mantener un control detallado con trazabilidad completa de todos los movimientos, incluyendo cierres mensuales automáticos para auditoría histórica.

### Objetivo Principal (MVP)

Desarrollar un MVP de aplicación web para gestión de inventario que permita:

- **Control de Productos**: CRUD completo con categorización y control de stock
- **Sistema RFID**: Carga masiva de productos con validación de duplicados
- **Alertas Inteligentes**: Notificaciones automáticas por stock bajo con trazabilidad
- **Reportes y Consolidados**: Informes detallados con exportación PDF/Excel
- **Cierres Mensuales**: Snapshots automáticos con auditoría histórica
- **Punto de Venta Básico**: Registro de salidas de prueba sin facturación completa
- **Administración de Usuarios**: Control de roles y permisos granulares

### Alcance Definido

✅ **Lo que SÍ incluye el MVP:**

- Base de datos Oracle con operaciones CRUD confiables
- Carga masiva de productos via RFID con validación automática
- Control de stock con alertas por bajo inventario
- Trazabilidad completa de cambios y movimientos
- Salidas de prueba para simular movimientos
- Reportes de existencias, consolidaciones y cierres mensuales
- Arquitectura moderna (Angular + NestJS + Oracle)

❌ **Lo que NO se contempla:**

- Sistema de ventas completo con facturación
- Gestión de pagos o punto de venta real
- Integración con sistemas ERP externos
- Logística de distribución y proveedores
- Gestión avanzada de clientes
- Herramientas de predicción con IA

## Funcionamiento de la Aplicación

La aplicación está construida con una arquitectura moderna de frontend-backend separados:

- **Frontend**: Angular v20.2 con arquitectura de componentes standalone y signals
- **Backend**: NestJS v11.0.1
- **ORM**: TypeORM
- **Base de datos**: Oracle última versión
- **Autenticación**: JWT (JSON Web Tokens) para seguridad
- **API**: RESTful API con documentación Swagger

## Estructura del Proyecto

```
GeStock-Backend/
   ├── src/
   │   ├── auth/                 # Módulo de autenticación
   │   ├── users/                # Gestión de usuarios
   │   ├── config/               # Configuración de base de datos
   │   ├── entities/             # Entidades de TypeORM
   │   ├── common/               # Utilidades compartidas
   │   └── main.ts               # Punto de entrada
   ├── .env                      # Variables de entorno
   └── package.json

```

## Flujos Desarrollados al momento

### ✅ 1. Sistema de Autenticación Completo

- **Registro de Usuarios**
  - Validación de contraseña fuerte (mínimo 6 caracteres, números y caracteres especiales)
  - Validación de email único
  - Encriptación de contraseñas con bcrypt
  - Asignación automática de rol de usuario

- **Inicio de Sesión**
  - Autenticación con email y contraseña
  - Generación de JWT tokens
  - Manejo de errores de autenticación
  - Redirección automática al dashboard

- **Cambio de Contraseña**
  - Validación de contraseña actual
  - Validación de contraseña (mínimo 6 caracteres, números y caracteres especiales)
  - Actualización segura en base de datos

### ✅ 2. Arquitectura de Navegación

- **Sidebar Navegación**
  - Navegación intuitiva por módulos
  - Dashboard principal
  - Acceso rápido a todas las secciones

## Flujos Pendientes (Entrega Final)

### 🚧 1. Administración de Usuarios y Roles (GES-112, GES-117, GES-152, GES-201)

- **Gestión de Usuarios por Administrador**
  - Listado completo de usuarios registrados (GES-117)
  - Eliminación de usuarios para revocar acceso (GES-112)
  - Asignación de roles diferenciados (GES-152)
  - Control de acceso por rol (administrador, cajero, usuario) (GES-201)

- **Recuperación de Contraseña** (GES-4)
  - Sistema de recuperación por email
  - Generación de tokens temporales
  - Validación de identidad

### 🚧 2. Gestión Completa de Productos (GES-47, GES-58, GES-69, GES-77, GES-85, GES-94, GES-103, GES-131)

- **CRUD de Productos**
  - Registro de productos en inventario (GES-47)
  - Actualización de categoría, nombre, precio (GES-58)
  - Visualización individual de productos (GES-69)
  - Vista general del inventario completo (GES-77)
  - Actualización de existencias (GES-85)
  - Eliminación de productos del sistema (GES-94)

- **Control de Stock**
  - Configuración de stock mínimo por producto (GES-131)
  - Filtrado por categoría, precio, existencias (GES-103)

### 🚧 3. Sistema RFID y Control de Lotes (GES-159, GES-160)

- **Carga Masiva con RFID**
  - Escaneo de etiquetas RFID para registro automático (GES-159)
  - Validación automática de duplicados (GES-160)
  - Registro de lotes con trazabilidad completa
  - Integración con hardware RFID

### 🚧 4. Sistema de Alertas y Trazabilidad (GES-118, GES-119, GES-203)

- **Alertas de Stock**
  - Notificaciones automáticas por stock bajo (GES-118)
  - Alertas diarias hasta reposición (GES-203)
  - Dashboard de alertas activas

### 🚧 5. Módulo de Ventas Básico (GES-162, GES-164, GES-204, GES-205)

- **Punto de Venta Simplificado**
  - Búsqueda de productos para venta (GES-162)
  - Emisión de comprobantes básicos (GES-164)
  - Validación en tiempo real del inventario (GES-204)
  - Control de acceso por rol cajero/admin (GES-205)

- **Registro de Salidas de Prueba**
  - Simulación de movimientos sin ventas reales
  - Registro de salidas para testing
  - Control de stock en tiempo real

### 🚧 6. Sistema de Reportes y Consolidados (GES-166, GES-167, GES-168, GES-206, GES-211, GES-212)

- **Reportes Operativos**
  - Reporte general de inventario por producto (GES-166)
  - Reporte de productos vendidos por categoría (GES-167)
  - Reporte de ingresos por lote RFID (GES-168)
  - Consolidado de stock por producto (GES-211)

### 🚧 7. Cierres Mensuales (GES-213, GES-214, GES-215)

- **Cierres Automáticos**
  - Snapshot automático mensual del inventario (GES-213)
  - Bloqueo de movimientos anteriores al cierre (GES-214)
  - Preservación de integridad histórica

## Modelo de Datos

### Entidades del Sistema

#### 🔐 **Usuarios y Autenticación**

##### **Users**

| Campo    | Tipo de datos | Descripción                                                     | Restricciones  |
| -------- | ------------- | --------------------------------------------------------------- | -------------- |
| User_id  | SERIAL        | Identificador único del usuario.                                | Llave primaria |
| Name     | VARCHAR(25)   | Nombre completo del usuario.                                    | Obligatorio    |
| Email    | VARCHAR(254)  | Correo electrónico del usuario (para autenticación y contacto). | Obligatorio    |
| Password | VARCHAR(40)   | Contraseña encriptada del usuario.                              | Obligatorio    |
| Role_id  | INT           | Referencia al rol que tiene asignado el usuario.                | Llave foránea  |
| State_id | INT           | Estado del usuario en el sistema (activo, inactivo, bloqueado). | Llave foránea  |

##### **Roles**

| Campo     | Tipo de datos | Descripción                                                 | Restricciones  |
| --------- | ------------- | ----------------------------------------------------------- | -------------- |
| Role_Id   | SERIAL        | Identificador único del rol en el sistema.                  | Llave primaria |
| Role_name | VARCHAR       | Nombre del rol (ejemplo: Administrador, Operador, Cliente). | Obligatorio    |

##### **User_states**

| Campo      | Tipo de datos | Descripción                                           | Restricciones      |
| ---------- | ------------- | ----------------------------------------------------- | ------------------ |
| State_id   | SERIAL        | Identificador del estado de usuario.                  | Llave primaria     |
| State_name | VARCHAR(20)   | Nombre del estado (ej.: activo, inactivo, bloqueado). | Obligatorio; Único |

#### 📦 **Productos**

##### **Products**

| Campo               | Tipo de datos | Descripción                                        | Restricciones  |
| ------------------- | ------------- | -------------------------------------------------- | -------------- |
| Product_id          | SERIAL        | Identificador único del producto.                  | Llave primaria |
| Product_name        | VARCHAR       | Nombre del producto.                               | Obligatorio    |
| Product_description | VARCHAR       | Descripción breve del producto.                    |                |
| Product_code        | VARCHAR       | Código interno del producto.                       |                |
| Unit_price          | DECIMAL(10,2) | Precio unitario vigente.                           | Obligatorio    |
| Category_id         | INT           | Referencia a la categoría del producto.            | Llave foránea  |
| Measurement_id      | INT           | Id de la unidad de medida                          | Llave foránea  |
| State_id            | INT           | Estado del producto (activo, descontinuado, etc.). | Llave foránea  |

##### **Product_categories**

| Campo         | Tipo de datos | Descripción                                               | Restricciones      |
| ------------- | ------------- | --------------------------------------------------------- | ------------------ |
| Category_id   | SERIAL        | Identificador único de la categoría de producto.          | Llave primaria     |
| Category_name | VARCHAR       | Nombre de la categoría de producto (ej: bebidas, snacks). | Obligatorio; Único |

##### **Product_states**

| Campo      | Tipo de datos | Descripción                                | Restricciones      |
| ---------- | ------------- | ------------------------------------------ | ------------------ |
| State_id   | SERIAL        | Identificador del estado del producto.     | Llave primaria     |
| State_name | VARCHAR       | Nombre del estado (activo, descontinuado). | Obligatorio; Único |

##### **Measurements_types**

| Campo            | Tipo de datos | Descripción                                     | Restricciones      |
| ---------------- | ------------- | ----------------------------------------------- | ------------------ |
| Measurement_id   | SERIAL        | Identificador de la unidad de medida.           | Llave primaria     |
| Measurement_name | VARCHAR       | Nombre de la unidad (unidad, kilogramo, litro). | Obligatorio; Único |

#### 📦 **Sistema RFID y Lotes**

##### **Batches**

| Campo       | Tipo de datos | Descripción                                      | Restricciones  |
| ----------- | ------------- | ------------------------------------------------ | -------------- |
| Lot_id      | SERIAL        | Identificador único del lote de productos.       | Llave primaria |
| RFID_code   | VARCHAR(40)   | Código RFID para identificar y rastrear el lote. | Obligatorio    |
| Description | VARCHAR(200)  | Breve descripción del lote.                      |                |
| Entry_date  | DATETIME      | Fecha de ingreso del lote al inventario.         | Obligatorio    |

#### 📊 **Control de Inventario**

##### **Inventory**

| Campo         | Tipo de datos | Descripción                                                | Restricciones  |
| ------------- | ------------- | ---------------------------------------------------------- | -------------- |
| Inventory_id  | SERIAL        | Identificador del registro de inventario para un producto. | Llave primaria |
| Product_id    | INT           | Producto al que corresponde este stock.                    | Llave foránea  |
| Lot_id        | INT           | Lote específico al que corresponde este stock.             | Llave foránea  |
| Actual_stock  | INT           | Cantidad actual disponible en inventario.                  | Obligatorio    |
| Minimum_stock | INT           | Cantidad mínima para activar alerta de reposición.         |                |

##### **Inventory_movements**

| Campo         | Tipo de datos   | Descripción                                       | Restricciones              |
| ------------- | --------------- | ------------------------------------------------- | -------------------------- |
| Movement_id   | SERIAL          | Identificador único del movimiento de inventario. | Llave primaria             |
| Product_id    | INT             | Producto asociado al movimiento.                  | Llave foránea; Obligatorio |
| Lot_id        | INT             | Lote relacionado al movimiento.                   | Llave foránea              |
| Movement_type | VARCHAR         | Tipo de movimiento (entrada, salida, ajuste).     | Obligatorio                |
| Quantity      | INT             | Cantidad involucrada en el movimiento.            | Obligatorio                |
| Movement_date | TIMESTAMP NOW() | Fecha y hora del movimiento.                      | Obligatorio                |
| Reference     | VARCHAR         | Referencia opcional                               |                            |
| User_id       | INT             | Usuario responsable del movimiento.               | Llave foránea              |

##### **Inventory_closure**

| Campo        | Tipo de datos | Descripción                                   | Restricciones              |
| ------------ | ------------- | --------------------------------------------- | -------------------------- |
| Closure_id   | SERIAL        | Identificador único del cierre de inventario. | Llave primaria             |
| Product_id   | INT           | Producto incluido en el cierre.               | Llave foránea; Obligatorio |
| Lot_id       | INT           | Lote incluido en el cierre.                   | Llave foránea              |
| Final_stock  | INT           | Cantidad final registrada en el cierre.       | Obligatorio                |
| Closure_date | TIMESTAMP     | Fecha en la que se realizó el cierre.         | Obligatorio                |
| User_id      | INT           | Usuario que ejecutó el cierre.                | Llave foránea              |

#### 💰 **Sistema de Ventas**

##### **Sales**

| Campo         | Tipo de datos | Descripción                      | Restricciones  |
| ------------- | ------------- | -------------------------------- | -------------- |
| Sale_id       | SERIAL        | Identificador único de la venta. | Llave primaria |
| Date          | DATETIME      | Fecha y hora de la venta.        | Obligatorio    |
| Total_sale    | DECIMAL(10,2) | Valor total de la venta.         | Obligatorio    |
| Sale_state_id | INT           | Id del estado de la venta.       | Llave foránea  |
| User_id       | INT           | Usuario que registró la venta.   | Llave foránea  |
| Observation   | VARCHAR(255)  | Nota u observación asociada.     |                |

##### **Sale_detail**

| Campo          | Tipo de datos | Descripción                               | Restricciones  |
| -------------- | ------------- | ----------------------------------------- | -------------- |
| Sale_detail_id | SERIAL        | Identificador único del detalle de venta. | Llave primaria |
| Sale_id        | INT           | Referencia a la venta asociada.           | Obligatorio    |
| Product_id     | INT           | Producto vendido en la transacción.       | Obligatorio    |
| Quantity       | INT           | Cantidad del producto vendida.            | Obligatorio    |
| Unit_price     | DECIMAL(10,2) | Precio unitario aplicado.                 | Obligatorio    |
| Subtotal       | DECIMAL(10,2) | Subtotal (Cantidad × Precio unitario).    | Obligatorio    |

##### **Sales_states**

| Campo         | Tipo de datos | Descripción                              | Restricciones      |
| ------------- | ------------- | ---------------------------------------- | ------------------ |
| Sale_state_id | SERIAL        | Identificador del estado de la venta.    | Llave primaria     |
| State_name    | VARCHAR(20)   | Nombre del estado (registrada, anulada). | Obligatorio; Único |

### Diagrama de Entidad-Relación

![Diagrama de entidad relación](https://i.imgur.com/292cYSe.png)

> Puedes acceder al modelo entidad relación con más detalle: https://i.imgur.com/292cYSe.png

**Equipo de Desarrollo**: GeStock Development Team  
**Versión**: 1.0.0  
**Fecha**: Octubre 2025
