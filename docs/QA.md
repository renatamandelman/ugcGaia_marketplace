# QA — Pruebas integrales

Registro de las pruebas hechas sobre GaiaUGC y checklist para repetirlas en el
entorno desplegado (Vercel + Supabase).

## Automáticas

| Prueba | Comando | Resultado |
|---|---|---|
| Tipos | `npx tsc --noEmit` | 0 errores |
| Lint | `npx eslint src` | 0 errores, 9 warnings (imágenes `<img>`, deuda conocida) |
| Migraciones | `npm run db:migrate` | idempotente, sin errores |
| RPC de pago + idempotencia | script SQL en transacción con rollback | `process_wallet_topup` acredita una sola vez ante reintentos |
| Permisos de los RPC | `has_function_privilege(...)` | `anon`/`authenticated` = **false**, `service_role` = **true** |

## Manuales (checklist)

### 1. Autenticación

- [ ] Login con `lumina@luminaskin.com` / `GaiaSeed2026!` → entra al panel de marca.
- [ ] Login con `malena@creadora.com` / `GaiaSeed2026!` → entra al dashboard de creador.
- [ ] Ruta protegida sin sesión (`/wallet`, `/premium`, `/collaborations`) → redirige a `/login`.
- [ ] Logout → vuelve a estado público.

### 2. ABM de contenidos

- [ ] Marca crea un brief en `/campaigns/new` con tags y presupuesto.
- [ ] El brief aparece en `/campaigns` y en el panel de la marca.
- [ ] Marca edita el brief (`/campaigns/[id]/edit`) y el cambio se refleja.
- [ ] Marca elimina el brief → desaparece del feed y de sus postulaciones.
- [ ] Creador agrega una pieza al portfolio (`/profile/settings`) con subida real de archivo.
- [ ] Creador edita y elimina la pieza.

### 3. Búsqueda, tags y matchmaking

- [ ] `/campaigns` filtra por tag y busca por título/marca.
- [ ] `/creators` filtra por tags (semántica AND) y busca por nombre/bio/ubicación.
- [ ] El dashboard del creador muestra % de match con briefs recomendados.
- [ ] Los filtros se preservan al combinar texto + tags.

### 4. Flujo transaccional con Stripe (modo test)

- [ ] Marca entra a `/wallet` y ve su saldo.
- [ ] Carga USD 25 con la tarjeta `4242 4242 4242 4242` → vuelve a `/wallet` con el saldo acreditado.
- [ ] El movimiento aparece como “Recarga con tarjeta” en la lista.
- [ ] Refrescar `/wallet?session_id=...` **no duplica** el saldo (idempotencia).
- [ ] Marca acepta una postulación → se descuenta el saldo y queda `held`.
- [ ] Marca aprueba la entrega → el creador recibe `monto − 6%` como `release`.
- [ ] Cancelar una colaboración devuelve el dinero a la wallet de la marca (`refund`).
- [ ] El creador con saldo ve el panel **Retirar saldo** en `/wallet` (la marca no lo ve).
- [ ] Retiro con alias válido → se descuenta el saldo, aparece “Retiro solicitado” y la solicitud queda **Pendiente**.
- [ ] Retiro con CBU de 5 dígitos → error de validación, sin tocar el saldo.
- [ ] Retiro mayor al saldo disponible → error de saldo insuficiente.
- [ ] “Cancelar” un retiro pendiente devuelve el saldo y el movimiento pasa a **Cancelado**.
- [ ] Sin sesión (`anon`), llamar `request_withdrawal` por API devuelve `permission denied`.

### 5. Premium

- [ ] `/premium` muestra los dos planes y el beneficio de cada uno.
- [ ] Suscripción con tarjeta de prueba → vuelve con “Ya sos Premium”.
- [ ] Aparece el badge **Premium** en el perfil.
- [ ] Las campañas de la marca premium aparecen primeras en `/campaigns` y en el home.
- [ ] El creador premium aparece primero en `/creators`.

### 6. Responsive

- [ ] Home, `/campaigns`, `/creators`, `/dashboard`, `/wallet`, `/premium` a 375 px, 768 px y 1280 px.
- [ ] Menú mobile abre/cierra y no desborda.
- [ ] Formularios y tablas no generan scroll horizontal.

### 7. Errores y carga

- [ ] Navegar entre rutas muestra skeleton (`loading.tsx`) en lugar de pantalla congelada.
- [ ] Forzar un error de render muestra `error.tsx` con botón “Reintentar”.
- [ ] URL inexistente muestra el 404 custom.

## Bugs encontrados y corregidos en esta etapa

1. **RPC de pagos ejecutables por cualquiera.** `revoke ... from anon, authenticated`
   no alcanzaba: en Postgres las funciones nacen con `EXECUTE` para `PUBLIC`.
   Se revocó a `public` y se verificó con `has_function_privilege`.
2. **`PaymentStatus` duplicado** en `db-types.ts` (colaboraciones vs. Stripe).
   Se renombró el de Stripe a `StripePaymentStatus`.
3. **Feed recortaba antes de destacar.** El home hacía `limit(6)` y recién
   después ordenaba: una campaña premium fuera del top 6 nunca se destacaba.
   Ahora trae 24, ordena y recorta.
4. **Stripe redirigía a localhost en producción.** `siteUrl()` ahora prioriza la
   URL de Vercel cuando `NEXT_PUBLIC_SITE_URL` apunta a localhost.
5. **Código muerto.** Se eliminaron `src/lib/mock-data.ts` y `src/lib/types.ts`
   (267 + 46 líneas sin importadores) y el README dejó de declarar datos mock.
