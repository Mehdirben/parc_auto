
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

let prochainIdentifiant = 0;

@Component({
    selector: 'app-dynamic-text-list',
    imports: [ReactiveFormsModule],
    templateUrl: './dynamic-text-list.component.html',
    styleUrls: ['./dynamic-text-list.component.css']
})
export class DynamicTextListComponent implements OnInit, OnDestroy {
  @Input({ required: true }) control!: FormArray<FormControl<string>>;
  @Input() title = 'Éléments';
  @Input() singularLabel = 'Élément';
  @Input() firstPlaceholder = '';
  @Input() nextPlaceholder = 'Autre élément';
  @Input() maxLength = 80;
  @Input() requiredMessage = 'Saisissez au moins un élément.';

  readonly idPrefix = `dynamicTextList${prochainIdentifiant++}`;
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.assurerLigneVide();
    this.control.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.assurerLigneVide());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  supprimer(index: number): void {
    this.control.removeAt(index);
    this.assurerLigneVide();
  }

  identifier(_index: number, controle: FormControl<string>): FormControl<string> {
    return controle;
  }

  private assurerLigneVide(): void {
    if (!this.control.length || this.control.at(this.control.length - 1).value.trim()) {
      this.control.push(new FormControl('', {
        nonNullable: true,
        validators: [Validators.maxLength(this.maxLength)]
      }));
    }
  }
}
