import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DiscordDataPort,
  DiscordConfig,
  DiscordChannelConfig,
  ChannelOptions,
  DiscordRole,
  DiscordChannel,
  VoiceHub,
  DiscordGuildConfigAdvanced,
  DiscordGameAccessMode,
} from '@servitium/discord';
import { environment } from '../../environments/environment';

/**
 * DiscordDataPort implementation for the standalone app: same API as Center,
 * scoped by the community/config id (clientId). The session token is attached
 * by the auth interceptor.
 */
@Injectable({ providedIn: 'root' })
export class DiscordDataAdapter implements DiscordDataPort {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/clients`;

  getDiscordConfig(clientId: string): Observable<DiscordConfig> {
    return this.http.get<DiscordConfig>(`${this.base}/${clientId}/discord`);
  }
  createOrUpdateConfig(clientId: string, config: Partial<DiscordConfig>): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.base}/${clientId}/discord`, config);
  }
  enableDiscord(clientId: string): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.base}/${clientId}/discord/enable`, {});
  }
  disableDiscord(clientId: string): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.base}/${clientId}/discord/disable`, {});
  }
  getInviteUrl(serverId: string): Observable<{ inviteUrl: string }> {
    return this.http.get<{ inviteUrl: string }>(`${this.base}/${serverId}/discord/invite`);
  }
  getAvailableGuilds(clientId: string): Observable<{ guilds: Array<{ guildId: string; guildName: string; serverName: string; serverId: string }> }> {
    return this.http.get<any>(`${this.base}/${clientId}/discord/available-guilds`);
  }
  linkToExistingGuild(clientId: string, guildId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/${clientId}/discord/link/${clientId}/${guildId}`, {});
  }
  unlinkDiscord(clientId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/${clientId}/discord/unlink`, {});
  }
  getDiscordRoles(clientId: string): Observable<{ roles: DiscordRole[] }> {
    return this.http.get<{ roles: DiscordRole[] }>(`${this.base}/${clientId}/discord/roles`);
  }
  getAvailableChannels(clientId: string): Observable<DiscordChannel[]> {
    return this.http.get<DiscordChannel[]>(`${this.base}/${clientId}/discord/channels/list`);
  }

  configureChannel(clientId: string, channelType: string, config: Partial<DiscordChannelConfig>): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.base}/${clientId}/discord/channels/${channelType}`, config);
  }
  renameChannel(clientId: string, channelType: string, newName: string): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.base}/${clientId}/discord/channels/${channelType}/rename`, { newName });
  }
  updateChannelVisibility(clientId: string, channelType: string, visibility: 'public' | 'admin-only'): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.base}/${clientId}/discord/channels/${channelType}`, { visibility });
  }
  updateChannelOptions(clientId: string, channelType: string, options: Partial<ChannelOptions>): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.base}/${clientId}/discord/channels/${channelType}/options`, { options });
  }
  resyncChannels(clientId: string): Observable<{ resynced: string[]; failed: Array<{ channel: string; error: string }> }> {
    return this.http.post<any>(`${this.base}/${clientId}/discord/channels/resync`, {});
  }
  saveCategories(
    clientId: string,
    body: { categories: Array<{ key: string; name: string; showServerName?: boolean }>; assignments: Record<string, string | null>; categoryPrefix?: string },
  ): Observable<{ applied: number; failed: Array<{ channel: string; error: string }> }> {
    return this.http.put<any>(`${this.base}/${clientId}/discord/categories`, body);
  }

  updateWelcomeChannel(clientId: string, channelId: string | null): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.base}/${clientId}/discord/welcome-channel`, { channelId });
  }
  updateWelcomeSettings(
    clientId: string,
    settings: { imageUrl?: string | null; thumbnailUrl?: string | null; title?: string | null; description?: string | null },
  ): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.base}/${clientId}/discord/welcome-settings`, settings);
  }

  createVoiceHub(clientId: string, body: { namePattern?: string; allowedRoleIds?: string[] }): Observable<{ message: string; hub: VoiceHub }> {
    return this.http.post<{ message: string; hub: VoiceHub }>(`${this.base}/${clientId}/discord/voice-hubs`, body);
  }
  updateVoiceHub(clientId: string, channelId: string, body: { namePattern?: string; allowedRoleIds?: string[] }): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.base}/${clientId}/discord/voice-hubs/${channelId}`, body);
  }
  deleteVoiceHub(clientId: string, channelId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${clientId}/discord/voice-hubs/${channelId}`);
  }

  getAdvancedGuildConfig(clientId: string): Observable<{ success: boolean; config: DiscordGuildConfigAdvanced | null }> {
    return this.http.get<any>(`${this.base}/${clientId}/discord/advanced/config`);
  }
  updateAdvancedGuildConfig(clientId: string, gameAccessMode: DiscordGameAccessMode): Observable<{ success: boolean; guildConfig: DiscordGuildConfigAdvanced }> {
    return this.http.patch<any>(`${this.base}/${clientId}/discord/advanced/config`, { gameAccessMode });
  }
  getGuildLinkedServers(clientId: string): Observable<{ servers: Array<{ serverId: string; serverName: string; gameType: string; isInSpaces: boolean; roleId?: string; roleName?: string }> }> {
    return this.http.get<any>(`${this.base}/${clientId}/discord/advanced/servers`);
  }
  createGameServerRoles(clientId: string, serverIds?: string[]): Observable<{ success: boolean; guildConfig: DiscordGuildConfigAdvanced }> {
    return this.http.post<any>(`${this.base}/${clientId}/discord/advanced/create-roles`, serverIds ? { serverIds } : {});
  }
  setupSelectionPanel(clientId: string): Observable<{ success: boolean; guildConfig: DiscordGuildConfigAdvanced }> {
    return this.http.post<any>(`${this.base}/${clientId}/discord/advanced/setup-selection`, {});
  }

  // Agent (paid) — not exposed in the standalone free UI, but the port requires them.
  refreshServerInfo(clientId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/${clientId}/discord/server-info/refresh`, {});
  }
  sendPvPStats(clientId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/${clientId}/discord/pvp-stats`, {});
  }
  sendGuildPvPStats(clientId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/${clientId}/discord/guild-pvp-stats`, {});
  }
  sendBuildingLeaderboard(clientId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/${clientId}/discord/building-leaderboard`, {});
  }
  triggerBuildingAlerts(clientId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/${clientId}/discord/building-alerts`, {});
  }
}
