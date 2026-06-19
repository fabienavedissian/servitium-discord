import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  DiscordMessageComponent,
  DiscordWelcomeChannelComponent,
  DiscordVoiceHubsComponent,
  DiscordLevelingComponent,
  DiscordReactionRolesComponent,
  DiscordStatsComponent,
  DiscordAutomodComponent,
  DiscordGiveawaysComponent,
  DiscordVerificationComponent,
  LocalizePipe,
  GreetingSeed,
  WelcomeChannelSeed,
  DiscordChannel,
  DiscordRole,
  VoiceHub,
  DiscordConfig,
} from '@servitium/discord';
import { SvtButtonComponent, SvtCardComponent, SvtIconComponent, SvtSelectComponent, SelectOption } from '@servitium/ui';
import { DiscordDataAdapter } from '../../core/discord-data.adapter';
import { SessionService } from '../../core/session.service';
import { CommunityService } from '../../core/community.service';
import { NotificationService } from '../../core/notification.service';
import { I18nService } from '../../core/i18n.service';

const LANG_LABELS: Record<string, string> = {
  en: 'English', fr: 'Français', de: 'Deutsch', es: 'Español', pt: 'Português', ru: 'Русский',
};

type GuildState = 'idle' | 'checking' | 'needs-bot' | 'needs-connect' | 'connecting' | 'ready';

