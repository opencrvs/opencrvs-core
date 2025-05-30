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
import { IUserData } from '@client/declarations'
import { storage } from '@client/storage'
import { APPLICATION_VERSION } from '@client/utils/constants'
import { useEffect, useState } from 'react'

export async function validateApplicationVersion() {
  const runningVer = localStorage.getItem('running-version')

  if (!runningVer || runningVer !== APPLICATION_VERSION) {
    localStorage.setItem('running-version', APPLICATION_VERSION)
    const userData = await storage.getItem('USER_DATA')
    const allUserData: IUserData[] = !userData
      ? []
      : (JSON.parse(userData) as IUserData[])

    allUserData.forEach((userData) => {
      userData['declarations'] = []
    })

    await storage.setItem('USER_DATA', JSON.stringify(allUserData))
  }
}
export function isNavigatorOnline() {
  return navigator.onLine
}

const ONLINE = 'online'
const OFFLINE = 'offline'

export function useOnlineStatus() {
  const [isOnline, setOnline] = useState(isNavigatorOnline())

  useEffect(() => {
    const handleConnectionChange = () => {
      setOnline(isNavigatorOnline())
    }

    window.addEventListener(ONLINE, handleConnectionChange)
    window.addEventListener(OFFLINE, handleConnectionChange)

    return () => {
      window.removeEventListener(ONLINE, handleConnectionChange)
      window.removeEventListener(OFFLINE, handleConnectionChange)
    }
  }, [])

  return isOnline
}

/** Tell compiler that accessing record with arbitrary key might result to undefined
 * Use when you **cannot guarantee**  that key exists in the record
 */
export interface IndexMap<T> {
  [id: string]: T | undefined
}

/**
 * browser polyfill for 'querystring module's stringify function
 * https://github.com/vitejs/vite/discussions/18671
 * below is a typescript copy of the code querystring-es3
 * https://github.com/mike-spainhower/querystring/blob/master/encode.js
 */

type Primitive = string | number | boolean | null | undefined
const objectKeys =
  Object.keys ||
  function (obj) {
    const res = []
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key)
    }
    return res
  }

const isArray =
  Array.isArray ||
  function (xs) {
    return Object.prototype.toString.call(xs) === '[object Array]'
  }

function stringifyPrimitive(value: Primitive): string {
  switch (typeof value) {
    case 'string':
      return value

    case 'boolean':
      return value ? 'true' : 'false'

    case 'number':
      return isFinite(value) ? value.toString() : ''

    default:
      return ''
  }
}

export function stringify(
  obj: Record<string, unknown> | null | undefined,
  sep = '&',
  eq = '=',
  name: Primitive | null = null
) {
  if (obj === null) {
    obj = undefined
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function (k: string) {
      const ks = encodeURIComponent(stringifyPrimitive(k as Primitive)) + eq
      if (isArray(obj[k])) {
        return map(obj[k], function (v: Primitive) {
          return ks + encodeURIComponent(stringifyPrimitive(v))
        }).join(sep)
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k] as Primitive))
      }
    }).join(sep)
  }

  if (!name) return ''
  return (
    encodeURIComponent(stringifyPrimitive(name)) +
    eq +
    encodeURIComponent(stringifyPrimitive(obj))
  )
}

function map(xs: string[], f: (x: string, i: number) => string): string[] {
  if (xs.map) return xs.map(f)
  const res = []
  for (let i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i))
  }
  return res
}
