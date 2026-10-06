import { Component, computed, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BranchService, ClassService, ToastService } from '../core/services';
import { Autofocus } from '../shared/shared';
@Component({
  selector: 'app-add-class-dialog', imports: [FormsModule, Autofocus],
  template: `
  <div class="overlay"><div class="dialog">
    <div class="row"><h2>Add New Class</h2><button class="x" (click)="closed.emit()">×</button></div>
    <div class="form2">
      <div><label>Class Name <span class="req">*</span></label><input appAutofocus [ngModel]="name()" (ngModelChange)="name.set($event)" placeholder="e.g., High-Intensity Interval Training" />
        @if (touched() && !nameOk()) { <small class="err">Enter 3–80 characters.</small> }</div>
      <div><label>Branch <span class="req">*</span></label><select [ngModel]="branch()" (ngModelChange)="branch.set($event)"><option>Downtown</option><option>Uptown</option></select></div>
      <div><label>Trainer / Instructor</label><select [ngModel]="trainer()" (ngModelChange)="trainer.set($event)"><option value="">Select an instructor</option>@for (t of trainers; track t) { <option>{{ t }}</option> }</select></div>
      <div><label>Studio / Room</label><select [ngModel]="studio()" (ngModelChange)="studio.set($event)"><option value="">Assign a room</option>@for (r of rooms; track r) { <option>{{ r }}</option> }</select></div>
      <div class="two"><div><label>Date <span class="req">*</span></label><input type="date" [min]="today" [ngModel]="date()" (ngModelChange)="date.set($event)" /></div>
        <div><label>Start Time <span class="req">*</span></label><input type="time" [ngModel]="time()" (ngModelChange)="time.set($event)" /></div></div>
      <div><label>Capacity Limit</label><input type="number" min="1" max="100" [ngModel]="capacity()" (ngModelChange)="capacity.set($event)" placeholder="20" /></div>
      <div><label>Duration</label><div class="row radios">@for (d of [30, 45, 60]; track d) { <button type="button" [class.sel]="duration() === d" (click)="duration.set(d)">{{ d }} min</button> }</div></div>
      <div><label>Status</label><span class="badge green">● Active (Booking Open)</span></div>
    </div>
    <label>Description (Optional)</label><textarea maxlength="500" placeholder="Add details about the class focus, required equipment, or intensity level..."></textarea>
    <div class="foot"><button class="btn-o" (click)="closed.emit()">Cancel</button><button class="btn" (click)="save()">Schedule Class</button></div>
  </div></div>`,
})
export class AddClassDialog {
  closed = output<void>(); saved = output<any>();
  svc = inject(ClassService); toast = inject(ToastService);
  today = new Date().toISOString().slice(0, 10);
  trainers = ['Sarah Jenkins', 'Marcus Lee', 'Elena Rodriguez']; rooms = ['Studio A', 'Zen Room', 'Cycle Studio'];
  name = signal(''); branch = signal(inject(BranchService).branch()); trainer = signal(''); studio = signal('');
  date = signal(''); time = signal(''); capacity = signal<number | null>(null); duration = signal(45); touched = signal(false);
  nameOk = computed(() => { const n = this.name().trim().length; return n >= 3 && n <= 80; });
  valid = computed(() => this.nameOk() && !!this.date() && this.date() >= this.today && !!this.time());
  save() {
    this.touched.set(true); if (!this.valid()) return;
    const body = { name: this.name().trim(), branch: this.branch(), trainer: this.trainer(), studio: this.studio(), date: this.date(), time: this.time(), capacity: this.capacity() ?? 20, duration: this.duration() };
    this.svc.create(body).subscribe(c => { this.toast.show('Class scheduled'); this.saved.emit(c); });
  }
}
