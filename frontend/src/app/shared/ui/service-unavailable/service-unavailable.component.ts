import { Component, EventEmitter, Output } from '@angular/core';

@Component({ selector: 'app-service-unavailable', standalone: true, templateUrl: './service-unavailable.component.html', styleUrls: ['./service-unavailable.component.css'] })
export class ServiceUnavailableComponent { @Output() retried = new EventEmitter<void>(); }
