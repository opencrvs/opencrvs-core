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
import { defineMessages } from 'react-intl'

export const messages = defineMessages({
  phoneNumberFormat: {
    id: 'validations.phoneNumberFormat',
    defaultMessage: 'Must be a valid 10 digit number that starts with 0(7|9)',
    description:
      'The error message that appears on phone numbers where the first character must be a 0'
  },
  emailAddressFormat: {
    id: 'validations.emailAddressFormat',
    defaultMessage: 'Must be a valid email address',
    description: 'The error message that appears on email address'
  }
})
