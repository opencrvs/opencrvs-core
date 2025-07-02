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
  Icon,
  IconProps,
  Link,
  ListReview,
  ResponsiveModal,
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
  SCOPES
} from '@opencrvs/commons/client'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { getCountryLogoFile } from '@client/offline/selectors'
import { getScope } from '@client/profile/profileSelectors'
import { withSuspense } from '@client/v2-events/components/withSuspense'
import { Output } from './Output'
import { DocumentViewer } from './DocumentViewer'

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
    id: 'v2.buttons.changeAll',
    defaultMessage: 'Change all',
    description: 'The label for the change all button'
  },
  changeButton: {
    id: 'v2.buttons.change',
    defaultMessage: 'Change',
    description: 'The label for the change button'
  },
  actionModalCancel: {
    id: 'v2.actionModal.cancel',
    defaultMessage: 'Cancel',
    description: 'The label for cancel button of action modal'
  },
  actionModalPrimaryAction: {
    id: 'v2.actionModal.PrimaryAction',
    defaultMessage: '{action, select, declare{Declare} other{{action}}}',
    description: 'The label for primary action button of action modal'
  },
  actionModalTitle: {
    id: 'v2.actionModal.title',
    defaultMessage:
      '{action, select, declare{Declare} other{{action}}} the member?',
    description: 'The title for action modal'
  },
  actionModalDescription: {
    id: 'v2.actionModal.description',
    defaultMessage:
      'The declarant will be notified of this action and a record of this decision will be recorded',
    description: 'The description for action modal'
  },
  actionModalIncompleteDescription: {
    id: 'v2.actionModal.description.incomplete',
    defaultMessage: 'This incomplete declaration will be sent for review.',
    description: 'The description for action modal when incomplete'
  },
  changeModalCancel: {
    id: 'v2.changeModal.cancel',
    defaultMessage: 'Cancel',
    description: 'The label for cancel button of change modal'
  },
  changeModalContinue: {
    id: 'v2.changeModal.continue',
    defaultMessage: 'Continue',
    description: 'The label for continue button of change modal'
  },
  changeModalTitle: {
    id: 'v2.changeModal.title',
    defaultMessage: 'Edit declaration?',
    description: 'The title for change modal'
  },
  changeModalDescription: {
    id: 'v2.changeModal.description',
    defaultMessage: 'A record will be created of any changes you make',
    description: 'The description for change modal'
  },
  govtName: {
    id: 'review.header.title.govtName',
    defaultMessage: 'Government',
    description: 'Header title that shows govt name'
  },
  zeroDocumentsTextForAnySection: {
    defaultMessage: 'No supporting documents',
    description: 'Zero documents text',
    id: 'review.documents.zeroDocumentsTextForAnySection'
  },
  editDocuments: {
    defaultMessage: 'Add attachement',
    description: 'Edit documents text',
    id: 'review.documents.editDocuments'
  },
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
  isCorrection = false
}: {
  formConfig: FormConfig
  form: EventState
  previousForm: EventState
  onEdit: ({ pageId, fieldId }: { pageId: string; fieldId?: string }) => void
  showPreviouslyMissingValuesAsChanged: boolean
  readonlyMode?: boolean
  isCorrection?: boolean
}) {
  const intl = useIntl()
  const visiblePages = formConfig.pages.filter((page) =>
    isPageVisible(page, form)
  )

  return (
    <FormData>
      <ReviewContainter>
        {visiblePages.map((page) => {
          const fields = page.fields
            .filter((field) => isFieldDisplayedOnReview(field, form))
            .map((field) => {
              const value = form[field.id]
              const previousValue = previousForm[field.id]

              const valueDisplay = Output({
                field,
                previousValue,
                showPreviouslyMissingValuesAsChanged,
                value
              })

              const error = runFieldValidations({
                field,
                values: form
              })

              const errorDisplay =
                error.errors.length > 0 ? (
                  <ValidationError key={field.id}>
                    {intl.formatMessage(error.errors[0].message)}
                  </ValidationError>
                ) : null

              return { ...field, valueDisplay, errorDisplay }
            })

          const shouldDisplayPage = fields.some(
            ({ type, valueDisplay, errorDisplay }) => {
              if (
                type === FieldType.FILE ||
                type === FieldType.FILE_WITH_OPTIONS
              ) {
                return true
              }

              // If page doesn't have any file inputs, we only want to display it if it has any fields with content
              return valueDisplay || errorDisplay
            }
          )

          if (!shouldDisplayPage) {
            return <></>
          }

          // Only display fields that have a non-undefined/null value or have an validation error
          const displayedFields = fields.filter(
            ({ valueDisplay, errorDisplay }) => {
              // Explicitly check for undefined and null, so that e.g. number 0 and empty string outputs are shown
              const hasValue =
                valueDisplay !== undefined && valueDisplay !== null
              return hasValue || Boolean(errorDisplay)
            }
          )

          const anyFieldsAreCorrectable = displayedFields.some(
            (field) => field.isCorrectable !== false
          )

          // If the page has any correctable fields, show the change all link
          const showChangeAllLink =
            !readonlyMode && (!isCorrection || anyFieldsAreCorrectable)

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
                      isCorrectable
                    }) => {
                      const shouldHideEditLink =
                        readonlyMode ||
                        (isCorrection && isCorrectable === false)

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
  annotation,
  onEdit,
  children,
  title,
  onAnnotationChange,
  readonlyMode,
  reviewFields,
  isCorrection = false
}: {
  children: React.ReactNode
  formConfig: FormConfig
  form: EventState
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
}) {
  const scopes = useSelector(getScope)
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

  return (
    <Row>
      <LeftColumn>
        <Card>
          <ReviewHeader title={title} />
          <FormReview
            form={form}
            formConfig={formConfig}
            isCorrection={isCorrection}
            previousForm={previousForm}
            readonlyMode={readonlyMode}
            showPreviouslyMissingValuesAsChanged={
              showPreviouslyMissingValuesAsChanged
            }
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
            disabled={readonlyMode}
            form={form}
            formConfig={formConfig}
            // @todo: ask about this rule
            showInMobile={
              scopes?.includes(SCOPES.RECORD_REGISTRATION_CORRECT) ?? false
            }
            onEdit={() =>
              onEdit({ pageId: pageIdsWithFile[0], confirmation: true })
            }
          />
        </RightColumn>
      )}
    </Row>
  )
}

