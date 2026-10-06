import { Component, computed, effect, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BranchService, Filters, Plan, PlanService } from '../core/services';
import { ClickOutside, FreezeAllowancePipe, HighlightPipe, Paginator, StatusBadge } from '../shared/shared';
import { FilterDialog, FilterGroup } from '../shared/filter-dialog';
@Component({
  selector: 'app-plan-catalogue', imports: [RouterLink, StatusBadge, Paginator, HighlightPipe, ClickOutside, FilterDialog, CurrencyPipe, FreezeAllowancePipe],
  template: `
  <div class="row top-row"><div><h1>Plan Catalogue</h1><p class="sub">Manage and view all membership plans.</p></div>
    <div class="row"><button class="btn-o sm" (click)="filtering.set(true)">☰ &nbsp;Filter</button><a class="btn auto sm" routerLink="/plans/new">+ &nbsp;Add Plan</a></div></div>
  <div class="card flush dir"><table><thead><tr>
    @for (c of cols; track c.k) { <th [class.srt]="c.k !== 'fa'" (click)="c.k !== 'fa' && sort(c.k)">{{ c.l }}{{ arrow(c.k) }}</th> }<th class="r">ACTIONS</th></tr></thead><tbody>
  @if (loading()) { <tr><td colspan="8">Loading…</td></tr> }
  @for (p of sorted(); track p.id) {
    <tr><td><a [routerLink]="['/plans', p.id]" [innerHTML]="p.name | highlight: branch.search()"></a></td><td>{{ p.price | currency }}</td>
      <td>{{ p.months }} month{{ p.months === 1 ? '' : 's' }}</td><td>{{ p.freezeDays | freezeAllowance: p.freezes }}</td><td>{{ p.guests }}</td><td>{{ p.access }}</td>
      <td><app-status-badge [status]="p.published ? 'Published' : 'Retired'" /></td>
      <td class="r rel" (appClickOutside)="open() === p.id && open.set('')"><button class="dots" (click)="open.set(p.id)">⋮</button>
        @if (open() === p.id) { <div class="menu"><a [routerLink]="['/plans', p.id]">View Plan</a><a [routerLink]="['/plans', p.id, 'edit']">Update Plan</a></div> }</td></tr>
  } @empty { @if (!loading()) { <tr><td colspan="8">No plans found.</td></tr> } }
  </tbody></table>
  <div class="row foot-r"><small>Showing 1 to {{ items().length }} of {{ total() }} entries</small><app-paginator [total]="total()" [page]="page()" (pageChange)="page.set($event)" /></div></div>
  @if (filtering()) { <app-filter-dialog title="Filter Plans" [groups]="groups" [initial]="filters()" (closed)="filtering.set(false)" (filtersApplied)="filters.set($event); page.set(1); filtering.set(false)" /> }`,
})
export class PlanCatalogue {
  svc = inject(PlanService); branch = inject(BranchService);
  page = signal(1); items = signal<Plan[]>([]); total = signal(0); loading = signal(false); open = signal('');
  filtering = signal(false); filters = signal<Filters>({}); key = signal('name'); desc = signal(false);
  cols = [{ k: 'name', l: 'PLAN NAME' }, { k: 'price', l: 'PRICE' }, { k: 'months', l: 'DURATION' }, { k: 'fa', l: 'FREEZE ALLOWANCE' }, { k: 'guests', l: 'GUEST PASSES' }, { k: 'access', l: 'ACCESS' }, { k: 'published', l: 'STATUS' }];
  groups: FilterGroup[] = [
    { key: 'duration', label: 'Duration', type: 'multi', options: ['1 month', '3 months', '12 months'] },
    { key: 'access', label: 'Access', type: 'single', options: ['Any', 'All branches', 'Home branch only'] },
    { key: 'price', label: 'Price range', type: 'range' },
    { key: 'status', label: 'Status', type: 'multi', options: ['Published', 'Retired'] }];
  sorted = computed(() => { const k = this.key() as keyof Plan, d = this.desc() ? -1 : 1; return [...this.items()].sort((a, b) => (a[k] > b[k] ? 1 : a[k] < b[k] ? -1 : 0) * d); });
  sort(k: string) { this.desc.set(this.key() === k ? !this.desc() : false); this.key.set(k); }
  arrow(k: string) { return this.key() === k ? (this.desc() ? ' ↓' : ' ↑') : ''; }
  constructor() {
    effect(() => {
      this.loading.set(true);
      this.svc.list(this.page(), this.branch.search(), this.filters()).subscribe({
        next: r => { this.items.set(r.items); this.total.set(r.total); this.loading.set(false); }, error: () => this.loading.set(false) });
    });
  }
}
