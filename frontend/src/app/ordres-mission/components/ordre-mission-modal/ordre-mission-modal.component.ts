import {
  Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges,
  ViewChild, inject
} from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastService } from '../../../core/toast.service';
import {
  PdfPreviewComponent
} from '../../../shared/ui/pdf-preview/pdf-preview.component';
import { apiErrorMessage } from '../../../shared/utils/api-error';
import { OrdreMissionService } from '../../data-access/ordre-mission.service';
import { OrdreMission } from '../../models/ordre-mission.models';

@Component({
  selector: 'app-ordre-mission-modal',
  imports: [PdfPreviewComponent],
  templateUrl: './ordre-mission-modal.component.html',
  styleUrls: ['./ordre-mission-modal.component.css']
})
export class OrdreMissionModalComponent implements OnChanges, OnDestroy {
  private readonly service = inject(OrdreMissionService);
  private readonly toast = inject(ToastService);
  private documentRequest: Subscription | null = null;

  @Input() ordre: OrdreMission | null = null;
  @Output() closed = new EventEmitter<void>();
  @ViewChild(PdfPreviewComponent) private pdfPreview?: PdfPreviewComponent;

  documentBlob: Blob | null = null;
  loading = false;
  documentError = '';

  get filename(): string {
    return `${this.ordre?.numero ?? 'ordre-mission'}.pdf`;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['ordre']) return;
    this.documentRequest?.unsubscribe();
    this.documentBlob = null;
    this.documentError = '';
    this.loading = false;
    if (this.ordre) this.loadDocument(this.ordre.id);
  }

  ngOnDestroy(): void {
    this.documentRequest?.unsubscribe();
  }

  imprimer(): void {
    this.pdfPreview?.print();
  }

  telecharger(): void {
    this.pdfPreview?.download();
  }

  signalerErreurApercu(error: unknown): void {
    this.toast.show('error', 'Aperçu PDF indisponible', apiErrorMessage(error));
  }

  private loadDocument(id: string): void {
    this.loading = true;
    this.documentRequest = this.service.document(id).subscribe({
      next: blob => {
        this.documentBlob = blob;
        this.loading = false;
      },
      error: error => {
        this.loading = false;
        this.documentError = 'Le document ne peut pas être affiché.';
        this.toast.show('error', 'Document indisponible', apiErrorMessage(error));
      }
    });
  }
}
