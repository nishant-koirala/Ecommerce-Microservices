import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';

import { Role, UserResponse } from '../../core/models/auth';
import { UserService } from '../../core/services/user.service';
import { BadgeComponent, BadgeTone } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';

type SortKey = 'email' | 'name';

const ROLE_TONE: Record<Role, BadgeTone> = {
  ADMIN: 'accent',
  USER: 'neutral',
};

@Component({
  selector: 'app-users-admin',
  standalone: true,
  imports: [BadgeComponent, ButtonComponent, SkeletonComponent],
  template: `
    <div class="space-y-4">
      @if (loading()) {
        <div class="flex flex-col gap-4">
          <app-skeleton shape="h-16 w-full rounded-lg" />
          <app-skeleton shape="h-16 w-full rounded-lg" />
          <app-skeleton shape="h-16 w-full rounded-lg" />
        </div>
      } @else {
        <div class="flex flex-wrap items-center gap-3">
          <input #search type="search" placeholder="Search email or name…"
            (input)="query.set(search.value); resetPage()"
            class="w-64 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none placeholder:text-neutral-500 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500/20" />
        </div>

        @if (paged().length === 0) {
          <div class="rounded-lg border border-dashed border-neutral-700 py-24 text-center">
            <p class="font-medium text-neutral-100">No users match your search</p>
            <p class="mt-1 text-sm text-neutral-500">Try a different email or name.</p>
          </div>
        } @else {
          <div class="overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-900">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left text-xs uppercase tracking-wider text-neutral-500">
                  <th class="px-5 py-4 font-semibold">
                    <button type="button" (click)="sortBy('email')" class="inline-flex items-center gap-1 uppercase tracking-wider hover:text-neutral-100">
                      Email {{ sortIndicator('email') }}
                    </button>
                  </th>
                  <th class="px-5 py-4 font-semibold">
                    <button type="button" (click)="sortBy('name')" class="inline-flex items-center gap-1 uppercase tracking-wider hover:text-neutral-100">
                      Name {{ sortIndicator('name') }}
                    </button>
                  </th>
                  <th class="px-5 py-4 font-semibold">Role</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-800">
                @for (user of paged(); track user.id) {
                  <tr class="text-neutral-300 transition-colors hover:bg-neutral-800/40">
                    <td class="px-5 py-4 font-medium text-neutral-50">{{ user.email }}</td>
                    <td class="px-5 py-4">{{ user.firstName }} {{ user.lastName }}</td>
                    <td class="px-5 py-4">
                      <app-badge [tone]="ROLE_TONE[user.role]">{{ user.role }}</app-badge>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="flex items-center justify-between text-sm text-neutral-500">
            <span>Showing {{ paged().length }} of {{ sorted().length }} user{{ sorted().length === 1 ? '' : 's' }}</span>
            <div class="flex items-center gap-1">
              <app-button size="sm" variant="outline" [disabled]="page() <= 1" (click)="page.set(page() - 1)">Prev</app-button>
              <span class="px-2 tabular-nums text-neutral-100">Page {{ page() }} / {{ pageCount() }}</span>
              <app-button size="sm" variant="outline" [disabled]="page() >= pageCount()" (click)="page.set(page() + 1)">Next</app-button>
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class UsersAdminComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly users = signal<UserResponse[]>([]);

  readonly query = signal('');
  readonly sortKey = signal<SortKey>('email');
  readonly sortDir = signal<'asc' | 'desc'>('asc');
  readonly page = signal(1);
  readonly pageSize = 10;

  readonly ROLE_TONE = ROLE_TONE;

  readonly filtered = computed(() => {
    const q = this.query().toLowerCase();
    return this.users().filter((u) => {
      if (!q) return true;
      return (
        u.email.toLowerCase().includes(q) ||
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q)
      );
    });
  });

  readonly sorted = computed(() => {
    const dir = this.sortDir() === 'asc' ? 1 : -1;
    const key = this.sortKey();
    return [...this.filtered()].sort((a, b) => {
      if (key === 'email') return a.email.localeCompare(b.email) * dir;
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return nameA.localeCompare(nameB) * dir;
    });
  });

  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.sorted().length / this.pageSize)));
  readonly paged = computed(() => {
    const safePage = Math.min(this.page(), this.pageCount());
    const start = (safePage - 1) * this.pageSize;
    return this.sorted().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.userService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef), take(1))
      .subscribe({
        next: (users) => {
          this.users.set(users);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  sortBy(key: SortKey): void {
    if (this.sortKey() === key) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortKey.set(key);
      this.sortDir.set('asc');
    }
    this.resetPage();
  }

  sortIndicator(key: SortKey): string {
    if (this.sortKey() !== key) return '↕';
    return this.sortDir() === 'asc' ? '↑' : '↓';
  }

  resetPage(): void {
    this.page.set(1);
  }
}
