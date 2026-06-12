import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DiscordWelcomeComponent,
  DiscordVoiceHubsComponent,
  WelcomeSeed,
  DiscordChannel,
  DiscordRole,
  VoiceHub,
  DiscordConfig,
} from '@servitium/discord';
import { SvtCardComponent, SvtIconComponent, SvtSelectComponent, SelectOption } from '@servitium/ui';
import { DiscordDataAdapter } from '../../core/discord-data.adapter';
import { SessionService } from '../../core/session.service';

/**
 * Free-tier dashboard: pick a managed guild, then configure the community
 * features (welcome, voice) via the SHARED @servitium/discord components — the
 * exact same UI as center.servitium.org/discord.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SvtCardComponent,
    SvtIconComponent,
    SvtSelectComponent,
    DiscordWelcomeComponent,
    DiscordVoiceHubsComponent,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent {
  private data = inject(DiscordDataAdapter);
  session = inject(SessionService);

  loading = signal<boolean>(false);
  private _config = signal<DiscordConfig | null>(null);
  channels = signal<DiscordChannel[]>([]);
  roles = signal<DiscordRole[]>([]);

  guildOptions = computed<SelectOption[]>(() =>
    this.session.guilds().map(g => ({ value: g.guildId, label: g.guildName })),
  );

  selectedGuild = computed(() =>
    this.session.guilds().find(g => g.guildId === this.session.selectedGuildId()) || null,
  );

  // The community/config id backing the selected guild (set once the guild is
  // connected to Servitium). Until then, nothing to configure.
  clientId = computed(() => this.selectedGuild()?.serverId || '');

  config = computed(() => this._config());
  serverName = computed(() => this._config()?.serverName || this.selectedGuild()?.guildName || '');
  welcomeSeed = computed<WelcomeSeed>(() => {
    const c = this._config() as any;
    return {
      channelId: c?.welcomeChannelId ?? null,
      imageUrl: c?.welcomeImageUrl ?? '',
      thumbnailUrl: c?.welcomeThumbnailUrl ?? '',
      title: c?.welcomeTitle ?? '',
      description: c?.welcomeDescription ?? '',
    };
  });
  voiceHubs = computed<VoiceHub[]>(() => (this._config() as any)?.voiceHubs || []);

  onGuildSelect(option: SelectOption | null): void {
    if (!option?.value) return;
    this.session.selectGuild(option.value);
    this.loadConfig();
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
