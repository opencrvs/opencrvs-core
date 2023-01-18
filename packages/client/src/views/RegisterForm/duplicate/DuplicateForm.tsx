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
import { Content } from '@opencrvs/components/lib/Content'
import { IDeclaration } from '@client/declarations'
import styled from 'styled-components'
import { duplicateMessages } from '@client/i18n/messages/views/duplicates'
import { useIntl } from 'react-intl'
import { Button } from '@opencrvs/components/src/Button'
import { Icon } from '@opencrvs/components/lib/Icon'

interface IProps {
  declaration: IDeclaration
}

const SubPageContent = styled(Content)`
  margin: auto 0 20px;
  max-width: 100%;
`

export const DuplicateForm = (props: IProps) => {
  const intl = useIntl()
  const { data } = props.declaration
  const trackingIds = props.declaration.duplicates
    ?.map((duplicate) => duplicate.trackingId)
    .join(', ')

  const getName = () => {
    return [
      data.child.firstNamesEng as string,
      data.child.familyNameEng as string
    ].join(' ')
  }

  const notADuplicateButton = (
    <Button
      onClick={() => {
        alert('Not a duplicate')
      }}
      type="positive"
    >
      <Icon name="Edit" />
      {intl.formatMessage(duplicateMessages.notDuplicateButton)}
    </Button>
  )

  const markASDuplicateButton = (
    <Button
      onClick={() => {
        alert('Mark as duplicate')
      }}
      type="negative"
    >
      <Icon name="Archive" />
      {intl.formatMessage(duplicateMessages.markAsDuplicateButton)}
    </Button>
  )

  return (
    <SubPageContent
      title={intl.formatMessage(duplicateMessages.duplicateContentTitle, {
        name: getName(),
        trackingId: String(data.registration.trackingId)
      })}
      subtitle={intl.formatMessage(duplicateMessages.duplicateContentSubtitle, {
        trackingIds
      })}
      bottomActionButtons={[notADuplicateButton, markASDuplicateButton]}
    ></SubPageContent>
  )
}
