import { PageResponse } from '../models/api.models';

export const emptyPage = <T>(taille = 10): PageResponse<T> => ({
  contenu: [],
  page: 0,
  taille,
  totalElements: 0,
  totalPages: 0,
  premiere: true,
  derniere: true
});
