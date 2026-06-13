import { Injectable, signal, computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';

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

interface PersistedSession {
  user: DiscordSessionUser;
  guilds: ManagedGuild[];
}

// Only non-secret display data (identity + guild list) is cached here. The
// session TOKEN lives in an httpOnly cookie and never touches localStorage.
const KEY = 'svt_discord_session';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private auth = inject(AuthService);

  private _user = signal<DiscordSessionUser | null>(null);
  private _guilds = signal<ManagedGuild[]>([]);
  private _selectedGuildId = signal<string | null>(null);
  private _validated = false;

  user = this._user.asReadonly();
  guilds = this._guilds.asReadonly();
  selectedGuildId = this._selectedGuildId.asReadonly();
  isLoggedIn = computed(() => !!this._user());

  constructor() {
    this.restore();
  }

  setSession(user: DiscordSessionUser, guilds: ManagedGuild[]): void {
    this._user.set(user);
    this._guilds.set(guilds);
    if (guilds.length && !this._selectedGuildId()) this._selectedGuildId.set(guilds[0].guildId);
    this._validated = true;
    this.persist();
  }

  /** Update the serverId backing a guild (set once its community is created). */
  setGuildServerId(guildId: string, serverId: string): void {
    this._guilds.update(gs => gs.map(g => g.guildId === guildId ? { ...g, serverId } : g));
    this.persist();
  }

  selectGuild(guildId: string): void {
    this._selectedGuildId.set(guildId);
  }

  /**
   * Confirms the httpOnly cookie is still valid (called by the route guard).
   * Optimistically trusts the cached identity, then verifies against the API
   * once per app load; a dead cookie clears the session.
   */
  async ensureAuthenticated(): Promise<boolean> {
    if (this._validated) return !!this._user();
    try {
      const me = await firstValueFrom(this.auth.me());
      this._user.set(me);
      this._validated = true;
      this.persist();
      return true;
    } catch {
      this.clear();
      return false;
    }
  }

  clear(): void {
    this._user.set(null);
    this._guilds.set([]);
    this._selectedGuildId.set(null);
    this._validated = false;
    if (typeof localStorage !== 'undefined') localStorage.removeItem(KEY);
  }

  logout(): void {
    this.auth.logout().subscribe({ next: () => {}, error: () => {} });
    this.clear();
  }

  private persist(): void {
    if (typeof localStorage === 'undefined') return;
    const u = this._user();
    if (!u) return;
    const data: PersistedSession = { user: u, guilds: this._guilds() };
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  private restore(): void {
    if (typeof localStorage === 'undefined') return;
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    try {
      const data = JSON.parse(raw) as PersistedSession;
      if (data?.user) {
        this._user.set(data.user);
        this._guilds.set(data.guilds || []);
        if (data.guilds?.length) this._selectedGuildId.set(data.guilds[0].guildId);
      }
    } catch {
      localStorage.removeItem(KEY);
    }
  }
}
