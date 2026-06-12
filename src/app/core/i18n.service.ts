import { Injectable } from '@angular/core';
import { TranslatePort } from '@servitium/discord';
import { EN_DISCORD } from './i18n/en';

/**
 * Minimal i18n for the standalone app — resolves dotted keys against the EN
 * dictionary (extracted from Center's locale) and interpolates {param}.
 * Bound to TRANSLATE_PORT so the shared components display real text.
 */
@Injectable({ providedIn: 'root' })
export class I18nService implements TranslatePort {
  private dict: any = EN_DISCORD;

  translate(key: string, params?: Record<string, any>): string {
    const val = key.split('.').reduce((o: any, k) => (o == null ? o : o[k]), this.dict);
    let s = typeof val === 'string' ? val : key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return s;
  }
}
