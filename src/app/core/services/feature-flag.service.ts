import { Injectable } from '@angular/core';
import { RemoteConfig, fetchAndActivate, getValue } from '@angular/fire/remote-config';
import { environment } from '../../../environments/environment';

export type FeatureFlags = {
  enableCategoryManager: boolean;
};

@Injectable({ providedIn: 'root' })
export class FeatureFlagService {
  private flags: FeatureFlags = {
    enableCategoryManager: (environment as any).featureFlags?.enableCategoryManager ?? true
  };

  constructor(private readonly rc: RemoteConfig) {}

  async initialize(): Promise<void> {
    try {
      await fetchAndActivate(this.rc);
      const enableCategoryManager = getValue(this.rc, 'enableCategoryManager').asBoolean();
      this.flags = {
        enableCategoryManager: typeof enableCategoryManager === 'boolean' ? enableCategoryManager : this.flags.enableCategoryManager
      };
      try {
        localStorage.setItem('featureFlags', JSON.stringify(this.flags));
      } catch {}
    } catch (e) {
      try {
        const raw = localStorage.getItem('featureFlags');
        if (raw) this.flags = { ...this.flags, ...JSON.parse(raw) };
      } catch {}
    }
  }

  isFeatureEnabled(flagName: keyof FeatureFlags): boolean {
    return !!this.flags[flagName];
  }
}
