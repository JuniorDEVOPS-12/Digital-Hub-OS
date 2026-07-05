import { BaseMapProvider } from './base-map.provider.js';
import { STORAGE_KEYS } from '../../config/constants.js';
import { createDefaultSettings } from '../models/settings.model.js';

export class SettingsProvider extends BaseMapProvider {
    constructor(storageAdapter) {
        super(STORAGE_KEYS.settings, storageAdapter);
    }

    get() {
        return this.storage.load(this.storageKey) || null;
    }

    save(settings) {
        this.saveAll(settings);
        return settings;
    }

    seed(settings) {
        this.save(settings ?? createDefaultSettings());
    }
}
