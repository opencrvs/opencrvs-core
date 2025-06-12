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
import { isEqual } from 'lodash'
import styled from 'styled-components'
import {
  ActionType,
  FieldConfig,
  generateTransactionId,
  Scope,
  SCOPES,
  isFieldVisible,
  getDeclarationFields,
  getDeclaration,
  getActionAnnotationFields
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
import { buttonMessages } from '@client/i18n/messages'
import { getScope } from '@client/profile/profileSelectors'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { useEventFormNavigation } from '@client/v2-events/features/events/useEventFormNavigation'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { useFormDataStringifier } from '@client/v2-events/hooks/useFormDataStringifier'
import { ROUTES } from '@client/v2-events/routes'
import { useActionAnnotation } from '@client/v2-events/features/events/useActionAnnotation'
import { Output } from '@client/v2-events/features/events/components/Output'

function ContinueButton({
  onClick,
  disabled = false,
  scopes
}: {
  disabled?: boolean
  onClick: () => void
  scopes: Scope[] | null
}) {
  const intl = useIntl()

  return (
    <Button
      key="make_correction"
      disabled={disabled}
      id="make_correction"
      size="large"
      type="positive"
      onClick={onClick}
    >
      <Check />
      {scopes?.includes(SCOPES.RECORD_REGISTRATION_CORRECT)
        ? intl.formatMessage(buttonMessages.makeCorrection)
        : intl.formatMessage(buttonMessages.sendForApproval)}
    </Button>
  )
}

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

const SectionTitle = styled(Text)`
  margin-bottom: 20px;
`

const CorrectionInformationSectionTitle = styled(SectionTitle)`
  margin-top: 20px;
`

export function Summary() {
  const { eventId } = useTypedParams(
    ROUTES.V2.EVENTS.REQUEST_CORRECTION.SUMMARY
  )

  const scopes = useSelector(getScope)

  const [showPrompt, setShowPrompt] = React.useState(false)
  const togglePrompt = () => setShowPrompt(!showPrompt)

  const eventFormNavigation = useEventFormNavigation()
  const { goToHome } = useEventFormNavigation()
  const navigate = useNavigate()
  const intl = useIntl()

  const events = useEvents()
  const event = events.getEventState.useSuspenseQuery(eventId)
  const { eventConfiguration } = useEventConfiguration(event.type)

  const previousFormValues = event.declaration
  const getFormValues = useEventFormData((state) => state.getFormValues)
  const stringifyFormData = useFormDataStringifier()

  const form = getFormValues()
  const formConfig = getDeclaration(eventConfiguration)

  const actionConfig = eventConfiguration.actions.find(
    (action) => action.type === ActionType.REQUEST_CORRECTION
  )

  if (!actionConfig) {
    throw new Error(
      `No action configuration found for ${ActionType.REQUEST_CORRECTION} found. This should never happen`
    )
  }
  const fields = getDeclarationFields(eventConfiguration)
  const declareActionConfig = eventConfiguration.actions.find(
    (action) => action.type === ActionType.DECLARE
  )

  if (!declareActionConfig) {
    throw new Error(
      `No action configuration found for ${ActionType.DECLARE} found. This should never happen`
    )
  }

  const annotationFields = getActionAnnotationFields(declareActionConfig)

  const allFields = [
    ...fields,
    ...actionConfig.correctionForm.pages.flatMap((page) => page.fields),
    ...annotationFields
  ]

  const stringifiedForm = stringifyFormData(allFields, form)
  const stringifiedPreviousForm = stringifyFormData(
    allFields,
    previousFormValues
  )

  const annotation = useActionAnnotation()
  const annotationForm = annotation.getAnnotation()
  const stringifiedRequestData = stringifyFormData(allFields, annotationForm)

  const correctionFormPages =
    eventConfiguration.actions.find(
      (action) => action.type === ActionType.REQUEST_CORRECTION
    )?.correctionForm.pages || []

  const submitCorrection = React.useCallback(() => {
    const formWithOnlyChangedValues = Object.entries(form).reduce<typeof form>(
      (acc, [key, value]) => {
        if (value !== previousFormValues[key]) {
          acc[key] = value
        }
        return acc
      },
      {}
    )

    const valuesThatGotHidden = fields.filter((field) => {
      const wasVisible = isFieldVisible(field, previousFormValues)
      const isHidden = !isFieldVisible(field, form)

      return wasVisible && isHidden
    })

    const nullifiedHiddenValues = setEmptyValuesForFields(valuesThatGotHidden)

    events.actions.correction.request.mutate({
      eventId,
      // @TODO:
      // @ts-ignore
      declaration: {
        ...formWithOnlyChangedValues,
        ...nullifiedHiddenValues
      },
      transactionId: generateTransactionId(),
      annotation: annotationForm
    })
    goToHome()
  }, [
    form,
    fields,
    events.actions.correction.request,
    eventId,
    annotationForm,
    goToHome,
    previousFormValues
  ])

  return (
    <>
      <ActionPageLight
        hideBackground
        goBack={() => navigate(-1)}
        goHome={goToHome}
        id="corrector_form"
        title={intl.formatMessage(correctionMessages.title)}
      >
        <Content
          bottomActionButtons={[
            <ContinueButton
              key="make-correction"
              scopes={scopes}
              onClick={togglePrompt}
            />
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
          <SectionTitle element="h3" variant="h3">
            {intl.formatMessage(correctionMessages.correctionSectionTitle)}
          </SectionTitle>

          {formConfig.pages.map((page) => {
            const changedFields = page.fields
              .filter((f) => {
                const wasVisible = isFieldVisible(f, previousFormValues)
                const isVisible = isFieldVisible(f, form)
                const visibilityChanged = wasVisible !== isVisible

                // TODO CIHAN: use the actually stringified values here...?
                const valueHasChanged = !isEqual(
                  stringifiedPreviousForm[f.id],
                  stringifiedForm[f.id]
                )

                return isVisible && (valueHasChanged || visibilityChanged)
              })
              .map((f) => ({
                fieldLabel: intl.formatMessage(f.label),
                original: stringifiedPreviousForm[f.id] || '-',
                correction: stringifiedForm[f.id] || '-'
              }))

            if (changedFields.length === 0) {
              return null
            }

            return (
              <Table
                key={`corrections-table-${page.id}`}
                columns={[
                  {
                    label: intl.formatMessage(page.title),
                    width: 34,
                    key: 'fieldLabel'
                  },
                  {
                    label: intl.formatMessage(
                      correctionMessages.correctionSummaryOriginal
                    ),
                    width: 33,
                    key: 'original'
                  },
                  {
                    label: intl.formatMessage(
                      correctionMessages.correctionSummaryCorrection
                    ),
                    width: 33,
                    key: 'correction'
                  }
                ]}
                content={changedFields}
                hideTableBottomBorder={true}
              ></Table>
            )
          })}

          <CorrectionInformationSectionTitle element="h3" variant="h3">
            {intl.formatMessage(
              correctionMessages.correctionInformationSectionTitle
            )}
          </CorrectionInformationSectionTitle>

          <Table
            columns={[
              {
                label: intl.formatMessage(correctionMessages.correctionDetails),
                width: 34,
                key: 'label'
              },
              { label: '', width: 64, key: 'value' }
            ]}
            content={[
              {
                label: intl.formatMessage(correctionMessages.submittedBy),
                value: 'CIHAN TODO'
              },
              {
                label: intl.formatMessage(correctionMessages.office),
                value: 'CIHAN TODO'
              },
              {
                label: intl.formatMessage(correctionMessages.requestedOn),
                value: 'CIHAN TODO'
              }
            ]}
            hideTableBottomBorder={true}
          ></Table>

          {correctionFormPages.map((page) => {
            const pageFields = page.fields
              .filter((f) => isFieldVisible(f, { ...form, ...annotationForm }))
              .map((field) => {
                const valueDisplay = Output({
                  field,
                  value: annotationForm[field.id],
                  showPreviouslyMissingValuesAsChanged: false
                })

                return { ...field, valueDisplay }
              })
              .filter((f) => f.valueDisplay)

            return (
              <Table
                key={`correction-form-table-${page.id}`}
                columns={[
                  {
                    label: intl.formatMessage(page.title),
                    width: 34,
                    alignment: ColumnContentAlignment.LEFT,
                    key: 'firstColumn'
                  },
                  {
                    label: '',
                    width: 64,
                    alignment: ColumnContentAlignment.LEFT,
                    key: 'secondColumn'
                  }
                ]}
                content={pageFields.map(({ valueDisplay, label }) => {
                  if (label.defaultMessage) {
                    return {
                      firstColumn: label.defaultMessage
                        ? intl.formatMessage(label)
                        : valueDisplay,
                      secondColumn: valueDisplay
                    }
                  }

                  // If no label is defined for the field, we just show the value on the first column
                  return { firstColumn: valueDisplay }
                })}
                hideTableBottomBorder={true}
              ></Table>
            )
          })}
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
          scopes?.includes(SCOPES.RECORD_REGISTRATION_CORRECT)
            ? correctionMessages.correctRecordDialogTitle
            : correctionMessages.correctionForApprovalDialogTitle
        )}
        onClose={togglePrompt}
      >
        <Text element="p" variant="reg16">
          {intl.formatMessage(
            scopes?.includes(SCOPES.RECORD_REGISTRATION_CORRECT)
              ? correctionMessages.correctRecordDialogDescription
              : correctionMessages.correctionForApprovalDialogDescription
          )}
        </Text>
      </Dialog>
    </>
  )
}
