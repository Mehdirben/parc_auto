
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-search-toolbar',
    imports: [ReactiveFormsModule],
    templateUrl: './search-toolbar.component.html',
    styleUrls: ['./search-toolbar.component.css']
})
export class SearchToolbarComponent {
  @Input({ required: true }) control!: FormControl<string>;
  @Input() placeholder = 'Rechercher…';
  @Input() ariaLabel = 'Rechercher';
  @Input() refreshLabel = 'Actualiser';
  @Output() refreshed = new EventEmitter<void>();
}
