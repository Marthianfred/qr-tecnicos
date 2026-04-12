# Fibex Qr Tecnicos

Fibex Qr Tecnicos es el sistema integral de Fibex Telecom diseñado para garantizar la seguridad, validación y monitoreo en tiempo real de las visitas domiciliarias de nuestros técnicos. 

El ecosistema se divide en 3 rutas operativas principales:

## 1. Ruta del Técnico (Generación de QR y Validación)

El flujo operativo para el personal en campo que asiste a las visitas domiciliarias.

- **Flujo Operativo**: El técnico accede al `TechnicianDashboard`, valida su identidad y estatus, y genera un token QR de visita único (`POST /tecnicos/:id/qr`).
- **Componentes Clave**:
  - `src/ui/components/TechnicianDashboard.tsx`
  - `src/modules/tecnicos/tecnicos.controller.ts`
- **Reglas de Negocio (TrustLayer)**: Aplica la validación **Triple Play** asegurando que el técnico posea una identidad válida, estatus `ACTIVO`, y certificaciones de formación vigentes adecuadas.

## 2. Ruta del Cliente (Escaneo y Validación/Reporte)

El flujo de seguridad para brindar confianza al cliente final.

- **Flujo Operativo**: El cliente escanea el QR generado por el técnico, el cual contiene un token JWT de un solo uso. La interfaz del cliente valida el token (`GET /tecnicos/validate/:token`) y muestra la foto, nombre y credenciales del técnico. Si existe alguna anomalía, el cliente puede emitir un reporte de inconsistencia.
- **Componentes Clave**:
  - `src/ui/components/ClientVerification.tsx`
  - `src/modules/auth/auth.controller.ts`
  - `src/modules/auth/trust-layer.service.ts`
- **Reglas de Negocio (TrustLayer)**: Se utiliza la validación **Anti-Replay (Factor 4)** para impedir la reutilización de un QR. Si el QR es válido, se marca como usado. 

## 3. Ruta del Coordinador (Dashboard de RRHH y Monitor de Alertas)

El panel central de monitoreo y respuesta a incidentes para supervisores.

- **Flujo Operativo**: El coordinador visualiza el estado de toda la fuerza técnica y monitorea alertas críticas de seguridad reportadas por los clientes. Ante una irregularidad grave, el coordinador puede ejecutar la suspensión de acceso inmediata para un técnico.
- **Componentes Clave**:
  - `src/ui/components/CoordinatorMonitor.tsx`
  - `src/modules/tecnicos/tecnicos.service.ts`
- **Capacidades**: Filtrado geográfico, control de estatus de la cuadrilla y visualización detallada de las certificaciones vigentes del personal.

## 4. Herramientas Operativas y ETL (Data Engineering)

### ETL de Carga Masiva
Se ha implementado un sistema de ETL para la migración de datos desde los sistemas legacy (archivos CSV) al nuevo esquema relacional.
- **Ruta del Script:** `src/modules/etl/etl.service.ts`
- **Funcionalidades:**
    - **Limpieza Inicial**: Omisión de cabeceras redundantes (3-5 filas).
    - **Creación de Empresas**: Extracción automática de entidades y NIL.
    - **Carga Jerárquica**: Inserción prioritaria de Coordinadores/Supervisores para asegurar la integridad referencial de las cuadrillas.
    - **Pivoteo de Certificaciones**: Transformación de columnas de cursos a registros individuales en la tabla de certificaciones.

