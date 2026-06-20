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
  GreetingMode,
  GreetingSettingsPayload,
  LevelingConfig,
  LevelEntry,
  ReactionPanel,
  CreateReactionPanelPayload,
  AutomodConfig,
  StatsChannelsConfig,
  DiscordGiveaway,
  CreateGiveawayPayload,
  CustomCommandsFeature,
  CustomCommand,
  CustomCommandPayload,
  RemindersFeature,
  DiscordReminder,
  ReminderPayload,
  AutomationsFeature,
  DiscordAutomation,
  AutomationPayload,
  LogsConfig,
  SuggestionsConfig,
  DiscordSuggestion,
  WipeAnnounceConfig,
  StreamerAlertsConfig,
  BotProfile,
  ReactionRolesFeature,
  GiveawaysFeature,
  VerificationConfig,
  GreetingBlock,
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
  unlinkDiscord(clientId: string): Observable<{ message: string; botLeft?: boolean; stillUsedBy?: number }> {
    return this.http.post<{ message: string; botLeft?: boolean; stillUsedBy?: number }>(`${this.base}/${clientId}/discord/unlink`, {});
  }
  getDiscordRoles(clientId: string): Observable<{ roles: DiscordRole[] }> {
    return this.http.get<{ roles: DiscordRole[] }>(`${this.base}/${clientId}/discord/roles`);
  }
  getAvailableChannels(clientId: string): Observable<DiscordChannel[]> {
    return this.http.get<DiscordChannel[]>(`${this.base}/${clientId}/discord/channels/list`);
  }
  createChannel(clientId: string, name: string, kind: 'text' | 'voice' = 'text'): Observable<{ channel: DiscordChannel }> {
    return this.http.post<{ channel: DiscordChannel }>(`${this.base}/${clientId}/discord/channels`, { name, kind });
  }
  listChannelMessages(clientId: string, channelId: string): Observable<Array<{ id: string; label: string }>> {
    return this.http.get<Array<{ id: string; label: string }>>(`${this.base}/${clientId}/discord/channels/${channelId}/messages`);
  }
  getGuildEmojis(clientId: string): Observable<Array<{ id: string; name: string; animated: boolean; mention: string }>> {
    return this.http.get<Array<{ id: string; name: string; animated: boolean; mention: string }>>(`${this.base}/${clientId}/discord/emojis`);
  }

  // ── Welcome channel / "Salon d'accueil" (static rich block message) ──
  getWelcomeChannelComposer(clientId: string): Observable<{ channelId: string | null; messageId: string | null; blocks: GreetingBlock[] }> {
    return this.http.get<{ channelId: string | null; messageId: string | null; blocks: GreetingBlock[] }>(
      `${this.base}/${clientId}/discord/welcome-channel`,
    );
  }
  setWelcomeChannelTarget(clientId: string, channelId: string | null): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.base}/${clientId}/discord/welcome-channel/target`, { channelId });
  }
  updateWelcomeChannelBlocks(clientId: string, blocks: GreetingBlock[]): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.base}/${clientId}/discord/welcome-channel/blocks`, { blocks });
  }
  publishWelcomeChannel(clientId: string): Observable<{ message: string; messageId: string }> {
    return this.http.post<{ message: string; messageId: string }>(`${this.base}/${clientId}/discord/welcome-channel/publish`, {});
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

  updateGreetingChannel(clientId: string, mode: GreetingMode, channelId: string | null): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.base}/${clientId}/discord/${mode}-channel`, { channelId });
  }
  updateGreetingSettings(clientId: string, mode: GreetingMode, settings: GreetingSettingsPayload): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.base}/${clientId}/discord/${mode}-settings`, settings);
  }
  sendGreetingTest(clientId: string, mode: GreetingMode, sampleName?: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/${clientId}/discord/greeting-test`, { mode, sampleName });
  }
  updateGreetingBlocks(clientId: string, mode: GreetingMode, blocks: GreetingBlock[]): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.base}/${clientId}/discord/greeting/${mode}/blocks`, { blocks });
  }
  uploadGreetingImage(clientId: string, file: File): Observable<{ url: string }> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ url: string }>(`${this.base}/${clientId}/discord/upload-image`, form);
  }

  bannerBaseUrl(): string {
    return `${environment.apiUrl}/assets/banners`;
  }

  createVoiceHub(clientId: string, body: { namePattern?: string; allowedRoleIds?: string[] }): Observable<{ message: string; hub: VoiceHub }> {
    return this.http.post<{ message: string; hub: VoiceHub }>(`${this.base}/${clientId}/discord/voice-hubs`, body);
  }
  updateVoiceHub(clientId: string, channelId: string, body: { namePattern?: string; allowedRoleIds?: string[]; userLimit?: number; locked?: boolean; ownerControls?: boolean }): Observable<{ message: string }> {
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

  // Leveling (free)
  getLevelingConfig(clientId: string): Observable<LevelingConfig> {
    return this.http.get<LevelingConfig>(`${this.base}/${clientId}/discord/leveling`);
  }
  updateLevelingConfig(clientId: string, config: Partial<LevelingConfig>): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.base}/${clientId}/discord/leveling`, config);
  }
  setLevelingPreset(clientId: string, body: { enabled?: boolean; preset?: string }): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.base}/${clientId}/discord/leveling/preset`, body);
  }
  getLevelingLeaderboard(clientId: string): Observable<LevelEntry[]> {
    return this.http.get<LevelEntry[]>(`${this.base}/${clientId}/discord/leveling/leaderboard`);
  }

  // Reaction-roles feature switch (free)
  getReactionRolesFeature(clientId: string): Observable<ReactionRolesFeature> {
    return this.http.get<ReactionRolesFeature>(`${this.base}/${clientId}/discord/reaction-roles-feature`);
  }
  updateReactionRolesFeature(clientId: string, payload: Partial<ReactionRolesFeature>): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.base}/${clientId}/discord/reaction-roles-feature`, payload);
  }

  // Reaction-role panels (free)
  getReactionPanels(clientId: string): Observable<ReactionPanel[]> {
    return this.http.get<ReactionPanel[]>(`${this.base}/${clientId}/discord/reaction-panels`);
  }
  createReactionPanel(clientId: string, payload: CreateReactionPanelPayload): Observable<{ message: string; panel: ReactionPanel }> {
    return this.http.post<{ message: string; panel: ReactionPanel }>(`${this.base}/${clientId}/discord/reaction-panels`, payload);
  }
  deleteReactionPanel(clientId: string, panelId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${clientId}/discord/reaction-panels/${panelId}`);
  }

  // AutoMod (free)
  getAutomodConfig(clientId: string): Observable<AutomodConfig> {
    return this.http.get<AutomodConfig>(`${this.base}/${clientId}/discord/automod`);
  }
  updateAutomodConfig(clientId: string, config: Partial<AutomodConfig>): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.base}/${clientId}/discord/automod`, config);
  }
  setAutomodPreset(clientId: string, body: { enabled?: boolean; preset?: string }): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.base}/${clientId}/discord/automod/preset`, body);
  }
  updateAutomodSettings(clientId: string, settings: any): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.base}/${clientId}/discord/automod/settings`, settings);
  }
  updateAutomodKeywords(clientId: string, keywords: string[]): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.base}/${clientId}/discord/automod/keywords`, { keywords });
  }

  updateAutomodExemptRoles(clientId: string, roleIds: string[]): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.base}/${clientId}/discord/automod/exempt-roles`, { roleIds });
  }

  // Stats voice channels (free)
  getStatsChannels(clientId: string): Observable<StatsChannelsConfig> {
    return this.http.get<StatsChannelsConfig>(`${this.base}/${clientId}/discord/stats-channels`);
  }
  updateStatsChannels(clientId: string, config: Partial<StatsChannelsConfig>): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.base}/${clientId}/discord/stats-channels`, config);
  }

  // Giveaways (free)
  getGiveaways(clientId: string): Observable<DiscordGiveaway[]> {
    return this.http.get<DiscordGiveaway[]>(`${this.base}/${clientId}/discord/giveaways`);
  }
  createGiveaway(clientId: string, payload: CreateGiveawayPayload): Observable<{ message: string; giveaway: DiscordGiveaway }> {
    return this.http.post<{ message: string; giveaway: DiscordGiveaway }>(`${this.base}/${clientId}/discord/giveaways`, payload);
  }
  deleteGiveaway(clientId: string, giveawayId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${clientId}/discord/giveaways/${giveawayId}`);
  }
  endGiveawayNow(clientId: string, giveawayId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/${clientId}/discord/giveaways/${giveawayId}/end`, {});
  }
  rerollGiveaway(clientId: string, giveawayId: string): Observable<{ message: string; winners: string[] }> {
    return this.http.post<{ message: string; winners: string[] }>(`${this.base}/${clientId}/discord/giveaways/${giveawayId}/reroll`, {});
  }

  getCustomCommandsFeature(clientId: string): Observable<CustomCommandsFeature> {
    return this.http.get<CustomCommandsFeature>(`${this.base}/${clientId}/discord/custom-commands/feature`);
  }
  updateCustomCommandsFeature(clientId: string, payload: Partial<CustomCommandsFeature>): Observable<CustomCommandsFeature> {
    return this.http.put<CustomCommandsFeature>(`${this.base}/${clientId}/discord/custom-commands/feature`, payload);
  }
  getCustomCommands(clientId: string): Observable<CustomCommand[]> {
    return this.http.get<CustomCommand[]>(`${this.base}/${clientId}/discord/custom-commands`);
  }
  restoreCustomCommands(clientId: string): Observable<{ message: string; commands: CustomCommand[] }> {
    return this.http.post<{ message: string; commands: CustomCommand[] }>(`${this.base}/${clientId}/discord/custom-commands/restore`, {});
  }

  getRemindersFeature(clientId: string): Observable<RemindersFeature> {
    return this.http.get<RemindersFeature>(`${this.base}/${clientId}/discord/reminders/feature`);
  }
  updateRemindersFeature(clientId: string, payload: Partial<RemindersFeature>): Observable<RemindersFeature> {
    return this.http.put<RemindersFeature>(`${this.base}/${clientId}/discord/reminders/feature`, payload);
  }
  getReminders(clientId: string): Observable<DiscordReminder[]> {
    return this.http.get<DiscordReminder[]>(`${this.base}/${clientId}/discord/reminders`);
  }
  createReminder(clientId: string, payload: ReminderPayload): Observable<{ message: string; reminder: DiscordReminder }> {
    return this.http.post<{ message: string; reminder: DiscordReminder }>(`${this.base}/${clientId}/discord/reminders`, payload);
  }
  updateReminder(clientId: string, reminderId: string, payload: ReminderPayload): Observable<{ message: string; reminder: DiscordReminder }> {
    return this.http.put<{ message: string; reminder: DiscordReminder }>(`${this.base}/${clientId}/discord/reminders/${reminderId}`, payload);
  }
  deleteReminder(clientId: string, reminderId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${clientId}/discord/reminders/${reminderId}`);
  }
  testReminder(clientId: string, reminderId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/${clientId}/discord/reminders/${reminderId}/test`, {});
  }

  getAutomationsFeature(clientId: string): Observable<AutomationsFeature> {
    return this.http.get<AutomationsFeature>(`${this.base}/${clientId}/discord/automations/feature`);
  }
  updateAutomationsFeature(clientId: string, payload: Partial<AutomationsFeature>): Observable<AutomationsFeature> {
    return this.http.put<AutomationsFeature>(`${this.base}/${clientId}/discord/automations/feature`, payload);
  }
  getAutomations(clientId: string): Observable<DiscordAutomation[]> {
    return this.http.get<DiscordAutomation[]>(`${this.base}/${clientId}/discord/automations`);
  }
  createAutomation(clientId: string, payload: AutomationPayload): Observable<{ message: string; automation: DiscordAutomation }> {
    return this.http.post<{ message: string; automation: DiscordAutomation }>(`${this.base}/${clientId}/discord/automations`, payload);
  }
  updateAutomation(clientId: string, automationId: string, payload: AutomationPayload): Observable<{ message: string; automation: DiscordAutomation }> {
    return this.http.put<{ message: string; automation: DiscordAutomation }>(`${this.base}/${clientId}/discord/automations/${automationId}`, payload);
  }
  deleteAutomation(clientId: string, automationId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${clientId}/discord/automations/${automationId}`);
  }

  getLogs(clientId: string): Observable<LogsConfig> {
    return this.http.get<LogsConfig>(`${this.base}/${clientId}/discord/logs`);
  }
  updateLogs(clientId: string, payload: Partial<LogsConfig>): Observable<LogsConfig> {
    return this.http.put<LogsConfig>(`${this.base}/${clientId}/discord/logs`, payload);
  }
  testLogs(clientId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/${clientId}/discord/logs/test`, {});
  }

  getSuggestionsConfig(clientId: string): Observable<SuggestionsConfig> {
    return this.http.get<SuggestionsConfig>(`${this.base}/${clientId}/discord/suggestions/config`);
  }
  updateSuggestionsConfig(clientId: string, payload: Partial<SuggestionsConfig>): Observable<SuggestionsConfig> {
    return this.http.put<SuggestionsConfig>(`${this.base}/${clientId}/discord/suggestions/config`, payload);
  }
  postSuggestionsPanel(clientId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/${clientId}/discord/suggestions/panel`, {});
  }
  getSuggestions(clientId: string): Observable<DiscordSuggestion[]> {
    return this.http.get<DiscordSuggestion[]>(`${this.base}/${clientId}/discord/suggestions`);
  }

  getWipeAnnounce(clientId: string): Observable<WipeAnnounceConfig> {
    return this.http.get<WipeAnnounceConfig>(`${this.base}/${clientId}/discord/wipe-announce`);
  }
  updateWipeAnnounce(clientId: string, payload: Partial<WipeAnnounceConfig>): Observable<WipeAnnounceConfig> {
    return this.http.put<WipeAnnounceConfig>(`${this.base}/${clientId}/discord/wipe-announce`, payload);
  }
  testWipeAnnounce(clientId: string, alert: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/${clientId}/discord/wipe-announce/test`, { alert });
  }

  getStreamerAlerts(clientId: string): Observable<StreamerAlertsConfig> {
    return this.http.get<StreamerAlertsConfig>(`${this.base}/${clientId}/discord/streamer-alerts`);
  }
  updateStreamerAlerts(clientId: string, payload: Partial<StreamerAlertsConfig>): Observable<StreamerAlertsConfig> {
    return this.http.put<StreamerAlertsConfig>(`${this.base}/${clientId}/discord/streamer-alerts`, payload);
  }
  testStreamerAlerts(clientId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/${clientId}/discord/streamer-alerts/test`, {});
  }

  getBotProfile(clientId: string): Observable<BotProfile> {
    return this.http.get<BotProfile>(`${this.base}/${clientId}/discord/bot-profile`);
  }
  updateBotProfile(clientId: string, nickname: string): Observable<BotProfile> {
    return this.http.put<BotProfile>(`${this.base}/${clientId}/discord/bot-profile`, { nickname });
  }
  createCustomCommand(clientId: string, payload: CustomCommandPayload): Observable<{ message: string; command: CustomCommand }> {
    return this.http.post<{ message: string; command: CustomCommand }>(`${this.base}/${clientId}/discord/custom-commands`, payload);
  }
  updateCustomCommand(clientId: string, commandId: string, payload: CustomCommandPayload): Observable<{ message: string; command: CustomCommand }> {
    return this.http.put<{ message: string; command: CustomCommand }>(`${this.base}/${clientId}/discord/custom-commands/${commandId}`, payload);
  }
  deleteCustomCommand(clientId: string, commandId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${clientId}/discord/custom-commands/${commandId}`);
  }

  // Verification gate (free)
  getVerificationConfig(clientId: string): Observable<VerificationConfig> {
    return this.http.get<VerificationConfig>(`${this.base}/${clientId}/discord/verification`);
  }
  updateVerificationConfig(clientId: string, config: Partial<VerificationConfig>): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.base}/${clientId}/discord/verification`, config);
  }
  setupVerification(clientId: string): Observable<{ message: string; config: VerificationConfig }> {
    return this.http.post<{ message: string; config: VerificationConfig }>(`${this.base}/${clientId}/discord/verification/setup`, {});
  }
  disableVerification(clientId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/${clientId}/discord/verification/disable`, {});
  }

  // Giveaways feature switch (free)
  getGiveawaysFeature(clientId: string): Observable<GiveawaysFeature> {
    return this.http.get<GiveawaysFeature>(`${this.base}/${clientId}/discord/giveaways-feature`);
  }
  updateGiveawaysFeature(clientId: string, payload: Partial<GiveawaysFeature>): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.base}/${clientId}/discord/giveaways-feature`, payload);
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
