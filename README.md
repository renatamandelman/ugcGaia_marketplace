# GaiaUGC — Marketplace de micro-creadores UGC

Marketplace que conecta **micro-creadores de contenido UGC** con **PyMEs**. Las marcas publican briefs, los creadores se postulan, y el pago queda **retenido en custodia (escrow)** hasta que la marca aprueba la entrega.

Este proyecto fue construido para la entrega final de la materia: incluye flujo transaccional completo, pagos con **Stripe en modo test**, **suscripción Premium**, ABM de contenidos, búsqueda por tags con matchmaking, y deploy en Vercel.

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | **Next.js 16** (App Router, Server Actions, Turbopack) |
| UI | **React 19** + **Tailwind CSS v4** (design tokens en `globals.css`) |
| Lenguaje | TypeScript estricto |
| Backend / DB | **Supabase** (Postgres + Auth + Storage + RLS + RPC) |
| Pagos | **Stripe** (Checkout Sessions, modo test) |

---

## Cómo correrlo

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

### Variables de entorno (`.env.local`)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # solo server: webhook de Stripe

# URL pública (se inlinea en build: configurala ANTES de buildear)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Stripe — modo test (dashboard.stripe.com → Developers → API keys)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Solo para `npm run db:migrate` y `npm run seed`
DB_PASSWORD=
```

### Base de datos

```bash
npm run db:migrate   # aplica todos los SQL de supabase/ (idempotente)
npm run seed         # carga usuarios, campañas y colaboraciones de demo
```

### Webhook de Stripe en local

El flujo funciona **sin webhook** (la app sincroniza la Checkout Session al volver de Stripe y usa RPC idempotentes). Para probar el webhook real:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Ese comando imprime el `whsec_...` que va en `STRIPE_WEBHOOK_SECRET`.

---

## Flujo transaccional (lo importante)

```
Marca carga saldo          Stripe Checkout (test)         Wallet
──────────────►   ─────────────────────────►   ──────────────►
                webhook / sync → RPC                  deposit

Marca acepta postulación              Escrow
──────────────────────►   wallets.balance -= monto
                          wallet_transactions.kind = 'hold'
                          collaborations.payment_status = 'held'

Marca aprueba entrega                 Liberación
────────────────────►   creator_amount = monto − 6% comisión
                        wallet_transactions.kind = 'release'
                        collaborations.payment_status = 'released'

Creador pide retiro                   Retiro (simulado)
───────────────────►   wallets.balance -= monto
                       withdrawals.status = 'pending'
                       wallet_transactions.kind = 'withdrawal'
```

El retiro es **simulado a propósito**: mueve el saldo y registra una solicitud
pendiente con CBU/alias, pero no transfiere dinero real. Un payout de verdad
necesita **Stripe Connect** (cuentas Express + onboarding + KYC) y transferencias
desde el balance de la plataforma. Modelamos la máquina de estados
(`pending` → `paid` / `cancelled`) para que el flujo quede completo y auditable:
cancelar un retiro pendiente devuelve el saldo como `refund`.

**El estado final en esta demo es `pending` o `cancelled`: nada escribe `paid`.**
Ese paso lo daría el worker de payout contra Stripe Connect, que no está
implementado. Es una decisión explícita, no un olvido: preferimos un flujo
incompleto pero honesto antes que simular una acreditación bancaria que no existe.

**Garantías de seguridad:**

- Los RPC que mueven plata (`process_wallet_topup`, `activate_premium`, `deactivate_premium`) están revocados de `PUBLIC`, `anon` y `authenticated`: **solo los puede ejecutar `service_role`**, o sea el servidor.
- `request_withdrawal` y `cancel_withdrawal` sí los llama el usuario, pero usan `auth.uid()` adentro con `security definer`, y están revocados de `PUBLIC` y `anon`: **un visitante sin sesión recibe `permission denied`**. El descuento se hace con `SELECT ... FOR UPDATE`, así que dos submits simultáneos no pueden dejar el saldo en negativo.
- Son **idempotentes** por `stripe_session_id`: si Stripe reintenta el webhook, no se acredita dos veces.
- El webhook valida la firma con `STRIPE_WEBHOOK_SECRET` y corre en runtime Node.
- RLS activo en todas las tablas: cada usuario ve solo sus datos.

---

## Premium

Suscripción mensual (**USD 19**) con Stripe `mode: subscription`.

Beneficios visibles en el producto:

- Badge **Premium** en perfil y campañas.
- Las campañas de marcas premium aparecen **primero en el feed**.
- Los creadores premium aparecen primero en el explorador.

Cancelación: el evento `customer.subscription.deleted` devuelve la cuenta a `free`.

---

## Rutas

| Ruta | Qué hace |
|---|---|
| `/` | Landing: hero, cómo funciona, campañas, creadores, confianza |
| `/campaigns` | Explorador de campañas (filtro por tags + búsqueda) |
| `/campaigns/[id]` | Detalle del brief + aplicar |
| `/campaigns/new` | Alta de brief (marca) |
| `/campaigns/[id]/edit` | Edición del brief (ABM) |
| `/creators` | Explorador de creadores (tags + búsqueda + matchmaking) |
| `/dashboard` | Panel del creador |
| `/profile` | Panel de marca / perfil propio |
| `/profile/settings` | Edición de perfil y portfolio |
| `/profile/portfolio/[id]` | Portfolio público del creador |
| `/collaborations` | Lista de colaboraciones |
| `/collaborations/[id]` | Contrato, entregas, historial y liberación de pago |
| `/messages` | Mensajería marca ↔ creador |
| `/notifications` | Notificaciones in-app |
| `/wallet` | Recarga con Stripe (test), saldo, movimientos y retiro del creador |
| `/premium` | Planes y suscripción Premium |
| `/login`, `/register` | Autenticación |
| `/api/stripe/webhook` | Webhook de Stripe |

---

## Cuentas de demo

Contraseña: `GaiaSeed2026!`

| Rol | Email |
|---|---|
| Marca | `lumina@luminaskin.com` |
| Marca | `hola@yerbapampa.com` |
| Creador | `malena@creadora.com` |
| Creador | `tomas@creador.com` |
| Creador | `sol@creadora.com` |

**Tarjeta de prueba Stripe:** `4242 4242 4242 4242` · cualquier fecha futura · cualquier CVC.

> Las cuentas y la tarjeta son exclusivamente de demostración.

---

## Scripts

```bash
npm run dev        # desarrollo
npm run build      # build de producción
npm start          # servir el build
npm run lint       # eslint
npm run db:migrate # aplicar migraciones SQL
npm run seed       # datos de demo
npx tsc --noEmit   # chequeo de tipos
```
