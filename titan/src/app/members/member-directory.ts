import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Filters, Member, MemberService, BranchService, CheckInService, ToastService } from '../core/services';
import { ClickOutside, HighlightPipe, Paginator, StatusBadge } from '../shared/shared';
import { FilterDialog, FilterGroup } from '../shared/filter-dialog';
import { AddMemberDialog } from './add-member-dialog';
@Component({
  selector: 'app-member-directory', imports: [RouterLink, StatusBadge, Paginator, HighlightPipe, ClickOutside, FilterDialog, AddMemberDialog],
  template: `
  <div class="row top-row"><div><h1>Member Directory</h1><p class="sub">Manage and view all registered members.</p></div>
    <div class="row"><button class="btn-o sm" (click)="filtering.set(true)">☰ &nbsp;Filter</button><button class="btn auto sm" (click)="adding.set(true)">+ &nbsp;Add Member</button></div></div>
  <div class="card flush dir"><table><thead><tr><th>MEMBER NAME</th><th>ID</th><th>STATUS</th><th>BRANCH</th><th>LAST VISIT</th><th class="r">ACTIONS</th></tr></thead><tbody>
  @if (loading()) { <tr><td colspan="6">Loading…</td></tr> }
  @for (m of shown(); track m.id) {
    <tr><td><div class="who"><span class="av">{{ initials(m.name) }}</span><a [routerLink]="['/members', m.id]" [innerHTML]="m.name | highlight: branch.search()"></a></div></td>
      <td>{{ m.id }}</td><td><app-status-badge [status]="m.status" /></td><td>{{ m.branch }}</td><td>{{ m.lastVisit }}</td>
      <td class="r rel" (appClickOutside)="open() === m.id && open.set('')"><button class="dots" (click)="open.set(m.id)">⋮</button>
        @if (open() === m.id) { <div class="menu">
          <a [routerLink]="['/members', m.id]">View Profile</a>
          <button [disabled]="m.status !== 'Active'" [title]="m.status !== 'Active' ? 'Member is ' + m.status : ''" (click)="checkIn(m)">Check-In</button>
          <a routerLink="/classes">Book Class</a>
          <button [disabled]="m.status !== 'Active'" [title]="m.status !== 'Active' ? 'Member is ' + m.status : ''" (click)="router.navigate(['/members', m.id, 'freeze'])">Freeze Membership</button></div> }</td></tr>
  } @empty { @if (!loading()) { <tr><td colspan="6">No members found.</td></tr> } }
  </tbody></table>
  <div class="row foot-r"><small>Showing 1 to {{ shown().length }} of {{ total() }} entries</small><app-paginator [total]="total()" [page]="page()" (pageChange)="page.set($event)" /></div></div>
  @if (adding()) { <app-add-member-dialog (closed)="adding.set(false)" (saved)="adding.set(false); reload()" /> }
  @if (filtering()) { <app-filter-dialog title="Filter Members" [groups]="groups" [initial]="filters()" (closed)="filtering.set(false)" (filtersApplied)="filters.set($event); filtering.set(false)" /> }`,
})
export class MemberDirectory {
  svc = inject(MemberService); router = inject(Router); toast = inject(ToastService); ci = inject(CheckInService); branch = inject(BranchService);
  page = signal(1); members = signal<Member[]>([]); total = signal(0); loading = signal(false); open = signal('');
  adding = signal(false); filtering = signal(false); filters = signal<Filters>({}); tick = signal(0);
  groups: FilterGroup[] = [{ key: 'status', label: 'Status', type: 'multi', options: ['Active', 'Frozen', 'Expired'] }, { key: 'branch', label: 'Branch', type: 'multi', options: ['Downtown', 'Uptown'] }];
  shown = computed(() => this.members().filter(m => !(this.filters()['status'] ?? []).length || this.filters()['status'].includes(m.status))
    .filter(m => !(this.filters()['branch'] ?? []).length || this.filters()['branch'].includes(m.branch)));
  reload() { this.tick.update(n => n + 1); }
  initials = (n: string) => n.split(' ').map(w => w[0]).join('').slice(0, 2);
  constructor() {
    effect(() => {
      this.tick(); this.loading.set(true);
      this.svc.list(this.page(), this.branch.search(), this.branch.branch()).subscribe({
        next: r => { this.members.set(r.items); this.total.set(r.total); this.loading.set(false); },
        error: () => this.loading.set(false),
      });
    });
  }
  checkIn(m: Member) {
    this.ci.checkIn(m.id).subscribe(() => {
      const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      this.members.update(l => l.map(x => x.id === m.id ? { ...x, lastVisit: `Today, ${t}` } : x));
      this.ci.count.update(n => n + 1); this.toast.show(`${m.name} checked in at ${t}`); this.open.set('');
    });
  }
}
