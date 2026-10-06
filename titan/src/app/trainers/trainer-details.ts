import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Trainer, TrainerService, ToastService } from '../core/services';
import { Autofocus } from '../shared/shared';
@Component({
  selector: 'app-trainer-details', imports: [FormsModule, RouterLink, Autofocus],
  template: `
  <a class="back" routerLink="/trainers">← Back to list</a>
  @if (missing()) { <h1>Trainer not found</h1> } @else {
  <div class="row top-row"><div><div class="gap8 ttl"><h1>{{ mode() === 'add' ? 'New Trainer' : f().name }}</h1><span class="mode"><i></i>{{ label() }}</span></div>
    <p class="sub">{{ mode() === 'add' ? 'Add a trainer to the roster.' : 'Trainer #' + id() }}</p></div>
    @if (view()) { <a class="btn auto sm" [routerLink]="['/trainers', id(), 'edit']">✎ &nbsp;Edit Trainer</a> }</div>
  <div class="card flush"><h3 class="ph">Trainer Details</h3><div class="form2 pad">
    <div><label>Trainer name @if (!view()) { <span class="req">*</span> }</label>
      <input appAutofocus [disabled]="view()" [ngModel]="f().name" (ngModelChange)="set('name', $event)" placeholder="e.g., Sarah Jenkins" />
      @if (tried() && errs()['name']) { <small class="err">{{ errs()['name'] }}</small> }</div>
    <div><label>Specialty</label><input [disabled]="view()" [ngModel]="f().specialty" (ngModelChange)="set('specialty', $event)" placeholder="e.g., HIIT / Strength" />
      @if (tried() && errs()['specialty']) { <small class="err">{{ errs()['specialty'] }}</small> }</div>
    <div><label>Branch @if (!view()) { <span class="req">*</span> }</label>
      <select [disabled]="view()" [ngModel]="f().branch" (ngModelChange)="set('branch', $event)"><option value="">Select a branch</option>@for (b of branches; track b) { <option [value]="b">{{ b }} Branch</option> }</select>
      @if (tried() && errs()['branch']) { <small class="err">{{ errs()['branch'] }}</small> }</div>
    <div><label>Email @if (!view()) { <span class="req">*</span> }</label><input type="email" [disabled]="view()" [ngModel]="f().email" (ngModelChange)="set('email', $event)" placeholder="name@titanfitness.com" />
      @if (tried() && errs()['email']) { <small class="err">{{ errs()['email'] }}</small> }</div>
    <div><label>Phone</label><input type="tel" [disabled]="view()" [ngModel]="f().phone" (ngModelChange)="set('phone', $event)" placeholder="+1 (555) 000-0000" />
      @if (tried() && errs()['phone']) { <small class="err">{{ errs()['phone'] }}</small> }</div>
    <div><label>Status</label><label class="chk"><input type="checkbox" [disabled]="view()" [ngModel]="f().isActive" (ngModelChange)="set('isActive', $event)" /> IsActive</label>
      @if (!view()) { <small>Ticked means true, unticked means false.</small> }</div>
  </div></div>
  @if (!view()) { <div class="foot bar-foot"><button class="btn-o" (click)="cancel()">Cancel</button><button class="btn" (click)="save()">✓ &nbsp;{{ mode() === 'add' ? 'Save Trainer' : 'Save Changes' }}</button></div> } }`,
})
export class TrainerDetails {
  id = input<string>(); mode = input<'add' | 'view' | 'edit'>('view');
  svc = inject(TrainerService); router = inject(Router); toast = inject(ToastService);
  branches = ['Downtown', 'Uptown']; missing = signal(false); tried = signal(false); dirty = signal(false);
  f = signal<Trainer>({ id: '', name: '', specialty: '', branch: '', email: '', phone: '', isActive: true });
  view = computed(() => this.mode() === 'view');
  label = computed(() => ({ add: 'Add mode', view: 'View mode', edit: 'Update mode' })[this.mode()]);
  errs = computed(() => {
    const t = this.f(), e: Record<string, string> = {}, n = t.name.trim().length;
    if (n < 2 || n > 80) e['name'] = 'Required; 2–80 characters.';
    if (t.specialty.length > 100) e['specialty'] = 'Up to 100 characters.';
    if (!t.branch) e['branch'] = 'Select a branch.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(t.email)) e['email'] = 'Enter a valid email.';
    if (t.phone && !/^[+()\d\s-]{7,}$/.test(t.phone)) e['phone'] = 'Enter a valid phone number.';
    return e;
  });
  constructor() {
    effect(() => { const id = this.id(); if (this.mode() !== 'add' && id) this.svc.get(id).subscribe({ next: t => this.f.set(t), error: () => this.missing.set(true) }); });
  }
  set(k: keyof Trainer, v: any) { this.dirty.set(true); this.f.update(x => ({ ...x, [k]: v })); }
  cancel() { if (this.dirty() && !confirm('Discard changes?')) return; this.router.navigate(this.mode() === 'edit' ? ['/trainers', this.id()] : ['/trainers']); }
  save() {
    this.tried.set(true); if (Object.keys(this.errs()).length) return;
    const body = { ...this.f(), name: this.f().name.trim() };
    if (this.mode() === 'add') this.svc.create(body).subscribe(t => { this.toast.show('Trainer created'); this.router.navigate(['/trainers', t.id]); });
    else this.svc.update(this.id()!, body).subscribe(() => { this.toast.show('Trainer updated'); this.router.navigate(['/trainers', this.id()]); });
  }
}
