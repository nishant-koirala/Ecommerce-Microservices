import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, forkJoin, map, of, switchMap, take } from 'rxjs';

import { CategoryResponse, ProductRequest, ProductResponse } from '../../core/models/product';
import { InventoryResponse } from '../../core/models/inventory';
import { CategoryService } from '../../core/services/category.service';
import { ImageService } from '../../core/services/image.service';
import { InventoryService } from '../../core/services/inventory.service';
import { ProductService } from '../../core/services/product.service';
import { ToastService } from '../../core/services/toast.service';
import { formatPrice } from '../../core/utils/format';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ImageUploadControl } from '../../shared/components/image-upload/image-upload.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';

const INPUT_CLASS =
  'w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50';

type StockMode = 'create' | 'restock';
type SortKey = 'id' | 'name' | 'sku' | 'price';

@Component({
  selector: 'app-products-admin',
  standalone: true,
  imports: [ReactiveFormsModule, BadgeComponent, ButtonComponent, ImageUploadControl, SkeletonComponent],
  template: `
    <div class="space-y-4">
      <div class="grid items-start gap-8 lg:grid-cols-[1fr_340px]">
        <!-- Product list -->
        <section aria-label="Product list">
          @if (loading()) {
            <div class="flex flex-col gap-4">
              <app-skeleton shape="h-16 w-full rounded-2xl" />
              <app-skeleton shape="h-16 w-full rounded-2xl" />
              <app-skeleton shape="h-16 w-full rounded-2xl" />
            </div>
          } @else {
            <input #search type="search" placeholder="Search products…"
              (input)="query.set(search.value); resetPage()"
              class="w-64 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100" />
            @if (paged().length === 0) {
              <div class="rounded-lg border border-dashed border-neutral-300 py-24 text-center dark:border-neutral-700">
                <p class="font-medium text-neutral-900 dark:text-neutral-50">No products match your search</p>
                <p class="mt-1 text-sm text-neutral-500">Try a different name, SKU, or category.</p>
              </div>
            } @else {
            <div class="overflow-x-auto rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-left text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    <th class="px-5 py-4 font-semibold">
                      <button type="button" (click)="sortBy('name')" class="inline-flex items-center gap-1 uppercase tracking-wider hover:text-neutral-900 dark:hover:text-neutral-50">
                        Product {{ sortIndicator('name') }}
                      </button>
                    </th>
                    <th class="px-5 py-4 font-semibold">
                      <button type="button" (click)="sortBy('sku')" class="inline-flex items-center gap-1 uppercase tracking-wider hover:text-neutral-900 dark:hover:text-neutral-50">
                        SKU {{ sortIndicator('sku') }}
                      </button>
                    </th>
                    <th class="px-5 py-4 font-semibold">Category</th>
                    <th class="px-5 py-4 text-right font-semibold">
                      <button type="button" (click)="sortBy('price')" class="inline-flex items-center gap-1 uppercase tracking-wider hover:text-neutral-900 dark:hover:text-neutral-50">
                        Price {{ sortIndicator('price') }}
                      </button>
                    </th>
                    <th class="px-5 py-4 font-semibold">Stock</th>
                    <th class="px-5 py-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800">
                  @for (product of paged(); track product.id) {
                    @let inv = stock()[product.id];
                    <tr class="text-neutral-700 dark:text-neutral-200">
                      <td class="px-5 py-3">
                        <div class="flex min-w-0 items-center gap-3">
                          <span class="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
                            <img [src]="image(product)" [alt]="product.name" class="size-10 object-cover" />
                          </span>
                          <span class="min-w-0 truncate font-medium text-neutral-900 dark:text-neutral-50">{{ product.name }}</span>
                        </div>
                      </td>
                      <td class="px-5 py-3 whitespace-nowrap text-xs text-neutral-500 dark:text-neutral-400">{{ product.sku }}</td>
                      <td class="px-5 py-3">
                        <app-badge tone="accent">{{ product.category.name }}</app-badge>
                      </td>
                      <td class="px-5 py-3 text-right font-medium text-neutral-900 dark:text-neutral-50">{{ formatPrice(product.price) }}</td>
                      <td class="px-5 py-3">
                        @if (inv) {
                          <p class="text-xs text-neutral-500 dark:text-neutral-400">
                            {{ inv.quantityAvailable }} available
                            @if (inv.quantityReserved > 0) {
                              · {{ inv.quantityReserved }} reserved
                            }
                          </p>
                        } @else {
                          <p class="text-xs text-neutral-500 dark:text-neutral-400">No stock</p>
                        }
                        @if (stockEdit()?.id === product.id) {
                          <div class="mt-1.5 flex items-center gap-1.5">
                            <input #qty type="number" min="1" placeholder="Qty"
                              class="w-20 rounded-lg border border-neutral-300 bg-white px-2 py-1 text-xs text-neutral-900 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50" />
                            <app-button size="sm" [busy]="stockBusy() === product.id" (click)="saveStock(product, qty.valueAsNumber)">Save</app-button>
                          </div>
                        } @else {
                          <div class="mt-1.5">
                            <app-button size="sm" variant="outline" (click)="startStockEdit(product)">
                              {{ inv ? 'Restock' : 'Create stock' }}
                            </app-button>
                          </div>
                        }
                      </td>
                      <td class="px-5 py-3 text-right">
                        <div class="flex justify-end gap-2">
                          <app-button size="sm" variant="outline" (click)="editProduct(product)">Edit</app-button>
                          <app-button
                            size="sm"
                            variant="outline"
                            tone="danger"
                            [busy]="deleteBusy() === product.id"
                            (click)="confirmDelete(product)"
                          >
                            {{ confirmingDelete() === product.id ? 'Confirm' : 'Delete' }}
                          </app-button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <div class="flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400">
              <span>Showing {{ paged().length }} of {{ sorted().length }} product{{ sorted().length === 1 ? '' : 's' }}</span>
              <div class="flex items-center gap-1">
                <app-button size="sm" variant="outline" [disabled]="page() <= 1" (click)="page.set(page() - 1)">Prev</app-button>
                <span class="px-2 tabular-nums text-neutral-900 dark:text-neutral-50">Page {{ page() }} / {{ pageCount() }}</span>
                <app-button size="sm" variant="outline" [disabled]="page() >= pageCount()" (click)="page.set(page() + 1)">Next</app-button>
              </div>
            </div>
            }
          }
        </section>

        <!-- Create product form -->
        <aside class="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 class="font-display text-lg font-semibold text-neutral-900 dark:text-neutral-50">{{ editingProduct() ? 'Edit product' : 'Add a product' }}</h2>
          <form [formGroup]="form" (ngSubmit)="submitProduct()" novalidate class="mt-4 space-y-4">
            <div>
              <label for="p-name" class="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Name</label>
              <input id="p-name" formControlName="name" type="text" placeholder="Copper Mug Set" class="${INPUT_CLASS}" />
            </div>
            <div>
              <label for="p-description" class="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Description</label>
              <textarea id="p-description" formControlName="description" rows="3" placeholder="Short description…" class="${INPUT_CLASS}"></textarea>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label for="p-price" class="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Price</label>
                <input id="p-price" formControlName="price" type="number" step="0.01" min="0.01" placeholder="29.99" class="${INPUT_CLASS}" />
              </div>
              <div>
                <label for="p-sku" class="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">SKU</label>
                <input id="p-sku" formControlName="sku" type="text" placeholder="ATL-HL-049" class="${INPUT_CLASS}" />
              </div>
            </div>
            <div>
              <label for="p-image" class="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Image</label>
              <app-image-upload id="p-image" formControlName="imageUrl" />
            </div>
            <div>
              <label for="p-category" class="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Category</label>
              <select id="p-category" formControlName="categoryId" class="${INPUT_CLASS}">
                <option [ngValue]="null">Select a category</option>
                @for (category of categories(); track category.id) {
                  <option [ngValue]="category.id">{{ category.name }}</option>
                }
              </select>
            </div>
            <div class="flex gap-2">
              <app-button type="submit" [busy]="submitting()" [disabled]="submitting() || form.invalid" [fullWidth]="true">
                {{ editingProduct() ? 'Save changes' : 'Create product' }}
              </app-button>
              @if (editingProduct()) {
                <app-button type="button" variant="outline" (click)="cancelEdit()">Cancel</app-button>
              }
            </div>
          </form>
        </aside>
      </div>
    </div>
  `,
})
export class ProductsAdminComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly inventoryService = inject(InventoryService);
  private readonly imageService = inject(ImageService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly products = signal<ProductResponse[]>([]);
  readonly categories = signal<CategoryResponse[]>([]);
  readonly stock = signal<Record<number, InventoryResponse | null>>({});
  readonly stockEdit = signal<{ id: number; mode: StockMode } | null>(null);
  readonly stockBusy = signal<number | null>(null);
  readonly editingProduct = signal<ProductResponse | null>(null);
  readonly confirmingDelete = signal<number | null>(null);
  readonly deleteBusy = signal<number | null>(null);

  readonly query = signal('');
  readonly sortKey = signal<SortKey>('name');
  readonly sortDir = signal<'asc' | 'desc'>('asc');
  readonly page = signal(1);
  readonly pageSize = 10;

  readonly filtered = computed(() => {
    const q = this.query().toLowerCase();
    return this.products().filter((p) => {
      if (!q) return true;
      return p.name.toLowerCase().includes(q)
        || p.sku.toLowerCase().includes(q)
        || p.category.name.toLowerCase().includes(q);
    });
  });

  readonly sorted = computed(() => {
    const dir = this.sortDir() === 'asc' ? 1 : -1;
    const key = this.sortKey();
    return [...this.filtered()].sort((a, b) => {
      if (key === 'name') return a.name.localeCompare(b.name) * dir;
      if (key === 'sku') return a.sku.localeCompare(b.sku) * dir;
      if (key === 'price') return (a.price - b.price) * dir;
      return (a.id - b.id) * dir;
    });
  });

  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.sorted().length / this.pageSize)));
  readonly paged = computed(() => {
    const safePage = Math.min(this.page(), this.pageCount());
    const start = (safePage - 1) * this.pageSize;
    return this.sorted().slice(start, start + this.pageSize);
  });

  sortBy(key: SortKey): void {
    if (this.sortKey() === key) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortKey.set(key);
      this.sortDir.set('asc');
    }
    this.page.set(1);
  }

  sortIndicator(key: SortKey): string {
    if (this.sortKey() !== key) return '↕';
    return this.sortDir() === 'asc' ? '↑' : '↓';
  }

  resetPage(): void {
    this.page.set(1);
  }

  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true }),
    price: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
    sku: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    imageUrl: new FormControl('', { nonNullable: true }),
    categoryId: new FormControl<number | null>(null, [Validators.required]),
  });

  formatPrice = formatPrice;

  ngOnInit(): void {
    this.categoryService
      .getCategories()
      .pipe(takeUntilDestroyed(this.destroyRef), take(1))
      .subscribe((categories) => this.categories.set(categories));
    this.loadProducts();
  }

  image(product: ProductResponse): string {
    return this.imageService.product(product, 128);
  }

  startStockEdit(product: ProductResponse): void {
    this.stockEdit.set({ id: product.id, mode: this.stock()[product.id] ? 'restock' : 'create' });
  }

  saveStock(product: ProductResponse, qty: number): void {
    const edit = this.stockEdit();
    if (!edit || !qty || qty < 1 || this.stockBusy() !== null) {
      return;
    }
    this.stockBusy.set(product.id);
    const call =
      edit.mode === 'create'
        ? this.inventoryService.create({ productId: product.id, quantityAvailable: qty })
        : this.inventoryService.restock(product.id, qty);
    call
      .pipe(takeUntilDestroyed(this.destroyRef), take(1))
      .subscribe({
        next: (inv) => {
          this.stock.update((record) => ({ ...record, [product.id]: inv }));
          this.stockBusy.set(null);
          this.stockEdit.set(null);
          this.toast.success(edit.mode === 'create' ? 'Inventory created' : 'Stock restocked');
        },
        error: () => {
          this.stockBusy.set(null);
        },
      });
  }

  editProduct(product: ProductResponse): void {
    this.editingProduct.set(product);
    this.stockEdit.set(null);
    this.confirmingDelete.set(null);
    this.form.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      sku: product.sku,
      imageUrl: product.imageUrl || '',
      categoryId: product.category.id,
    });
  }

  cancelEdit(): void {
    this.editingProduct.set(null);
    this.resetForm();
  }

  submitProduct(): void {
    if (this.submitting() || this.form.invalid) {
      return;
    }
    const raw = this.form.getRawValue();
    const request: ProductRequest = {
      name: raw.name,
      description: raw.description,
      price: raw.price!,
      sku: raw.sku,
      imageUrl: raw.imageUrl || null,
      categoryId: raw.categoryId!,
    };

    const editing = this.editingProduct();
    this.submitting.set(true);

    const call = editing
      ? this.productService.update(editing.id, request)
      : this.productService.create(request);

    call
      .pipe(takeUntilDestroyed(this.destroyRef), take(1))
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.editingProduct.set(null);
          this.resetForm();
          this.toast.success(editing ? 'Product updated' : 'Product created');
          this.loadProducts();
        },
        error: () => {
          this.submitting.set(false);
        },
      });
  }

  confirmDelete(product: ProductResponse): void {
    if (this.confirmingDelete() !== product.id) {
      this.confirmingDelete.set(product.id);
      return;
    }
    this.confirmingDelete.set(null);
    this.deleteBusy.set(product.id);
    // Delete the inventory row first (when present) so deleting a product
    // doesn't leave an orphaned inventory record.
    const inventory = this.stock()[product.id];
    const deleteInventory$: Observable<void> = inventory
      ? this.inventoryService.deleteByProduct(product.id)
      : of(undefined);
    deleteInventory$
      .pipe(
        switchMap(() => this.productService.remove(product.id)),
        takeUntilDestroyed(this.destroyRef),
        take(1),
      )
      .subscribe({
        next: () => {
          this.deleteBusy.set(null);
          if (this.editingProduct()?.id === product.id) {
            this.editingProduct.set(null);
            this.resetForm();
          }
          this.toast.success('Product deleted');
          this.loadProducts();
        },
        error: () => {
          this.deleteBusy.set(null);
        },
      });
  }

  private resetForm(): void {
    this.form.reset({
      name: '',
      description: '',
      price: null,
      sku: '',
      imageUrl: '',
      categoryId: null,
    });
  }

  private loadProducts(): void {
    this.productService
      .getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        take(1),
        switchMap((products) =>
          this.loadStock(products).pipe(map((entries) => ({ products, entries }))),
        ),
      )
      .subscribe(({ products, entries }) => {
        const record: Record<number, InventoryResponse | null> = {};
        for (const { productId, inventory } of entries) {
          record[productId] = inventory;
        }
        this.products.set(products);
        this.stock.set(record);
        this.loading.set(false);
        this.confirmingDelete.set(null);
      });
  }

  private loadStock(products: ProductResponse[]): Observable<{ productId: number; inventory: InventoryResponse | null }[]> {
    return forkJoin(
      products.map((product) =>
        this.inventoryService.getByProduct(product.id).pipe(
          map((inventory) => ({ productId: product.id, inventory })),
        ),
      ),
    );
  }
}
