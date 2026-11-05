/** Montos sugeridos de recarga de wallet (USD). */
export const WALLET_PRESETS = [10, 25, 50, 100] as const;

export const WALLET_MIN_USD = 5;
export const WALLET_MAX_USD = 2000;

/**
 * Monto mínimo de retiro. Tiene que coincidir con el chequeo del RPC
 * `request_withdrawal`: si cambia acá y no allá (o al revés), el usuario
 * ve un error que el formulario no pudo anticipar.
 */
export const WITHDRAW_MIN_USD = 5;

/** Deja ver solo los últimos 4 caracteres del CBU/alias. */
export function maskDestination(destination: string): string {
  const clean = destination.trim();
  if (clean.length <= 4) return clean;
  return `•••• ${clean.slice(-4)}`;
}
