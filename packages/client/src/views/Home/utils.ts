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
import { IFormField, IRadioGroupFormField, ISelectOption } from '@client/forms'
import { IOfflineData } from '@client/offline/reducer'
import { get, has } from 'lodash'
import { IntlShape } from 'react-intl'

export const getFieldValue = (
  value: string,
  fieldObj: IFormField,
  offlineData: Partial<IOfflineData>,
  intl: IntlShape
) => {
  let original = value
  if (has(fieldObj, 'dynamicOptions')) {
    const offlineIndex = get(fieldObj, 'dynamicOptions.resource')
    const offlineResourceValues = get(offlineData, offlineIndex)
    const offlineResourceValue = get(offlineResourceValues, original)
    original = offlineResourceValue?.name || ''
  }
  if (fieldObj.type === 'SELECT_WITH_OPTIONS') {
    const selectedOption = fieldObj.options.find(
      (option) => option.value === value
    ) as ISelectOption
    return selectedOption ? intl.formatMessage(selectedOption.label) : original
  }
  if (
    ['RADIO_GROUP_WITH_NESTED_FIELDS', 'RADIO_GROUP'].includes(fieldObj.type)
  ) {
    const selectedOption = (fieldObj as IRadioGroupFormField).options.find(
      (option) => option.value === value
    )
    return selectedOption ? intl.formatMessage(selectedOption.label) : original
  }
  return original
}
