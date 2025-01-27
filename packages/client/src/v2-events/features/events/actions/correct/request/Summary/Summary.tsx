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
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import {
  ActionType,
  FieldConfig,
  generateTransactionId,
  getAllPages,
  getCurrentEventState,
  SCOPES
} from '@opencrvs/commons/client'
import { ActionPageLight } from '@opencrvs/components/lib/ActionPageLight'
import { Button } from '@opencrvs/components/lib/Button'
import { Content } from '@opencrvs/components/lib/Content'
import { Dialog } from '@opencrvs/components/lib/Dialog/Dialog'
import { Table } from '@opencrvs/components/lib/Table'
import { Text } from '@opencrvs/components/lib/Text'
import { SecondaryButton } from '@opencrvs/components/lib/buttons'
import { ColumnContentAlignment } from '@opencrvs/components/lib/common-types'
import { Check } from '@opencrvs/components/lib/icons'
import { messages as registerMessages } from '@client/i18n/messages/views/register'
import { messages as correctionMessages } from '@client/i18n/messages/views/correction'
import { buttonMessages, constantsMessages } from '@client/i18n/messages'
// eslint-disable-next-line no-restricted-imports
import { getScope } from '@client/profile/profileSelectors'

import {
  getInitialValues,
  isFormFieldVisible
} from '@client/v2-events/components/forms/utils'
import { useCorrectionRequestData } from '@client/v2-events/features/events/actions/correct/request/useCorrectionRequestData'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { useEventFormNavigation } from '@client/v2-events/features/events/useEventFormNavigation'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { useTransformer } from '@client/v2-events/hooks/useTransformer'
import { ROUTES } from '@client/v2-events/routes'

function shouldBeShownAsAValue(field: FieldConfig) {
  if (field.type === 'PAGE_HEADER' || field.type === 'PARAGRAPH') {
    return false
  }
  return true
}

