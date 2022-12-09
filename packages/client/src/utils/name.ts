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
import { upperFirst, toLower } from 'lodash'

const startCase = (str: string) =>
  str
    .split(' ')
    .map((x) => upperFirst(toLower(x)))
    .join(' ')

// Expects to receive a name in surname, firstname middlename - format
export function formatName(name: string) {
  return name.split(', ').map(startCase).join(', ')
}
