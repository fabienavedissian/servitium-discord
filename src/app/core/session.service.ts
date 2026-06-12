import { Injectable, signal } from '@angular/core';

export interface DiscordSessionUser {
  id: string;
  username: string;
  avatar?: string | null;
}

export interface ManagedGuild {
  /** Discord guild id. */
  guildId: string;
  guildName: string;
  iconUrl?: string | null;
  /** The Servitium community/config id (serverId) backing this guild, if any. */
  serverId?: string | null;
}

const TOKEN_KEY = 'svt_discord_session';

/**
 * Holds the Discord-OAuth session token, the logged-in user and the currently
 * selected managed guild. Populated by the OAuth callback.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private _token = signal<string | null>(typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null);
  private _user = signal<DiscordSessionUser | null>(null);
  private _guilds = signal<ManagedGuild[]>([]);
  private _selectedGuildId = signal<string | null>(null);

  token = this._token.asReadonly();
  user = this._user.asReadonly();
  guilds = this._guilds.asReadonly();
  selectedGuildId = this._selectedGuildId.asReadonly();

  isLoggedIn(): boolean {
    return !!this._token();
  }

  setSession(token: string, user: DiscordSessionUser, guilds: ManagedGuild[]): void {
    this._token.set(token);
    this._user.set(user);
    this._guilds.set(guilds);
    if (typeof localStorage !== 'undefined') localStorage.setItem(TOKEN_KEY, token);
  }

  selectGuild(guildId: string): void {
    this._selectedGuildId.set(guildId);
  }

  clear(): void {
    this._token.set(null);
    this._user.set(null);
    this._guilds.set([]);
    this._selectedGuildId.set(null);
    if (typeof localStorage !== 'undefined') localStorage.removeItem(TOKEN_KEY);
  }
}
