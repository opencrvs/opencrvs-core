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
import { defineMessages, useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'
import {
  useTypedParams,
  useTypedSearchParams
} from 'react-router-typesafe-routes/dom'
import {
  FieldConfig,
  generateTransactionId,
  getDeclarationFields,
  EventDocument,
  ActionType,
  getCurrentEventState
} from '@opencrvs/commons/client'
import { ActionPageLight } from '@opencrvs/components/lib/ActionPageLight'
import { Button } from '@opencrvs/components/lib/Button'
import { Content } from '@opencrvs/components/lib/Content'
import { Dialog } from '@opencrvs/components/lib/Dialog/Dialog'
import { SecondaryButton } from '@opencrvs/components/lib/buttons'
import { Check } from '@opencrvs/components/lib/icons'
import { Text } from '@opencrvs/components/lib/Text'
import { messages as registerMessages } from '@client/i18n/messages/views/register'
import { messages as correctionMessages } from '@client/i18n/messages/views/correction'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { useEventFormNavigation } from '@client/v2-events/features/events/useEventFormNavigation'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { ROUTES } from '@client/v2-events/routes'
import { useActionAnnotation } from '@client/v2-events/features/events/useActionAnnotation'
import { useUserAllowedActions } from '@client/v2-events/features/workqueues/EventOverview/components/useAllowedActionConfigurations'
import { useValidationFunctionsWithContext } from '@client/v2-events/hooks/useValidationFunctionsWithContext'
import { CorrectionDetails } from './CorrectionDetails'

const messages = defineMessages({
  submitCorrectionRequest: {
    id: 'buttons.submitCorrectionRequest',
    defaultMessage: 'Submit correction request',
    description: 'Submit correction request button text'
  },
  makeCorrection: {
    id: 'buttons.correctRecord',
    defaultMessage: 'Correct record',
    description: 'Record corrected button text'
  }
})

/**
 * Used for ensuring that the object has all the properties. For example, intl expects object with well defined properties for translations.
 * For setting default fields for form values @see setFormValueToOutputFormat
 *
 * @returns object based on the fields given with null values.
 */
function setEmptyValuesForFields(fields: FieldConfig[]) {
  return fields.reduce((initialValues: Record<string, null>, field) => {
    return {
      ...initialValues,
      [field.id]: null
    }
  }, {})
}

export function Summary() {
  const { eventId } = useTypedParams(
    ROUTES.V2.EVENTS.REQUEST_CORRECTION.SUMMARY
  )

  const [{ workqueue }] = useTypedSearchParams(
    ROUTES.V2.EVENTS.REQUEST_CORRECTION.SUMMARY
  )
  const [showPrompt, setShowPrompt] = React.useState(false)
  const eventFormNavigation = useEventFormNavigation()
  const navigate = useNavigate()
  const intl = useIntl()

  const { hasFieldChanged, isFieldVisible } =
    useValidationFunctionsWithContext()

  const events = useEvents()
  const event: EventDocument = events.getEvent.getFromCache(eventId)
  const { eventConfiguration } = useEventConfiguration(event.type)
  const eventIndex = getCurrentEventState(event, eventConfiguration)
  const togglePrompt = () => setShowPrompt(!showPrompt)

  const previousFormValues = eventIndex.declaration
  const getFormValues = useEventFormData((state) => state.getFormValues)

  const form = getFormValues()
  const fields = getDeclarationFields(eventConfiguration)
  const { getAnnotation } = useActionAnnotation()
  const annotation = getAnnotation()

  const { isActionAllowed } = useUserAllowedActions(event.type)
  const userMayCorrect = isActionAllowed(ActionType.APPROVE_CORRECTION)

  const submitCorrection = React.useCallback(() => {
    const formWithOnlyChangedValues = Object.fromEntries(
      Object.entries(form).filter(([key]) => {
        const field = fields.find((f) => f.id === key)
        if (!field) {
          return false
        }

        return hasFieldChanged(field, form, previousFormValues)
      })
    )

    const valuesThatGotHidden = fields.filter((field) => {
      const wasVisible = isFieldVisible(field, previousFormValues)
      const isHidden = !isFieldVisible(field, form)
      return wasVisible && isHidden
    })

    const nullifiedHiddenValues = setEmptyValuesForFields(valuesThatGotHidden)

    const mutationPayload = {
      eventId,
      declaration: {
        ...formWithOnlyChangedValues,
        ...nullifiedHiddenValues
      },
      transactionId: generateTransactionId(),
      annotation,
      event,
      context: {}
    }

    if (userMayCorrect) {
      events.customActions.makeCorrectionOnRequest.mutate(mutationPayload)
    } else {
      events.actions.correction.request.mutate(mutationPayload)
    }

    navigate(ROUTES.V2.EVENTS.OVERVIEW.buildPath({ eventId }))
  }, [
    form,
    fields,
    event,
    events.customActions.makeCorrectionOnRequest,
    events.actions.correction.request,
    eventId,
    annotation,
    previousFormValues,
    navigate,
    userMayCorrect,
    hasFieldChanged,
    isFieldVisible
  ])

  return (
    <>
      <ActionPageLight
        hideBackground
        goBack={() => navigate(-1)}
        goHome={() => eventFormNavigation.closeActionView()}
        id="corrector_form"
        title={intl.formatMessage(correctionMessages.title)}
      >
        <Content
          bottomActionButtons={[
            <Button
              key="make-correction"
              fullWidth
              id="make-correction"
              size="large"
              type="primary"
              onClick={togglePrompt}
            >
              <Check />
              {userMayCorrect
                ? intl.formatMessage(messages.makeCorrection)
                : intl.formatMessage(messages.submitCorrectionRequest)}
            </Button>
          ]}
          showTitleOnMobile={true}
          title={intl.formatMessage(correctionMessages.correctionSummaryTitle)}
          topActionButtons={[
            <SecondaryButton
              key="back-to-review"
              id="back-to-review"
              onClick={() =>
                navigate(
                  ROUTES.V2.EVENTS.REQUEST_CORRECTION.REVIEW.buildPath({
                    eventId
                  })
                )
              }
            >
              {intl.formatMessage(registerMessages.backToReviewButton)}
            </SecondaryButton>
          ]}
        >
          <CorrectionDetails
            annotation={annotation}
            editable={true}
            event={event}
            form={form}
            requesting={!userMayCorrect}
            workqueue={workqueue}
          />
        </Content>
      </ActionPageLight>
      <Dialog
        actions={[
          <Button
            key="cancel"
            id="cancel"
            size="medium"
            type="tertiary"
            onClick={togglePrompt}
          >
            {intl.formatMessage(
              correctionMessages.correctionForApprovalDialogCancel
            )}
          </Button>,
          <Button
            key="continue"
            id="send"
            size="medium"
            type="positive"
            onClick={submitCorrection}
          >
            {intl.formatMessage(
              correctionMessages.correctionForApprovalDialogConfirm
            )}
          </Button>
        ]}
        id="without-correction-for-approval-prompt"
        isOpen={showPrompt}
        title={intl.formatMessage(
          userMayCorrect
            ? correctionMessages.correctRecordDialogTitle
            : correctionMessages.correctionApprovalDialogTitle
        )}
        onClose={togglePrompt}
      >
        <Text element="p" variant="reg16">
          {intl.formatMessage(
            userMayCorrect
              ? correctionMessages.correctRecordDialogDescription
              : correctionMessages.correctionForApprovalDialogDescription
          )}
        </Text>
      </Dialog>
    </>
  )
}
