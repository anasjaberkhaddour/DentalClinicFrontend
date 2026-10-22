import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ClinicContextService } from '../services/clinic-context.service';
import { TokenStorageService } from '../services/token-storage.service';

export const clinicContextGuard: CanActivateFn = () => {
  const clinicContext = inject(ClinicContextService);
  const tokenStorage = inject(TokenStorageService);
  const router = inject(Router);

  if (!tokenStorage.isLoggedIn()) {
    return true;
  }

  if (clinicContext.hasClinic) {
    return true;
  }

  return router.createUrlTree(['/select-clinic']);
};