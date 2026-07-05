/* ========================================
   Digital Hub OS — Repository Interface
   Contrat CRUD pour le remplacement futur des providers.
   ======================================== */

/**
 * @typedef {Object} IRepository
 * @property {() => Array} getAll
 * @property {(id: string) => Object|null} getById
 * @property {(item: Object) => Object} create
 * @property {(id: string, fields: Object) => Object|null} update
 * @property {(id: string) => boolean} delete
 * @property {(data: Array) => void} [seed]
 * @property {() => void} [clear]
 */

/**
 * @typedef {Object} IMapRepository
 * @property {() => Object} getAll
 * @property {(data: Object) => boolean} saveAll
 * @property {() => void} [clear]
 */

export {};
