export const IMMATRICULATION_MAROCAINE =
  /^(?:[0-9]{1,8}|[0-9]{1,5}-[A-Za-z]-[0-9]{1,2})$/;

export function normaliserImmatriculation(valeur: string): string {
  return valeur.trim().toUpperCase();
}
