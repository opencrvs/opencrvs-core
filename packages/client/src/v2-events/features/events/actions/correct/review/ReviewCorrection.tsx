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
import styled from 'styled-components'
import { defineMessages, useIntl } from 'react-intl'
import {
  useTypedParams,
  useTypedSearchParams
} from 'react-router-typesafe-routes/dom'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  EventState,
  generateTransactionId,
  RequestedCorrectionAction,
  SCOPES
} from '@opencrvs/commons/client'
import { Dialog } from '@opencrvs/components/lib/Dialog/Dialog'
import {
  Button,
  Content,
  ContentSize,
  Icon,
  InputField,
  Stack,
  Text,
  TextArea
} from '@opencrvs/components'
import { buttonMessages } from '@client/i18n/messages/buttons'
import { ROUTES } from '@client/v2-events/routes'
import { useModal } from '@client/v2-events/hooks/useModal'
import { useActionAnnotation } from '@client/v2-events/features/events/useActionAnnotation'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { getScope } from '@client/profile/profileSelectors'
import { CorrectionDetails } from '@client/v2-events/features/events/actions/correct/request/Summary/CorrectionDetails'

const reviewCorrectionMessages = defineMessages({
  actionModalCancel: {
    id: 'v2.actionModal.cancel',
    defaultMessage: 'Cancel',
    description: 'The label for cancel button of action modal'
  },
  actionModalDescription: {
    id: 'v2.actionModal.description',
    defaultMessage:
      'The informant will be notified of this decision and a record of this decision will be recorded',
    description: 'The description for action modal'
  },
  approveCorrection: {
    id: 'v2.modal.approveCorrection',
    defaultMessage: 'Approve correction?',
    description: 'The title for approve correction modal'
  },
  rejectCorrection: {
    id: 'v2.modal.rejectCorrection',
    defaultMessage: 'Reject correction?',
    description: 'The title for reject correction modal'
  },
  actionModalConfirm: {
    id: 'v2.actionModal.confirm',
    defaultMessage: 'Confirm',
    description: 'The label for confirm button of action modal'
  },
  correctionRequest: {
    id: 'v2-events.correction.correctionRequest',
    defaultMessage: 'Correction request',
    description: 'Correction request text'
  },
  rejectReason: {
    id: 'v2-events.correction.correctionReject.reason',
    defaultMessage: 'Reason for rejection',
    description: 'Correction request rejection reason'
  }
})

const Row = styled.div<{
  position?: 'left' | 'center'
  background?: 'white' | 'background'
}>`
  display: flex;
  gap: 16px;
  width: 100%;
  justify-content: ${({ position }) => position || 'center'};
  background-color: ${({ theme, background }) =>
    !background || background === 'background'
      ? theme.colors.background
      : theme.colors.white};
  flex-direction: row;
  padding: 24px 0px 24px 0px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: 0;
  }
`

const StyledTextArea = styled(TextArea)`
  height: 100px;
  width: 420px;
  @media (max-width: 480px) {
    width: 100%;
  }
`

const StyledButton = styled(Button)`
  width: 235px;
  height: 56px;
  @media (max-width: 480px) {
    width: 100%;
  }
`

const StyledStack = styled(Stack)`
  padding-top: 20px;
`

function ApproveModal({
  close,
  onSubmit
}: {
  close: (result: boolean | null) => void
  onSubmit: () => void
}) {
  const intl = useIntl()
  return (
    <Dialog
      actions={[
        <StyledButton
          key="confirm_correction"
          id="confirm_correction"
          type="positive"
          onClick={() => {
            onSubmit()
            close(true)
          }}
        >
          {intl.formatMessage(reviewCorrectionMessages.actionModalConfirm)}
        </StyledButton>
      ]}
      isOpen={true}
      title={intl.formatMessage(reviewCorrectionMessages.approveCorrection)}
      onClose={() => close(true)}
    >
      <Stack>
        <Text color="grey500" element="p" variant="reg16">
          {intl.formatMessage(reviewCorrectionMessages.actionModalDescription)}
        </Text>
      </Stack>
    </Dialog>
  )
}

