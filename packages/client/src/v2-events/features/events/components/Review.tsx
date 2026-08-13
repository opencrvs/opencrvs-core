/* eslint-disable max-lines */
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
import { defineMessages, MessageDescriptor, useIntl } from 'react-intl'
import { useSelector } from 'react-redux'
import styled from 'styled-components'
import { CountryLogo } from '@opencrvs/components/lib/icons'
import {
  Accordion,
  Button,
  Link,
  List,
  Dialog,
  Stack,
  Text,
  TextArea
} from '@opencrvs/components'
import {
  EventConfig,
  EventState,
  FieldConfig,
  FieldType,
  FieldUpdateValue,
  FormConfig,
  isFieldDisplayedOnReview,
  isPageVisible,
  omitHiddenFields,
  runFieldValidations,
  FieldTypesToHideInReview,
  ValidatorContext,
  flattenFormState,
  IndexMap,
  FormState,
  PlainDate
} from '@opencrvs/commons/client'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { getCountryLogoFile } from '@client/offline/selectors'
import { withSuspense } from '@client/v2-events/components/withSuspense'
import { buttonMessages } from '@client/i18n/messages'
import { useValidatorContext } from '@client/v2-events/hooks/useValidatorContext'
import { useDialogFormState } from '@client/v2-events/hooks/useDialogFormState'
import { Output } from './Output'
import { DocumentViewer } from './DocumentViewer'
import { TranslationTextWithFormatModifier } from './TranslationTextWithFormatModifier'

const ValidationError = styled.span`
  color: ${({ theme }) => theme.colors.negative};
  display: inline-block;
  text-transform: lowercase;

  &::first-letter {
    text-transform: uppercase;
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
const HeaderContainer = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
`
const HeaderContent = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: left;
  gap: 16px;
  align-items: center;
  ${({ theme }) => theme.fonts.h2}
  color: ${({ theme }) => theme.colors.copy};
`

const TitleContainer = styled.div`
  ${({ theme }) => theme.fonts.bold14}
  color: ${({ theme }) => theme.colors.supportingCopy};
  text-transform: uppercase;
`
const SubjectContainer = styled.div`
  ${({ theme }) => theme.fonts.h2}
  overflow-wrap: anywhere;
`
const RightColumn = styled.div`
  width: 40%;
  border-radius: 4px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`
const LeftColumn = styled.div`
  flex-grow: 1;
  max-width: 840px;
  overflow: hidden;
`

const Card = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.grey300};
  background: ${({ theme }) => theme.colors.white};
  border-radius: 4px;
  margin-bottom: 40px;
  &:last-child {
    margin-bottom: 200px;
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    border: 0;
    margin: 0;
  }
`

const FormData = styled.div`
  padding-top: 24px;
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.copy};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: 24px;
  }
`

const ReviewContainter = styled.div`
  padding: 0px 32px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: 0;
  }
`

const DeclarationDataContainer = styled.div``

