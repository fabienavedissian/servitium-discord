import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from './session.service';

/** Protects authenticated routes: validate the session cookie, else redirect home. */
export const authGuard: CanActivateFn = async () => {
  const session = inject(SessionService);
  const router = inject(Router);
  const ok = await session.ensureAuthenticated();
  return ok ? true : router.createUrlTree(['/']);
};
