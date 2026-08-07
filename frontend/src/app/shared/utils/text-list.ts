export function nettoyerListeTexte(valeurs: string[]): string[] {
  return [...new Map(valeurs
    .map(valeur => valeur.trim())
    .filter(Boolean)
    .map(valeur => [valeur.toLocaleUpperCase('fr'), valeur])).values()];
}
