import { Component, Directive, ElementRef, HostListener, Pipe, PipeTransform, input, output, inject, AfterViewInit } from '@angular/core';
@Directive({ selector: '[appAutofocus]' })
export class Autofocus implements AfterViewInit { el = inject(ElementRef); ngAfterViewInit() { this.el.nativeElement.focus(); } }
@Directive({ selector: '[appClickOutside]' })
export class ClickOutside {
  el = inject(ElementRef); appClickOutside = output<void>();
  @HostListener('document:click', ['$event.target']) c(t: Node) { if (!this.el.nativeElement.contains(t)) this.appClickOutside.emit(); }
}
@Pipe({ name: 'highlight' })
export class HighlightPipe implements PipeTransform {
  transform(v: string, q: string) { return q ? v.replace(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'), '<mark>$1</mark>') : v; }
}
@Pipe({ name: 'freezeAllowance' })
export class FreezeAllowancePipe implements PipeTransform {
  transform(days: number, n: number) { return days === 0 ? 'None' : `${days} days / ${n} freeze${n === 1 ? '' : 's'}`; }
}
@Component({ selector: 'app-status-badge', template: `<span class="badge" [class]="status().toLowerCase()">● {{ status() }}</span>` })
export class StatusBadge { status = input.required<string>(); }
@Component({
  selector: 'app-paginator',
  template: `<button [disabled]="page() === 1" (click)="pageChange.emit(page() - 1)">‹</button>@for (p of pages(); track p) { <button [class.on]="p === page()" (click)="pageChange.emit(p)">{{ p }}</button> }<button [disabled]="page() >= last()" (click)="pageChange.emit(page() + 1)">›</button>`,
})
export class Paginator {
  total = input.required<number>(); page = input.required<number>(); size = input(10); pageChange = output<number>();
  last() { return Math.max(1, Math.ceil(this.total() / this.size())); }
  pages() { const s = Math.max(1, Math.min(this.page() - 1, this.last() - 2)); return Array.from({ length: Math.min(3, this.last()) }, (_, i) => s + i); }
}
export const hh = (t: string) => `${String(+t.slice(0, 2) % 12 || 12).padStart(2, '0')}:${t.slice(3)}`;
export const ap = (t: string) => (+t.slice(0, 2) >= 12 ? 'PM' : 'AM');
const mins = (t: string, d: number) => { const [h, m] = t.split(':').map(Number); return [h * 60 + m, h * 60 + m + d]; };
export const range24 = (t: string, d: number) => mins(t, d).map(x => `${String(Math.floor(x / 60) % 24).padStart(2, '0')}:${String(x % 60).padStart(2, '0')}`).join(' - ');
export const range12 = (t: string, d: number) => mins(t, d).map(x => { const h = Math.floor(x / 60) % 24; return `${h % 12 || 12}:${String(x % 60).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`; }).join(' - ');
