import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent
} from '@angular/common/http';
import { inject } from '@angular/core';
import {
  Observable,
  catchError,
  switchMap,
  throwError,
  BehaviorSubject,
  filter,
  take
} from 'rxjs';
import { TokenStorageService } from '../services/token-storage.service';
import { AuthService } from '../services/auth.service';
import { ClinicContextService } from '../services/clinic-context.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorageService);
  const authService = inject(AuthService);
  const clinicContext = inject(ClinicContextService);

  const isAuthEndpoint =
    req.url.includes(API_ENDPOINTS.auth.login) ||
    req.url.includes(API_ENDPOINTS.auth.refresh);

  const accessToken = tokenStorage.getAccessToken();

  let authReq = req;
  if (accessToken && !isAuthEndpoint) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${accessToken}` }
    });
  }

  const clinicId = clinicContext.clinicId;
  if (clinicId) {
    authReq = authReq.clone({
      setHeaders: { 'X-Clinic-Id': clinicId }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isAuthEndpoint) {
        return handle401Error(authReq, next, tokenStorage, authService);
      }
      return throwError(() => error);
    })
  );
};

function handle401Error(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  tokenStorage: TokenStorageService,
  authService: AuthService
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refresh().pipe(
      switchMap(response => {
        isRefreshing = false;

        if (response.isSuccess && response.value) {
          const newToken = response.value.accessToken;
          refreshTokenSubject.next(newToken);

          return next(req.clone({
            setHeaders: { Authorization: `Bearer ${newToken}` }
          }));
        }

        authService.forceLogout();
        return throwError(() => new Error('Refresh failed.'));
      }),
      catchError(err => {
        isRefreshing = false;
        authService.forceLogout();
        return throwError(() => err);
      })
    );
  }

  return refreshTokenSubject.pipe(
    filter((token): token is string => token !== null),
    take(1),
    switchMap(token => next(req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    })))
  );
}