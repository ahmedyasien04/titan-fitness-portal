import { Component, computed, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BranchService, MemberService, ToastService } from '../core/services';
import { Autofocus } from '../shared/shared';
@Component({
  selector: 'app-add-member-dialog', imports: [FormsModule, Autofocus],
  template: `
  <div class="overlay"><div class="dialog sm-d">
    <div class="row"><h2>Add Member</h2><button class="x" (click)="closed.emit()">×</button></div>
    <label>Member name <span class="req">*</span></label>
    <input appAutofocus [ngModel]="name()" (ngModelChange)="name.set($event)" placeholder="e.g., Jane Doe" />
    @if (tried() && !ok()) { <small class="err">2–80 characters; letters, spaces, hyphens and apostrophes only.</small> }
    <label>Branch <span class="req">*</span></label>
    <select [ngModel]="branch()" (ngModelChange)="branch.set($event)"><option>Downtown</option><option>Uptown</option></select>
    <label>Status</label><span class="badge active green">● Active</span>
    <div class="foot"><button class="btn-o" (click)="closed.emit()">Cancel</button><button class="btn" (click)="save()">+ &nbsp;Add Member</button></div>
  </div></div>`,
})
export class AddMemberDialog {
  closed = output<void>(); saved = output<void>(); svc = inject(MemberService); toast = inject(ToastService);
  name = signal(''); branch = signal(inject(BranchService).branch()); tried = signal(false);
  ok = computed(() => /^\p{L}[\p{L}\s'’-]{1,79}$/u.test(this.name().trim()));
  save() {
    this.tried.set(true); if (!this.ok()) return;
    this.svc.create({ name: this.name().trim(), branch: this.branch() }).subscribe(() => { this.toast.show(`${this.name().trim()} added`); this.saved.emit(); });
  }
}