const reviewMessages = defineMessages({
  changeAllButton: {
    id: 'buttons.changeAll',
    defaultMessage: 'Change all',
    description: 'The label for the change all button'
  },
  changeButton: {
    id: 'buttons.change',
    defaultMessage: 'Change',
    description: 'The label for the change button'
  },
  changeModalContinue: {
    id: 'changeModal.continue',
    defaultMessage: 'Continue',
    description: 'The label for continue button of change modal'
  },
  changeModalTitle: {
    id: 'changeModal.title',
    defaultMessage: 'Edit declaration?',
    description: 'The title for change modal'
  },
  changeModalDescription: {
    id: 'changeModal.description',
    defaultMessage: 'A record will be created of any changes you make',
    description: 'The description for change modal'
  },
  govtName: {
    id: 'review.header.title.govtName',
    defaultMessage: 'Government',
    description: 'Header title that shows govt name'
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
  annotationsTitle: {
    id: 'review.annotations.title',
    defaultMessage: 'Annotations',
    description: 'Title for the annotations accordion section in review'
  }
})

function ReviewHeader({ title }: { title: string }) {
  const countryLogoFile = useSelector(getCountryLogoFile)
  const intl = useIntl()

  return (
    <HeaderContainer>
      <HeaderContent>
        {countryLogoFile && <CountryLogo size="small" src={countryLogoFile} />}
        <Stack
          alignItems="flex-start"
          direction="column"
          gap={6}
          justify-content="flex-start"
        >
          <TitleContainer id={`header_title`}>
            {intl.formatMessage(reviewMessages.govtName)}
          </TitleContainer>
          <SubjectContainer id={`header_subject`}>{title}</SubjectContainer>
        </Stack>
      </HeaderContent>
    </HeaderContainer>
  )
}

/**
 *  Renders review of form data, with the ability to edit the data.
 */
function FormReview({
  formConfig,
  form,
  previousForm,
  onEdit,
  showPreviouslyMissingValuesAsChanged,
  readonlyMode,
  isCorrection = false,
  isReviewCorrection = false,
  treatMissingValuesAsCleared = false,
  validatorContext,
  anchor
}: {
  formConfig: FormConfig
  form: EventState
  previousForm: EventState
  onEdit: ({ pageId, fieldId }: { pageId: string; fieldId?: string }) => void
  showPreviouslyMissingValuesAsChanged: boolean
  validatorContext: ValidatorContext
  readonlyMode?: boolean
  isCorrection?: boolean
  isReviewCorrection?: boolean
  treatMissingValuesAsCleared?: boolean
  /** The record anchor — declaration fields are per-fact but share one record-wide anchor. */
  anchor: PlainDate
}) {
  const intl = useIntl()

  const visiblePages = formConfig.pages.filter((page) =>
    isPageVisible(page, form, validatorContext)
  )

  return (
    <FormData>
      <ReviewContainter>
        {visiblePages.map((page) => {
          const fields = page.fields
            .filter((field) =>
              isFieldDisplayedOnReview(field, form, validatorContext)
            )
            .map((field) => {
              const value = form[field.id]
              const previousValue = previousForm[field.id]

              const displayValue =
                treatMissingValuesAsCleared &&
                value === undefined &&
                previousValue !== undefined
                  ? null
                  : value

              // previousForm, formConfig are used to find previous values with the same label if required
              const valueDisplay = (
                <Output
                  anchor={anchor}
                  field={field}
                  formConfig={formConfig}
                  previousForm={previousForm}
                  previousValue={previousValue}
                  showPreviouslyMissingValuesAsChanged={
                    showPreviouslyMissingValuesAsChanged
                  }
                  value={displayValue}
                />
              )

              const errors = flattenFormState(
                runFieldValidations({
                  field,
                  value: form[field.id],
                  form,
                  context: validatorContext
                })
              ).flatMap(([, errs]) => errs)

              const errorDisplay =
                errors.length > 0 ? (
                  <ValidationError key={field.id}>
                    {intl.formatMessage(errors[0].message)}
                  </ValidationError>
                ) : null

              return { ...field, valueDisplay, errorDisplay }
            })

          // All interactive fields are shown in review, including optional fields with no value
          // (empty optional fields render as a blank value cell). Only non-interactive display
          // types (DIVIDER, PAGE_HEADER, etc.) are hidden. Value-based filtering happens only in
          // certificate printing and correction summary — not here.
          const displayedFields = fields.filter(
            ({ type }) =>
              !FieldTypesToHideInReview.some(
                (typeToHide) => type === typeToHide
              )
          )

          if (displayedFields.length === 0) {
            return <React.Fragment key={`Section_${page.id}`}></React.Fragment>
          }

          const hasCorrectableFields = displayedFields.some(
            (field) => !field.uncorrectable
          )

          // If the page has any correctable fields, show the change all link
          const showChangeAllLink =
            !readonlyMode &&
            (!isCorrection || hasCorrectableFields) &&
            !isReviewCorrection

          const hasMandatoryFields = page.fields.some(
            (field) => !!field.required
          )
          const hasAnyCompletedField = page.fields.some(
            (field) => form[field.id] != null && form[field.id] !== ''
          )

          return (
            <DeclarationDataContainer
              key={'Section_' + page.title.defaultMessage}
            >
              <Accordion
                action={
                  showChangeAllLink && (
                    <Link
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit({ pageId: page.id })
                      }}
                    >
                      {intl.formatMessage(reviewMessages.changeAllButton)}
                    </Link>
                  )
                }
                expand={hasMandatoryFields || hasAnyCompletedField}
                label={intl.formatMessage(page.title)}
                labelForHideAction="Hide"
                labelForShowAction="Show"
                name={'Accordion_' + page.id}
              >
                <List id={'Section_' + page.id}>
                  {displayedFields.map((field) => {
                    const {
                      id,
                      type,
                      label,
                      errorDisplay,
                      valueDisplay,
                      uncorrectable
                    } = field
                    const shouldHideEditLink =
                      readonlyMode ||
                      (isCorrection && uncorrectable) ||
                      isReviewCorrection

                    const showSectionHeading = type === FieldType.HEADING

                    return (
                      <React.Fragment key={id}>
                        {showSectionHeading ? (
                          <List.Heading
                            fontVariant={
                              field.configuration.styles?.fontVariant
                            }
                            label={intl.formatMessage(label)}
                          />
                        ) : (
                          <List.Item
                            actions={
                              !shouldHideEditLink && (
                                <Link
                                  data-testid={`change-button-${id}`}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onEdit({
                                      pageId: page.id,
                                      fieldId: id
                                    })
                                  }}
                                >
                                  {intl.formatMessage(
                                    reviewMessages.changeButton
                                  )}
                                </Link>
                              )
                            }
                            data-testid={id}
                            id={id}
                            label={intl.formatMessage(label)}
                            value={errorDisplay || valueDisplay}
                          />
                        )}
                      </React.Fragment>
                    )
                  })}
                </List>
              </Accordion>
            </DeclarationDataContainer>
          )
        })}
      </ReviewContainter>
    </FormData>
  )
}

