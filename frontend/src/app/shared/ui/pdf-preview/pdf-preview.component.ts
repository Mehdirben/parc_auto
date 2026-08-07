import {
  AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy,
  Output, ViewChild
} from '@angular/core';
import {
  GlobalWorkerOptions, PDFDocumentLoadingTask, PDFDocumentProxy, PDFPageProxy,
  RenderTask, getDocument
} from 'pdfjs-dist';

GlobalWorkerOptions.workerSrc = new URL(
  'pdf.worker.min.mjs?v=5.4.296', document.baseURI
).toString();

@Component({
  selector: 'app-pdf-preview',
  imports: [],
  templateUrl: './pdf-preview.component.html',
  styleUrls: ['./pdf-preview.component.css']
})
export class PdfPreviewComponent implements AfterViewInit, OnDestroy {
  private pdfBlobValue: Blob | null = null;
  private pdf: PDFDocumentProxy | null = null;
  private page: PDFPageProxy | null = null;
  private loadingTask: PDFDocumentLoadingTask | null = null;
  private renderTask: RenderTask | null = null;
  private objectUrl = '';
  private generation = 0;
  private viewReady = false;
  private renderingQueue = false;
  private renderRequested = false;
  private renderFrame = 0;
  private resizeObserver: ResizeObserver | null = null;

  @Input()
  set pdfBlob(value: Blob | null) {
    if (value === this.pdfBlobValue) return;
    this.pdfBlobValue = value;
    this.loadDocument(value);
  }

  @Input() filename = 'document.pdf';
  @Input() loading = false;
  @Input() externalError = '';
  @Input() ariaLabel = 'Aperçu du document PDF';
  @Output() renderError = new EventEmitter<unknown>();

  @ViewChild('canvas') private canvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('container')
  set container(element: ElementRef<HTMLDivElement> | undefined) {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    if (!element) return;

    this.resizeObserver = new ResizeObserver(() => this.requestRender());
    this.resizeObserver.observe(element.nativeElement);
  }

  rendering = false;
  internalError = '';

  get errorMessage(): string {
    return this.externalError || this.internalError;
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.requestRender();
  }

  ngOnDestroy(): void {
    ++this.generation;
    this.viewReady = false;
    cancelAnimationFrame(this.renderFrame);
    this.resizeObserver?.disconnect();
    this.destroyDocument();
    this.revokeObjectUrl();
  }

  download(): void {
    if (!this.objectUrl) return;
    const link = document.createElement('a');
    link.href = this.objectUrl;
    link.download = this.filename;
    link.click();
  }

  print(): void {
    if (!this.objectUrl) return;

    const frame = document.createElement('iframe');
    frame.setAttribute('aria-hidden', 'true');
    frame.style.cssText = 'position:fixed;width:0;height:0;border:0;visibility:hidden';
    frame.src = this.objectUrl;
    document.body.appendChild(frame);

    const fallback = window.setTimeout(() => frame.remove(), 60_000);
    frame.onload = () => {
      const printWindow = frame.contentWindow;
      if (!printWindow) return;
      printWindow.addEventListener('afterprint', () => {
        window.clearTimeout(fallback);
        frame.remove();
      }, { once: true });
      printWindow.focus();
      printWindow.print();
    };
  }

  private loadDocument(blob: Blob | null): void {
    const generation = ++this.generation;
    cancelAnimationFrame(this.renderFrame);
    this.renderFrame = 0;
    this.renderRequested = false;
    this.destroyDocument();
    this.revokeObjectUrl();
    this.internalError = '';
    this.rendering = blob !== null;
    if (!blob) return;

    this.objectUrl = URL.createObjectURL(blob);
    void this.prepareDocument(blob, generation);
  }

  private async prepareDocument(blob: Blob, generation: number): Promise<void> {
    try {
      const data = new Uint8Array(await blob.arrayBuffer());
      if (generation !== this.generation) return;

      this.loadingTask = getDocument({ data });
      const pdf = await this.loadingTask.promise;
      if (generation !== this.generation) return;

      this.pdf = pdf;
      this.page = await pdf.getPage(1);
      if (generation !== this.generation) return;
      this.requestRender();
    } catch (error) {
      this.handleRenderError(error, generation);
    }
  }

  private requestRender(): void {
    this.renderRequested = true;
    if (!this.viewReady || !this.page || this.renderFrame || this.renderingQueue) return;

    this.renderFrame = requestAnimationFrame(() => {
      this.renderFrame = 0;
      void this.processRenderQueue();
    });
  }

  private async processRenderQueue(): Promise<void> {
    if (this.renderingQueue || !this.page) return;
    const generation = this.generation;
    this.renderingQueue = true;

    try {
      while (this.renderRequested && generation === this.generation && this.page) {
        this.renderRequested = false;
        await this.renderPage(this.page);
      }
      if (generation === this.generation) this.rendering = false;
    } catch (error) {
      this.handleRenderError(error, generation);
    } finally {
      this.renderingQueue = false;
      if (this.renderRequested) this.requestRender();
    }
  }

  private async renderPage(page: PDFPageProxy): Promise<void> {
    const canvas = this.canvas?.nativeElement;
    const container = canvas?.parentElement;
    if (!canvas || !container) return;

    const original = page.getViewport({ scale: 1 });
    const width = Math.max(280, container.clientWidth - 36);
    const cssScale = width / original.width;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const viewport = page.getViewport({ scale: cssScale * pixelRatio });
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D indisponible.');

    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    canvas.style.width = `${Math.floor(viewport.width / pixelRatio)}px`;
    canvas.style.height = `${Math.floor(viewport.height / pixelRatio)}px`;
    this.renderTask = page.render({ canvas, canvasContext: context, viewport });
    await this.renderTask.promise;
    this.renderTask = null;
  }

  private handleRenderError(error: unknown, generation: number): void {
    if (generation !== this.generation || this.isCancellation(error)) return;
    this.rendering = false;
    this.internalError = 'Le document ne peut pas être affiché.';
    this.renderError.emit(error);
  }

  private destroyDocument(): void {
    this.renderTask?.cancel();
    this.renderTask = null;
    if (this.loadingTask) void this.loadingTask.destroy();
    else if (this.pdf) void this.pdf.destroy();
    this.loadingTask = null;
    this.pdf = null;
    this.page = null;
  }

  private revokeObjectUrl(): void {
    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
    this.objectUrl = '';
  }

  private isCancellation(error: unknown): boolean {
    return error instanceof Error && error.name === 'RenderingCancelledException';
  }
}
