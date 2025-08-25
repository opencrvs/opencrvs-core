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
import styled from 'styled-components'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'
import { Content } from '@opencrvs/components/lib/Content'
import { Button } from '@opencrvs/components/src/Button'
import { Icon } from '@opencrvs/components/lib/Icon'
import {
  ResponsiveModal,
  Select,
  Stack,
  Text,
  TextArea
} from '@opencrvs/components/lib'
import { EventIndex } from '@opencrvs/commons/client'
import { buttonMessages } from '@client/i18n/messages'
import { useEventConfiguration } from '../../useEventConfiguration'
import { useEventTitle } from '../../useEvents/useEventTitle'
import { duplicateMessages } from './ReviewDuplicate'

const SubPageContent = styled(Content)`
  margin: auto 0 20px;
  max-width: 100%;
`

const StyledText = styled(Text)`
  padding-bottom: 4px;
`

const StyledTextArea = styled(TextArea)`
  border-radius: 4px;
  margin-bottom: 24px;
`

export const DuplicateForm = ({ eventIndex }: { eventIndex: EventIndex }) => {
  const intl = useIntl()

  const navigate = useNavigate()
  const [showModal, setShowModal] = React.useState(false)
  const [selectedTrackingId, setSelectedTrackingId] = React.useState('')
  const [comment, setComment] = React.useState('')
  const { getEventTitle } = useEventTitle()

  const { eventConfiguration: configuration } = useEventConfiguration(
    eventIndex.type
  )

  const { title: name } = getEventTitle(configuration, eventIndex)

  configuration.summary.fields

  const trackingIds = eventIndex.duplicates
    .map((duplicate) => duplicate.trackingId)
    .join(', ')

  const toggleModal = () => {
    setShowModal((prev) => !prev)
  }

  const handleCommentChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setComment(event.target.value)
  }

  const [toggleNotDuplicate, setToggleNotDuplicate] = React.useState(false)

  const toggleNotDuplicateModal = () => {
    setToggleNotDuplicate((prevValue) => !prevValue)
  }

  const notADuplicateButton = (
    <Button
      key="btn-not-a-duplicate"
      fullWidth
      id="not-a-duplicate"
      type="positive"
      onClick={() => {
        toggleNotDuplicateModal()
      }}
    >
      <Icon name="NotePencil" />
      {intl.formatMessage(duplicateMessages.notDuplicateButton)}
    </Button>
  )

  const markAsDuplicateButton = (
    <Button
      key="btn-mark-as-duplicate"
      fullWidth
      id="mark-as-duplicate"
      type="negative"
      onClick={() => {
        toggleModal()
      }}
    >
      <Icon name="Archive" />
      {intl.formatMessage(duplicateMessages.markAsDuplicateButton)}
    </Button>
  )
  return (
    <>
      <div>
        <SubPageContent
          bottomActionButtons={[notADuplicateButton, markAsDuplicateButton]}
          bottomActionDirection="row"
          showTitleOnMobile={true}
          subtitle={intl.formatMessage(
            duplicateMessages.duplicateContentSubtitle,
            {
              trackingIds
            }
          )}
          title={intl.formatMessage(duplicateMessages.duplicateContentTitle, {
            name,
            trackingId: eventIndex.trackingId
          })}
        ></SubPageContent>
      </div>

      <ResponsiveModal
        actions={[
          <Button
            key="cancel"
            id="modal_cancel"
            type="tertiary"
            onClick={toggleModal}
          >
            {intl.formatMessage(buttonMessages.cancel)}
          </Button>,
          <Button
            key="mark-as-duplicate-button"
            disabled={!(Boolean(selectedTrackingId) && Boolean(comment))}
            id="mark-as-duplicate-button"
            type="negative"
            onClick={() => {
              alert('Mark as duplicate clicked')
            }}
          >
            {intl.formatMessage(duplicateMessages.markAsDuplicateButton)}
          </Button>
        ]}
        autoHeight={true}
        handleClose={toggleModal}
        id="mark-as-duplicate-modal"
        show={showModal}
        title={intl.formatMessage(
          duplicateMessages.markAsDuplicateConfirmationTitle,
          {
            trackingId: eventIndex.trackingId
          }
        )}
        titleHeightAuto={true}
        width={840}
      >
        {
          <>
            <Stack alignItems="stretch" direction="column" gap={10}>
              <Text element="span" variant="reg18">
                {intl.formatMessage(duplicateMessages.duplicateDropdownMessage)}
              </Text>
              <Select
                id="selectTrackingId"
                isDisabled={false}
                options={eventIndex.duplicates.map(({ trackingId }) => ({
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
          </>
        }
      </ResponsiveModal>
      <ResponsiveModal
        actions={[
          <Button
            key="not-duplicateRegistration-cancel"
            id="not-duplicate-cancel"
            type="tertiary"
            onClick={() => toggleNotDuplicateModal()}
          >
            {intl.formatMessage(buttonMessages.cancel)}
          </Button>,
          <Button
            key="not-duplicateRegistration-confirm"
            id="not-duplicate-confirm"
            type="primary"
            onClick={() => {
              alert('Not a duplicate clicked')
            }}
          >
            {intl.formatMessage(buttonMessages.confirm)}
          </Button>
        ]}
        autoHeight={true}
        handleClose={() => toggleNotDuplicateModal()}
        id="not-duplicate-modal"
        responsive={false}
        show={toggleNotDuplicate}
        title={intl.formatMessage(
          duplicateMessages.notDuplicateContentConfirmationTitle,
          {
            name,
            trackingId: eventIndex.trackingId
          }
        )}
        titleHeightAuto={true}
      ></ResponsiveModal>
    </>
  )
}