/**
 * Review component, used to display the "read" version of the declaration with annotation input fields for the user (signatures etc.)
 * User can review the declaration and take actions like declare, reject or edit.
 */
function ReviewComponent({
  formConfig,
  previousFormValues,
  form,
  validatorContext,
  annotation,
  onEdit,
  children,
  title,
  onAnnotationChange,
  readonlyMode,
  reviewFields,
  isCorrection = false,
  isReviewCorrection = false,
  treatMissingValuesAsCleared = false,
  banner,
  anchor
}: {
  children?: React.ReactNode
  formConfig: FormConfig
  form: EventState
  validatorContext: ValidatorContext
  annotation?: EventState
  reviewFields?: FieldConfig[]
  previousFormValues?: EventState
  onEdit: ({
    pageId,
    fieldId,
    confirmation
  }: {
    pageId: string
    fieldId?: string
    confirmation?: boolean
  }) => void
  title: string
  onAnnotationChange?: (values: EventState) => void
  readonlyMode?: boolean
  isCorrection?: boolean
  isReviewCorrection?: boolean
  treatMissingValuesAsCleared?: boolean
  banner?: React.ReactNode
  /** The record anchor — date of event, falling back to the record's creation date. */
  anchor: PlainDate
}) {
  const intl = useIntl()
  const showPreviouslyMissingValuesAsChanged = previousFormValues !== undefined
  const previousForm = previousFormValues ?? {}

  const [touched, setTouched] = useState<IndexMap<FormState<boolean>>>({})

  const pageIdsWithFile = formConfig.pages
    .filter(({ fields }) =>
      fields.some(
        ({ type }) =>
          type === FieldType.FILE || type === FieldType.FILE_WITH_OPTIONS
      )
    )
    .map(({ id }) => id)

  const hasAnnotationFieldsToShow =
    annotation !== undefined && reviewFields && reviewFields.length > 0

  const displayedAnnotationFields = hasAnnotationFieldsToShow
    ? reviewFields.filter(
        (field) =>
          !FieldTypesToHideInReview.some((t) => t === field.type) &&
          isFieldDisplayedOnReview(field, annotation, validatorContext)
      )
    : []

  return (
    <Row>
      <LeftColumn>
        {banner}
        <Card>
          <ReviewHeader title={title} />
          <FormReview
            anchor={anchor}
            form={form}
            formConfig={formConfig}
            isCorrection={isCorrection}
            isReviewCorrection={isReviewCorrection}
            previousForm={previousForm}
            readonlyMode={readonlyMode}
            showPreviouslyMissingValuesAsChanged={
              showPreviouslyMissingValuesAsChanged
            }
            treatMissingValuesAsCleared={treatMissingValuesAsCleared}
            validatorContext={validatorContext}
            onEdit={onEdit}
          />

          {/* edit annotation fields  */}
          {hasAnnotationFieldsToShow && onAnnotationChange && (
            <FormData>
              <ReviewContainter>
                <DeclarationDataContainer>
                  <Accordion
                    expand={true}
                    label={intl.formatMessage(reviewMessages.annotationsTitle)}
                    labelForHideAction="Hide"
                    labelForShowAction="Show"
                    name="annotation"
                  >
                    <FormFieldGenerator
                      fields={reviewFields}
                      formTouched={touched}
                      formValues={annotation}
                      id={'review'}
                      readonlyMode={readonlyMode}
                      validatorContext={{
                        ...validatorContext,
                        baseFormState: form
                      }}
                      onFormChange={onAnnotationChange}
                      onTouchedChange={setTouched}
                    />
                  </Accordion>
                </DeclarationDataContainer>
              </ReviewContainter>
            </FormData>
          )}

          {/* show annotation fields */}
          {hasAnnotationFieldsToShow &&
            readonlyMode &&
            displayedAnnotationFields.length > 0 && (
              <FormData>
                <ReviewContainter>
                  <DeclarationDataContainer>
                    <Accordion
                      expand={true}
                      label={intl.formatMessage(
                        reviewMessages.annotationsTitle
                      )}
                      labelForHideAction="Hide"
                      labelForShowAction="Show"
                      name="annotation"
                    >
                      <List id="annotation">
                        {displayedAnnotationFields.map((field) => (
                          <List.Item
                            key={field.id}
                            actions={null}
                            data-testid={field.id}
                            id={field.id}
                            label={intl.formatMessage(field.label)}
                            value={
                              <Output
                                anchor={anchor}
                                field={field}
                                value={annotation[field.id]}
                              />
                            }
                          />
                        ))}
                      </List>
                    </Accordion>
                  </DeclarationDataContainer>
                </ReviewContainter>
              </FormData>
            )}
        </Card>
        {children}
      </LeftColumn>
      {pageIdsWithFile.length > 0 && (
        <RightColumn>
          <DocumentViewer form={form} formConfig={formConfig} />
        </RightColumn>
      )}
    </Row>
  )
}