function RejectModal({
  close,
  onSubmit
}: {
  close: (result: boolean | null) => void
  onSubmit: (message: string) => void
}) {
  const intl = useIntl()
  const [message, setMessage] = React.useState('')
  return (
    <Dialog
      actions={[
        <StyledButton
          key="reject_correction"
          disabled={!message}
          id="reject_correction"
          size="large"
          type="negative"
          onClick={() => {
            onSubmit(message)
            close(true)
          }}
        >
          {intl.formatMessage(reviewCorrectionMessages.actionModalConfirm)}
        </StyledButton>
      ]}
      isOpen={true}
      title={intl.formatMessage(reviewCorrectionMessages.rejectCorrection)}
      onClose={() => close(true)}
    >
      <Stack>
        <Text color="grey500" element="p" variant="reg16">
          {intl.formatMessage(reviewCorrectionMessages.actionModalDescription)}
        </Text>
      </Stack>
      <StyledStack>
        <InputField
          id={'reject-correction'}
          label={intl.formatMessage(reviewCorrectionMessages.rejectReason)}
          required={true}
          touched={false}
        >
          <StyledTextArea
            id={'reject-correction-reason'}
            onChange={(e) => setMessage(e.target.value)}
          />
        </InputField>
      </StyledStack>
    </Dialog>
  )
}

export function ReviewCorrection({
  form,
  correctionRequestAction
}: {
  form: EventState
  correctionRequestAction: RequestedCorrectionAction
}) {
  const intl = useIntl()
  const scopes = useSelector(getScope)
  const { getAnnotation } = useActionAnnotation()
  const annotation = getAnnotation()
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.REQUEST_CORRECTION.REVIEW)
  const [searchParams] = useTypedSearchParams(
    ROUTES.V2.EVENTS.REQUEST_CORRECTION.REVIEW
  )

  const events = useEvents()
  const event = events.getEvent.getFromCache(eventId)
  const [modal, openModal] = useModal()
  const navigate = useNavigate()

  const openApproveModal = async () => {
    await openModal((close) => (
      <ApproveModal
        close={close}
        onSubmit={() => {
          events.actions.correction.approve.mutate({
            transactionId: generateTransactionId(),
            eventId,
            requestId: correctionRequestAction.id,
            annotation
          })
          return navigate(
            ROUTES.V2.EVENTS.OVERVIEW.buildPath(
              { eventId },
              { workqueue: searchParams.workqueue }
            )
          )
        }}
      />
    ))
  }

  const openRejectModal = async () => {
    await openModal((close) => (
      <RejectModal
        close={close}
        onSubmit={(message) => {
          events.actions.correction.reject.mutate({
            transactionId: generateTransactionId(),
            eventId,
            requestId: correctionRequestAction.id,
            annotation,
            reason: { message }
          })
          return navigate(
            ROUTES.V2.EVENTS.OVERVIEW.buildPath(
              { eventId },
              { workqueue: searchParams.workqueue }
            )
          )
        }}
      />
    ))
  }

  const rejectButton = (
    <Button
      fullWidth={true}
      id="rejectCorrectionBtn"
      size="large"
      type="negative"
      onClick={openRejectModal}
    >
      <Icon name="X" />
      {intl.formatMessage(buttonMessages.reject)}
    </Button>
  )

  const approveButton = (
    <Button
      fullWidth={true}
      id="ApproveCorrectionBtn"
      size="large"
      type="positive"
      onClick={openApproveModal}
    >
      <Icon name="Check" />
      {intl.formatMessage(buttonMessages.approve)}
    </Button>
  )

  return (
    <Content
      size={ContentSize.LARGE}
      title={intl.formatMessage(reviewCorrectionMessages.correctionRequest)}
    >
      <CorrectionDetails
        annotation={annotation}
        correctionRequestAction={correctionRequestAction}
        event={event}
        form={form}
        requesting={!scopes?.includes(SCOPES.RECORD_REGISTRATION_CORRECT)}
      />
      <Row background="white" position="left">
        {rejectButton}
        {approveButton}
      </Row>
      {modal}
    </Content>
  )
}
