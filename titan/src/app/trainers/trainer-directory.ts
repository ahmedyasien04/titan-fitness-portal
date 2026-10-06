import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BranchService, Filters, Trainer, TrainerService } from '../core/services';
import { ClickOutside, HighlightPipe, Paginator, StatusBadge } from '../shared/shared';
import { FilterDialog, FilterGroup } from '../shared/filter-dialog';
@Component({
  selector: 'app-trainer-directory', imports: [RouterLink, StatusBadge, Paginator, HighlightPipe, ClickOutside, FilterDialog],
  template: `
  <div class="row top-row"><div><h1>Trainer Directory</h1><p class="sub">Manage and view all trainers.</p></div>
    <div class="row"><button class="btn-o sm" (click)="filtering.set(true)">☰ &nbsp;Filter</button><a class="btn auto sm" routerLink="/trainers/new">+ &nbsp;Add Trainer</a></div></div>
  <div class="card flush dir"><table><thead><tr>
    @for (c of cols; track c.k) { <th class="srt" (click)="sort(c.k)">{{ c.l }}{{ arrow(c.k) }}</th> }<th class="r">ACTIONS</th></tr></thead><tbody>
  @if (loading()) { <tr><td colspan="6">Loading…</td></tr> }
  @for (t of sorted(); track t.id) {
    <tr><td><div class="who"><span class="av">{{ initials(t.name) }}</span><a [routerLink]="['/trainers', t.id]" [innerHTML]="t.name | highlight: branch.search()"></a></div></td>
      <td>#{{ t.id }}</td><td>{{ t.specialty }}</td><td>{{ t.branch }}</td><td><app-status-badge [status]="t.isActive ? 'Active' : 'Inactive'" /></td>
      <td class="r rel" (appClickOutside)="open() === t.id && open.set('')"><button class="dots" (click)="open.set(t.id)">⋮</button>
        @if (open() === t.id) { <div class="menu"><a [routerLink]="['/trainers', t.id]">View Trainer</a><a [routerLink]="['/trainers', t.id, 'edit']">Update Trainer</a></div> }</td></tr>
  } @empty { @if (!loading()) { <tr><td colspan="6">No trainers found.</td></tr> } }
  </tbody></table>
  <div class="row foot-r"><small>Showing 1 to {{ items().length }} of {{ total() }} entries</small><app-paginator [total]="total()" [page]="page()" (pageChange)="page.set($event)" /></div></div>
  @if (filtering()) { <app-filter-dialog title="Filter Trainers" [groups]="groups" [initial]="filters()" (closed)="filtering.set(false)" (filtersApplied)="filters.set($event); page.set(1); filtering.set(false)" /> }`,
})
export class TrainerDirectory {
  svc = inject(TrainerService); branch = inject(BranchService);
  page = signal(1); items = signal<Trainer[]>([]); total = signal(0); loading = signal(false); open = signal('');
  filtering = signal(false); filters = signal<Filters>({}); key = signal('name'); desc = signal(false);
  cols = [{ k: 'name', l: 'TRAINER NAME' }, { k: 'id', l: 'ID' }, { k: 'specialty', l: 'SPECIALTY' }, { k: 'branch', l: 'BRANCH' }, { k: 'isActive', l: 'STATUS' }];
  groups: FilterGroup[] = [
    { key: 'branch', label: 'Branch', type: 'multi', options: ['Downtown', 'Uptown'] },
    { key: 'specialty', label: 'Specialty', type: 'multi', options: ['HIIT / Strength', 'Yoga / Mobility', 'Cycling', 'Pilates'] },
    { key: 'status', label: 'Status', type: 'multi', options: ['Active', 'Inactive'] }];
  sorted = computed(() => { const k = this.key() as keyof Trainer, d = this.desc() ? -1 : 1; return [...this.items()].sort((a, b) => (a[k] > b[k] ? 1 : a[k] < b[k] ? -1 : 0) * d); });
  initials = (n: string) => n.split(' ').map(w => w[0]).join('').slice(0, 2);
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
