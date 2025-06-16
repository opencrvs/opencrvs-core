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
import { Table } from '@opencrvs/components/lib/Table'
import { Text } from '@opencrvs/components/lib/Text'
import {
  ActionType,
  EventConfig,
  getDeclaration
} from '@opencrvs/commons/client'
import { messages as correctionMessages } from '@client/i18n/messages/views/correction'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'

const SectionTitle = styled(Text)`
  margin-bottom: 20px;
`

const CorrectionInformationSectionTitle = styled(SectionTitle)`
  margin-top: 20px;
`

export function RequestCorrection({
  eventConfiguration
}: {
  eventConfiguration: EventConfig
}) {
  const intl = useIntl()

  const correctionFormPages =
    eventConfiguration.actions.find(
      (action) => action.type === ActionType.REQUEST_CORRECTION
    )?.correctionForm.pages || []

  const formConfig = getDeclaration(eventConfiguration)

  return (
    <>
      {correctionFormPages.map((page) => (
        <div key={page.id}>
          <CorrectionInformationSectionTitle element="h3" variant="h3">
            {intl.formatMessage(page.title)}
          </CorrectionInformationSectionTitle>
        </div>
      ))}
    </>
  )
}
