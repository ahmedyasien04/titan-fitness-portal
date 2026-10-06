import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BranchService, ClassService } from '../core/services';
import { ClickOutside } from '../shared/shared';
import { AddClassDialog } from './add-class-dialog';
@Component({
  selector: 'app-classes', imports: [RouterLink, FormsModule, AddClassDialog, ClickOutside],
  template: `
  <div class="row"><div><h1>Class Schedule</h1><p class="sub">{{ isToday() ? "Manage and monitor today's sessions." : 'Sessions for ' + date() }}</p></div>
    <div class="row"><select [ngModel]="branchFilter()" (ngModelChange)="branchFilter.set($event)"><option>All Branches</option><option>Downtown</option><option>Uptown</option></select>
      <input type="date" [ngModel]="date()" (ngModelChange)="date.set($event)" /><button class="btn auto" (click)="adding.set(true)">Add Class</button></div></div>
  <div class="grid">
    <section class="card flush"><div class="row head"><b>{{ isToday() ? "Today's Sessions" : date() }}</b><span class="count">{{ shown().length }} Classes</span></div>
      @for (c of shown(); track c.id) {
        <div class="class-row" [class.live]="c.inProgress">
          <div class="time"><b>{{ hh(c.time) }}</b><small>{{ ap(c.time) }}</small></div>
          <div class="grow"><b>{{ c.name }}</b> @if (c.enrolled / c.capacity >= 0.9) { <i class="dot"></i> }
            <div class="meta">♙ {{ c.trainer }} &nbsp;•&nbsp; ⌖ {{ c.studio }}@if (branchFilter() === 'All Branches') { • {{ c.branch }} }</div></div>
          @if (c.inProgress) { <span class="badge navy">IN PROGRESS</span> }
          <div class="fill"><b>{{ c.enrolled }} / {{ c.capacity }}</b><div class="bar"><span [class.red]="c.enrolled / c.capacity >= 0.9" [style.width.%]="c.enrolled / c.capacity * 100"></span></div>
            @if (c.enrolled >= c.capacity) { <small class="wl">Waitlist: 3</small> }</div>
          <span class="rel" (appClickOutside)="menu() === c.id && menu.set(0)"><button class="dots" (click)="menu.set(c.id)">⋮</button>
            @if (menu() === c.id) { <div class="menu"><button>View Class</button><button>Edit Class</button><a [routerLink]="['/classes', c.id, 'book']">Book Session</a><button>Cancel Class</button></div> }</span>
        </div>
      } @empty { <p class="pad">No classes scheduled for this day.</p> }
    </section>
    <aside class="card"><h3>Capacity Overview</h3><div class="kpis">
      <div class="card"><h1>{{ bookings() }}</h1><small>Total Bookings</small></div><div class="card"><h1>{{ fillRate() }}%</h1><small>Avg Fill Rate</small></div></div></aside>
  </div>
  @if (adding()) { <app-add-class-dialog (closed)="adding.set(false)" (saved)="adding.set(false); reload()" /> }`,
})
export class Classes {
  svc = inject(ClassService); b = inject(BranchService);
  date = signal(new Date().toISOString().slice(0, 10)); branchFilter = signal('All Branches');
  list = signal<any[]>([]); adding = signal(false); menu = signal(0);
  isToday = computed(() => this.date() === new Date().toISOString().slice(0, 10));
  shown = computed(() => this.list().filter(c => this.branchFilter() === 'All Branches' || c.branch === this.branchFilter()));
  bookings = computed(() => this.shown().reduce((s, c) => s + c.enrolled, 0));
  fillRate = computed(() => { const t = this.shown().reduce((s, c) => s + c.capacity, 0); return t ? Math.round(this.bookings() / t * 100) : 0; });
  constructor() { effect(() => { this.date(); this.reload(); }); }
  reload() { this.svc.list(this.date()).subscribe(r => this.list.set(r)); }
  hh = (t: string) => { const h = +t.slice(0, 2) % 12 || 12; return `${String(h).padStart(2, '0')}:${t.slice(3)}`; };
  ap = (t: string) => (+t.slice(0, 2) >= 12 ? 'PM' : 'AM');
}
