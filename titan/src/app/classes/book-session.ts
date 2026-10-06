import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClassService, Member, MemberService, ToastService } from '../core/services';
import { StatusBadge, range12, range24 } from '../shared/shared';
@Component({
  selector: 'app-book-session', imports: [FormsModule, StatusBadge],
  template: `
  <div class="book-wrap"><div class="book card">
  @if (c(); as c) {
    <div class="row"><h1 class="navy">{{ c.name }}</h1><span class="chip">⚇ {{ c.capacity - c.enrolled }} / {{ c.capacity }} spots remaining</span></div>
    <div class="meta gap24">◔ Today, {{ r24(c.time, c.duration) }}<span>♙ Trainer: {{ c.trainer }}</span><span>⌖ {{ c.studio }}</span></div><hr>
    <label>Select Member</label>
    <input class="srch" placeholder="🔍 Search by name or ID..." [ngModel]="q()" (ngModelChange)="q.set($event)" />
    @for (m of shown(); track m.id) { <div class="pick" [class.on]="sel()?.id === m.id" (click)="sel.set(m)"><span class="av">{{ m.name.slice(0, 2) }}</span><div class="grow"><b>{{ m.name }}</b><br><small>ID: {{ m.id }}</small></div><app-status-badge [status]="m.status" /></div> }
    <label>Special Requirements / Notes (Optional)</label><textarea rows="3" placeholder="e.g., Recovering from mild shoulder injury"></textarea><hr>
    <div class="foot"><button class="btn-o" (click)="router.navigate(['/classes'])">Cancel</button><button class="btn" [disabled]="!sel()" (click)="confirm()">Confirm Booking</button></div>
  } @else { <p class="pad">Loading class…</p> }</div></div>`,
})
export class BookSession {
  id = input.required<string>(); svc = inject(ClassService); ms = inject(MemberService); router = inject(Router); toast = inject(ToastService);
  r24 = range24; c = signal<any>(null); q = signal(''); list = signal<Member[]>([]); sel = signal<Member | null>(null);
  shown = computed(() => this.q() ? this.list() : this.sel() ? [this.sel()!] : []);
  constructor() {
    effect(() => this.svc.get(this.id()).subscribe(r => this.c.set(r)));
    effect(() => this.ms.list(1, this.q(), '').subscribe(r => { this.list.set(r.items); if (!this.sel()) this.sel.set(r.items.find(m => m.status === 'Active') ?? null); }));
  }
  confirm() { this.toast.show(`${this.sel()!.name} booked into ${this.c().name}`); this.router.navigate(['/classes']); }
}
@Component({
  selector: 'app-book-member', imports: [RouterLink],
  template: `
  <div class="mbar"><div class="row gap8"><a class="sq" routerLink="/classes">←</a><b class="navy">Class Booking</b></div><span class="badge green">● Active Member</span></div>
  <div class="book-wrap"><div class="crumb">Classes &nbsp;›&nbsp; Booking</div>
  @if (c(); as c) { <div class="book card">
    <h1 class="navy">{{ c.name }}</h1><div class="meta">◔ Today, {{ r12(c.time, c.duration) }}</div><hr>
    <div class="gap24"><span class="lab">♙ <small>TRAINER</small><br>{{ c.trainer }}</span><span class="lab">▯ <small>STUDIO</small><br>{{ c.studio }}</span></div><hr>
    <div class="kpis"><div class="grey"><small class="cap">AVAILABILITY</small><p><b class="n8">{{ c.capacity - c.enrolled }}</b> spots left ({{ c.enrolled }}/{{ c.capacity }} booked)</p><div class="bar"><span [style.width.%]="c.enrolled / c.capacity * 100"></span></div></div>
      <div class="grey"><small class="cap">ELIGIBILITY STATUS</small><div class="gap8"><span class="okb">✔</span><div><b>Active Membership</b><br><small>Cleared for booking</small></div></div></div></div>
    <label>Notes for the Trainer (Optional)</label><small>Include any injuries, required modifications, or equipment needs.</small>
    <textarea rows="3" placeholder="e.g., Recovering from mild shoulder strain, need alternative exercises."></textarea><hr>
    <div class="foot"><a class="btn-o" routerLink="/classes">Cancel</a><button class="btn" (click)="confirm()">Confirm Booking ✓</button></div></div> } @else { <p class="pad">Loading class…</p> }</div>`,
})
export class BookMember {
  id = input.required<string>(); svc = inject(ClassService); router = inject(Router); toast = inject(ToastService);
  r12 = range12; c = signal<any>(null);
  constructor() { effect(() => this.svc.get(this.id()).subscribe(r => this.c.set(r))); }
  confirm() { this.toast.show('Booking confirmed'); this.router.navigate(['/classes']); }
}
