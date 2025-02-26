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

import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'
import { v4 as uuid } from 'uuid'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import { useSelector } from 'react-redux'
import {
  Button,
  Checkbox,
  ResponsiveModal,
  Stack,
  Text,
  TextInput
} from '@opencrvs/components'
import {
  ActionFormData,
  ActionType,
  findActiveActionForm,
  FormConfig,
  Scope,
  SCOPES
} from '@opencrvs/commons/client'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { useEventMetadata } from '@client/v2-events/features/events/useEventMeta'
import { useEventFormNavigation } from '@client/v2-events/features/events/useEventFormNavigation'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { useModal } from '@client/v2-events/hooks/useModal'
import { ROUTES } from '@client/v2-events/routes'
import { Review as ReviewComponent } from '@client/v2-events/features/events/components/Review'
import { FormLayout } from '@client/v2-events/layouts'

// eslint-disable-next-line no-restricted-imports
import { getScope } from '@client/profile/profileSelectors'
import { validationErrorsInActionFormExist } from '@client/v2-events/components/forms/validation'
import { withSuspense } from '@client/v2-events/components/withSuspense'

const rejectModalMessages = defineMessages({
  rejectModalCancel: {
    id: 'v2.rejectModal.cancel',
    defaultMessage: 'Cancel',
    description: 'The label for cancel button of reject modal'
  },
  rejectModalArchive: {
    id: 'v2.rejectModal.archive',
    defaultMessage: 'Archive',
    description: 'The label for archive button of reject modal'
  },
  rejectModalSendForUpdate: {
    id: 'v2.rejectModal.sendForUpdate',
    defaultMessage: 'Send For Update',
    description: 'The label for send For Update button of reject modal'
  },
  rejectModalTitle: {
    id: 'v2.rejectModal.title',
    defaultMessage: 'Reason for rejection?',
    description: 'The title for reject modal'
  },
  rejectModalDescription: {
    id: 'v2.rejectModal.description',
    defaultMessage:
      'Please describe the updates required to this record for follow up action.',
    description: 'The description for reject modal'
  },
  rejectModalMarkAsDuplicate: {
    id: 'v2.rejectModal.markAsDuplicate',
    defaultMessage: 'Mark as a duplicate',
    description: 'The label for mark as duplicate checkbox of reject modal'
  }
})

const confirmModalMessages = {
  complete: {
    declare: {
      title: {
        id: 'v2.review.declare.confirmModal.title',
        defaultMessage: 'Send for review?',
        description: 'The title for review action modal when declaring'
      },
      description: {
        id: 'v2.review.declare.confirmModal.description',
        defaultMessage: 'This declaration will be sent for review',
        description: 'The description for review action modal when declaring'
      },
      onConfirm: {
        id: 'v2.review.declare.confirmModal.confirm',
        defaultMessage: 'Confirm',
        description: 'The label for modal confirm button when declaring'
      },
      onCancel: {
        id: 'v2.review.declare.confirmModal.cancel',
        defaultMessage: 'Cancel',
        description: 'The label for modal cancel button when declaring'
      }
    },
    validate: {
      title: {
        id: 'v2.review.validate.confirmModal.title',
        defaultMessage: 'Send for approval?',
        description: 'The title for review action modal when validating'
      },
      description: {
        id: 'v2.review.validate.confirmModal.description',
        defaultMessage:
          'This declaration will be sent for approval prior to registration.',
        description: 'The description for review action modal when validating'
      },
      onConfirm: {
        id: 'v2.review.validate.confirmModal.confirm',
        defaultMessage: 'Confirm',
        description: 'The label for modal confirm button when validating'
      },
      onCancel: {
        id: 'v2.review.validate.confirmModal.cancel',
        defaultMessage: 'Cancel',
        description: 'The label for modal cancel button when validating'
      }
    },
    register: {
      title: {
        id: 'v2.review.register.confirmModal.title',
        defaultMessage: 'Register?',
        description: 'The title for review action modal when registering'
      },
      description: {
        id: 'v2.review.register.confirmModal.description',
        defaultMessage: '‎', // intentionally empty, as the description is not used in v1
        description: 'The description for review action modal when registering'
      },
      onConfirm: {
        id: 'v2.review.register.confirmModal.confirm',
        defaultMessage: 'Register',
        description: 'The label for modal confirm button when registering'
      },
      onCancel: {
        id: 'v2.review.register.confirmModal.cancel',
        defaultMessage: 'Cancel',
        description: 'The label for modal cancel button when registering'
      }
    }
  }
}

const registerMessages = {
  title: {
    id: 'v2.review.register.title',
    defaultMessage: 'Register event',
    description: 'The title shown when reviewing a record to register'
  },
  onConfirm: {
    id: 'v2.review.register.confirm',
    defaultMessage: 'Register',
    description: 'The label for register button of review action'
  }
}

