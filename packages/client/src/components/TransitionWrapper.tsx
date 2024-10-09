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
import React, { useState, useEffect } from 'react'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import {
  PAGE_TRANSITIONS_ENTER_TIME,
  PAGE_TRANSITIONS_CLASSNAME,
  PAGE_TRANSITIONS_EXIT_TIME
} from '@client/utils/constants'
import * as routes from '@client/navigation/routes'
import { matchPath } from 'react-router'
import { Location } from 'history'

function isPathExactmatch(pathname: string, routesPath: string): boolean {
  const match = matchPath(pathname, routesPath)
  if (match) {
    return match.isExact
  }

  return false
}

function isUserHome(pathname: string): boolean {
  if (
    isPathExactmatch(pathname, routes.HOME) ||
    isPathExactmatch(pathname, routes.REGISTRAR_HOME) ||
    isPathExactmatch(pathname, routes.REGISTRAR_HOME_TAB)
  ) {
    return true
  }

  return false
}

function isFormPage(pathname: string): boolean {
  if (
    isPathExactmatch(pathname, routes.DRAFT_BIRTH_PARENT_FORM) ||
    isPathExactmatch(pathname, routes.DRAFT_BIRTH_PARENT_FORM_PAGE) ||
    isPathExactmatch(pathname, routes.DRAFT_BIRTH_PARENT_FORM_PAGE_GROUP) ||
    isPathExactmatch(pathname, routes.DRAFT_DEATH_FORM) ||
    isPathExactmatch(pathname, routes.DRAFT_DEATH_FORM_PAGE) ||
    isPathExactmatch(pathname, routes.DRAFT_DEATH_FORM_PAGE_GROUP) ||
    isPathExactmatch(pathname, routes.REVIEW_EVENT_PARENT_FORM_PAGE) ||
    isPathExactmatch(pathname, routes.REVIEW_EVENT_PARENT_FORM_PAGE_GROUP)
  ) {
    return true
  }

  return false
}

function setLocationKey(currLocation: Location, prevLocation: Location) {
  const locationKey = 'locationkey'
  const prevLocPathname = prevLocation.pathname
  const currLocPathname = currLocation.pathname

  if (
    currLocPathname === routes.SELECT_VITAL_EVENT &&
    isUserHome(prevLocPathname)
  ) {
    return currLocation.key as string
  }

  if (isUserHome(currLocPathname) && isFormPage(prevLocPathname)) {
    return currLocation.key as string
  }
  return locationKey
}

interface IProps {
  location: Location
  children: React.ReactNode
}

const TransitionWrapper = ({ location, children }: IProps) => {
  const [locations, setLocations] = useState<Location[]>([location, location])

  useEffect(() => {
    setLocations([location, locations[0]])
  }, [location])

  const [currLocation, prevLocation] = locations

  const locationKey = setLocationKey(currLocation, prevLocation)

  return (
    <TransitionGroup component={null}>
      <CSSTransition
        unmountOnExit
        timeout={{
          enter: PAGE_TRANSITIONS_ENTER_TIME,
          exit: PAGE_TRANSITIONS_EXIT_TIME
        }}
        classNames={PAGE_TRANSITIONS_CLASSNAME}
        key={locationKey}
      >
        {children}
      </CSSTransition>
    </TransitionGroup>
  )
}

export default TransitionWrapper
