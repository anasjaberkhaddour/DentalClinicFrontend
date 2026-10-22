import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 0) {
        messageService.add({
          severity: 'error',
          summary: 'خطأ في الاتصال',
          detail: 'تعذّر الوصول إلى الخادم. تحقق من الاتصال بالإنترنت.'
        });
      } else if (error.status === 403) {
        messageService.add({
          severity: 'warn',
          summary: 'صلاحية مرفوضة',
          detail: 'لا تملك الصلاحية للقيام بهذا الإجراء.'
        });
      } else if (error.status === 429) {
        messageService.add({
          severity: 'warn',
          summary: 'عدد الطلبات كبير',
          detail: 'حاول مجدداً بعد قليل.'
        });
      } else if (error.status >= 500) {
        messageService.add({
          severity: 'error',
          summary: 'خطأ في الخادم',
          detail: 'حدث خطأ غير متوقع. حاول لاحقاً.'
        });
      }

      return throwError(() => error);
    })
  );
};