function EditModal({
  copy,
  close
}: {
  copy?: {
    continue?: MessageDescriptor
    title?: MessageDescriptor
    description?: MessageDescriptor
  }
  close: (result: boolean | null) => void
}) {
  const intl = useIntl()
  return (
    <Dialog
      isOpen
      actions={[
        <Button
          key="cancel_edit"
          id="cancel_edit"
          type="tertiary"
          onClick={() => {
            close(null)
          }}
        >
          {intl.formatMessage(buttonMessages.cancel)}
        </Button>,
        <Button
          key="confirm_edit"
          id="confirm_edit"
          type="primary"
          onClick={() => {
            close(true)
          }}
        >
          {intl.formatMessage(
            copy?.continue || reviewMessages.changeModalContinue
          )}
        </Button>
      ]}
      title={intl.formatMessage(copy?.title || reviewMessages.changeModalTitle)}
      onClose={() => close(null)}
    >
      <Stack>
        <Text color="grey500" element="p" variant="reg16">
          {intl.formatMessage(
            copy?.description || reviewMessages.changeModalDescription
          )}
        </Text>
      </Stack>
    </Dialog>
  )
}

export interface AcceptActionModalResult {
  values: Record<string, FieldUpdateValue>
}

function AcceptActionModal({
  copy,
  close,
  action,
  eventType,
  fields = [],
  eventConfiguration,
  declaration
}: {
  copy: {
    onConfirm: MessageDescriptor
    title: MessageDescriptor
    supportingCopy?: MessageDescriptor
  }
  close: (result: AcceptActionModalResult | null) => void
  action: string
  eventType: string
  fields?: FieldConfig[]
  eventConfiguration: EventConfig
  declaration: EventState
}) {
  const intl = useIntl()
  const validatorContext = useValidatorContext()
  const dialogForm = useDialogFormState()
  const modalValues = dialogForm.formValues

  const errorsOnField = fields.flatMap((field) =>
    flattenFormState(
      runFieldValidations({
        field,
        form: modalValues,
        value: modalValues[field.id],
        context: validatorContext
      })
    ).flatMap(([, errs]) => errs)
  )

  return (
    <Dialog
      isOpen
      actions={[
        <Button
          key={'cancel_' + action}
          id={'cancel_' + action}
          type="tertiary"
          onClick={() => {
            close(null)
          }}
        >
          {intl.formatMessage(buttonMessages.cancel)}
        </Button>,
        <Button
          key={'confirm_' + action}
          disabled={errorsOnField.length > 0}
          id={'confirm_' + action}
          type="primary"
          onClick={() => {
            close({
              values: omitHiddenFields(fields, modalValues, validatorContext)
            })
          }}
        >
          {intl.formatMessage(copy.onConfirm)}
        </Button>
      ]}
      title={intl.formatMessage(copy.title, { event: eventType })}
      variant="large"
      width={600}
      onClose={() => close(null)}
    >
      <Stack alignItems="left" direction="column" gap={16}>
        {copy.supportingCopy && (
          <TranslationTextWithFormatModifier
            color="supportingCopy"
            element="p"
            message={copy.supportingCopy}
            variant="reg16"
          />
        )}
        {fields.length > 0 && (
          <FormFieldGenerator
            {...dialogForm}
            eventConfig={eventConfiguration}
            fields={fields}
            id={`accept-action-modal-form-${action}`}
            validatorContext={{
              ...validatorContext,
              baseFormState: declaration
            }}
          />
        )}
      </Stack>
    </Dialog>
  )
}

