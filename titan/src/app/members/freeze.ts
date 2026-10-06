import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Member, MemberService, ToastService } from '../core/services';
import { Autofocus, StatusBadge } from '../shared/shared';
@Component({
  selector: 'app-freeze', imports: [FormsModule, RouterLink, DatePipe, StatusBadge, Autofocus],
  template: `
  <a class="back" [routerLink]="['/members', id()]">← Back to Member Profile</a>
  <h1>Freeze Membership</h1><p class="sub bb">Temporarily suspend a membership contract.</p>
  @if (m(); as m) {
  <div class="grid frz">
    <section>
      <div class="card who2"><div class="photo sm"></div><div><b class="big">{{ m.name }}</b><br><small>ID: {{ m.id }} • {{ m.plan }}</small>
        <div class="gap8"><app-status-badge [status]="m.status" /><small>Current End Date: {{ m.endDate | date: 'MMM d, y' }}</small></div></div></div>
      <div class="card"><h3 class="qh">Freeze Parameters</h3>
        <label>Start Date <span class="req">*</span></label><input class="w60" appAutofocus type="date" [ngModel]="start()" (ngModelChange)="start.set($event)" [min]="tomorrow" />
        <label>Duration (Months) <span class="req">*</span></label>
        <div class="gap8">@for (d of [1, 2, 3]; track d) { <button class="opt" [class.sel]="months() === d" (click)="months.set(d)">{{ d }} Month{{ d > 1 ? 's' : '' }}</button> }</div>
        <label>Reason for Freeze <span class="req">*</span></label>
        <select class="w60" [ngModel]="reason()" (ngModelChange)="reason.set($event)"><option value="">Select a reason</option>@for (r of reasons; track r) { <option>{{ r }}</option> }</select>
        <label>Additional Notes (Optional)</label>
        <textarea rows="4" maxlength="500" [ngModel]="notes()" (ngModelChange)="notes.set($event)" placeholder="Enter any relevant details..."></textarea>
        <small>{{ notes().length }}/500</small></div></section>
    <aside class="card flush panel"><h3 class="ph">▥ &nbsp;Projected Impact</h3><div class="pb">
      <div class="row li"><small>Original End Date</small><span>{{ m.endDate | date: 'MMM d, y' }}</span></div>
      <div class="row li"><small>Freeze Duration</small><span>{{ months() }} Month{{ months() > 1 ? 's' : '' }}</span></div>
      <div class="hl"><small>New End Date</small><b>{{ newEnd() ? (newEnd() | date: 'MMM d, y') : '—' }}</b></div>
      <small class="note">* Billing will automatically pause during the freeze period and resume upon reactivation.</small></div>
      <div class="pb btns"><button class="btn" [disabled]="!valid()" (click)="confirm()">❄ &nbsp;Confirm Freeze</button><a class="btn-o" [routerLink]="['/members', id()]">Cancel</a></div></aside>
  </div> }`,
})
export class Freeze {
  id = input.required<string>(); svc = inject(MemberService); router = inject(Router); toast = inject(ToastService);
  m = signal<Member | null>(null); reasons = ['Extended Travel', 'Medical', 'Injury', 'Financial', 'Other'];
  tomorrow = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
  start = signal(this.tomorrow); months = signal(1); reason = signal(''); notes = signal('');
  newEnd = computed(() => {
    const m = this.m(), s = this.start(); if (!m?.endDate || !s || s < this.tomorrow || s >= m.endDate) return null;
    const d = new Date(m.endDate); d.setMonth(d.getMonth() + this.months()); return d;
  });
  valid = computed(() => !!this.newEnd() && !!this.reason());
  constructor() { effect(() => this.svc.get(this.id()).subscribe(r => this.m.set(r))); }
  confirm() {
    this.svc.freeze(this.id(), { start: this.start(), months: this.months(), reason: this.reason(), notes: this.notes() })
      .subscribe(() => { this.toast.show('Membership frozen'); this.router.navigate(['/members']); });
  }
}
