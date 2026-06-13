import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

/**
 * Sends the httpOnly session cookie with every API call (the token lives in the
 * cookie, never in JS storage). Requests already setting withCredentials are
 * left untouched.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith(environment.apiUrl) && !req.withCredentials) {
    req = req.clone({ withCredentials: true });
  }
  return next(req);
};
