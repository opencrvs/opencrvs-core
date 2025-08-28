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

import { Location } from '@events/service/locations/locations'
import { IntlShape } from 'react-intl'
import { FieldConfigInput, User } from '@opencrvs/commons/client'

export interface RegisteredFieldModule<T extends FieldConfigInput> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stringify?: (value: any, context: StringifierContext<T>) => string
  toCertificateVariables?: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
    context: StringifierContext<T>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) => Record<string, any> | string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Input: React.ComponentType<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Output: React.ComponentType<any> | null
}

export interface StringifierContext<F extends FieldConfigInput> {
  intl: IntlShape
  locations: Location[]
  users?: User[]
  config?: F
}
