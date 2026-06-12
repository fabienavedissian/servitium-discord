import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvtButtonComponent, SvtCardComponent, SvtIconComponent } from '@servitium/ui';

interface FeatureCard {
  icon: string;
  title: string;
  text: string;
  free: boolean;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, SvtButtonComponent, SvtCardComponent, SvtIconComponent],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class LandingComponent {
  readonly inviteUrl =
    'https://discord.com/oauth2/authorize?client_id=&scope=bot%20applications.commands';

  readonly features: FeatureCard[] = [
    { icon: 'message-circle', title: 'Welcome messages', text: 'Greet new members with a custom embed: your title, text, logo and banner. No imposed branding.', free: true },
    { icon: 'volume-2', title: 'Join-to-Create voice', text: 'Members join a hub and get their own temporary voice channel, deleted when empty. Multiple hubs, per-role access.', free: true },
    { icon: 'shield', title: 'Moderation', text: 'Warn, mute, kick, ban with a mod-log and basic auto-mod.', free: true },
    { icon: 'sparkles', title: 'Auto-roles & reaction roles', text: 'Assign roles on join and let members self-assign with buttons.', free: true },
    { icon: 'gamepad-2', title: 'Game server management', text: 'Live status, monitoring, killfeed, wipes, shop and more — when you link a game server.', free: false },
  ];

  login(): void {
    window.location.href = '/auth/login';
  }
}