const validateMessages = {
  title: {
    id: 'v2.review.validate.title',
    defaultMessage: 'Send for approval',
    description: 'The title shown when reviewing a record to validate'
  },
  onConfirm: {
    id: 'v2.review.validate.confirm',
    defaultMessage: 'Send for approval',
    description: 'The label for review action button when validating'
  }
}

const declareMessages = {
  onConfirm: {
    id: 'v2.review.declare.confirm',
    defaultMessage: 'Send for review',
    description: 'The label for review action button when declaring'
  }
}

const reviewMessages = {
  complete: {
    register: {
      title: registerMessages.title,
      description: {
        id: 'v2.review.register.description.complete',
        defaultMessage:
          'By clicking register, you confirm that the information entered is correct and the event can be registered.',
        description:
          'The description for registration action when form is complete'
      },
      onConfirm: registerMessages.onConfirm,
      modal: confirmModalMessages.complete.register
    },
    validate: {
      title: validateMessages.title,
      description: {
        id: 'v2.review.validate.description.complete',
        defaultMessage:
          'The informant will receive an email with a registration number that they can use to collect the certificate',
        description: 'The description for validate action when form is complete'
      },
      onConfirm: validateMessages.onConfirm,
      modal: confirmModalMessages.complete.validate
    },
    declare: {
      title: {
        id: 'v2.review.declare.title.complete',
        defaultMessage: 'Declaration complete',
        description:
          'The title shown when reviewing an incomplete record to declare'
      },
      description: {
        id: 'v2.review.declare.description.complete',
        defaultMessage:
          'The informant will receive an email with a registration number that they can use to collect the certificate',
        description: 'The description for declare action when form is complete'
      },
      onConfirm: declareMessages.onConfirm,
      modal: confirmModalMessages.complete.declare
    }
  },
  incomplete: {
    register: {
      title: registerMessages.title,
      description: {
        id: 'v2.reviewAction.register.description.incomplete',
        defaultMessage: 'Please add mandatory information before registering',
        description:
          'The description for registration action when form is incomplete'
      },
      onConfirm: registerMessages.onConfirm,
      modal: {}
    },
    validate: {
      title: validateMessages.title,
      description: {
        id: 'v2.review.validate.description.incomplete',
        defaultMessage:
          'Please add mandatory information before sending for approval',
        description: 'The description for validate action when form is complete'
      },
      onConfirm: validateMessages.onConfirm,
      modal: {}
    },
    declare: {
      title: {
        id: 'v2.review.declare.title.incomplete',
        defaultMessage: 'Declaration incomplete',
        description:
          'The title shown when reviewing an incomplete record to declare'
      },
      description: {
        id: 'v2.review.declare.description.complete',
        defaultMessage:
          'The informant will receive an email with a tracking ID that they can use to provide the additional mandatory information required for registration',
        description: 'The description for declare action when form is complete'
      },
      onConfirm: declareMessages.onConfirm,
      modal: {}
    }
  }
}
function getReviewActionConfig({
  formConfig,
  form,
  metadata,
  scopes
}: {
  formConfig: FormConfig
  form: ActionFormData
  metadata?: ActionFormData
  scopes?: Scope[]
}) {
  const incomplete = validationErrorsInActionFormExist(
    formConfig,
    form,
    metadata
  )

  const isDisabled = incomplete
    ? !scopes?.includes(SCOPES.RECORD_SUBMIT_INCOMPLETE)
    : false

  if (scopes?.includes(SCOPES.RECORD_REGISTER)) {
    return {
      buttonType: 'positive' as const,
      incomplete,
      isDisabled,
      messages: incomplete
        ? reviewMessages.incomplete.register
        : reviewMessages.complete.register
    }
  }

  if (scopes?.includes(SCOPES.RECORD_SUBMIT_FOR_APPROVAL)) {
    return {
      buttonType: 'positive' as const,
      incomplete,
      isDisabled,
      messages: incomplete
        ? reviewMessages.incomplete.validate
        : reviewMessages.complete.validate
    }
  }

  if (scopes?.includes(SCOPES.RECORD_DECLARE)) {
    return {
      buttonType: 'primary' as const,
      incomplete,
      isDisabled,
      messages: incomplete
        ? reviewMessages.incomplete.declare
        : reviewMessages.complete.declare
    }
  }

  throw new Error('No valid scope found for the action')
}

// eslint-disable-next-line no-shadow
enum REJECT_ACTIONS {
  ARCHIVE,
  SEND_FOR_UPDATE
}

interface RejectionState {
  rejectAction: REJECT_ACTIONS
  details: string
  isDuplicate: boolean
}

