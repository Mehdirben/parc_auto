import { KeycloakTokenParsed } from '../../tokens';

export function nomAffichage(token: KeycloakTokenParsed): string {
  const nomComposé = `${token.given_name ?? ''} ${token.family_name ?? ''}`.trim();
  return (token.name ?? nomComposé) || 'Utilisateur';
}