export function Summary() {
  const { eventId } = useTypedParams(
    ROUTES.V2.EVENTS.REQUEST_CORRECTION.SUMMARY
  )

  const scopes = useSelector(getScope)

  const [showPrompt, setShowPrompt] = React.useState(false)

  const togglePrompt = () => setShowPrompt(!showPrompt)

  const eventFormNavigation = useEventFormNavigation()
  const navigate = useNavigate()
  const intl = useIntl()

  const events = useEvents()
  const [event] = events.getEvent.useSuspenseQuery(eventId)
  const { eventConfiguration } = useEventConfiguration(event.type)
  const { toString } = useTransformer(eventConfiguration.id)
  const previousFormValues = getCurrentEventState(event).data
  const getFormValues = useEventFormData((state) => state.getFormValues)

  const form = getFormValues(eventId)
  const formConfig = eventConfiguration.actions
    .find((action) => action.type === ActionType.REQUEST_CORRECTION)
    ?.forms.find(({ active }) => active)

  if (!formConfig) {
    throw new Error(
      `No form configuration found for ${ActionType.REQUEST_CORRECTION} found. This should never happen`
    )
  }

  const stringifiedForm = toString(form)
  const stringifiedPreviousForm = toString(previousFormValues)
  const pages = getAllPages(eventConfiguration)

  const correctionRequestData = useCorrectionRequestData()
  const stringiedRequestData = toString(correctionRequestData.getFormValues())

  const onboardingFormPages =
    eventConfiguration.actions.find(
      (action) => action.type === ActionType.REQUEST_CORRECTION
    )?.onboardingForm || []

  const additionalDetailsFormPages =
    eventConfiguration.actions.find(
      (action) => action.type === ActionType.REQUEST_CORRECTION
    )?.additionalDetailsForm || []

  const continueButton = (
    <Button
      key="make_correction"
      disabled={false /* @todo */}
      id="make_correction"
      size="large"
      type="positive"
      onClick={togglePrompt}
    >
      <Check />

      {scopes?.includes(SCOPES.RECORD_REGISTRATION_CORRECT)
        ? intl.formatMessage(buttonMessages.makeCorrection)
        : intl.formatMessage(buttonMessages.sendForApproval)}
    </Button>
  )

  const backToReviewButton = (
    <SecondaryButton
      key="back_to_review"
      id="back_to_review"
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
  )

  return (
    <>
      <ActionPageLight
        hideBackground
        goBack={() => navigate(-1)}
        goHome={() => eventFormNavigation.goToHome()}
        id="corrector_form"
        title={intl.formatMessage(correctionMessages.title)}
      >
        <Content
          bottomActionButtons={[continueButton]}
          showTitleOnMobile={true}
          title={intl.formatMessage(correctionMessages.correctionSummaryTitle)}
          topActionButtons={[backToReviewButton]}
        >
          {onboardingFormPages.map((page) => {
            return (
              <Table
                key={page.id}
                columns={[
                  {
                    label: intl.formatMessage(page.title),
                    width: 34,
                    alignment: ColumnContentAlignment.LEFT,
                    key: 'fieldLabel'
                  },
                  {
                    label: '',
                    width: 64,
                    alignment: ColumnContentAlignment.LEFT,
                    key: 'collectedValue'
                  }
                ]}
                content={page.fields
                  .filter(shouldBeShownAsAValue)
                  .map((field) => {
                    return {
                      fieldLabel: intl.formatMessage(field.label),
                      collectedValue: stringiedRequestData[field.id] || ''
                    }
                  })}
                hideTableBottomBorder={true}
                id="requestedBy"
                isLoading={false}
                noResultText={intl.formatMessage(constantsMessages.noResults)}
              ></Table>
            )
          })}

          {formConfig.pages.map((page) => {
            const content = page.fields
              .filter((field) => {
                const visibilityChanged =
                  isFormFieldVisible(field, previousFormValues) !==
                  isFormFieldVisible(field, form)

                return (
                  stringifiedPreviousForm[field.id] !==
                    stringifiedForm[field.id] || visibilityChanged
                )
              })
              .map((field) => {
                const wasHidden = !isFormFieldVisible(field, form)
                return {
                  item: intl.formatMessage(field.label),
                  original: stringifiedPreviousForm[field.id] || '-',
                  changed: wasHidden ? '-' : stringifiedForm[field.id]
                }
              })

            if (content.length === 0) {
              return null
            }
            return (
              <Table
                key={page.id}
                noPagination
                columns={[
                  {
                    label: intl.formatMessage(page.title),
                    alignment: ColumnContentAlignment.LEFT,
                    width: 34,
                    key: 'item'
                  },
                  {
                    label: intl.formatMessage(
                      correctionMessages.correctionSummaryOriginal
                    ),
                    width: 33,
                    alignment: ColumnContentAlignment.LEFT,
                    key: 'original'
                  },
                  {
                    label: intl.formatMessage(
                      correctionMessages.correctionSummaryCorrection
                    ),
                    width: 33,
                    alignment: ColumnContentAlignment.LEFT,
                    key: 'changed'
                  }
                ]}
                content={content}
                hideTableBottomBorder={true}
                id="diff"
                isLoading={false}
                noResultText={intl.formatMessage(constantsMessages.noResults)}
              ></Table>
            )
          })}

          {additionalDetailsFormPages.map((page) => {
            return (
              <Table
                key={page.id}
                columns={[
                  {
                    label: intl.formatMessage(page.title),
                    width: 34,
                    alignment: ColumnContentAlignment.LEFT,
                    key: 'fieldLabel'
                  },
                  {
                    label: '',
                    width: 64,
                    alignment: ColumnContentAlignment.LEFT,
                    key: 'collectedValue'
                  }
                ]}
                content={page.fields
                  .filter(shouldBeShownAsAValue)
                  .map((field) => {
                    return {
                      fieldLabel: intl.formatMessage(field.label),
                      collectedValue: stringiedRequestData[field.id] || ''
                    }
                  })}
                hideTableBottomBorder={true}
                id="requestedBy"
                isLoading={false}
                noResultText={intl.formatMessage(constantsMessages.noResults)}
              ></Table>
            )
          })}

          {/* @todo fees select */}
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
            onClick={() => {
              const formWithOnlyChangedValues = Object.entries(form).reduce<
                typeof form
              >((acc, [key, value]) => {
                if (value !== previousFormValues[key]) {
                  acc[key] = value
                }
                return acc
              }, {})

              const valuesThatGotHidden = formConfig.pages
                .flatMap((page) => page.fields)
                .filter((field) => {
                  const wasVisible = isFormFieldVisible(
                    field,
                    previousFormValues
                  )
                  const isHidden = !isFormFieldVisible(field, form)

                  return wasVisible && isHidden
                })

              const nullifiedHiddenValues =
                getInitialValues(valuesThatGotHidden)

              events.actions.correct.request.mutate({
                eventId,
                data: {
                  ...formWithOnlyChangedValues,
                  ...nullifiedHiddenValues
                },
                transactionId: generateTransactionId(),
                metadata: correctionRequestData.getFormValues()
              })
              eventFormNavigation.goToHome()
            }}
          >
            {intl.formatMessage(
              correctionMessages.correctionForApprovalDialogConfirm
            )}
          </Button>
        ]}
        id="withoutCorrectionForApprovalPrompt"
        isOpen={showPrompt}
        title={intl.formatMessage(
          scopes?.includes(SCOPES.RECORD_REGISTRATION_CORRECT)
            ? correctionMessages.correctRecordDialogTitle
            : correctionMessages.correctionForApprovalDialogTitle
        )}
        onClose={togglePrompt}
      >
        <p>
          <Text element="p" variant="reg16">
            {intl.formatMessage(
              scopes?.includes(SCOPES.RECORD_REGISTRATION_CORRECT)
                ? correctionMessages.correctRecordDialogDescription
                : correctionMessages.correctionForApprovalDialogDescription
            )}
          </Text>
        </p>
      </Dialog>
    </>
  )
}
