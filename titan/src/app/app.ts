import { Component, computed, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, tap } from 'rxjs';
import { BranchService, ToastService } from './core/services';
@Component({
  selector: 'app-root', imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
  @if (!bare()) {
  <aside class="side">
    <div class="brand"><span class="logo">⤡</span><div><b>Titan Fitness</b><small>STAFF PORTAL</small></div></div>
    <button class="btn-w">+ &nbsp;New Check-in</button>
    <nav>@for (l of links; track l.n) { <a [routerLink]="l.n.toLowerCase()" routerLinkActive="act"><span class="i">{{ l.i }}</span>{{ l.n }}</a> }</nav>
  </aside>
  <header class="top"><div class="left"><b>{{ branch.branch() }} Branch</b>
    <input class="search" [placeholder]="'🔍 ' + ph()" [value]="branch.search()" (input)="branch.search.set($any($event.target).value)" /></div>
    <span class="tools"><span>🔔</span><a routerLink="/classes">📅</a><span class="avatar"></span></span></header> }
  <main [class.bare]="bare()"><router-outlet /></main>
  @if (toast.msg()) { <div class="toast">{{ toast.msg() }}</div> }`,
})
export class App {
  branch = inject(BranchService); toast = inject(ToastService); router = inject(Router);
  links = [{ n: 'Dashboard', i: '▦' }, { n: 'Members', i: '⚇' }, { n: 'Classes', i: '⤡' }, { n: 'Trainers', i: '▤' }, { n: 'Plans', i: '◈' }];
  url = toSignal(this.router.events.pipe(filter(e => e instanceof NavigationEnd), map(e => (e as NavigationEnd).urlAfterRedirects), tap(() => this.branch.search.set(''))), { initialValue: '' });
  bare = computed(() => this.url().endsWith('/member'));
  ph = computed(() => { const u = this.url(); return 'Search ' + (u.startsWith('/trainers') ? 'trainers' : u.startsWith('/plans') ? 'plans' : u.startsWith('/classes') ? 'classes' : 'members') + '...'; });
}
