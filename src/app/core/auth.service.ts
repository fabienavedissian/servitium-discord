import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DiscordSessionUser, ManagedGuild } from './session.service';

export interface DiscordExchangeResult {
  user: DiscordSessionUser;
  guilds: ManagedGuild[];
}

/**
 * Sign in with Discord. The session token is issued by the API as an httpOnly
 * cookie (XSS-safe, never readable by JS), so every call goes out with
 * withCredentials and we never hold the token in the app.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/auth/discord`;

  /** Get the Discord authorize URL and send the browser to it. */
  startLogin(): void {
    this.http.get<{ url: string }>(`${this.base}/login`).subscribe({
      next: res => { if (res?.url) window.location.href = res.url; },
      error: () => { /* surfaced by the caller's UI if needed */ },
    });
  }

  /** Trade the OAuth code for a session (cookie is set) + manageable guilds. */
  exchange(code: string): Observable<DiscordExchangeResult> {
    return this.http.post<DiscordExchangeResult>(`${this.base}/callback`, { code }, { withCredentials: true });
  }

  /** Validate the session cookie on boot and return the current identity. */
  me(): Observable<DiscordSessionUser> {
    return this.http.get<DiscordSessionUser>(`${this.base}/me`, { withCredentials: true });
  }

  /** Clear the session cookie server-side. */
  logout(): Observable<{ ok: true }> {
    return this.http.post<{ ok: true }>(`${this.base}/logout`, {}, { withCredentials: true });
  }
}
