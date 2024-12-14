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

import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { useEventFormNavigation } from '@client/v2-events/features/events/useEventFormNavigation'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { useModal } from '@client/v2-events/hooks/useModal'
import { ROUTES } from '@client/v2-events/routes'
import {
  Button,
  Checkbox,
  ResponsiveModal,
  Stack,
  Text,
  TextInput
} from '@opencrvs/components'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'
import { v4 as uuid } from 'uuid'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import { Preview } from '@client/v2-events/features/events/components/Preview'

const messages = defineMessages({
  reviewActionTitle: {
    id: 'reviewAction.title',
    defaultMessage: 'Declare member',
    description: 'The title for review action'
  },
  reviewActionDescription: {
    id: 'reviewAction.description',
    defaultMessage:
      'By clicking declare, you confirm that the information entered is correct and the member can be declared.',
    description: 'The description for review action'
  },
  reviewActionDeclare: {
    id: 'reviewAction.Declare',
    defaultMessage: 'Declare',
    description: 'The label for declare button of review action'
  },
  reviewActionReject: {
    id: 'reviewAction.reject',
    defaultMessage: 'Reject',
    description: 'The label for reject button of review action'
  },
  rejectModalCancel: {
    id: 'rejectModal.cancel',
    defaultMessage: 'Cancel',
    description: 'The label for cancel button of reject modal'
  },
  rejectModalArchive: {
    id: 'rejectModal.archive',
    defaultMessage: 'Archive',
    description: 'The label for archive button of reject modal'
  },
  rejectModalSendForUpdate: {
    id: 'rejectModal.sendForUpdate',
    defaultMessage: 'Send For Update',
    description: 'The label for send For Update button of reject modal'
  },
  rejectModalTitle: {
    id: 'rejectModal.title',
    defaultMessage: 'Reason for rejection?',
    description: 'The title for reject modal'
  },
  rejectModalDescription: {
    id: 'rejectModal.description',
    defaultMessage:
      'Please describe the updates required to this record for follow up action.',
    description: 'The description for reject modal'
  },
  rejectModalMarkAsDuplicate: {
    id: 'rejectModal.markAsDuplicate',
    defaultMessage: 'Mark as a duplicate',
    description: 'The label for mark as duplicate checkbox of reject modal'
  }
})

enum REJECT_ACTIONS {
  ARCHIVE,
  SEND_FOR_UPDATE
}

interface RejectionState {
  rejectAction: REJECT_ACTIONS
  details: string
  isDuplicate: boolean
}

export const ReviewSection = () => {
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.DECLARE.REVIEW)
  const events = useEvents()
  const navigate = useNavigate()
  const [modal, openModal] = useModal()
  const intl = useIntl()

  const { goToHome } = useEventFormNavigation()
  const declareMutation = events.actions.declare()

  const [event] = events.getEvent(eventId)

  const { eventConfiguration: config } = useEventConfiguration(event.type)

  if (!config) {
    throw new Error('Event configuration not found with type: ' + event.type)
  }

  const { forms: formConfigs } = config.actions.filter(
    (action) => action.type === 'DECLARE'
  )[0]

  const form = useEventFormData((state) => state.formValues)

  const handleEdit = async ({
    pageId,
    fieldId
  }: {
    pageId: string
    fieldId?: string
  }) => {
    const confirmedEdit = await openModal<boolean | null>((close) => (
      <Preview.EditModal close={close}></Preview.EditModal>
    ))

    if (confirmedEdit) {
      navigate(
        ROUTES.V2.EVENTS.DECLARE.PAGE.buildPath(
          { pageId, eventId },
          {
            from: 'review'
          },
          fieldId
        )
      )
    }
    return
  }

  const handleDeclaration = async () => {
    const confirmedDeclaration = await openModal<boolean | null>((close) => (
      <Preview.ActionModal close={close} action="Declare" />
    ))
    if (confirmedDeclaration) {
      declareMutation.mutate({
        eventId: event.id,
        data: form,
        transactionId: `tmp-${uuid()}`
      })

      goToHome()
    }
  }

  const handleReject = async () => {
    const confirmedReject = await openModal<RejectionState | null>((close) => (
      <RejectModal close={close}></RejectModal>
    ))
    if (confirmedReject) {
      const { rejectAction, ...rest } = confirmedReject
      switch (rejectAction) {
        case REJECT_ACTIONS.ARCHIVE:
          alert('Archived the registration ' + JSON.stringify(rest))
          break
        case REJECT_ACTIONS.SEND_FOR_UPDATE:
          alert('Sent the registration for update ' + JSON.stringify(rest))
          break
        default:
          break
      }
    }
    return
  }

  return (
    <>
      <Preview.Body
        formConfig={formConfigs[0]}
        eventConfig={config}
        onEdit={handleEdit}
        form={form}
        // @todo: Update to use dynamic title
        title={intl.formatMessage(formConfigs[0].review.title, {
          firstname: form['applicant.firstname'],
          surname: form['applicant.surname']
        })}
      >
        <Preview.Actions
          onConfirm={handleDeclaration}
          onReject={handleReject}
          messages={{
            title: messages.reviewActionTitle,
            description: messages.reviewActionDescription,
            onConfirm: messages.reviewActionDeclare
          }}
        />
      </Preview.Body>
      {modal}
    </>
  )
}

const RejectModal: React.FC<{
  close: (result: RejectionState | null) => void
}> = ({ close }) => {
  const [state, setState] = useState<RejectionState>({
    rejectAction: REJECT_ACTIONS.ARCHIVE,
    details: '',
    isDuplicate: false
  })

  const intl = useIntl()

  return (
    <ResponsiveModal
      autoHeight
      responsive={false}
      title={intl.formatMessage(messages.rejectModalTitle)}
      actions={[
        <Button
          type="tertiary"
          id="cancel_reject"
          key="cancel_reject"
          onClick={() => {
            close(null)
          }}
        >
          {intl.formatMessage(messages.rejectModalCancel)}
        </Button>,
        <Button
          type="secondaryNegative"
          key="confirm_reject_with_archive"
          id="confirm_reject_with_archive"
          onClick={() => {
            close({
              ...state,
              rejectAction: REJECT_ACTIONS.ARCHIVE
            })
          }}
        >
          {intl.formatMessage(messages.rejectModalArchive)}
        </Button>,
        <Button
          type="negative"
          key="confirm_reject_with_update"
          id="confirm_reject_with_update"
          onClick={() => {
            close({
              ...state,
              rejectAction: REJECT_ACTIONS.SEND_FOR_UPDATE
            })
          }}
        >
          {intl.formatMessage(messages.rejectModalSendForUpdate)}
        </Button>
      ]}
      show={true}
      handleClose={() => close(null)}
    >
      <Stack direction="column" alignItems="left">
        <Text variant="reg16" element="p" color="grey500">
          {intl.formatMessage(messages.rejectModalDescription)}
        </Text>
        <TextInput
          required={true}
          value={state.details}
          onChange={(e) =>
            setState((prev) => ({ ...prev, details: e.target.value }))
          }
        />
        <Checkbox
          name={'markDUplicate'}
          label={intl.formatMessage(messages.rejectModalMarkAsDuplicate)}
          value={''}
          selected={state.isDuplicate}
          onChange={() =>
            setState((prev) => ({ ...prev, isDuplicate: !prev.isDuplicate }))
          }
        />
      </Stack>
    </ResponsiveModal>
  )
}
