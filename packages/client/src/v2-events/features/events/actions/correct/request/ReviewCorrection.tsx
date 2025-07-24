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
import {
  EventState,
  generateTransactionId,
  isMetaAction
} from '@opencrvs/commons/client'
import {
  Button,
  Icon,
  ResponsiveModal,
  Stack,
  Text
} from '@opencrvs/components'
import { buttonMessages } from '@client/i18n/messages/buttons'
import { ROUTES } from '@client/v2-events/routes'
import { useModal } from '@client/v2-events/hooks/useModal'
import { useActionAnnotation } from '../../../useActionAnnotation'
import { useEvents } from '../../../useEvents/useEvents'
import { CorrectionDetails } from './Summary/CorrectionDetails'
import { ReviewHeader } from './ReviewHeader'

const reviewCorrectionMessages = defineMessages({
  actionModalCancel: {
    id: 'v2.actionModal.cancel',
    defaultMessage: 'Cancel',
    description: 'The label for cancel button of action modal'
  },
  actionModalDescription: {
    id: 'v2.actionModal.description',
    defaultMessage:
      'The declarant will be notified of this action and a record of this decision will be recorded',
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
  }
})

const Card = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.grey300};
  background: ${({ theme }) => theme.colors.white};
  border-radius: 4px;
  margin-bottom: 40px;
  &:last-child {
    margin-bottom: 200px;
  }
`

const ReviewContainter = styled.div<{ paddingT?: boolean }>`
  padding: ${({ paddingT }) => (paddingT ? '32px 32px 0 32px' : '0px 32px')};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: 0px 24px;
  }
`

const Row = styled.div<{
  position?: 'left' | 'center'
  background?: 'white' | 'background'
}>`
  display: flex;
  gap: 24px;
  width: 100%;
  justify-content: ${({ position }) => position || 'center'};
  background-color: ${({ theme, background }) =>
    !background || background === 'background'
      ? theme.colors.background
      : theme.colors.white};
  flex-direction: row;
  padding: 24px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: 0;
  }
`

const messages = defineMessages({
  correctionRequest: {
    id: 'v2-events.correction.correctionRequest',
    defaultMessage: 'Correction request',
    description: 'Correction request text'
  }
})

function ApproveModal({
  close,
  onSubmit
}: {
  close: (result: boolean | null) => void
  onSubmit: () => void
}) {
  const intl = useIntl()
  return (
    <ResponsiveModal
      autoHeight
      showHeaderBorder
      actions={[
        <Button
          key="cancel_correction"
          id="cancel_correction"
          type="tertiary"
          onClick={() => {
            close(null)
          }}
        >
          {intl.formatMessage(reviewCorrectionMessages.actionModalCancel)}
        </Button>,
        <Button
          key="confirm_correction"
          id="confirm_correction"
          type="primary"
          onClick={() => {
            onSubmit()
            close(true)
          }}
        >
          {intl.formatMessage(reviewCorrectionMessages.actionModalConfirm)}
        </Button>
      ]}
      handleClose={() => close(null)}
      responsive={true}
      show={true}
      title={intl.formatMessage(reviewCorrectionMessages.approveCorrection)}
    >
      <Stack>
        <Text color="grey500" element="p" variant="reg16">
          {intl.formatMessage(reviewCorrectionMessages.actionModalDescription)}
        </Text>
      </Stack>
    </ResponsiveModal>
  )
}

function RejectModal({
  close,
  onSubmit
}: {
  close: (result: boolean | null) => void
  onSubmit: () => void
}) {
  const intl = useIntl()
  return (
    <ResponsiveModal
      autoHeight
      showHeaderBorder
      actions={[
        <Button
          key="cancel_reject_correction"
          id="cancel_reject_correction"
          type="tertiary"
          onClick={() => {
            close(null)
          }}
        >
          {intl.formatMessage(reviewCorrectionMessages.actionModalCancel)}
        </Button>,
        <Button
          key="reject_correction"
          id="reject_correction"
          type="primary"
          onClick={() => {
            onSubmit()
            close(true)
          }}
        >
          {intl.formatMessage(reviewCorrectionMessages.actionModalConfirm)}
        </Button>
      ]}
      handleClose={() => close(null)}
      responsive={false}
      show={true}
      title={intl.formatMessage(reviewCorrectionMessages.rejectCorrection)}
    >
      <Stack>
        <Text color="grey500" element="p" variant="reg16">
          {intl.formatMessage(reviewCorrectionMessages.actionModalDescription)}
        </Text>
      </Stack>
    </ResponsiveModal>
  )
}

export function ReviewCorrection({ form }: { form: EventState }) {
  const intl = useIntl()
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

  const writeActions = event.actions.filter(
    (action) => !isMetaAction(action.type)
  )

  // latest action should be correction action
  const lastWriteAction = writeActions[writeActions.length - 1]

  const openApproveModal = async () => {
    await openModal((close) => (
      <ApproveModal
        close={close}
        onSubmit={() => {
          events.actions.correction.approve.mutate({
            transactionId: generateTransactionId(),
            eventId,
            requestId: lastWriteAction.id,
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
        onSubmit={() => {
          events.actions.correction.reject.mutate({
            transactionId: generateTransactionId(),
            eventId,
            requestId: lastWriteAction.id,
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

  return (
    <Card>
      <ReviewContainter paddingT={true}>
        <ReviewHeader
          id="correction_header"
          subject={messages.correctionRequest}
        />
        <CorrectionDetails annotation={annotation} event={event} form={form} />
        <Row background="white" position="left">
          <Button
            id="ApproveCorrectionBtn"
            size="large"
            type="positive"
            onClick={openApproveModal}
          >
            <Icon name="Check" />
            {intl.formatMessage(buttonMessages.approve)}
          </Button>
          <Button
            id="rejectCorrectionBtn"
            size="large"
            type="negative"
            onClick={openRejectModal}
          >
            <Icon name="X" />
            {intl.formatMessage(buttonMessages.reject)}
          </Button>
        </Row>
      </ReviewContainter>
      {modal}
    </Card>
  )
}
