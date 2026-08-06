import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, take } from 'rxjs';

import { CategoryResponse, CategoryRequest } from '../../core/models/product';
import { CategoryService } from '../../core/services/category.service';
import { ToastService } from '../../core/services/toast.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';

const INPUT_CLASS =
 'w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50';

@Component({
 selector: 'app-categories-admin',
 standalone: true,
 imports: [ReactiveFormsModule, ButtonComponent, SkeletonComponent],
 template: `
<div class="space-y-4">
<div class="grid items-start gap-8 lg:grid-cols-2">
 <!-- Category list -->
<section aria-label="Category list">
 @if (loading()) {
<div class="flex flex-col gap-4">
<app-skeleton shape="h-16 w-full rounded-2xl" />
<app-skeleton shape="h-16 w-full rounded-2xl" />
<app-skeleton shape="h-16 w-full rounded-2xl" />
</div>
 } @else {
<input #search type="search" placeholder="Search categories…"
 (input)="query.set(search.value); resetPage()"
 class="w-64 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100" />
@if (paged().length === 0) {
<div class="rounded-lg border border-dashed border-neutral-300 py-24 text-center dark:border-neutral-700">
<p class="font-medium text-neutral-900 dark:text-neutral-50">No categories match your search</p>
<p class="mt-1 text-sm text-neutral-500">Try a different name or description.</p>
</div>
} @else {
<div class="overflow-x-auto rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
<table class="w-full text-sm">
<thead>
<tr class="text-left text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
<th class="px-5 py-4 font-semibold">
<button type="button" (click)="sortBy('name')" class="inline-flex items-center gap-1 uppercase tracking-wider hover:text-neutral-900 dark:hover:text-neutral-50">
Name {{ sortIndicator('name') }}
</button>
</th>
<th class="px-5 py-4 font-semibold">Description</th>
<th class="px-5 py-4 font-semibold">Image</th>
<th class="px-5 py-4 text-right font-semibold">Actions</th>
</tr>
</thead>
<tbody class="divide-y divide-neutral-100 dark:divide-neutral-800">
 @for (category of paged(); track category.id) {
<tr class="text-neutral-700 dark:text-neutral-200">
<td class="px-5 py-4 font-medium text-neutral-900 dark:text-neutral-50">{{ category.name }}</td>
<td class="px-5 py-4">
<p class="text-xs text-neutral-500 dark:text-neutral-400">{{ category.description }}</p>
</td>
<td class="px-5 py-4">
 @if (category.imageUrl) {
<img [src]="category.imageUrl" alt="" class="h-10 w-10 object-cover rounded-lg" />
 } @else {
<span class="text-xs text-neutral-400 dark:text-neutral-500">No image</span>
 }
</td>
<td class="px-5 py-4 text-right">
<div class="flex justify-end gap-2">
<app-button size="sm" variant="outline" (click)="editCategory(category)">Edit</app-button>
<app-button size="sm" variant="outline" tone="danger" [busy]="deleteBusy() === category.id" (click)="confirmDelete(category)">Delete</app-button>
</div>
</td>
</tr>
 }
</tbody>
</table>
</div>
<div class="flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400">
<span>Showing {{ paged().length }} of {{ sorted().length }} categor{{ sorted().length === 1 ? 'y' : 'ies' }}</span>
<div class="flex items-center gap-1">
<app-button size="sm" variant="outline" [disabled]="page() <= 1" (click)="page.set(page() - 1)">Prev</app-button>
<span class="px-2 tabular-nums text-neutral-900 dark:text-neutral-50">Page {{ page() }} / {{ pageCount() }}</span>
<app-button size="sm" variant="outline" [disabled]="page() >= pageCount()" (click)="page.set(page() + 1)">Next</app-button>
</div>
</div>
}
 }
</section>

 <!-- Create/edit category form -->
<aside class="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
<h2 class="font-display text-lg font-semibold text-neutral-900 dark:text-neutral-50">{{ editingCategory() ? 'Edit category' : 'Add a category' }}</h2>
<form [formGroup]="form" (ngSubmit)="submitCategory()" novalidate class="mt-4 space-y-4">
<div>
<label for="c-name" class="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Name</label>
<input id="c-name" formControlName="name" type="text" placeholder="Electronics" class="${INPUT_CLASS}" />
</div>
<div>
<label for="c-description" class="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Description</label>
<textarea id="c-description" formControlName="description" rows="3" placeholder="Short description…" class="${INPUT_CLASS}"></textarea>
</div>
<div>
<label for="c-image" class="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Image URL</label>
<input id="c-image" formControlName="imageUrl" type="url" placeholder="https://images.unsplash.com/photo-…" class="${INPUT_CLASS}" />
</div>
<div class="flex gap-2">
<app-button type="submit" [busy]="submitting()" [disabled]="submitting() || form.invalid" [fullWidth]="true">
 {{ editingCategory() ? 'Save changes' : 'Create category' }}</app-button>
@if (editingCategory()) {
<app-button type="button" variant="outline" (click)="cancelEdit()">Cancel</app-button>
}
</div>
</form>
</aside>
</div>
</div>
 `,
})
export class CategoriesAdminComponent implements OnInit {
 private readonly categoryService = inject(CategoryService);
 private readonly toast = inject(ToastService);
 private readonly destroyRef = inject(DestroyRef);

