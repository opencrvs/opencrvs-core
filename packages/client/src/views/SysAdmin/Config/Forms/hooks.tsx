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
import { selectConfigRegisterForm } from '@client/forms/configuration/formConfig/selectors'
import { useSelector } from 'react-redux'
import { IStoreState } from '@client/store'
import {
  IConfigField,
  getDefaultConfigFieldIdentifiers,
  isDefaultField
} from '@client/forms/configuration/formConfig/utils'
import { IFormField } from '@client/forms'
import { deserializeFormField } from '@client/forms/mappings/deserializer'
import { createCustomField } from '@client/forms/configuration/customUtils'
import { getConfigFieldIdentifiers } from '@client/forms/configuration/formConfig/motionUtils'

export function useFieldDefinition(configField: IConfigField): IFormField {
  const { event } = getConfigFieldIdentifiers(configField.fieldId)
  const registerForm = useSelector((store: IStoreState) =>
    selectConfigRegisterForm(store, event)
  )
  if (!isDefaultField(configField)) {
    return deserializeFormField(createCustomField(configField))
  }
  const { sectionIndex, groupIndex, fieldIndex } =
    getDefaultConfigFieldIdentifiers(configField)
  /* Remove conditionals as we need to always build the field*/
  const { conditionals, ...formField } =
    registerForm.sections[sectionIndex].groups[groupIndex].fields[fieldIndex]

  return {
    ...formField,
    required: configField.required
  }
}
