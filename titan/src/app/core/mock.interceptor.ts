import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, delay, throwError } from 'rxjs';
const today = new Date().toISOString().slice(0, 10);
const members: any[] = [
  { id: '#TF-8932', name: 'Jane Doe', branch: 'Downtown', status: 'Active', lastVisit: 'Today, 08:30 AM', email: 'jane@email.com', phone: '+1 (555) 019-2834', plan: 'Annual Pro Plan', endDate: '2027-10-12', freezesUsed: 2, freezesMax: 3 },
  { id: '#TF-7741', name: 'John Smith', branch: 'Uptown', status: 'Frozen', lastVisit: 'Oct 12, 2023', plan: 'Annual Pro Plan', endDate: '2027-03-01', freezesUsed: 3, freezesMax: 3 },
  { id: '#TF-9012', name: 'Alice Williams', branch: 'Downtown', status: 'Active', lastVisit: 'Yesterday', plan: 'Monthly Plan', endDate: '2027-01-20', freezesUsed: 0, freezesMax: 3 },
  { id: '#TF-5521', name: 'Robert Johnson', branch: 'Downtown', status: 'Expired', lastVisit: 'Sep 01, 2023', plan: 'Monthly Plan', endDate: '2026-09-01', freezesUsed: 1, freezesMax: 3 },
];
const classes: any[] = [
  { id: 1, name: 'HIIT Core Blast', branch: 'Downtown', trainer: 'Sarah Jenkins', studio: 'Studio A', date: today, time: '06:00', capacity: 30, enrolled: 28, duration: 45, inProgress: false },
  { id: 2, name: 'Vinyasa Flow Yoga', branch: 'Downtown', trainer: 'Marcus Lee', studio: 'Zen Room', date: today, time: '08:00', capacity: 20, enrolled: 15, duration: 60, inProgress: true },
  { id: 3, name: 'Lunchtime Spin', branch: 'Downtown', trainer: 'Elena Rodriguez', studio: 'Cycle Studio', date: today, time: '12:00', capacity: 40, enrolled: 40, duration: 45, inProgress: false },
];
const trainers: any[] = [
  { id: 'TR-1042', name: 'Sarah Jenkins', specialty: 'HIIT / Strength', branch: 'Downtown', email: 's.jenkins@titanfitness.com', phone: '+1 (555) 019-4471', isActive: true },
  { id: 'TR-1057', name: 'Marcus Lee', specialty: 'Yoga / Mobility', branch: 'Downtown', email: 'm.lee@titanfitness.com', phone: '', isActive: true },
  { id: 'TR-1063', name: 'Elena Rodriguez', specialty: 'Cycling', branch: 'Uptown', email: 'e.rodriguez@titanfitness.com', phone: '', isActive: true },
  { id: 'TR-1071', name: 'Mike Turner', specialty: 'Pilates', branch: 'Uptown', email: 'm.turner@titanfitness.com', phone: '', isActive: false },
];
const plans: any[] = [
  { id: '1', name: 'Annual Pro', price: 899, months: 12, freezeDays: 60, freezes: 3, guests: 5, access: 'All branches', published: true },
  { id: '2', name: 'Quarterly', price: 279, months: 3, freezeDays: 15, freezes: 1, guests: 2, access: 'All branches', published: true },
  { id: '3', name: 'Monthly', price: 99, months: 1, freezeDays: 0, freezes: 0, guests: 0, access: 'Home branch only', published: true },
  { id: '4', name: 'Student 2024', price: 69, months: 1, freezeDays: 0, freezes: 0, guests: 0, access: 'Home branch only', published: false },
];
const csv = (p: any, k: string): string[] => (p.get(k) ?? '').split(',').filter(Boolean);
const has = (l: string[], v: string) => !l.length || l.includes(v);
const nm = (x: any, p: any) => x.name.toLowerCase().includes((p.get('search') ?? '').toLowerCase());
const trainerF = (x: any, p: any) => nm(x, p) && has(csv(p, 'branch'), x.branch) && has(csv(p, 'specialty'), x.specialty) && has(csv(p, 'status'), x.isActive ? 'Active' : 'Inactive');
const planF = (x: any, p: any) => {
  const [lo, hi] = (p.get('price') ?? ',').split(','), acc = csv(p, 'access')[0];
  return nm(x, p) && has(csv(p, 'duration'), `${x.months} month${x.months === 1 ? '' : 's'}`) && has(csv(p, 'status'), x.published ? 'Published' : 'Retired')
    && (!acc || acc === 'Any' || acc === x.access) && (!lo || x.price >= +lo) && (!hi || x.price <= +hi);
};

