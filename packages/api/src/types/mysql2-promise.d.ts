/** mysql2@2 typings — TODO: upgrade mysql2 and remove this shim */
declare module 'mysql2/promise' {
  export interface Pool {
    query(sql: string, args?: unknown): Promise<[unknown, unknown]>
  }
  export function createPool(config: Record<string, string | undefined>): Pool
}
