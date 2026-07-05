import { BaseProvider } from './base.provider.js';
import { STORAGE_KEYS } from '../../config/constants.js';

export class ScheduleProvider extends BaseProvider {
    constructor() {
        super(STORAGE_KEYS.schedule);
    }
}
