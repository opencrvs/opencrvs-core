import { createContext, useContext } from 'react'

import { EventIndex, EventConfig } from '@opencrvs/commons/client'

export const CurrentEventContext = createContext<{
  config: EventConfig | null
  event: EventIndex | null
}>({ config: null, event: null })

export function useCurrentEvent() {
  return useContext(CurrentEventContext)
}
