import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
export interface Member { id: string; name: string; branch: string; status: 'Active'|'Frozen'|'Expired'; lastVisit: string; email?: string; phone?: string; plan?: string; endDate?: string; address?: string; joined?: string; guests?: number; guestsMax?: number; price?: number; activity?: { k: string; t: string; s: string; d: string }[]; freezesUsed?: number; freezesMax?: number; }
export interface Page<T> { items: T[]; total: number; }
@Injectable({ providedIn: 'root' }) export class BranchService { branch = signal('Downtown'); search = signal(''); }
@Injectable({ providedIn: 'root' }) export class ToastService {
  msg = signal('');
  show(m: string) { this.msg.set(m); setTimeout(() => this.msg.set(''), 3500); }
}
@Injectable({ providedIn: 'root' }) export class MemberService {
  private http = inject(HttpClient);
  list(page: number, search: string, branch: string) {
    return this.http.get<Page<Member>>('/api/members', { params: { page, size: 10, search, branch } });
  }
  create(b: { name: string; branch: string }) { return this.http.post<Member>('/api/members', b); }
  get(id: string) { return this.http.get<Member>(`/api/members/${id}`); }
  freeze(id: string, body: { start: string; months: number; reason: string; notes: string }) {
    return this.http.post<Member>(`/api/members/${id}/freeze`, body);
  }
}
@Injectable({ providedIn: 'root' }) export class CheckInService {
  private http = inject(HttpClient);
  count = signal(142);
  checkIn(memberId: string) { return this.http.post('/api/check-ins', { memberId }); }
}
@Injectable({ providedIn: 'root' }) export class ClassService {
  private http = inject(HttpClient);
  upcoming(branch: string) { return this.http.get<any[]>('/api/classes', { params: { branch } }); }
  get(id: string) { return this.http.get<any>(`/api/classes/${id}`); }
  list(date: string) { return this.http.get<any[]>('/api/classes', { params: { date } }); }
  create(c: any) { return this.http.post<any>('/api/classes', c); }
}

export interface Trainer { id: string; name: string; specialty: string; branch: string; email: string; phone: string; isActive: boolean; }
export interface Plan { id: string; name: string; price: number; months: number; freezeDays: number; freezes: number; guests: number; access: string; published: boolean; }
export type Filters = Record<string, string[]>;
const q = (f: Filters) => Object.fromEntries(Object.entries(f).filter(([, v]) => v.length).map(([k, v]) => [k, v.join(',')]));
@Injectable({ providedIn: 'root' }) export class TrainerService {
  private http = inject(HttpClient);
  list(page: number, search: string, f: Filters) { return this.http.get<Page<Trainer>>('/api/trainers', { params: { page, size: 10, search, ...q(f) } }); }
  get(id: string) { return this.http.get<Trainer>(`/api/trainers/${id}`); }
  create(t: Partial<Trainer>) { return this.http.post<Trainer>('/api/trainers', t); }
  update(id: string, t: Partial<Trainer>) { return this.http.put<Trainer>(`/api/trainers/${id}`, t); }
}
@Injectable({ providedIn: 'root' }) export class PlanService {
  private http = inject(HttpClient);
  list(page: number, search: string, f: Filters) { return this.http.get<Page<Plan>>('/api/plans', { params: { page, size: 10, search, ...q(f) } }); }
  get(id: string) { return this.http.get<Plan>(`/api/plans/${id}`); }
  create(t: Partial<Plan>) { return this.http.post<Plan>('/api/plans', t); }
  update(id: string, t: Partial<Plan>) { return this.http.put<Plan>(`/api/plans/${id}`, t); }
}
