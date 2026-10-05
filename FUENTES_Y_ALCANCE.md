# FUENTES Y ALCANCE

## VLUX — fuentes internas revisadas
- Identidad oficial VLUX: filosofía de software adaptativo, automatización, centralización, enfoque premium y resultados reales.
- GitHub: `lilpne25-ui/Vlux-Poos-Odoo`
- `src/application/use-cases/CalculateROI.ts`
- `src/domain/entities/ROI.ts`
- `src/config/pricing.ts`
- `src/application/use-cases/SimulateSale.ts`
- `src/config/content.ts`
- Especificación `POS — UX UI Y TEMAS`.

## Odoo 19 — documentación oficial
- Point of Sale: https://www.odoo.com/documentation/19.0/applications/sales/point_of_sale.html
- Restaurant features: https://www.odoo.com/documentation/19.0/applications/sales/point_of_sale/restaurant.html
- Preparation display: https://www.odoo.com/documentation/19.0/applications/sales/point_of_sale/extra/preparation.html

Capacidades documentadas utilizadas en la demo:
- pisos / mesas,
- órdenes,
- envío a cocina/bar,
- división de cuentas,
- propinas,
- pantalla de preparación,
- autoservicio,
- lealtad,
- reportes.

## Apple — referencias de diseño (principios, no copia visual)
- Human Interface Guidelines — Design principles.
- Motion.
- Layout / visual hierarchy / progressive disclosure.

Principios aplicados:
- jerarquía clara,
- foco en tarea principal,
- disclosure progresivo,
- movimiento breve y con propósito,
- feedback visible,
- opción de saltar la demo guiada,
- `prefers-reduced-motion`.

## El Refil de la Abuela — referencias públicas
- Menú público de Uber Eats: se verificaron Agua de frutas, Ensalada César con pollo y Ensalada de la Abuela Raquel; los demás precios de la demo se etiquetan como demo.
- Restaurant Guru / reseñas públicas: chilaquiles y enchiladas aparecen mencionados con frecuencia. No se afirma que sean los más vendidos.

## Regla de esta propuesta
Ningún número de ROI precargado representa datos reales del restaurante. La calculadora debe completarse con la clienta.
