/* eslint-disable import/export */
import * as React from 'react'
import { ReactWrapper } from 'enzyme'

const MAX_TIME = process.env.CI ? 10000 : 2000
const INTERVAL = 10

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
