import { BaseProvider } from './base.provider.js';
import { STORAGE_KEYS } from '../../config/constants.js';

export class StudentsProvider extends BaseProvider {
    constructor() {
        super(STORAGE_KEYS.students);
    }
}
