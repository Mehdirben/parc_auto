import { HttpErrorResponse } from '@angular/common/http';
import { ApiProblem } from '../models/api.models';

export function apiErrorMessage(erreur: unknown): string {
  if (erreur instanceof HttpErrorResponse) {
    const problem = erreur.error as ApiProblem | null;
    return problem?.detail
      || (erreur.status === 0 ? 'Le serveur est inaccessible.' : 'Une erreur inattendue est survenue.');
  }
  return 'Une erreur inattendue est survenue.';
}
