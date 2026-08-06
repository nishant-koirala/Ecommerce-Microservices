import { Component, inject, signal, viewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { take } from 'rxjs';

import { ImageUploadService } from '../../../core/services/image-upload.service';
import { ToastService } from '../../../core/services/toast.service';
import { ButtonComponent } from '../button/button.component';

const INPUT_CLASS =
  'w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [ButtonComponent],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: ImageUploadControl, multi: true }],
  template: `
    <div class="space-y-2">
      <div class="flex items-center gap-3">
        <span
          class="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800"
        >
          @if (preview(); as p) {
            <img [src]="p" alt="Upload preview" class="size-full object-cover" />
          } @else if (value()) {
            <img [src]="value()" alt="Current image" class="size-full object-cover" />
          } @else {
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"
              class="size-6 text-neutral-400" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 15V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v10m-6-8.5L8.5 10m0 0 2 1.5m-2-1.5 2 1.5M5.5 15h9" />
            </svg>
          }
        </span>
        <div class="flex flex-col items-start gap-1.5">
          <div class="flex gap-2">
            <app-button type="button" size="sm" variant="outline" [busy]="busy()" [disabled]="busy() || disabled()" (click)="fileInput()?.click()">
              Upload image
            </app-button>
            @if (value() || preview()) {
              <app-button type="button" size="sm" variant="ghost" [disabled]="busy() || disabled()" (click)="remove()">Remove</app-button>
            }
          </div>
          <p class="text-xs text-neutral-500 dark:text-neutral-400">JPG, PNG, WEBP or GIF · max 5MB</p>
          <input #file type="file" accept="image/jpeg,image/png,image/webp,image/gif" class="hidden" (change)="onFileSelected($event)" />
        </div>
      </div>
      <div>
        <label class="mb-1.5 block text-xs font-medium text-neutral-500 dark:text-neutral-400">…or paste an image URL</label>
        <input type="url" [value]="value()" (input)="onUrlInput($event)"
          placeholder="https://images.unsplash.com/photo-…" class="${INPUT_CLASS}" />
      </div>
    </div>
  `,
})
export class ImageUploadControl implements ControlValueAccessor {
  private readonly uploadService = inject(ImageUploadService);
  private readonly toast = inject(ToastService);

  readonly busy = signal(false);
  readonly disabled = signal(false);
  readonly value = signal('');
  readonly preview = signal<string | null>(null);
  protected readonly fileInput = viewChild<HTMLInputElement>('file');

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null | undefined): void {
    this.value.set(value ?? '');
    this.preview.set(null);
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    this.preview.set(objectUrl);
    this.busy.set(true);
    this.uploadService
      .upload(file)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.busy.set(false);
          this.clearPreview(objectUrl);
          this.setValue(res.url);
          this.toast.success('Image uploaded');
        },
        error: () => {
          this.busy.set(false);
          this.clearPreview(objectUrl);
          input.value = '';
          this.toast.error('Upload failed. Try a different image.');
        },
      });
  }

  onUrlInput(event: Event): void {
    this.setValue((event.target as HTMLInputElement).value);
  }

  remove(): void {
    this.setValue('');
  }

  private setValue(value: string): void {
    this.value.set(value);
    this.onChange(value);
    this.onTouched();
  }

  private clearPreview(objectUrl: string): void {
    this.preview.set(null);
    URL.revokeObjectURL(objectUrl);
  }
}
