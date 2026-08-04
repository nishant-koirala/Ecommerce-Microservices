import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { ApiError } from '../models/common';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        const apiError = error.error as ApiError | undefined;
        const message = apiError?.message ?? fallbackMessage(error);
        const isLoginRequest = req.url.includes('/auth/login');

        if (error.status === 401 && !isLoginRequest) {
          toast.error('Your session has expired. Please sign in again.');
          auth.logout();
        } else if (error.status === 0) {
          toast.error('Network error — is the backend running?');
        } else {
          toast.error(message);
        }
      } else {
        toast.error(error instanceof Error ? error.message : 'Something went wrong.');
      }
      return throwError(() => error);
    }),
  );
};

function fallbackMessage(error: HttpErrorResponse): string {
  switch (error.status) {
    case 400:
      return 'The request was invalid.';
    case 401:
      return 'Please sign in to continue.';
    case 403:
      return 'You do not have permission to do that.';
    case 404:
      return 'Not found.';
    default:
      return 'Something went wrong on the server.';
  }
}
