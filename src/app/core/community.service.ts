import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface GuildCommunityStatus {
  /** Whether the Servitium bot is currently in the guild. */
  botPresent: boolean;
  /** The community/config id backing the guild, or null if not connected yet. */
  serverId: string | null;
  /** Bot invite URL pre-targeted to this guild. */
  inviteUrl: string;
}

/** Per-guild onboarding: is the bot in, and is a community connected. */
@Injectable({ providedIn: 'root' })
export class CommunityService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/discord-communities`;

  status(guildId: string): Observable<GuildCommunityStatus> {
    return this.http.get<GuildCommunityStatus>(`${this.base}/guild/${guildId}/status`);
  }

  connect(guildId: string, guildName: string): Observable<{ serverId: string }> {
    return this.http.post<{ serverId: string }>(`${this.base}/guild/${guildId}/connect`, { guildName });
  }
}
