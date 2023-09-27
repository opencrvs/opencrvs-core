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
import { archiveDeclaration, IDeclaration } from '@client/declarations'
import styled from 'styled-components'
import { duplicateMessages } from '@client/i18n/messages/views/duplicates'
import { useIntl } from 'react-intl'
import { Button } from '@opencrvs/components/src/Button'
import { Icon } from '@opencrvs/components/lib/Icon'
import { useDispatch } from 'react-redux'
import { updateDeclaration } from '@client/declarations/submissionMiddleware'
import {
  ResponsiveModal,
  Select,
  Stack,
  Text,
  TextArea
} from '@opencrvs/components/lib'
import { CancelButton } from '@client/views/SysAdmin/Config/Application/Components'
import { buttonMessages } from '@client/i18n/messages'
import { goToHome } from '@client/navigation'

interface IProps {
  declaration: IDeclaration
}

const SubPageContent = styled(Content)`
  margin: auto 0 20px;
  max-width: 100%;
`

const StyledSelect = styled(Select)`
  width: 192px;
  ${({ theme }) => theme.fonts.reg18};
  padding-bottom: 20px;
  .react-select__control {
    border-radius: 4px;
  }
`
const StyledText = styled(Text)`
  padding-bottom: 4px;
`

const StyledTextArea = styled(TextArea)`
  border-radius: 4px;
  margin-bottom: 24px;
`

export const DuplicateForm = (props: IProps) => {
  const intl = useIntl()
  const [showModal, setShowModal] = React.useState(false)
  const [selectedTrackingId, setSelectedTrackingId] = React.useState('')
  const [comment, setComment] = React.useState('')
  const compositionId = props.declaration.id
  const dispatch = useDispatch()
  const { data } = props.declaration
  const { duplicates, ...withoutDuplicates } = props.declaration
  const trackingIds = duplicates
    ?.map((duplicate) => duplicate.trackingId)
    .join(', ')

  const getName = () => {
    switch (data.registration.type) {
      case 'birth':
        return [
          data.child.firstNamesEng as string,
          data.child.familyNameEng as string
        ].join(' ')
      case 'death':
        return [
          data.deceased.firstNamesEng as string,
          data.deceased.familyNameEng as string
        ].join(' ')
      default:
        return
    }
  }

  const toggleModal = () => {
    setShowModal((prev) => !prev)
  }

  const handleCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setComment(event.target.value)
  }

  const [toggleNotDuplicate, setToggleNotDuplicate] = React.useState(false)

  const toggleNotDuplicateModal = () => {
    setToggleNotDuplicate((prevValue) => !prevValue)
  }

  const notADuplicateButton = (
    <Button
      id="not-a-duplicate"
      key="btn-not-a-duplicate"
      onClick={() => {
        toggleNotDuplicateModal()
      }}
      type="positive"
    >
      <Icon name="NotePencil" />
      {intl.formatMessage(duplicateMessages.notDuplicateButton)}
    </Button>
  )

  const markAsDuplicateButton = (
    <Button
      id="mark-as-duplicate"
      key="btn-mark-as-duplicate"
      onClick={() => {
        toggleModal()
      }}
      type="negative"
    >
      <Icon name="Archive" />
      {intl.formatMessage(duplicateMessages.markAsDuplicateButton)}
    </Button>
  )
  return (
    <>
      <div>
        <SubPageContent
          title={intl.formatMessage(duplicateMessages.duplicateContentTitle, {
            name: getName(),
            trackingId: String(data.registration.trackingId)
          })}
          subtitle={intl.formatMessage(
            duplicateMessages.duplicateContentSubtitle,
            {
              trackingIds
            }
          )}
          bottomActionButtons={[notADuplicateButton, markAsDuplicateButton]}
        ></SubPageContent>
      </div>

      <ResponsiveModal
        id="mark-as-duplicate-modal"
        width={840}
        title={intl.formatMessage(
          duplicateMessages.markAsDuplicateConfirmationTitle,
          {
            trackingId: String(data.registration.trackingId)
          }
        )}
        autoHeight={true}
        titleHeightAuto={true}
        show={showModal}
        actions={[
          <CancelButton key="cancel" id="modal_cancel" onClick={toggleModal}>
            {intl.formatMessage(buttonMessages.cancel)}
          </CancelButton>,
          <Button
            key="mark-as-duplicate-button"
            id="mark-as-duplicate-button"
            type="negative"
            onClick={() => {
              if (Boolean(selectedTrackingId)) {
                dispatch(
                  archiveDeclaration(
                    compositionId,
                    'duplicate',
                    comment,
                    selectedTrackingId
                  )
                )
                dispatch(goToHome())
              }
            }}
            disabled={!Boolean(selectedTrackingId)}
          >
            {intl.formatMessage(duplicateMessages.markAsDuplicateButton)}
          </Button>
        ]}
        handleClose={toggleModal}
      >
        {
          <>
            <Stack direction="column" alignItems="stretch" gap={10}>
              <Text variant="reg18" element="span">
                {intl.formatMessage(duplicateMessages.duplicateDropdownMessage)}
              </Text>
              <StyledSelect
                id="selectTrackingId"
                isDisabled={false}
                value={selectedTrackingId}
                onChange={(val: string) => {
                  setSelectedTrackingId(val)
                }}
                options={props.declaration.duplicates?.map((id) => ({
                  value: id.trackingId,
                  label: id.trackingId
                }))}
              />
              <StyledText id="describe-reason" variant="reg18" element="span">
                {intl.formatMessage(duplicateMessages.markAsDuplicateReason)}
              </StyledText>
              <StyledTextArea
                ignoreMediaQuery
                {...{
                  onChange: handleCommentChange
                }}
              />
            </Stack>
          </>
        }
      </ResponsiveModal>
      <ResponsiveModal
        id="not-duplicate-modal"
        show={toggleNotDuplicate}
        autoHeight={true}
        responsive={false}
        titleHeightAuto={true}
        handleClose={() => toggleNotDuplicateModal()}
        title={intl.formatMessage(
          duplicateMessages.notDuplicateContentConfirmationTitle,
          {
            name: getName(),
            trackingId: String(data.registration.trackingId)
          }
        )}
        actions={[
          <Button
            type="tertiary"
            id="not-duplicate-cancel"
            key="not-duplicateRegistration-cancel"
            onClick={() => toggleNotDuplicateModal()}
          >
            {intl.formatMessage(buttonMessages.cancel)}
          </Button>,
          <Button
            type="primary"
            id="not-duplicate-confirm"
            key="not-duplicateRegistration-confirm"
            onClick={() => {
              if (duplicates) {
                withoutDuplicates.isNotDuplicate = true
                updateDeclaration(dispatch, withoutDuplicates)
              }
              toggleNotDuplicateModal()
            }}
          >
            {intl.formatMessage(buttonMessages.confirm)}
          </Button>
        ]}
      ></ResponsiveModal>
    </>
  )
}
