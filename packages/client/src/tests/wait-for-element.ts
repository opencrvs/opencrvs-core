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
/* eslint-disable import/export */
import * as React from 'react'
import { ReactWrapper } from 'enzyme'

const MAX_TIME = process.env.CI ? 10000 : 2000
const INTERVAL = 10

export async function waitFor(condition: () => boolean) {
  return new Promise<void>((resolve, reject) => {
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
  C extends React.ComponentClass<any> | React.FunctionComponent<any>
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

export async function waitForElement<T extends string | (() => void)>(
  rootComponent: ReactWrapper,
  selector: T
) {
  try {
    await waitFor(
      () => rootComponent.update().find(selector as string).length > 0
    )
  } catch (err) {
    throw new Error(
      `Couldn't find selector ${
        typeof selector === 'function' ? selector.name : selector
      } from component in ${MAX_TIME}ms`
    )
  }
  return rootComponent.update().find(selector as string)
}
