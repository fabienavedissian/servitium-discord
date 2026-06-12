import { Injectable, signal } from '@angular/core';
import { NotificationPort } from '@servitium/discord';

export interface Toast {
  id: number;
  type: 'success' | 'error';
  title: string;
  message: string;
}

/**
 * Lightweight toast service bound to NOTIFICATION_PORT. The app shell renders
 * `toasts()` and they auto-dismiss.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService implements NotificationPort {
  private _toasts = signal<Toast[]>([]);
  private seq = 0;
  toasts = this._toasts.asReadonly();

  success(title: string, message: string): void {
    this.push('success', title, message);
  }

  error(title: string, message: string): void {
    this.push('error', title, message);
  }

  dismiss(id: number): void {
    this._toasts.update(t => t.filter(x => x.id !== id));
  }

  private push(type: 'success' | 'error', title: string, message: string): void {
    const id = ++this.seq;
    this._toasts.update(t => [...t, { id, type, title, message }]);
    setTimeout(() => this.dismiss(id), 4000);
  }
}
