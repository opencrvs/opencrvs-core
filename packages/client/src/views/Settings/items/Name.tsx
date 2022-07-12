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
import { ListViewItemSimplified } from '@opencrvs/components/lib/interface'
import { useIntl } from 'react-intl'
import { userMessages, buttonMessages } from '@client/i18n/messages'
import {
  LabelContainer,
  ValueContainer,
  DynamicHeightLinkButton
} from '@client/views/Settings/items/utils'
import { useSelector } from 'react-redux'
import { IStoreState } from '@client/store'
import { getDefaultLanguage } from '@client/i18n/utils'
import { GQLHumanName } from '@opencrvs/gateway/src/graphql/schema'

export function Name() {
  const intl = useIntl()
  const englishName = useSelector<IStoreState, string>((state) => {
    const { userDetails } = state.profile
    const nameObj = userDetails?.name?.find(
      (storedName: GQLHumanName | null) => {
        const name = storedName as GQLHumanName
        return name.use === getDefaultLanguage()
      }
    ) as GQLHumanName

    return nameObj
      ? `${String(nameObj.firstNames)} ${String(nameObj.familyName)}`
      : ''
  })

  return (
    <ListViewItemSimplified
      label={
        <LabelContainer>
          {intl.formatMessage(userMessages.labelEnglishName)}
        </LabelContainer>
      }
      value={<ValueContainer>{englishName}</ValueContainer>}
      actions={
        <DynamicHeightLinkButton disabled>
          {intl.formatMessage(buttonMessages.change)}
        </DynamicHeightLinkButton>
      }
    />
  )
}