 readonly loading = signal(true);
 readonly submitting = signal(false);
 readonly categories = signal<CategoryResponse[]>([]);
 readonly editingCategory = signal<CategoryResponse | null>(null);
 readonly deleteBusy = signal<number | null>(null);
 readonly showConfirmDelete = signal<CategoryResponse | null>(null);

 readonly query = signal('');
 readonly sortKey = signal<'name'>('name');
 readonly sortDir = signal<'asc' | 'desc'>('asc');
 readonly page = signal(1);
 readonly pageSize = 10;

 readonly filtered = computed(() => {
  const q = this.query().toLowerCase();
  return this.categories().filter((c) => {
   if (!q) return true;
   return c.name.toLowerCase().includes(q) || (c.description ?? '').toLowerCase().includes(q);
  });
 });

 readonly sorted = computed(() => {
  const dir = this.sortDir() === 'asc' ? 1 : -1;
  return [...this.filtered()].sort((a, b) => a.name.localeCompare(b.name) * dir);
 });

 readonly pageCount = computed(() => Math.max(1, Math.ceil(this.sorted().length / this.pageSize)));
 readonly paged = computed(() => {
  const safePage = Math.min(this.page(), this.pageCount());
  const start = (safePage - 1) * this.pageSize;
  return this.sorted().slice(start, start + this.pageSize);
 });

 sortBy(key: 'name'): void {
  if (this.sortKey() === key) {
   this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
  } else {
   this.sortKey.set(key);
   this.sortDir.set('asc');
  }
  this.page.set(1);
 }

 sortIndicator(key: 'name'): string {
  if (this.sortKey() !== key) return '↕';
  return this.sortDir() === 'asc' ? '↑' : '↓';
 }

 resetPage(): void {
  this.page.set(1);
 }

 readonly form = new FormGroup({
 name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
 description: new FormControl('', { nonNullable: true }),
 imageUrl: new FormControl('', { nonNullable: true }),
 });

 ngOnInit(): void {
 this.loadCategories();
 }

 private loadCategories(): void {
 this.categoryService.getCategories()
   .pipe(takeUntilDestroyed(this.destroyRef), take(1))
   .subscribe({
     next: (categories) => {
       this.categories.set(categories);
       this.loading.set(false);
     },
     error: () => {
       this.loading.set(false);
     },
   });
 }

 editCategory(category: CategoryResponse): void {
 this.editingCategory.set(category);
 this.form.patchValue({
   name: category.name,
   description: category.description,
   imageUrl: category.imageUrl || '',
 });
 }

 cancelEdit(): void {
 this.editingCategory.set(null);
 this.form.reset({
   name: '',
   description: '',
   imageUrl: '',
 });
 }

 submitCategory(): void {
 if (this.submitting() || this.form.invalid) {
   return;
 }
 const raw = this.form.getRawValue();
 const request: CategoryRequest = {
   name: raw.name,
   description: raw.description,
   imageUrl: raw.imageUrl || null,
 };

 const editing = this.editingCategory();
 this.submitting.set(true);

 const call = editing
   ? this.categoryService.update(editing.id, request)
   : this.categoryService.create(request);

 call
   .pipe(takeUntilDestroyed(this.destroyRef), take(1))
   .subscribe({
     next: () => {
       this.submitting.set(false);
       this.cancelEdit();
       this.toast.success(editing ? 'Category updated' : 'Category created');
       this.loadCategories();
     },
     error: (err) => {
       this.submitting.set(false);
       if (err.status === 400) {
         this.toast.error('Cannot delete category with products');
       }
     },
   });
 }

 confirmDelete(category: CategoryResponse): void {
 if (confirm(`Delete category "${category.name}"? This will fail if products still reference it.`)) {
   this.deleteCategory(category);
 }
 }

 deleteCategory(category: CategoryResponse): void {
 this.deleteBusy.set(category.id);
 this.categoryService.remove(category.id)
   .pipe(takeUntilDestroyed(this.destroyRef), take(1))
   .subscribe({
     next: () => {
       this.deleteBusy.set(null);
       this.toast.success('Category deleted');
       this.loadCategories();
     },
     error: (err) => {
       this.deleteBusy.set(null);
       if (err.status === 400) {
         this.toast.error('Cannot delete category with products');
       }
     },
   });
 }
}