/**
 * Free-tier dashboard: pick a managed guild; depending on whether the bot is in
 * the guild and a community already backs it, prompt to invite / connect / or
 * configure the features (welcome, voice) via the SHARED @servitium/discord
 * components — the exact same UI as center.servitium.org/discord.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SvtButtonComponent,
    SvtCardComponent,
    SvtIconComponent,
    SvtSelectComponent,
    DiscordMessageComponent,
    DiscordWelcomeChannelComponent,
    DiscordVoiceHubsComponent,
    DiscordLevelingComponent,
    DiscordReactionRolesComponent,
    DiscordStatsComponent,
    DiscordAutomodComponent,
    DiscordGiveawaysComponent,
    DiscordVerificationComponent,
    LocalizePipe,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit {
  private data = inject(DiscordDataAdapter);
  private community = inject(CommunityService);
  private notify = inject(NotificationService);
  private router = inject(Router);
  session = inject(SessionService);
  i18n = inject(I18nService);

  // Re-derive state + reload config/channels on a fresh page load when a guild
  // is already selected from the persisted session (no manual re-select needed).
  ngOnInit(): void {
    if (this.session.selectedGuildId()) this.refreshGuild();
  }

  logout(): void {
    this.session.logout();
    this.router.navigateByUrl('/');
  }

  langOptions: SelectOption[] = this.i18n.languages.map(l => ({ value: l, label: LANG_LABELS[l] || l }));
  onLangChange(option: SelectOption | null): void {
    if (option?.value) this.i18n.setLang(option.value as any);
  }

  loading = signal<boolean>(false);
  state = signal<GuildState>('idle');
  inviteUrl = signal<string>('');
  activeTab = signal<'welcome' | 'goodbye' | 'salon' | 'voice' | 'verification' | 'leveling' | 'reaction-roles' | 'stats' | 'automod' | 'giveaways'>('welcome');
  private _config = signal<DiscordConfig | null>(null);
  channels = signal<DiscordChannel[]>([]);
  roles = signal<DiscordRole[]>([]);

  setTab(tab: 'welcome' | 'goodbye' | 'salon' | 'voice' | 'verification' | 'leveling' | 'reaction-roles' | 'stats' | 'automod' | 'giveaways'): void { this.activeTab.set(tab); }

  guildOptions = computed<SelectOption[]>(() =>
    this.session.guilds().map(g => ({ value: g.guildId, label: g.guildName })),
  );

  selectedGuild = computed(() =>
    this.session.guilds().find(g => g.guildId === this.session.selectedGuildId()) || null,
  );

  clientId = computed(() => this.selectedGuild()?.serverId || '');

  config = computed(() => this._config());
  serverName = computed(() => this._config()?.serverName || this.selectedGuild()?.guildName || '');

  private seed(mode: 'welcome' | 'goodbye'): GreetingSeed {
    const c = (this._config() as any) || {};
    return {
      enabled: mode === 'welcome' ? c.welcomeEnabled !== false : c.goodbyeEnabled === true,
      channelId: c[`${mode}ChannelId`] ?? null,
      channelName: c[`${mode}ChannelName`] ?? null,
      title: c[`${mode}Title`] ?? '',
      description: c[`${mode}Description`] ?? '',
      imageUrl: c[`${mode}ImageUrl`] ?? '',
      thumbnailUrl: c[`${mode}ThumbnailUrl`] ?? '',
      color: c[`${mode}Color`] ?? '',
      ping: mode === 'welcome' ? c.welcomePing !== false : false,
      bannerEnabled: c[`${mode}BannerEnabled`] === true,
      bannerColor: c[`${mode}BannerColor`] ?? '',
      blocks: c[`${mode}Blocks`] ?? [],
    };
  }
  welcomeSeed = computed<GreetingSeed>(() => this.seed('welcome'));
  goodbyeSeed = computed<GreetingSeed>(() => this.seed('goodbye'));
  welcomeChannelSeed = computed<WelcomeChannelSeed>(() => {
    const wc = (this._config() as any)?.welcomeChannel || {};
    return { channelId: wc.channelId ?? null, messageId: wc.messageId ?? null, blocks: wc.blocks ?? [] };
  });
  voiceHubs = computed<VoiceHub[]>(() => (this._config() as any)?.voiceHubs || []);

  onGuildSelect(option: SelectOption | null): void {
    if (!option?.value) return;
    this.session.selectGuild(option.value);
    this.refreshGuild();
  }

  /** Decide what the selected guild needs: invite the bot, connect, or edit. */
  refreshGuild(): void {
    const guild = this.selectedGuild();
    if (!guild) { this.state.set('idle'); return; }

    if (guild.serverId) { this.state.set('ready'); this.loadConfig(); return; }

    this.state.set('checking');
    this.community.status(guild.guildId).subscribe({
      next: s => {
        this.inviteUrl.set(s.inviteUrl);
        if (s.serverId) {
          this.session.setGuildServerId(guild.guildId, s.serverId);
          this.state.set('ready');
          this.loadConfig();
        } else if (s.botPresent) {
          this.state.set('needs-connect');
        } else {
          this.state.set('needs-bot');
        }
      },
      error: () => { this.state.set('needs-bot'); },
    });
  }

  /** Open the targeted bot invite in a new tab. */
  openInvite(): void {
    const url = this.inviteUrl();
    if (url) window.open(url, '_blank', 'noopener');
  }

  /** Create the free community backing the guild, then load its config. */
  connect(): void {
    const guild = this.selectedGuild();
    if (!guild) return;
    this.state.set('connecting');
    this.community.connect(guild.guildId, guild.guildName).subscribe({
      next: res => {
        this.session.setGuildServerId(guild.guildId, res.serverId);
        this.state.set('ready');
        this.loadConfig();
        this.notify.success(this.i18n.translate('common.success'), this.i18n.translate('discordApp.connectedToast'));
      },
      error: () => {
        // Don't assume "no bot" — re-derive the real state from a fresh check.
        this.notify.error(this.i18n.translate('common.error'), this.i18n.translate('discordApp.connectError'));
        this.refreshGuild();
      },
    });
  }

  private loadConfig(): void {
    const id = this.clientId();
    if (!id) { this._config.set(null); return; }
    this.loading.set(true);
    this.data.getDiscordConfig(id).subscribe({
      next: cfg => { this._config.set(cfg); this.loading.set(false); },
      error: () => { this._config.set(null); this.loading.set(false); },
    });
    this.data.getAvailableChannels(id).subscribe({ next: ch => this.channels.set(ch), error: () => this.channels.set([]) });
    this.data.getDiscordRoles(id).subscribe({ next: r => this.roles.set(r.roles || []), error: () => this.roles.set([]) });
  }
}
