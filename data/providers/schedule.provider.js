import { BaseProvider } from './base.provider.js';
import { STORAGE_KEYS } from '../../config/constants.js';

export class ScheduleProvider extends BaseProvider {
    constructor(storageAdapter) {
        super(STORAGE_KEYS.schedule, storageAdapter);
    }
}
