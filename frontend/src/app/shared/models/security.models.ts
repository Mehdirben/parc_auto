export type RoleApplication = 'admin' | 'gestionnaire' | 'consultation';

export const ROLES_APPLICATION: readonly RoleApplication[] = [
  'admin',
  'gestionnaire',
  'consultation'
];

export const rolePrincipal = (roles: Iterable<string>): RoleApplication => {
  const ensemble = new Set(roles);
  return ROLES_APPLICATION.find(role => ensemble.has(role)) ?? 'consultation';
};
