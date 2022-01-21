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
import { post } from 'k6/http'
import { AUTH_URL } from './constants.js'

export function fetchToken(username, password) {
  const resAuth = post(
    `${AUTH_URL}/authenticate`,
    JSON.stringify({
      username: username,
      password: password
    }),
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
  const body = resAuth.json()

  const resVerify = post(
    `${AUTH_URL}/verifyCode`,
    JSON.stringify({
      nonce: body.nonce,
      code: '000000'
    }),
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
  return resVerify.json().token
}

interface RateElement {
  rate: number
  [key: string]: any
}

/*
 * Chooses a element in a array where every element is an object with atleast a rate property.
 * The rates should add up to 1 or 100 are some easy to work with value. However, any value
 * will work as the algorithm will works out the total and works out each rate according to
 * that total.
 */
export function chooseElementUsingRate(elements: RateElement[]): RateElement {
  const rateTotal = elements.reduce(
    (accumulatedRate, element) => accumulatedRate + element.rate,
    0
  )
  const choice = Math.random() * rateTotal

  let currentRate = 0
  let chosenElement

  for (const element of elements) {
    currentRate = currentRate + element.rate

    if (choice < currentRate) {
      chosenElement = element
      break
    }
  }

  return chosenElement
}
