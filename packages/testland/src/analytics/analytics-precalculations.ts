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
import { differenceInDays } from 'date-fns'
import { ActionDocument, AddressFieldValue } from '@opencrvs/toolkit/events'
import { COUNTRY_NAMES_BY_CODE } from './countries'

function getCountryPlaceOfBirthResolved(
  declaration: ActionDocument['declaration']
) {
  const placeOfBirth =
    'child.birthLocation.privateHome' in declaration
      ? declaration['child.birthLocation.privateHome']
      : 'child.birthLocation.other' in declaration
        ? declaration['child.birthLocation.other']
        : null

  const maybeAddress = AddressFieldValue.safeParse(placeOfBirth)

  if (!maybeAddress.success) {
    return 'Farajaland'
  }

  const country = maybeAddress.data.country

  return COUNTRY_NAMES_BY_CODE[country] || 'Farajaland'
}

export function precalculateBirthEvent(
  action: ActionDocument,
  declaration: ActionDocument['declaration']
) {
  const createdAt = new Date(action.createdAt)
  const childDoB = declaration['child.dob']
  if (!childDoB) return action

  return {
    ...declaration,
    'child.age.days': differenceInDays(createdAt, new Date(childDoB as string)),
    'child.countryPlaceOfBirth': getCountryPlaceOfBirthResolved(declaration)
  }
}
