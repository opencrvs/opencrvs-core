/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */

import React, { createContext, useContext } from 'react'
import { EventIndex, User } from '@opencrvs/commons/client'
import { ILocation } from '@client/offline/reducer'
import { IndexMap } from '@client/utils'

const EventOverviewContext = createContext<{
  findUser: (id: string) => User | undefined
  getLocation: (id: string) => ILocation | undefined
  event: EventIndex
} | null>(null)

/**
 * Provides methods for resolving users and locations within the event.
 */
export const EventOverviewProvider = ({
  children,
  locations,
  users,
  event
}: {
  children: React.ReactNode
  users: User[]
  locations: IndexMap<ILocation>
  event: EventIndex
}) => {
  const findUser = (id: string) => {
    return users.find((u) => u.id === id)
  }

  const getLocation = (id: string) => {
    return locations[id]
  }

  return (
    <EventOverviewContext.Provider value={{ findUser, getLocation, event }}>
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
