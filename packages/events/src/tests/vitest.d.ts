export type { ProvidedContext } from 'vitest'

declare module 'vitest' {
  export interface ProvidedContext {
    EVENTS_MONGO_URI: string
    USER_MGNT_MONGO_URI: string
    ELASTICSEARCH_URI: string
  }
}
