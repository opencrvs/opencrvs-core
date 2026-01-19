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
  Checkbox,
  Dialog,
  Icon,
  IconProps,
  Link,
  ListReview,
  Stack,
  Text,
  TextArea
} from '@opencrvs/components'
import {
  EventState,
  FieldConfig,
  FieldType,
  FormConfig,
  isFieldDisplayedOnReview,
  isPageVisible,
  runFieldValidations,
  FieldTypesToHideInReview,
  ValidatorContext
} from '@opencrvs/commons/client'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { getCountryLogoFile } from '@client/offline/selectors'
import { withSuspense } from '@client/v2-events/components/withSuspense'
import { buttonMessages } from '@client/i18n/messages'
import { Output } from './Output'
import { DocumentViewer } from './DocumentViewer'

const ReviewContainter = styled.div`
  padding: 0px 32px;
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

const Header = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  flex-direction: column;
  padding: 16px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: none;
  }
`

const SubHeaderContainer = styled.div`
  position: relative;
  margin: 0 32px;
  padding: 24px 8px;
  display: flex;
  align-items: center;
  gap: 16px;
  color: ${({ theme }) => theme.colors.copy};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey200};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    margin: 0 32px;
  }
`

const FormData = styled.div`
  padding: 24px 0px;
`

const DeclarationDataContainer = styled.div``

const ValidationError = styled.span`
  color: ${({ theme }) => theme.colors.negative};
  display: inline-block;
  text-transform: lowercase;

  &::first-letter {
    text-transform: uppercase;
  }
`

const RightColumn = styled.div`
  width: 40%;
  border-radius: 4px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`

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
    defaultMessage: 'Reject?',
    description: 'The title for reject modal'
  },
  rejectModalMarkAsDuplicate: {
    id: 'rejectModal.markAsDuplicate',
    defaultMessage: 'Mark as a duplicate',
    description: 'The label for mark as duplicate checkbox of reject modal'
  },
  recordTabTitle: {
    id: 'recordTab.title',
    defaultMessage: 'Record',
    description: 'The label for page title for the record tab'
  }
})

