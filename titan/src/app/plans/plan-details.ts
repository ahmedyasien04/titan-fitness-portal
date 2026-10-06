import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PlanService, ToastService } from '../core/services';
import { Autofocus } from '../shared/shared';
interface PlanForm { name: string; price: number | null; months: number | null; published: boolean; freezeDays: number | null; freezes: number | null; guests: number | null; access: string; }
@Component({
  selector: 'app-plan-details', imports: [FormsModule, RouterLink, Autofocus],
  template: `
  <a class="back" routerLink="/plans">← Back to list</a>
  @if (missing()) { <h1>Plan not found</h1> } @else {
  <div class="row top-row"><div><div class="gap8 ttl"><h1>{{ mode() === 'add' ? 'New Plan' : f().name }}</h1><span class="mode"><i></i>{{ label() }}</span></div>
    <p class="sub">{{ mode() === 'add' ? 'Publish a new membership plan.' : 'Plan details' }}</p></div>
    @if (view()) { <a class="btn auto sm" [routerLink]="['/plans', id(), 'edit']">✎ &nbsp;Edit Plan</a> }</div>
  @if (mode() === 'edit') { <div class="warn">Changes to this plan apply to new purchases only. 412 active memberships keep the terms they were sold.</div> }
  <div class="card flush"><h3 class="ph">Plan Details</h3><div class="form2 pad">
    <div><label>Plan name @if (!view()) { <span class="req">*</span> }</label><input appAutofocus [disabled]="view()" [ngModel]="f().name" (ngModelChange)="set('name', $event)" placeholder="e.g., Annual Pro" />
      @if (tried() && errs()['name']) { <small class="err">{{ errs()['name'] }}</small> }</div>
    <div><label>Price @if (!view()) { <span class="req">*</span> }</label><input type="number" step="0.01" min="0" [disabled]="view()" [ngModel]="f().price" (ngModelChange)="set('price', $event)" placeholder="0.00" />
      @if (tried() && errs()['price']) { <small class="err">{{ errs()['price'] }}</small> }</div>
    <div><label>Duration in months @if (!view()) { <span class="req">*</span> }</label><input type="number" [disabled]="view()" [ngModel]="f().months" (ngModelChange)="set('months', $event)" placeholder="e.g., 12" />
      @if (tried() && errs()['months']) { <small class="err">{{ errs()['months'] }}</small> }</div>
    <div><label>Status</label><label class="chk"><input type="checkbox" [disabled]="view()" [ngModel]="f().published" (ngModelChange)="set('published', $event)" /> IsPublished</label>
      @if (!view()) { <small>Ticked means true, unticked means false.</small> }</div>
  </div></div>
  <div class="card flush"><h3 class="ph">Terms Offered</h3><div class="form2 pad">
    <div><label>Maximum freeze days</label><input type="number" min="0" [disabled]="view()" [ngModel]="f().freezeDays" (ngModelChange)="set('freezeDays', $event)" placeholder="0" />
      @if (tried() && errs()['freezeDays']) { <small class="err">{{ errs()['freezeDays'] }}</small> }</div>
    <div><label>Maximum number of freezes</label><input type="number" min="0" [disabled]="view()" [ngModel]="f().freezes" (ngModelChange)="set('freezes', $event)" placeholder="0" />
      @if (tried() && errs()['freezes']) { <small class="err">{{ errs()['freezes'] }}</small> }</div>
    <div><label>Guest pass quota</label><input type="number" min="0" [disabled]="view()" [ngModel]="f().guests" (ngModelChange)="set('guests', $event)" placeholder="0" /></div>
    <div><label>Access scope</label>
      @if (view()) { <input disabled [value]="f().access || 'Home branch only'" /> } @else {
      <div class="gap8">@for (a of scopes; track a) { <button type="button" class="rad" [class.sel]="f().access === a" (click)="set('access', a)"><i></i>{{ a }}</button> }</div> }</div>
  </div></div>
  @if (!view()) { <div class="foot bar-foot"><button class="btn-o" (click)="cancel()">Cancel</button><button class="btn" (click)="save()">✓ &nbsp;{{ mode() === 'add' ? 'Save Plan' : 'Save Changes' }}</button></div> } }`,
})
export class PlanDetails {
  id = input<string>(); mode = input<'add' | 'view' | 'edit'>('view');
  svc = inject(PlanService); router = inject(Router); toast = inject(ToastService);
  scopes = ['Home branch only', 'All branches']; missing = signal(false); tried = signal(false); dirty = signal(false);
  f = signal<PlanForm>({ name: '', price: null, months: null, published: false, freezeDays: null, freezes: null, guests: null, access: '' });
  view = computed(() => this.mode() === 'view');
  label = computed(() => ({ add: 'Add mode', view: 'View mode', edit: 'Update mode' })[this.mode()]);
  errs = computed(() => {
    const t = this.f(), e: Record<string, string> = {}, n = t.name.trim().length, whole = (v: number | null) => v == null || (Number.isInteger(v) && v >= 0);
    if (n < 2 || n > 60) e['name'] = 'Required; 2–60 characters.';
    if (t.price == null || t.price < 0 || Math.round(t.price * 100) !== t.price * 100) e['price'] = 'Required; 0 or more, 2 decimals.';
    if (t.months == null || !Number.isInteger(t.months) || t.months < 1 || t.months > 36) e['months'] = 'Whole number 1–36.';
    if (!whole(t.freezeDays)) e['freezeDays'] = 'Whole number, 0 or more.';
    if (!whole(t.freezes)) e['freezes'] = 'Whole number, 0 or more.';
    else if (!(t.freezeDays ?? 0) && (t.freezes ?? 0) > 0) e['freezes'] = 'Must be 0 when freeze days is 0.';
    return e;
  });
  constructor() {
    effect(() => {
      const id = this.id();
      if (this.mode() !== 'add' && id) this.svc.get(id).subscribe({ next: p => this.f.set({ name: p.name, price: p.price, months: p.months, published: p.published, freezeDays: p.freezeDays, freezes: p.freezes, guests: p.guests, access: p.access }), error: () => this.missing.set(true) });
    });
  }
  set(k: keyof PlanForm, v: any) { this.dirty.set(true); this.f.update(x => ({ ...x, [k]: v })); }
  cancel() { if (this.dirty() && !confirm('Discard changes?')) return; this.router.navigate(this.mode() === 'edit' ? ['/plans', this.id()] : ['/plans']); }
  save() {
    this.tried.set(true); if (Object.keys(this.errs()).length) return;
    const t = this.f(), body = { name: t.name.trim(), price: t.price!, months: t.months!, published: t.published, freezeDays: t.freezeDays ?? 0, freezes: t.freezes ?? 0, guests: t.guests ?? 0, access: t.access || 'Home branch only' };
    if (this.mode() === 'add') this.svc.create(body).subscribe(p => { this.toast.show(`${body.name} created`); this.router.navigate(['/plans', p.id]); });
    else this.svc.update(this.id()!, body).subscribe(() => { this.toast.show('Plan updated'); this.router.navigate(['/plans', this.id()]); });
  }
}
