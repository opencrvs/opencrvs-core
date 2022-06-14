/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
/* eslint-disable import/export */
import * as React from 'react'
import { ReactWrapper } from 'enzyme'

const MAX_TIME = process.env.CI ? 10000 : 2000
const INTERVAL = 10
const SECONDS_INTERVAL = 1000

export async function waitForSeconds(time: number) {
  return new Promise((resolve, reject) => {
    let remainingTime = time * 1000

    const intervalId = setInterval(() => {
      if (remainingTime < 0) {
        clearInterval(intervalId)
        return resolve()
      }
      remainingTime = remainingTime - SECONDS_INTERVAL
    }, INTERVAL)
  })
}

export async function waitFor(condition: () => boolean) {
  return new Promise((resolve, reject) => {
    let remainingTime = MAX_TIME

    const intervalId = setInterval(() => {
      if (remainingTime < 0) {
        clearInterval(intervalId)
        return reject(
          new Error(
            `Condition was not met in ${MAX_TIME}ms: \n\n${condition.toString()}`
          )
        )
      }

      let result = false
      try {
        result = condition()
      } catch (err) {}

      if (result) {
        clearInterval(intervalId)
        return resolve()
      }

      remainingTime = remainingTime - INTERVAL
    }, INTERVAL)
  })
}

export async function waitForElement<
  C extends React.ComponentClass<any> | React.StatelessComponent<any>
>(
  rootComponent: ReactWrapper,
  selector: C
): Promise<
  C extends React.ComponentClass<infer Props>
    ? ReactWrapper<Props, any, InstanceType<C>>
    : ReactWrapper<any, any>
>
export async function waitForElement(
  rootComponent: ReactWrapper,
  selector: string
): Promise<ReactWrapper<any, any>>

export async function waitForElement<T>(
  rootComponent: ReactWrapper,
  selector: T
) {
  try {
    await waitFor(() => rootComponent.update().find(selector).length > 0)
  } catch (err) {
    throw new Error(
      `Couldn't find selector ${
        typeof selector === 'function' ? selector.name : selector
      } from component in ${MAX_TIME}ms`
    )
  }
  return rootComponent.update().find(selector)
}