function SubHeader({ title }: { title: string }) {
  const countryLogoFile = useSelector(getCountryLogoFile)
  const intl = useIntl()

  return (
    <SubHeaderContainer>
      {countryLogoFile && <CountryLogo size="small" src={countryLogoFile} />}
      <Stack
        alignItems="flex-start"
        direction="column"
        gap={6}
        justify-content="flex-start"
      >
        <Text
          color="supportingCopy"
          element="h2"
          id="header_title"
          variant="h4"
        >
          {intl.formatMessage(reviewMessages.govtName)}
        </Text>
        <Text color="copy" element="h3" id={`header_subject`} variant="h3">
          {title}
        </Text>
      </Stack>
    </SubHeaderContainer>
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
  validatorContext
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

              // previousForm, formConfig are used to find previous values with the same label if required
              const valueDisplay = (
                <Output
                  field={field}
                  formConfig={formConfig}
                  previousForm={previousForm}
                  previousValue={previousValue}
                  showPreviouslyMissingValuesAsChanged={
                    showPreviouslyMissingValuesAsChanged
                  }
                  value={value}
                />
              )

              const errors = runFieldValidations({
                field,
                values: form,
                context: validatorContext
              })

              const errorDisplay =
                errors.length > 0 ? (
                  <ValidationError key={field.id}>
                    {intl.formatMessage(errors[0].message)}
                  </ValidationError>
                ) : null

              return { ...field, valueDisplay, errorDisplay }
            })

          // Only display fields that have a non-undefined/null value or have an validation error
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
                expand={true}
                label={intl.formatMessage(page.title)}
                labelForHideAction="Hide"
                labelForShowAction="Show"
                name={'Accordion_' + page.id}
              >
                <ListReview id={'Section_' + page.id}>
                  {displayedFields.map(
                    ({
                      id,
                      label,
                      errorDisplay,
                      valueDisplay,
                      uncorrectable
                    }) => {
                      const shouldHideEditLink =
                        readonlyMode ||
                        (isCorrection && uncorrectable) ||
                        isReviewCorrection

                      return (
                        <ListReview.Row
                          key={id}
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
                          id={id}
                          label={intl.formatMessage(label)}
                          value={errorDisplay || valueDisplay}
                        />
                      )
                    }
                  )}
                </ListReview>
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
  banner
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
  banner?: React.ReactNode
}) {
  const showPreviouslyMissingValuesAsChanged = previousFormValues !== undefined
  const previousForm = previousFormValues ?? {}

  const pageIdsWithFile = formConfig.pages
    .filter(({ fields }) =>
      fields.some(
        ({ type }) =>
          type === FieldType.FILE || type === FieldType.FILE_WITH_OPTIONS
      )
    )
    .map(({ id }) => id)

  const hasReviewFieldsToUpdate =
    annotation && onAnnotationChange && reviewFields && reviewFields.length > 0

  const intl = useIntl()

  return (
    <Row>
      <LeftColumn>
        {banner}
        <Card>
          <Header>
            <Text color="copy" element="h1" id={`header_title`} variant="h2">
              {intl.formatMessage(reviewMessages.recordTabTitle)}
            </Text>
          </Header>
          <SubHeader title={title} />
          <FormReview
            form={form}
            formConfig={formConfig}
            isCorrection={isCorrection}
            isReviewCorrection={isReviewCorrection}
            previousForm={previousForm}
            readonlyMode={readonlyMode}
            showPreviouslyMissingValuesAsChanged={
              showPreviouslyMissingValuesAsChanged
            }
            validatorContext={validatorContext}
            onEdit={onEdit}
          />

          {hasReviewFieldsToUpdate && (
            <FormData>
              <ReviewContainter>
                <FormFieldGenerator
                  fields={reviewFields}
                  id={'review'}
                  initialValues={annotation}
                  readonlyMode={readonlyMode}
                  validatorContext={validatorContext}
                  onChange={onAnnotationChange}
                />
              </ReviewContainter>
            </FormData>
          )}
        </Card>
        {children}
      </LeftColumn>
      {pageIdsWithFile.length > 0 && (
        <RightColumn>
          <DocumentViewer
            disabled={readonlyMode || isCorrection || isReviewCorrection}
            form={form}
            formConfig={formConfig}
            onEdit={() =>
              onEdit({ pageId: pageIdsWithFile[0], confirmation: true })
            }
          />
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
      isOpen={true}
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

function AcceptActionModal({
  copy,
  close,
  action
}: {
  copy: {
    onConfirm: MessageDescriptor
    title: MessageDescriptor
    supportingCopy?: MessageDescriptor
  }
  close: (result: boolean | null) => void
  action: string
}) {
  const intl = useIntl()

  return (
    <Dialog
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
          id={'confirm_' + action}
          type="primary"
          onClick={() => {
            close(true)
          }}
        >
          {intl.formatMessage(copy.onConfirm)}
        </Button>
      ]}
      isOpen={true}
      title={intl.formatMessage(copy.title)}
      onClose={() => close(null)}
    >
      <Stack>
        <Text color="grey500" element="p" variant="reg16">
          {copy.supportingCopy ? intl.formatMessage(copy.supportingCopy) : null}
        </Text>
      </Stack>
    </Dialog>
  )
}

export const REJECT_ACTIONS = {
  ARCHIVE: 'ARCHIVE',
  SEND_FOR_UPDATE: 'SEND_FOR_UPDATE'
} as const

export interface RejectionState {
  rejectAction: keyof typeof REJECT_ACTIONS
  message: string
  isDuplicate: boolean
}

function RejectActionModal({
  close,
  allowArchive = true,
  supportingCopy
}: {
  close: (result: RejectionState | null) => void
  allowArchive?: boolean
  supportingCopy?: MessageDescriptor
}) {
  const [state, setState] = useState<RejectionState>({
    rejectAction: REJECT_ACTIONS.ARCHIVE,
    message: '',
    isDuplicate: false
  })

  const intl = useIntl()

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
    ...(allowArchive
      ? [
          <Button
            key="confirm_reject_with_archive"
            disabled={!state.message}
            id="confirm_reject_with_archive"
            type="secondaryNegative"
            onClick={() => {
              close({
                ...state,
                rejectAction: REJECT_ACTIONS.ARCHIVE
              })
            }}
          >
            {intl.formatMessage(reviewMessages.rejectModalArchive)}
          </Button>
        ]
      : []),
    <Button
      key="confirm_reject_with_update"
      disabled={!state.message || state.isDuplicate}
      id="confirm_reject_with_update"
      type="negative"
      onClick={() => {
        close({
          ...state,
          rejectAction: REJECT_ACTIONS.SEND_FOR_UPDATE
        })
      }}
    >
      {intl.formatMessage(buttonMessages.reject)}
    </Button>
  ]

  return (
    <Dialog
      actions={actions}
      id="reject-modal"
      isOpen={true}
      title={intl.formatMessage(reviewMessages.rejectModalTitle)}
      titleIcon={<Icon color="primary" name="FileX" size="large" />}
      variant="large"
      onClose={() => close(null)}
    >
      <Stack alignItems="left" direction="column">
        <Text color="grey500" element="p" variant="reg16">
          {supportingCopy ? intl.formatMessage(supportingCopy) : null}
        </Text>
        <TextArea
          data-testid="reject-reason"
          required={true}
          value={state.message}
          onChange={(e) =>
            setState((prev) => ({ ...prev, message: e.target.value }))
          }
        />
        <Checkbox
          label={intl.formatMessage(reviewMessages.rejectModalMarkAsDuplicate)}
          name={'markDuplicate'}
          selected={state.isDuplicate}
          value={''}
          onChange={() =>
            setState((prev) => ({ ...prev, isDuplicate: !prev.isDuplicate }))
          }
        />
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
