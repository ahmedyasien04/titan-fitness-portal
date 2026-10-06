import { Component, inject, input, signal, effect } from '@angular/core';
import { Location, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Member, MemberService } from '../core/services';
import { StatusBadge } from '../shared/shared';
@Component({
  selector: 'app-member-profile', imports: [RouterLink, StatusBadge, DatePipe, CurrencyPipe],
  template: `
  <div class="row top-row"><div class="row"><button class="sq" (click)="loc.back()">←</button><h1>Member Profile</h1></div><button class="btn-o sm">Edit Profile</button></div>
  @if (m(); as m) {
  <div class="grid prof">
    <section>
      <div class="card ctr"><span class="tr"><app-status-badge [status]="m.status" /></span><div class="photo"></div><h2>{{ m.name }}</h2><p class="sub">ID: {{ m.id }}</p>
        <ul class="contact"><li>✉ {{ m.email }}</li><li>✆ {{ m.phone }}</li><li>⌖ {{ m.address }}</li><li>▦ Joined: {{ m.joined }}</li></ul></div>
      <div class="card"><div class="row"><h3>Current Plan</h3><span>◎</span></div><hr>
        <div class="row end"><div><b class="plan">{{ m.plan }}</b><br><small>Renews: {{ m.endDate | date: 'MMM d, y' }}</small></div><div class="r"><b>{{ m.price | currency: 'USD':'symbol':'1.0-0' }}</b><br><small>/year</small></div></div>
        <a class="btn-o" [routerLink]="['/members', m.id, 'freeze']">Freeze Membership</a></div>
    </section>
    <section>
      <div class="kpis">
        <div class="card"><div class="row"><b>❄ Freezes Used</b><small>{{ m.freezesUsed }} / {{ m.freezesMax }}</small></div><div class="bar"><span [style.width.%]="(m.freezesUsed ?? 0) / (m.freezesMax ?? 1) * 100"></span></div><small class="r">{{ (m.freezesMax ?? 0) - (m.freezesUsed ?? 0) }} freeze remaining</small></div>
        <div class="card"><div class="row"><b>⚇ Guest Passes</b><small>{{ m.guests }} / {{ m.guestsMax }}</small></div><div class="bar"><span class="ind" [style.width.%]="(m.guests ?? 0) / (m.guestsMax ?? 1) * 100"></span></div><small class="r">{{ (m.guestsMax ?? 0) - (m.guests ?? 0) }} passes remaining</small></div>
      </div>
      <div class="card flush tall"><div class="row head white"><h3>Recent Activity</h3><a class="lnk">View All</a></div>
        @for (a of m.activity; track $index) { <div class="class-row"><span class="ib sq">{{ a.k === 'in' ? '⇥' : '⤡' }}</span><div class="grow"><b>{{ a.t }}</b><div class="meta">{{ a.s }}</div></div><span class="r dl">{{ a.d }}</span></div> }</div>
    </section>
  </div> } @else { <p>Member not found.</p> }`,
})
export class MemberProfile {
  id = input.required<string>(); loc = inject(Location); svc = inject(MemberService); m = signal<Member | null>(null);
  constructor() { effect(() => this.svc.get(this.id()).subscribe({ next: r => this.m.set(r), error: () => this.m.set(null) })); }
}
