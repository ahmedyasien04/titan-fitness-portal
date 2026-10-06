import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CheckInService, ClassService, BranchService } from '../core/services';
import { toSignal } from '@angular/core/rxjs-interop';
import { HighlightPipe, hh, ap } from '../shared/shared';
@Component({
  selector: 'app-dashboard', imports: [RouterLink, HighlightPipe],
  template: `
  <h1>Dashboard</h1><p class="sub">Live floor statistics and quick actions.</p>
  <div class="grid">
    <section>
      <div class="kpis">
        <div class="card kpi"><div class="row"><small class="cap">CHECK-INS TODAY</small><span class="ic">⚇</span></div><h1>{{ checkIns.count() }}</h1><small class="up">+12% vs last week</small></div>
        <div class="card kpi"><div class="row"><small class="cap">ACTIVE MEMBERS</small><span class="ic">⚇</span></div><h1>1,240</h1><small class="up">Currently on floor: 45</small></div>
      </div>
      <div class="card flush"><div class="row head white"><h3>Upcoming Classes</h3><a class="lnk" routerLink="/classes">View Schedule</a></div>
        @for (c of filtered(); track c.id) {
          <div class="class-row"><div class="t"><b>{{ hh(c.time) }}</b><small>{{ ap(c.time) }}</small></div>
            <div class="grow"><b class="big" [innerHTML]="c.name | highlight: q()"></b><div class="meta">{{ c.studio }} • {{ c.trainer }}</div></div>
            <span class="meta">{{ c.enrolled }}/{{ c.capacity }} Enrolled</span>
            @switch (state(c)) { @case ('Full') { <span class="badge expired">Full</span> } @case ('Active') { <span class="badge active green">Active</span> } @default { <span class="badge up-b">Upcoming</span> } }</div>
        } @empty { <p class="pad">No classes match.</p> }
      </div></section>
    <aside class="card"><h3 class="qh">Quick Actions</h3>
      <a class="qa" routerLink="/members"><span class="ib">⚇</span><div><b>New Member</b><small>Start enrollment process</small></div></a>
      <a class="qa"><span class="ib">⌗</span><div><b>Manual Check-in</b><small>Verify member entry</small></div></a>
      <a class="qa" routerLink="/classes"><span class="ib">▣</span><div><b>Register Class</b><small>Book member into session</small></div></a></aside>
  </div>`,
})
export class Dashboard {
  hh = hh; ap = ap; checkIns = inject(CheckInService); q = signal('');
  classes = toSignal(inject(ClassService).upcoming(inject(BranchService).branch()), { initialValue: [] as any[] });
  filtered = computed(() => this.classes().filter(c => `${c.name} ${c.trainer} ${c.studio}`.toLowerCase().includes(this.q().toLowerCase())));
  state = (c: any) => c.enrolled >= c.capacity ? 'Full' : c.inProgress ? 'Active' : 'Upcoming';
}
