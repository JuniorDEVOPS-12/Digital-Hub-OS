/* ========================================
   Digital Hub OS — Storage Adapter Contract
   Interface pour le remplacement futur de localStorage.
   ======================================== */

/**
 * @typedef {Object} StorageAdapter
 * @property {(key: string) => *} load
 * @property {(key: string, data: *) => boolean} save
 * @property {(key: string) => boolean} remove
 * @property {() => boolean} clear
 */

export { localStorageAdapter as defaultStorageAdapter } from './local-storage.adapter.js';
