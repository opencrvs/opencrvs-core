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
import { Location, useLocation, useNavigationType } from 'react-router-dom'
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
 * - User can back-navigate from inside the stack to the view they were in before entering the stack
 * - User can not forward-navigate back to the stack after leaving it
 * - User can back and forward-navigate inside the stack
 * - User can directly navigate to the stack if they know the URL
 * - User can refresh the page while on the stack
 */
export function NavigationStack(props: PropsWithChildren) {
  const location = useLocation()
  const navigateType = useNavigationType()
  const history = useNavigationHistory()
  const [allowedToNavigate, setAllowedToNavigate] = useState(false)
  // Tracks if we're in the process of backing out of the navigation stack
  const [backing, setBacking] = useState(false)

  useEffect(() => {
    // User is accessing the view directly if there's no navigation history
    const userAccessingViewDirectly = history.length === 0

    // We also don't want to start backing the user if its only a page reload
    const navEntry = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming

    const userReloadingPage = navEntry.type === 'reload'

    // User is trying to navigate back to a view in the stack using browser back button
    const navigatingBackToStack =
      !userAccessingViewDirectly &&
      navigateType === Action.Pop &&
      !userReloadingPage

    // On storybook tests we don't want to navigate the user with window.history.back()
    const isStorybook = import.meta.env.STORYBOOK === 'true'

    // When user tries to navigate back to the stack with browser back button,
    // we initiate a sequence of back navigations to exit the stack completely.
    // This preserves the browser's history state for proper forward/back navigation.
    if (navigatingBackToStack && !isStorybook) {
      setBacking(true)
    }

    setAllowedToNavigate(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Continue backing out of the stack.
  // This effect retriggers on each location change, until we unmount.
  useEffect(() => {
    if (backing) {
      window.history.back()
    }
  }, [location, backing])

  // When unmounting while in backing mode, perform one final back navigation
  // This ensures we land at the correct previous page that the user intended to reach
  useEffect(() => {
    return () => {
      if (backing) {
        window.history.back()
      }
    }
  }, [backing])

  // Don't render children while backing out or before navigation is allowed
  if (!allowedToNavigate || backing) {
    return null
  }

  return props.children
}
