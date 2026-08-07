import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, debounceTime, distinctUntilChanged, merge } from 'rxjs';

interface FiltreObservable {
  readonly valueChanges: Observable<unknown>;
}

export interface FiltreListe {
  control: FiltreObservable;
  debounce?: number;
}

export function lierFiltresListe(
  destroyRef: DestroyRef,
  filtres: readonly FiltreListe[],
  actualiser: () => void
): void {
  merge(...filtres.map(({ control, debounce = 0 }) =>
    control.valueChanges.pipe(debounceTime(debounce), distinctUntilChanged())
  ))
    .pipe(takeUntilDestroyed(destroyRef))
    .subscribe(actualiser);
}
