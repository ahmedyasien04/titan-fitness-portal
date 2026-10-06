import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from './services';
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService), router = inject(Router);
  const authed = req.clone({ setHeaders: { Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` } });
  return next(authed).pipe(catchError((e: HttpErrorResponse) => {
    const isPage = req.method === 'GET';
    switch (e.status) {
      case 0: toast.show("Can't reach the server. Check your connection."); break;
      case 400: if (!e.error?.fieldErrors) toast.show(e.error?.message ?? 'Bad request'); break;
      case 401: localStorage.removeItem('token'); router.navigate(['/sign-in'], { queryParams: { returnUrl: router.url } }); break;
      case 403: isPage ? router.navigate(['/access-denied']) : toast.show("You don't have permission to do this."); break;
      case 404: if (!isPage) toast.show('The item no longer exists.'); break;
      case 409: toast.show(e.error?.message ?? 'Conflict'); break;
      case 500: case 502: case 503: toast.show('Something went wrong. Please try again.'); break;
    }
    return throwError(() => e);
  }));
};
