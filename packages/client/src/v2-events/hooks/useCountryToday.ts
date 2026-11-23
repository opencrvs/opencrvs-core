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
import { useSyncExternalStore } from 'react'
import { useSelector } from 'react-redux'
import { PlainDate, toPlainDateInTimeZone } from '@opencrvs/commons/client'
import { getOfflineData } from '@client/offline/selectors'

/** @returns the country's time zone (IANA). Dates such as the day
 *  a configuration version takes effect are in this time zone. */
export function useCountryTimeZone() {
  return useSelector(getOfflineData).config.SYSTEM_IANA_TIMEZONE
}

/** How often the date in the country is checked while a component uses it. */
const TODAY_CHECK_INTERVAL_MS = 60 * 1000

/**
 * The components that use `useCountryToday`. One timer serves all of them, so
 * they all change to the new date together.
 */
const listeners = new Set<() => void>()
let intervalId: ReturnType<typeof setInterval> | undefined

function subscribe(listener: () => void) {
  listeners.add(listener)
  intervalId ??= setInterval(
    () => listeners.forEach((notify) => notify()),
    TODAY_CHECK_INTERVAL_MS
  )

  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      clearInterval(intervalId)
      intervalId = undefined
    }
  }
}

/**
 * @returns today's date in the country's time zone. A component that uses it
 * renders again when the date changes, not each time that the date is checked.
 */
export function useCountryToday(): PlainDate {
  const timeZone = useCountryTimeZone()
  return useSyncExternalStore(subscribe, () =>
    toPlainDateInTimeZone(new Date(), timeZone)
  )
}
