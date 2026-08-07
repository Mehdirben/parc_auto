import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-toggle-field',
    imports: [ReactiveFormsModule],
    templateUrl: './toggle-field.component.html',
    styleUrls: ['./toggle-field.component.css']
})
export class ToggleFieldComponent {
  @Input({ required: true }) control!: FormControl<boolean>;
  @Input() label = '';
  @Input() help = '';
}
