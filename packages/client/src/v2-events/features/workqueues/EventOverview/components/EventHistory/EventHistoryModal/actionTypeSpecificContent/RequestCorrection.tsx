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
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { Text } from '@opencrvs/components/lib/Text'
import {
  ActionType,
  EventConfig,
  getDeclaration,
  RequestedCorrectionAction
} from '@opencrvs/commons/client'
import { messages as correctionMessages } from '@client/i18n/messages/views/correction'

const CorrectionSectionTitle = styled(Text)`
  margin: 20px 0;
`

export function RequestCorrection({
  eventConfiguration,
  action
}: {
  eventConfiguration: EventConfig
  action: RequestedCorrectionAction
}) {
  const intl = useIntl()

  const correctionFormPages =
    eventConfiguration.actions.find(
      (a) => a.type === ActionType.REQUEST_CORRECTION
    )?.correctionForm.pages || []

  console.log(action)

  const formConfig = getDeclaration(eventConfiguration)

  return (
    <>
      {correctionFormPages.map((page) => (
        <div key={page.id}>{'todo'}</div>
      ))}
      <CorrectionSectionTitle element="h3" variant="h3">
        {intl.formatMessage(
          correctionMessages.correctionInformationSectionTitle
        )}
      </CorrectionSectionTitle>
    </>
  )
}