export const mockInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api')) return next(req);
  const ok = (b: any) => of(new HttpResponse({ status: 200, body: b })).pipe(delay(150));
  const p = req.params;
  const rest = (name: string, data: any[], filt: (x: any, p: any) => boolean, mk: (n: number) => string) => {
    if (req.url === `/api/${name}`) {
      if (req.method === 'POST') { const n = { ...(req.body as any), id: mk(data.length) }; data.push(n); return ok(n); }
      const items = data.filter(x => filt(x, p));
      return ok({ items, total: items.length !== data.length ? items.length : 24 });
    }
    const m2 = req.url.match(new RegExp(`^/api/${name}/([^/]+)$`));
    if (!m2) return null;
    const i = data.findIndex(x => x.id === m2[1]);
    if (i < 0) return throwError(() => new HttpErrorResponse({ status: 404 }));
    if (req.method === 'PUT') data[i] = { ...data[i], ...(req.body as any) };
    return ok(data[i]);
  };
  const r = rest('trainers', trainers, trainerF, n => 'TR-' + (1080 + n)) ?? rest('plans', plans, planF, n => String(n + 1));
  if (r) return r;
  if (req.url === '/api/members' && req.method === 'POST') { const n = { id: '#TF-' + (9100 + members.length), status: 'Active', lastVisit: '—', ...(req.body as any) }; members.push(n); return ok(n); }
  if (req.url === '/api/members') {
    const s = (p.get('search') ?? '').toLowerCase(), b = p.get('branch');
    const items = members.filter(m => m.name.toLowerCase().includes(s) || m.id.toLowerCase().includes(s));
    return ok({ items, total: s ? items.length : 240 });
  }
  const m = req.url.match(/^\/api\/members\/(.+?)(\/freeze)?$/);
  if (m) {
    const mem = members.find(x => x.id === decodeURIComponent(m[1])) ?? members.find(x => x.id.replace('#', '') === decodeURIComponent(m[1]));
    if (m[2]) { if (mem) mem.status = 'Frozen'; return ok(mem); }
    return ok({ address: '142 West Metro Dr, Apt 4B', joined: 'Oct 12, 2022', guests: 1, guestsMax: 5, price: 899, ...(mem ?? members[0]),
      activity: [{ k: 'in', t: 'Facility Check-in', s: 'Downtown Branch', d: 'Today\n06:45 AM' }, { k: 'cls', t: 'Class Attendance', s: 'HIIT Bootcamp with Sarah', d: 'Oct 18, 2023\n05:30 PM' }, { k: 'in', t: 'Facility Check-in', s: 'Downtown Branch', d: 'Oct 16, 2023\n06:30 AM' }] });
  }
  if (req.url === '/api/check-ins') return ok({});
  const cm = req.url.match(/^\/api\/classes\/(\d+)$/); if (cm) return ok(classes.find(c => c.id === +cm[1]));
  if (req.url === '/api/classes') {
    if (req.method === 'POST') { const c = { ...(req.body as any), id: Date.now(), enrolled: 0, inProgress: false }; classes.push(c); return ok(c); }
    const d = p.get('date') ?? today;
    return ok(classes.filter(c => c.date === d).sort((a, b) => a.time.localeCompare(b.time)));
  }
  return next(req);
};
