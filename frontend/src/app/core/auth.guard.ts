import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from './authentication.service';
import { PermissionService } from './permission.service';

export const métierGuard: CanActivateFn = () => {
  const authentication = inject(AuthenticationService);
  const router = inject(Router);

  if (!authentication.authenticated) {
    authentication.login(window.location.href);
    return false;
  }

  const permissions = inject(PermissionService);
  return permissions.peutConsulter
    ? true
    : router.createUrlTree(['/acces-refuse']);
};

export const adminGuard: CanActivateFn = () => {
  const permissions = inject(PermissionService);
  const router = inject(Router);
  return permissions.estAdmin ? true : router.createUrlTree(['/acces-refuse']);
};
