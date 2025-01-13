import React, { createContext, useContext } from 'react'
import { ResolvedUser } from '@opencrvs/commons/client'
// eslint-disable-next-line no-restricted-imports
import { ILocation } from '@client/offline/reducer'

const EventOverviewContext = createContext<{
  getUser: (id: string) => ResolvedUser
  getLocation: (id: string) => ILocation
} | null>(null)

const MISSING_USER = {
  id: 'ID_MISSING',
  name: [
    {
      use: 'en',
      given: ['user'],
      family: 'missing'
    }
  ],
  systemRole: 'ROLE_MISSING'
}

/**
 * Provides methods for resolving users and locations within the event.
 */
export const EventOverviewProvider = ({
  children,
  locations,
  users
}: {
  children: React.ReactNode
  users: ResolvedUser[]
  locations: { [locationId: string]: ILocation }
}) => {
  const getUser = (id: string) => {
    const user = users.find((u) => u.id === id)

    if (!user) {
      // eslint-disable-next-line no-console
      console.error(`User with id ${id} not found.`)

      return MISSING_USER
    }

    return user
  }

  const getLocation = (id: string) => {
    return locations[id]
  }

  return (
    <EventOverviewContext.Provider value={{ getUser, getLocation }}>
      {children}
    </EventOverviewContext.Provider>
  )
}

export const useEventOverviewContext = () => {
  const context = useContext(EventOverviewContext)

  if (!context) {
    throw new Error('EventOverviewContext not found')
  }

  return context
}
