import { Injectable, signal } from '@angular/core';
import { TranslatePort } from '@servitium/discord';
import { AppLang, APP_LANGS, DICTS } from './i18n/dicts';

const STORAGE_KEY = 'svt_discord_lang';

/**
 * i18n for the standalone app + the shared @servitium/discord components.
 * Resolves dotted keys against the current language dictionary (6 langs,
 * extracted from Center) and interpolates {param}. Bound to TRANSLATE_PORT.
 */
@Injectable({ providedIn: 'root' })
export class I18nService implements TranslatePort {
  private _lang = signal<AppLang>(this.initialLang());
  lang = this._lang.asReadonly();
  readonly languages = APP_LANGS;

  private initialLang(): AppLang {
    const stored = typeof localStorage !== 'undefined' ? (localStorage.getItem(STORAGE_KEY) as AppLang | null) : null;
    if (stored && APP_LANGS.includes(stored)) return stored;
    const nav = typeof navigator !== 'undefined' ? navigator.language?.slice(0, 2) as AppLang : 'en';
    return APP_LANGS.includes(nav) ? nav : 'en';
  }

  setLang(lang: AppLang): void {
    if (!APP_LANGS.includes(lang)) return;
    this._lang.set(lang);
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, lang);
  }

  translate(key: string, params?: Record<string, any>): string {
    const dict: any = DICTS[this._lang()] ?? DICTS.en;
    let val = key.split('.').reduce((o: any, k) => (o == null ? o : o[k]), dict);
    if (val == null) {
      // Fall back to English, then the key itself.
      val = key.split('.').reduce((o: any, k) => (o == null ? o : o[k]), DICTS.en);
    }
    let s = typeof val === 'string' ? val : key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return s;
  }
}
