# Ruta del Técnico (Generación de QR y Validación)

Este módulo gestiona el flujo operativo de los técnicos de Fibex Telecom, desde su identificación hasta la generación de tokens dinámicos para visitas domiciliarias.

## Flujo Operativo
1. **Identificación**: El técnico accede a su dashboard (`TechnicianDashboard.tsx`) donde se cargan sus datos de identidad y certificaciones desde el microservicio de técnicos.
2. **Generación de QR**: Al presionar "GENERAR QR DE VISITA", se invoca el endpoint `POST /tecnicos/:id/qr`.
3. **Validación TrustLayer**: Antes de generar el token, el sistema aplica el motor de validaciones **Triple Play** en el `AuthService`:
   - **Identidad**: Verifica que el técnico exista en la base de datos maestra.
   - **Estatus**: El técnico debe estar estrictamente en estado `ACTIVO`.
   - **Certificación**: El técnico debe poseer certificaciones vigentes (no vencidas) adecuadas para el nivel de servicio.
4. **Despliegue**: Si las validaciones son exitosas, se genera un token JWT firmado y se muestra al técnico mediante el componente `QRDisplay.tsx`.

## Reglas de Negocio (TrustLayer)
- **Bloqueo por Estatus**: Los técnicos en estado `SUSPENDIDO` o `INACTIVO` tienen restringida la generación de nuevos tokens de visita.
- **Validación de Formación**: El sistema impide la generación si el técnico no tiene registros de formación o si sus certificaciones actuales han expirado.
- **Persistencia**: Los tokens generados tienen una validez temporal limitada para garantizar la seguridad.
