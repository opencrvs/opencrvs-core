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

import { getDefaultLanguage } from '@client/i18n/utils'
import { useIntl } from 'react-intl'
import { Location } from '@client/utils/gateway'

export const useLocationIntl = () => {
  const intl = useIntl()

  const localizeLocation = (location: Location) => {
    if (intl.locale === getDefaultLanguage()) {
      // Fix GraphQL typing to remove !
      return location.name!
    } else {
      // Fix GraphQL typing to remove !
      return location.alias?.[0] ?? location.name!
    }
  }

  return { localizeLocation }
}
