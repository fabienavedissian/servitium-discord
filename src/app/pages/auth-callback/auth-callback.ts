import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SvtIconComponent } from '@servitium/ui';
import { AuthService } from '../../core/auth.service';
import { SessionService } from '../../core/session.service';

/** Handles the Discord OAuth redirect: ?code=... -> exchange -> session -> dashboard. */
@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule, SvtIconComponent],
  template: `
    <div class="cb">
      @if (error()) {
        <svt-icon name="circle-alert" [size]="40" />
        <h3>Sign-in failed</h3>
        <p>{{ error() }}</p>
        <a href="/">Back to home</a>
      } @else {
        <svt-icon name="loader-2" [size]="40" class="cb__spin" />
        <p>Signing you in…</p>
      }
    </div>
  `,
  styles: [`
    .cb { min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.75rem; color: var(--svt-text-secondary); }
    .cb h3 { color: var(--svt-text-primary); margin: 0.5rem 0 0; }
    .cb a { color: #5865f2; }
    .cb__spin { animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class AuthCallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);
  private session = inject(SessionService);

  error = signal<string | null>(null);

  ngOnInit(): void {
    const code = this.route.snapshot.queryParamMap.get('code');
    if (!code) { this.error.set('No authorization code returned by Discord.'); return; }
    this.auth.exchange(code).subscribe({
      next: res => {
        this.session.setSession(res.user, res.guilds);
        this.router.navigateByUrl('/dashboard');
      },
      error: () => this.error.set('Could not complete sign-in. Please try again.'),
    });
  }
}
