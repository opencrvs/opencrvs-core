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
import { ApolloLink, Observable, Operation, NextLink } from 'apollo-link'
import { DefinitionNode, OperationDefinitionNode } from 'graphql'
const DEFAULT_TIMEOUT = 30000
const REQUEST_TIMEOUT_ERROR_CODE = 408

/**
 * Aborts the request if the timeout expires before the response is received.
 */
export type TimeoutError = Error & {
  statusCode: number
}

export const throwTimeoutError = (message: string) => {
  const error = new Error(message) as TimeoutError

  error.name = 'RequestTimeoutError'
  error.statusCode = REQUEST_TIMEOUT_ERROR_CODE

  return error
}

export default class TimeoutLink extends ApolloLink {
  private timeout: number

  constructor(timeout: number = DEFAULT_TIMEOUT) {
    super()
    this.timeout = timeout
  }

  public request(operation: Operation, forward?: NextLink): any {
    let controller: AbortController
    let ctxTimeout: number | null

    // override timeout from operation context
    ctxTimeout = operation.getContext().timeout || null
    if ((ctxTimeout as number) <= 0) {
      ctxTimeout = null
    }

    // add abort controller and signal object to fetchOptions if they don't already exist
    if (typeof AbortController !== 'undefined') {
      const context = operation.getContext()
      let fetchOptions = context.fetchOptions || {}

      controller = fetchOptions.controller || new AbortController()

      fetchOptions = { ...fetchOptions, controller, signal: controller.signal }
      operation.setContext({ fetchOptions })
    }
    if (forward) {
      const chainObservable = forward(operation) // observable for remaining link chain

      const operationType: string = (
        (operation.query.definitions as ReadonlyArray<DefinitionNode>).find(
          (def: DefinitionNode) => def.kind === 'OperationDefinition'
        ) as OperationDefinitionNode
      ).operation

      if (this.timeout <= 0 || operationType === 'subscription') {
        return chainObservable // skip this link if timeout is zero or it's a subscription request
      }

      // create local observable with timeout functionality (unsubscibe from chain observable and
      // return an error if the timeout expires before chain observable resolves)
      const localObservable = new Observable((observer) => {
        // eslint-disable-next-line prefer-const
        let timer: ReturnType<typeof setTimeout>

        // listen to chainObservable for result and pass to localObservable if received before timeout
        const subscription = chainObservable.subscribe(
          (result) => {
            clearTimeout(timer)
            observer.next(result)
            observer.complete()
          },
          (error) => {
            clearTimeout(timer)
            observer.error(error) // pass error to the errorLink
            observer.complete()
          }
        )

        // if timeout expires before observable completes, abort call, unsubscribe, and return error
        timer = setTimeout(() => {
          if (controller) {
            controller.abort() // abort fetch operation
          }

          observer.error(
            throwTimeoutError(
              `Timeout exceeded ` +
                `for ${operationType} "${operation.operationName}"`
            )
          )
          subscription.unsubscribe()
        }, ctxTimeout || this.timeout)

        // this function is called when a client unsubscribes from localObservable
        return () => {
          clearTimeout(timer)
          subscription.unsubscribe()
        }
      })

      return localObservable
    } else {
      return null
    }
  }
}
