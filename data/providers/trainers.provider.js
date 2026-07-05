import { BaseProvider } from './base.provider.js';
import { STORAGE_KEYS } from '../../config/constants.js';

export class TrainersProvider extends BaseProvider {
    constructor(storageAdapter) {
        super(STORAGE_KEYS.trainers, storageAdapter);
    }
}
