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

import * as React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import {
  Button,
  ResponsiveModal,
  Select,
  Stack,
  Text,
  TextArea
} from '@opencrvs/components'
import { PotentialDuplicate } from '@opencrvs/commons/client'
import { buttonMessages } from '@client/i18n/messages'
import { duplicateMessages } from './ReviewDuplicate'

const StyledText = styled(Text)`
  padding-bottom: 4px;
`

const StyledTextArea = styled(TextArea)`
  border-radius: 4px;
  margin-bottom: 24px;
`
export interface MarkAsDuplicateContent {
  selectedTrackingId: string
  reason: string
}

export function MarkAsDuplicateModal({
  close,
  duplicates,
  originalTrackingId
}: {
  close: (content?: MarkAsDuplicateContent) => void
  duplicates: PotentialDuplicate[]
  originalTrackingId: string
}) {
  const intl = useIntl()
  const [selectedTrackingId, setSelectedTrackingId] = React.useState('')
  const [comment, setComment] = React.useState('')

  const handleCommentChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setComment(event.target.value)
  }
  return (
    <ResponsiveModal
      actions={[
        <Button
          key="cancel"
          id="modal_cancel"
          type="tertiary"
          onClick={() => close()}
        >
          {intl.formatMessage(buttonMessages.cancel)}
        </Button>,
        <Button
          key="mark-as-duplicate-button"
          disabled={!(Boolean(selectedTrackingId) && Boolean(comment))}
          id="mark-as-duplicate-button"
          type="negative"
          onClick={() => close({ selectedTrackingId, reason: comment })}
        >
          {intl.formatMessage(duplicateMessages.markAsDuplicateButton)}
        </Button>
      ]}
      autoHeight={true}
      handleClose={() => close()}
      id="mark-as-duplicate-modal"
      show={true}
      title={intl.formatMessage(
        duplicateMessages.markAsDuplicateConfirmationTitle,
        {
          trackingId: originalTrackingId
        }
      )}
      titleHeightAuto={true}
      width={840}
    >
      {
        <Stack alignItems="stretch" direction="column" gap={10}>
          <Text element="span" variant="reg18">
            {intl.formatMessage(duplicateMessages.duplicateDropdownMessage)}
          </Text>
          <Select
            id="selectTrackingId"
            isDisabled={false}
            options={duplicates.map(({ trackingId }) => ({
              value: trackingId,
              label: trackingId
            }))}
            value={selectedTrackingId}
            onChange={(val: string) => {
              setSelectedTrackingId(val)
            }}
          />
          <StyledText element="span" variant="reg18">
            {intl.formatMessage(duplicateMessages.markAsDuplicateReason)}
          </StyledText>
          <StyledTextArea
            id="describe-reason"
            {...{
              onChange: handleCommentChange
            }}
          />
        </Stack>
      }
    </ResponsiveModal>
  )
}
