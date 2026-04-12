# Ruta del Cliente (Escaneo y Validación/Reporte)

Este módulo implementa la capa de seguridad y confianza para el cliente final, garantizando que el personal que ingresa a su propiedad está debidamente autorizado y validado por Fibex Telecom.

## Flujo de Seguridad
1. **Escaneo**: El cliente escanea el código QR presentado por el técnico. Este QR contiene una URL única que incluye un token de verificación JWT.
2. **Verificación en Tiempo Real**: La vista de cliente (`ClientVerification.tsx`) consume el endpoint `GET /tecnicos/validate/:token`.
3. **Validación de Confianza (TrustLayer)**:
   - **Anti-Replay (Factor 4)**: Cada token es de un solo uso. El `TrustLayerService` marca el token como consumido tras la primera validación. Si se intenta reutilizar un QR, el sistema muestra una **¡ALERTA DE SEGURIDAD!**.
   - **Integridad de Datos**: Se verifica la firma del token y se recupera la información oficial (Nombre, Foto, Documento, Nivel de Certificación) para que el cliente la compare con el personal presente.
4. **Reporte de Inconsistencia**: Si el cliente detecta que los datos no coinciden o existe alguna anomalía, puede emitir un reporte inmediato (`InconsistencyReport.tsx`) que escala al Monitor del Coordinador.

## Componentes Técnicos
- **TrustLayer Service**: Encargado de la validación anti-replay y el marcado de tokens usados.
- **Auth Controller**: Expone los endpoints de validación utilizados por la interfaz del cliente.
