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

import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState
} from 'react'
import {
  Location,
  useLocation,
  useNavigate,
  useNavigationType
} from 'react-router-dom'
import { Action } from '@remix-run/router'
const NavigationContext = createContext<Location[]>([])

export const NavigationHistoryProvider = ({ children }: PropsWithChildren) => {
  const location = useLocation()
  const [history, setHistory] = useState<Location[]>([])

  useEffect(() => {
    setHistory((prevHistory) => [...prevHistory, location])
  }, [location])

  return (
    <NavigationContext.Provider value={history}>
      {children}
    </NavigationContext.Provider>
  )
}

function useNavigationHistory() {
  return useContext(NavigationContext)
}

/*
 * All views wrapped with this component follow the following rules:
 * - User can not back-navigate inside the stack from outside the stack
 *   - This is useful for view where user for instance registers an event or does anything else where back-navigating
 *     would shown them an outdated view or cause them to attempt to re-submit an action
 * - User can back-navigate outside from the stack to the view they were in before entering the stack
 * - User can not forward-navigate back to the stack after leaving it
 * - User can back and forward-navigate inside the stack
 * - User can directly navigate to the stack if they know the URL
 * - User can refresh the page while on the stack
 */
export function NavigationStack(props: PropsWithChildren) {
  const navigate = useNavigate()
  const navigateType = useNavigationType()
  const history = useNavigationHistory()
  const [allowedToNavigate, setAllowedToNavigate] = useState(false)

  useEffect(() => {
    const userAccessingViewDirectly = history.length === 0
    const userNavigatingBack =
      !userAccessingViewDirectly && navigateType === Action.Pop

    if (userNavigatingBack) {
      navigate(history[history.length - 1], { replace: true })
    }
    setAllowedToNavigate(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!allowedToNavigate) {
    return null
  }

  return props.children
}
