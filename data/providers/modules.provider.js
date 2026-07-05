import { BaseProvider } from './base.provider.js';
import { STORAGE_KEYS } from '../../config/constants.js';

export class ModulesProvider extends BaseProvider {
    constructor() {
        super(STORAGE_KEYS.modules);
    }
}
