# Ruta del Coordinador (Dashboard de RRHH y Monitor de Alertas)

Este componente centraliza la supervisión de las operaciones de campo y la respuesta inmediata a incidentes de seguridad reportados por la comunidad.

## Flujo de Monitoreo
1. **Monitor de Cuadrillas**: El coordinador accede a la interfaz `CoordinatorMonitor.tsx`, la cual ofrece una visión global de la fuerza técnica. La interfaz se actualiza en tiempo real mediante **Server-Sent Events (SSE)**.
2. **Gestión de Alertas Críticas**: Los reportes de inconsistencia generados por los clientes aparecen instantáneamente como notificaciones de alta prioridad sin necesidad de recargar la página.
3. **Protocolo de Respuesta**: Ante un reporte de seguridad, el coordinador puede ejecutar la acción **SUSPENDER ACCESO** de forma inmediata. Esto cambia el estatus del técnico a `SUSPENDIDO` en la base de datos, invalidando su capacidad de generar nuevos tokens QR.

## Capacidades del Sistema
- **Filtrado Geográfico**: Segmentación de la fuerza técnica por país (Venezuela, Perú, República Dominicana).
- **Control de Estatus**: Interfaz administrativa para activar o suspender personal basado en el desempeño o reportes de seguridad.
- **Visibilidad de Certificaciones**: Permite verificar el nivel de formación de cada miembro del equipo (Integral, Avanzado, etc.).
