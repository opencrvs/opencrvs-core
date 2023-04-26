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
import * as React from 'react'
import { Select } from '@opencrvs/components/lib/Select'
import { useSelector } from 'react-redux'
import { getOfflineData } from '@client/offline/selectors'
import { InputField } from '@client/components/form/InputField'
import { useIntl } from 'react-intl'
import { messages } from '@client/i18n/messages/views/review'

interface IDeclarationOfficeSelectProps {
  value: string
  onChange: (value: string) => void
}
export function DeclarationOfficeSelect(props: IDeclarationOfficeSelectProps) {
  const offlineData = useSelector(getOfflineData)
  const offices = offlineData.offices
  const primaryOffices = Object.values(offices)
    .filter((office) => !office.primary)
    .map((office) => ({
      label: office.name,
      value: office.id
    }))
  const intl = useIntl()
  return (
    <InputField
      id="declaration-office-select"
      label={intl.formatMessage(messages.officeSelectLabel)}
      helperText={intl.formatMessage(messages.officeSelectHelper)}
      touched
      required
    >
      <Select
        value={props.value}
        onChange={props.onChange}
        options={primaryOffices}
      />
    </InputField>
  )
}
