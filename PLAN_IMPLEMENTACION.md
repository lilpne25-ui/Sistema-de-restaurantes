# PLAN DE IMPLEMENTACIÓN — EL REFIL

## Objetivo
Llevar una sola sucursal desde diagnóstico hasta un go-live estable sin rehacer el POS desde cero.

## Base reutilizada
- Odoo 19 para operación de restaurante.
- Repo actual `lilpne25-ui/Vlux-Poos-Odoo`.
- Casos de uso y experiencia comercial existentes.
- VLUX Owner como PWA separada según especificación interna.
- Calculadora de ROI actual.

## Calendario recomendado
### 29 septiembre 2026 — reunión
- Mostrar experiencia V2.
- Obtener datos de operación y ROI.
- No cerrar integraciones de hardware sin revisión.

### 30 septiembre–3 octubre — diagnóstico y sandbox
Entregable: documento de alcance + ambiente de prueba.
- Menú / categorías / precios.
- Mesas / pisos.
- Usuarios / roles.
- Estaciones de preparación.
- Métodos de pago.
- Hardware actual.
- CFDI y facturación: validar alcance separado.

### 5–9 octubre — primer resultado visible
Entregable: orden real en sandbox.
- Catálogo real.
- Piso y mesas reales.
- Orden por mesa.
- Flujo de cobro de prueba.

### 12–16 octubre — cocina, Owner y QA
Entregable: recorrido end-to-end validado.
- Preparación / cocina.
- Estados de orden.
- Lectura Owner.
- Perfiles y permisos.
- Checklist de pruebas.

### 19–23 octubre — piloto controlado
Entregable: operación en una sucursal durante ventana acordada.
- Observación de fricción.
- Tiempos de atención.
- Errores / ajustes.
- Capacitación inicial.

### 26 octubre–13 noviembre — estabilización
Objetivo de go-live estable: **9–13 noviembre 2026**.

## Uso de IA
Claude Pro / Codex pueden acelerar:
- scaffolding,
- refactor,
- generación de pruebas,
- documentación,
- análisis de errores,
- creación de adaptadores,
- soporte a QA.

No deben sustituir:
- levantamiento con la clienta,
- validación de hardware,
- pruebas de pago,
- operación real,
- seguridad,
- aceptación de usuario.

## Regla comercial
No prometer una función como “VLUX terminada” si sólo existe como capacidad de Odoo o como prototipo. Etiquetarla como:
1. **Odoo / disponible en plataforma**,
2. **VLUX / ya existente**, o
3. **Implementación / por validar**.