const Container = styled.div`
  position: relative;
  margin-top: 48px;
  border-top: 1px solid ${({ theme }) => theme.colors.grey300};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    max-width: 100vw;
  }
`
const Content = styled.div`
  z-index: 1;
  padding: 32px;
  position: relative;
  white-space: pre-wrap;
  color: ${({ theme }) => theme.colors.copy};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: 24px;
    padding-bottom: 32px;
  }
`
const UnderLayBackground = styled.div<{ background: string }>`
  background-color: ${({ background, theme }) => {
    if (background === 'error') {
      return theme.colors.redLighter
    }

    return theme.colors.greenLighter
  }};
`

const Title = styled.div`
  ${({ theme }) => theme.fonts.h2}
  margin-bottom: 12px;
`
const Description = styled.div`
  ${({ theme }) => theme.fonts.reg18};
  margin-bottom: 32px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    ${({ theme }) => theme.fonts.reg16}
  }
`

const ActionContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;

  button:first-child {
    margin-right: 16px;
  }

  & > button {
    margin-bottom: 8px;
  }
`

function ReviewActionComponent({
  incomplete,
  onConfirm,
  onReject,
  messages,
  primaryButtonType,
  canSendIncomplete,
  icon
}: {
  incomplete: boolean
  onConfirm: () => void
  onReject?: () => void
  messages: {
    title: MessageDescriptor
    description: MessageDescriptor
    onConfirm: MessageDescriptor
    onReject?: MessageDescriptor
  }
  primaryButtonType?: 'positive' | 'primary'
  canSendIncomplete?: boolean
  icon: IconProps['name']
}) {
  const intl = useIntl()

  const background = incomplete ? 'error' : 'success'

  return (
    <Container>
      <UnderLayBackground background={background}>
        <Content>
          <Title>{intl.formatMessage(messages.title)}</Title>
          <Description>{intl.formatMessage(messages.description)}</Description>
          <ActionContainer>
            <Button
              disabled={!!incomplete && !canSendIncomplete}
              id="validateDeclarationBtn"
              size="large"
              type={primaryButtonType ?? 'positive'}
              onClick={onConfirm}
            >
              <Icon color="white" name={icon} />
              {intl.formatMessage(messages.onConfirm)}
            </Button>
            {onReject && messages.onReject && (
              <Button
                id="review-reject"
                size="large"
                type={'negative'}
                onClick={onReject}
              >
                <Icon name="X" />
                {intl.formatMessage(messages.onReject)}
              </Button>
            )}
          </ActionContainer>
        </Content>
      </UnderLayBackground>
    </Container>
  )
}

function EditModal({
  copy,
  close
}: {
  copy?: {
    cancel?: MessageDescriptor
    continue?: MessageDescriptor
    title?: MessageDescriptor
    description?: MessageDescriptor
  }
  close: (result: boolean | null) => void
}) {
  const intl = useIntl()
  return (
    <ResponsiveModal
      autoHeight
      showHeaderBorder
      actions={[
        <Button
          key="cancel_edit"
          id="cancel_edit"
          type="tertiary"
          onClick={() => {
            close(null)
          }}
        >
          {intl.formatMessage(copy?.cancel || reviewMessages.changeModalCancel)}
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
      handleClose={() => close(null)}
      responsive={false}
      show={true}
      title={intl.formatMessage(copy?.title || reviewMessages.changeModalTitle)}
    >
      <Stack>
        <Text color="grey500" element="p" variant="reg16">
          {intl.formatMessage(
            copy?.description || reviewMessages.changeModalDescription
          )}
        </Text>
      </Stack>
    </ResponsiveModal>
  )
}

function AcceptActionModal({
  copy,
  close,
  action
}: {
  copy: {
    onCancel: MessageDescriptor
    onConfirm: MessageDescriptor
    title: MessageDescriptor
    description: MessageDescriptor
    eventLabel: MessageDescriptor
  }
  close: (result: boolean | null) => void
  action: string
}) {
  const intl = useIntl()
  // @TODO: Revisit this. There must be a better way to have the event name as part of string.
  const eventName = intl.formatMessage(copy.eventLabel).toLocaleLowerCase()

  return (
    <ResponsiveModal
      autoHeight
      show
      showHeaderBorder
      actions={[
        <Button
          key={'cancel_' + action}
          id={'cancel_' + action}
          type="tertiary"
          onClick={() => {
            close(null)
          }}
        >
          {intl.formatMessage(copy.onCancel)}
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
      handleClose={() => close(null)}
      title={intl.formatMessage(
        copy.title,
        // @TODO: Consider whether every formatted message should have access to global variables
        // currently it seems we are arbitrarily deciding which ones do.
        { event: eventName }
      )}
    >
      <Stack>
        <Text color="grey500" element="p" variant="reg16">
          {intl.formatMessage(copy.description)}
        </Text>
      </Stack>
    </ResponsiveModal>
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
  close
}: {
  close: (result: RejectionState | null) => void
}) {
  const [state, setState] = useState<RejectionState>({
    rejectAction: REJECT_ACTIONS.ARCHIVE,
    message: '',
    isDuplicate: false
  })

  const intl = useIntl()
  return (
    <ResponsiveModal
      showHeaderBorder
      actions={[
        <Button
          key="cancel_reject"
          id="cancel_reject"
          type="tertiary"
          onClick={() => {
            close(null)
          }}
        >
          {intl.formatMessage(reviewMessages.rejectModalCancel)}
        </Button>,
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
        </Button>,
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
          {intl.formatMessage(reviewMessages.rejectModalSendForUpdate)}
        </Button>
      ]}
      contentHeight={270}
      handleClose={() => close(null)}
      id="reject-modal"
      show={true}
      title={intl.formatMessage(reviewMessages.rejectModalTitle)}
      width={918}
    >
      <Stack alignItems="left" direction="column">
        <Text color="grey500" element="p" variant="reg16">
          {intl.formatMessage(reviewMessages.rejectModalDescription)}
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
    </ResponsiveModal>
  )
}

export const Review = {
  Body: withSuspense(ReviewComponent),
  Actions: ReviewActionComponent,
  EditModal: EditModal,
  ActionModal: {
    Accept: AcceptActionModal,
    Reject: RejectActionModal
  }
}
