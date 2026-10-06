import { Component, OnInit, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Filters } from '../core/services';
export interface FilterGroup { key: string; label: string; type: 'multi' | 'single' | 'range'; options?: string[]; }
@Component({
  selector: 'app-filter-dialog', imports: [FormsModule],
  template: `
  <div class="overlay"><div class="dialog sm-d">
    <div class="row"><h2>{{ title() }}</h2><button class="x" (click)="closed.emit()">×</button></div>
    @for (g of groups(); track g.key) {
      <label>{{ g.label }}</label>
      @if (g.type === 'range') {
        <div class="two"><input type="number" placeholder="Min (USD)" [ngModel]="val()[g.key][0]" (ngModelChange)="setR(g.key, 0, $event)" />
          <input type="number" placeholder="Max (USD)" [ngModel]="val()[g.key][1]" (ngModelChange)="setR(g.key, 1, $event)" /></div>
      } @else {
        <div class="chips">@for (o of g.options; track o) { <button type="button" class="opt" [class.sel]="val()[g.key].includes(o)" (click)="toggle(g, o)">{{ o }}</button> }</div>
      }
    }
    <div class="foot"><button class="btn-o" (click)="clear()">Clear</button><button class="btn" (click)="apply()">Apply</button></div>
  </div></div>`,
})
export class FilterDialog implements OnInit {
  title = input.required<string>(); groups = input.required<FilterGroup[]>(); initial = input<Filters>({});
  filtersApplied = output<Filters>(); closed = output<void>(); val = signal<Filters>({});
  ngOnInit() { const v: Filters = {}; for (const g of this.groups()) v[g.key] = [...(this.initial()[g.key] ?? (g.type === 'range' ? ['', ''] : []))]; this.val.set(v); }
  toggle(g: FilterGroup, o: string) {
    const cur = this.val()[g.key], on = cur.includes(o);
    this.val.update(v => ({ ...v, [g.key]: g.type === 'single' ? (on ? [] : [o]) : on ? cur.filter(x => x !== o) : [...cur, o] }));
  }
  setR(k: string, i: number, x: unknown) { const a = [...this.val()[k]]; a[i] = x == null ? '' : String(x); this.val.update(v => ({ ...v, [k]: a })); }
  clear() { this.ngOnInit(); this.val.update(v => Object.fromEntries(Object.keys(v).map(k => [k, v[k].length === 2 && this.groups().find(g => g.key === k)?.type === 'range' ? ['', ''] : []]))); }
  apply() { this.filtersApplied.emit(Object.fromEntries(Object.entries(this.val()).filter(([, v]) => v.some(x => x !== '')))); }
}