export function Review() {
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.DECLARE.REVIEW)
  const events = useEvents()
  const navigate = useNavigate()
  const [modal, openModal] = useModal()
  const intl = useIntl()
  const { goToHome } = useEventFormNavigation()
  const declareMutation = events.actions.declare

  const [event] = events.getEvent.useSuspenseQuery(eventId)

  const { eventConfiguration: config } = useEventConfiguration(event.type)

  const formConfig = findActiveActionForm(config, ActionType.DECLARE)
  if (!formConfig) {
    throw new Error('No active form configuration found for declare action')
  }

  const form = useEventFormData((state) => state.formValues)

  const { setMetadata, getMetadata } = useEventMetadata()
  const metadata = getMetadata(eventId, {})

  const scopes = useSelector(getScope) ?? undefined

  const reviewActionConfiguration = getReviewActionConfig({
    formConfig,
    form,
    metadata,
    scopes
  })

  async function handleEdit({
    pageId,
    fieldId,
    confirmation
  }: {
    pageId: string
    fieldId?: string
    confirmation?: boolean
  }) {
    const confirmedEdit =
      confirmation ||
      (await openModal<boolean | null>((close) => (
        <ReviewComponent.EditModal close={close}></ReviewComponent.EditModal>
      )))

    if (confirmedEdit) {
      navigate(
        ROUTES.V2.EVENTS.DECLARE.PAGES.buildPath(
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

  async function handleDeclaration() {
    const confirmedDeclaration = await openModal<boolean | null>((close) => (
      <ReviewComponent.ActionModal
        action="Declare"
        close={close}
        copy={reviewActionConfiguration.messages.modal}
      />
    ))
    if (confirmedDeclaration) {
      declareMutation.mutate({
        eventId: event.id,
        data: form,
        transactionId: uuid(),
        metadata
      })
      goToHome()
    }
  }

  async function handleReject() {
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
    <FormLayout
      route={ROUTES.V2.EVENTS.DECLARE}
      onSaveAndExit={() => {
        events.actions.declare.mutate({
          eventId: event.id,
          data: form,
          transactionId: uuid(),
          metadata,
          draft: true
        })
        goToHome()
      }}
    >
      <ReviewComponent.Body
        eventConfig={config}
        formConfig={formConfig}
        // eslint-disable-next-line
        onEdit={handleEdit} // will be fixed on eslint-plugin-react, 7.19.0. Update separately.
        form={form}
        isUploadButtonVisible={true}
        // @todo: Update to use dynamic title
        title={intl.formatMessage(formConfig.review.title, {
          firstname: form['applicant.firstname'] as string,
          surname: form['applicant.surname'] as string
        })}
        metadata={metadata}
        onMetadataChange={(values) => setMetadata(eventId, values)}
      >
        <ReviewComponent.Actions
          form={form}
          formConfig={formConfig}
          messages={reviewActionConfiguration.messages}
          metadata={metadata}
          primaryButtonType={reviewActionConfiguration.buttonType}
          onConfirm={handleDeclaration}
          onReject={handleReject}
        />
      </ReviewComponent.Body>
      {modal}
    </FormLayout>
  )
}

function RejectModal({
  close
}: {
  close: (result: RejectionState | null) => void
}) {
  const [state, setState] = useState<RejectionState>({
    rejectAction: REJECT_ACTIONS.ARCHIVE,
    details: '',
    isDuplicate: false
  })

  const intl = useIntl()

  return (
    <ResponsiveModal
      autoHeight
      actions={[
        <Button
          key="cancel_reject"
          id="cancel_reject"
          type="tertiary"
          onClick={() => {
            close(null)
          }}
        >
          {intl.formatMessage(rejectModalMessages.rejectModalCancel)}
        </Button>,
        <Button
          key="confirm_reject_with_archive"
          id="confirm_reject_with_archive"
          type="secondaryNegative"
          onClick={() => {
            close({
              ...state,
              rejectAction: REJECT_ACTIONS.ARCHIVE
            })
          }}
        >
          {intl.formatMessage(rejectModalMessages.rejectModalArchive)}
        </Button>,
        <Button
          key="confirm_reject_with_update"
          id="confirm_reject_with_update"
          type="negative"
          onClick={() => {
            close({
              ...state,
              rejectAction: REJECT_ACTIONS.SEND_FOR_UPDATE
            })
          }}
        >
          {intl.formatMessage(rejectModalMessages.rejectModalSendForUpdate)}
        </Button>
      ]}
      handleClose={() => close(null)}
      responsive={false}
      show={true}
      title={intl.formatMessage(rejectModalMessages.rejectModalTitle)}
    >
      <Stack alignItems="left" direction="column">
        <Text color="grey500" element="p" variant="reg16">
          {intl.formatMessage(rejectModalMessages.rejectModalDescription)}
        </Text>
        <TextInput
          required={true}
          value={state.details}
          onChange={(e) =>
            setState((prev) => ({ ...prev, details: e.target.value }))
          }
        />
        <Checkbox
          label={intl.formatMessage(
            rejectModalMessages.rejectModalMarkAsDuplicate
          )}
          name={'markDUplicate'}
          selected={state.isDuplicate}
          value={''}
          onChange={() =>
            setState((prev) => ({ ...prev, isDuplicate: !prev.isDuplicate }))
          }
        />
      </Stack>
    </ResponsiveModal>
  )
}

export const ReviewIndex = withSuspense(Review)
