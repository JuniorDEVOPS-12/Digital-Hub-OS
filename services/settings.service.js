import { createDefaultSettings, updateSettingsFields } from '../data/models/settings.model.js';
import { AppError, ErrorCodes } from '../data/errors/app-error.js';

export class SettingsService {
    constructor(settingsProvider) {
        this.settingsProvider = settingsProvider;
    }

    get() {
        return this.settingsProvider.get() ?? createDefaultSettings();
    }

    update(fields) {
        const current = this.get();
        const updated = updateSettingsFields(current, fields);
        return this.settingsProvider.save(updated);
    }

    seedIfEmpty() {
        if (!this.settingsProvider.get()) {
            this.settingsProvider.seed(createDefaultSettings());
        }
    }

    getMaxStudents() {
        return this.get().maxStudents;
    }
}