export interface RejectActionModalResult {
  reason: string
  values: Record<string, FieldUpdateValue>
}

function RejectActionModal({
  close,
  supportingCopy,
  fields = [],
  eventConfiguration
}: {
  close: (result: RejectActionModalResult | null) => void
  supportingCopy?: MessageDescriptor
  fields?: FieldConfig[]
  eventConfiguration: EventConfig
}) {
  const [message, setMessage] = useState<string>('')
  const dialogForm = useDialogFormState()
  const modalValues = dialogForm.formValues
  const intl = useIntl()
  const validatorContext = useValidatorContext()

  const errorsOnField = fields.flatMap((field) =>
    flattenFormState(
      runFieldValidations({
        field,
        form: modalValues,
        value: modalValues[field.id],
        context: validatorContext
      })
    ).flatMap(([, errs]) => errs)
  )

  const actions = [
    <Button
      key="cancel_reject"
      id="cancel_reject"
      type="tertiary"
      onClick={() => {
        close(null)
      }}
    >
      {intl.formatMessage(buttonMessages.cancel)}
    </Button>,
    <Button
      key="confirm_reject_with_update"
      disabled={!message || errorsOnField.length > 0}
      id="confirm_reject_with_update"
      type="negative"
      onClick={() => {
        close({
          reason: message,
          values: omitHiddenFields(fields, modalValues, validatorContext)
        })
      }}
    >
      {intl.formatMessage(reviewMessages.rejectModalSendForUpdate)}
    </Button>
  ]

  return (
    <Dialog
      isOpen
      actions={actions}
      id="reject-modal"
      title={intl.formatMessage(reviewMessages.rejectModalTitle)}
      variant="large"
      width={700}
      onClose={() => close(null)}
    >
      <Stack alignItems="left" direction="column">
        <Text color="grey500" element="p" variant="reg16">
          {supportingCopy ? intl.formatMessage(supportingCopy) : null}
        </Text>
        <TextArea
          data-testid="reject-reason"
          required={true}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        {fields.length > 0 && (
          <FormFieldGenerator
            {...dialogForm}
            eventConfig={eventConfiguration}
            fields={fields}
            id="reject-action-modal-form"
            validatorContext={validatorContext}
          />
        )}
      </Stack>
    </Dialog>
  )
}

export const Review = {
  Body: withSuspense(ReviewComponent),
  EditModal,
  ActionModal: {
    Accept: AcceptActionModal,
    Reject: RejectActionModal
  }
}
