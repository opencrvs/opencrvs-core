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
import { useNavigate } from 'react-router-dom'
import { v4 as uuid } from 'uuid'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import { useSelector } from 'react-redux'
import { ActionType, findActiveActionForm } from '@opencrvs/commons/client'
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
import { withSuspense } from '@client/v2-events/components/withSuspense'
import { useReviewActionConfig } from './useReviewActionConfig'

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
  },
  onReject: {
    id: 'v2.review.reject',
    defaultMessage: 'Reject',
    description: 'The label for reject action button'
  }
}

const declareMessages = {
  onConfirm: {
    id: 'v2.review.declare.confirm',
    defaultMessage: 'Send for review',
    description: 'The label for review action button when declaring'
  }
}

export function Review() {
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.DECLARE.REVIEW)
  const events = useEvents()
  const navigate = useNavigate()
  const [modal, openModal] = useModal()
  const intl = useIntl()
  const { goToHome } = useEventFormNavigation()

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

  const reviewActionConfiguration = useReviewActionConfig({
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
      <ReviewComponent.ActionModal.Accept
        action="Declare"
        close={close}
        copy={reviewActionConfiguration.messages.modal}
      />
    ))
    if (confirmedDeclaration) {
      reviewActionConfiguration.onConfirm(eventId)

      goToHome()
    }
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
          action={ActionType.DECLARE}
          form={form}
          formConfig={formConfig}
          messages={reviewActionConfiguration.messages}
          metadata={metadata}
          primaryButtonType={reviewActionConfiguration.buttonType}
          onConfirm={handleDeclaration}
        />
      </ReviewComponent.Body>
      {modal}
    </FormLayout>
  )
}

export const ReviewIndex = withSuspense(Review)
