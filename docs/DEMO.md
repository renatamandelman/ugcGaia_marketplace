# Guion de demo (7 minutos)

Objetivo: mostrar el flujo completo **brief → postulación → escrow → entrega →
liberación de pago**, y el cobro real en modo test (recarga + premium).

## Antes de empezar

1. Abrir dos navegadores (o una ventana normal + una incógnita):
   - **A**: marca `lumina@luminaskin.com` / `GaiaSeed2026!`
   - **B**: creador `malena@creadora.com` / `GaiaSeed2026!`
2. Tener a mano la tarjeta de prueba: `4242 4242 4242 4242`, `12/34`, `123`.
3. Dejar abiertas las pestañas: `/campaigns`, `/wallet`, `/premium`.

## 1. El problema (30 s)

> “Las PyMEs no tienen equipo para producir contenido y los micro-creadores no
> tienen dónde conseguir clientes. Gaia resuelve las dos puntas: briefs claros,
> matchmaking por tags y **pago protegido**: la marca paga, Gaia retiene, y el
> creador cobra cuando la entrega se aprueba.”

## 2. Exploración y matchmaking (1 min)

- En `/campaigns`: filtrar por un tag (ej. `skincare`) y buscar “rutina”.
- Mostrar que el filtro es server-side y usa un índice GIN.
- En `/creators`: mismo filtro por tags.
- En el dashboard del creador: “Briefs recomendados” con **% de match**
  (traslape de tags de la campaña).

> “No es un listado: es matchmaking. El porcentaje mide cuánto de lo que pide
> la campaña cubre el creador.”

## 3. Alta de contenido (45 s)

- Como marca: `/campaigns/new` → crear un brief con tags y presupuesto.
- Mostrar que aparece en el panel y en el feed.
- Como creador: `/profile/settings` → subir una pieza al portfolio
  (se guarda en Supabase Storage).

## 4. Recarga de saldo con Stripe (1 min 30 s) ← **lo que pedía la consigna**

- Como marca: `/wallet` → “Cargar saldo” → USD 25.
- Paga con `4242 4242 4242 4242`.
- Vuelve a `/wallet`: **saldo acreditado** y movimiento “Recarga con tarjeta”.

> “El saldo no sale de un script: entra por la API de Stripe en modo test.
> El webhook acredita con un RPC **idempotente**; si Stripe reintenta el evento,
> no duplica el saldo.”

- Refrescar la página para demostrar la idempotencia.

## 5. Escrow: aceptar y liberar (1 min 30 s)

- Como marca: abrir el brief y aceptar la postulación de Malena.
- Mostrar: saldo descontado + estado **Retenido**.
- Como creador: subir la entrega.
- Como marca: aprobar la entrega → **pago liberado**.
- Mostrar el detalle de la colaboración: monto, comisión 6 %, historial de
  versiones (`changes_requested` → `approved`).

> “Acá está el modelo de negocio: Gaia cobra 6 % sobre cada colaboración
> liberada. El dinero nunca se mueve fuera del escrow hasta la aprobación.”

- Como creador: `/wallet` → panel **Retirar saldo** → alias `gaia.creador` →
  retirar una parte del saldo liberado. Queda **Pendiente**.
- Mostrar “Cancelar”: el saldo vuelve y el movimiento pasa a **Cancelado**.

> “El creador cobra en su wallet al aprobarse la entrega y lo retira desde acá.
> El retiro está modelado con máquina de estados (`pending` → `paid` / `cancelled`)
> y descuento atómico con `FOR UPDATE`. Está **simulado**: un payout real a un
> banco requiere Stripe Connect con onboarding y KYC, que es la evolución natural
> de este módulo.”

## 6. Premium (1 min)

- `/premium`: mostrar planes y beneficios.
- Suscribirse (Stripe test) → badge **Premium** en el panel.
- Volver a `/campaigns`: la campaña de la marca premium aparece **primera**.

> “Suscripción recurrente real (Stripe `mode: subscription`). El beneficio es
> visible en producto, no una etiqueta: prioridad en el feed.”

## 7. Cierre técnico (45 s)

> “Next.js 16 App Router, React 19, Tailwind v4, Supabase con RLS y RPC en
> Postgres, Stripe en modo test, deploy en Vercel. El gateway está aislado
> detrás de webhooks: migrar a MercadoPago en producción es cambiar el
> proveedor, no el modelo.”

## Plan B (si falla la red o Stripe)

- El flujo de escrow **no depende de Stripe**: mostrar aceptación, entrega y
  liberación con el saldo ya cargado.
- Si Stripe no responde, mostrar el código de `src/app/api/stripe/webhook/route.ts`
  y `supabase/payments-stripe.sql` para explicar la integración.
