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
import {
  EditAction,
  EventDocument,
  ValidatorContext
} from '@opencrvs/commons/client'
import { Text } from '@opencrvs/components/lib/Text'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { withSuspense } from '@client/v2-events/components/withSuspense'
import { DeclarationComparisonTable } from '@client/v2-events/features/events/actions/correct/request/Summary/DeclarationComparisonTable'

const ReasonParagraph = styled(Text)`
  padding: 16px 0;
`

const reasonLabel = {
  id: 'event.edit.reason.label',
  defaultMessage: 'Reason of edit',
  description: 'The label for the reason of edit'
}

/** Displays reason for edit and made edits */
function EditComponent({
  action,
  fullEvent,
  validatorContext
}: {
  action: EditAction
  fullEvent: EventDocument
  validatorContext: ValidatorContext
}) {
  const { eventConfiguration } = useEventConfiguration(fullEvent.type)
  const reason = action.content?.reason
  const intl = useIntl()

  return (
    <>
      {reason && (
        <ReasonParagraph element="p" variant="reg16">
          <b>
            {intl.formatMessage(reasonLabel)}
            {':'}
          </b>{' '}
          {reason}
        </ReasonParagraph>
      )}
      <DeclarationComparisonTable
        action={action}
        eventConfig={eventConfiguration}
        fullEvent={fullEvent}
        id={'declaration-edit'}
        validatorContext={validatorContext}
      />
    </>
  )
}

export const Edit = withSuspense(EditComponent)
