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
import React from 'react'
import {
  getFieldDefinition,
  IDefaultConfigField,
  ICustomConfigField
} from '@client/forms/configuration/formConfig/utils'
import { IFormField } from '@client/forms'
import { useParams } from 'react-router'
import { populateRegisterFormsWithAddresses } from '@client/forms/configuration/administrative/addresses'
import { registerForms } from '@client/forms/configuration/default'
import { Event } from '@client/utils/gateway'

export function useDefaultForm() {
  const { event } = useParams<{ event: Event }>()
  return React.useMemo(
    () => populateRegisterFormsWithAddresses(registerForms[event], event),
    [event]
  )
}

export function useFieldDefinition(
  configField: IDefaultConfigField | ICustomConfigField
): IFormField {
  const defaultForm = useDefaultForm()
  return React.useMemo(() => {
    return getFieldDefinition(configField, defaultForm)
  }, [configField, defaultForm])
}
