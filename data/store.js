/* ========================================
   Digital Hub OS — LocalStorage Data Store
   Délègue au StorageAdapter (compatibilité).
   ======================================== */

import { localStorageAdapter } from './adapters/local-storage.adapter.js';

/** @deprecated Préférer dataAccess ou defaultStorageAdapter */
export const store = localStorageAdapter;
