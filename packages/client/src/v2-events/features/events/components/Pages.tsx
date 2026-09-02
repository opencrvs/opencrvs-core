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

import React, { useEffect, useRef } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { omit } from 'lodash'
import {
  EventState,
  EventConfig,
  isPageVisible,
  isNonInteractiveFieldType,
  PageTypes,
  PageConfig,
  ValidatorContext,
  isNameFieldType,
  FieldConfig
} from '@opencrvs/commons/client'
import { MAIN_CONTENT_ANCHOR_ID } from '@opencrvs/components/lib/Frame/components/SkipToContent'
import { Button } from '@opencrvs/components/lib/Button'
import {
  FormFieldGenerator,
  FormFieldGeneratorHandle
} from '@client/v2-events/components/forms/FormFieldGenerator'
import { useClearFormModal } from '@client/v2-events/components/ClearFormModal'
import { useDefaultValue } from '@client/v2-events/hooks/useDefaultValue'
import { useEventFormData } from '../useEventFormData'
import { VerificationWizard } from './VerificationWizard'
import { FormWizard } from './FormWizard'

const messages = defineMessages({
  clear: {
    defaultMessage: 'Clear',
    description: 'Label for the button clearing all fields on the form page',
    id: 'buttons.clear'
  }
})

interface PagesProps {
  formData: EventState
  setFormData: (form: EventState) => void
  pageId: string
  hideBackToReview?: boolean
  formPages: PageConfig[]
  onPageChange: (nextPageId: string) => void
  onSubmit: () => void
  validatorContext: ValidatorContext
  continueButtonText?: string
  eventConfig?: EventConfig
  attachmentPath: string
  isCorrection?: boolean
}

/**
 *
 * Reusable component for rendering a form with pagination. Used by different action forms
 */
export function Pages({
  formData,
  hideBackToReview = false,
  attachmentPath,
  formPages,
  onPageChange,
  onSubmit,
  pageId,
  continueButtonText,
  setFormData,
  eventConfig,
  // When isCorrection is true, we should disabled fields with 'uncorrectable' set to true, or skip pages where all fields have 'uncorrectable' set to true
  isCorrection = false,
  validatorContext
}: PagesProps) {
  const intl = useIntl()
  const visiblePages = formPages.filter((page) =>
    isPageVisible(page, formData, validatorContext)
  )

  const pageIdx = visiblePages.findIndex((p) => p.id === pageId)
  const page = pageIdx === -1 ? visiblePages[0] : visiblePages[pageIdx]
  const formRef = useRef<FormFieldGeneratorHandle>(null)

  const { formTouched, setFormTouched } = useEventFormData()
  const popHiddenFieldValue = useEventFormData(
    (state) => state.popHiddenFieldValue
  )
  const getDefaultValue = useDefaultValue()
  const { clearFormModal, openClearFormConfirmation } = useClearFormModal()

  useEffect(() => {
    // If page changes, scroll to the top of the page using the anchor element ID
    document.getElementById(MAIN_CONTENT_ANCHOR_ID)?.scrollTo({ top: 0 })
  }, [pageId])

  function switchToNextPage(formValues: EventState = formData) {
    const currentVisiblePages = formPages.filter((p) =>
      isPageVisible(p, formValues, validatorContext)
    )
    const currentPageIdx = currentVisiblePages.findIndex((p) => p.id === pageId)
    const nextPageIdx = currentPageIdx + 1
    const nextPage =
      nextPageIdx < currentVisiblePages.length
        ? currentVisiblePages[nextPageIdx]
        : undefined

    // If there is a next page on the form available, navigate to it.
    // Otherwise, submit the form.
    return nextPage ? onPageChange(nextPage.id) : onSubmit()
  }

  // values is used on the verification page wizard to set the verification page result
  function onNextPage(values?: EventState) {
    // submit() flushes the current page values (including values computed
    // inside FormFieldGenerator, e.g. default values) into the form state
    // store and returns any validation errors.
    const errors = formRef.current?.submit(values) ?? []
    // Navigate when the page allows incomplete values, or when the page is
    // error-free.
    const allowErrors = !page.requireCompletionToContinue
    if (allowErrors || errors.length === 0) {
      switchToNextPage()
    }
  }

  function handleSubmit() {
    // submit() flushes the current page values (including values computed
    // inside FormFieldGenerator, e.g. default values) into the form state
    // store. Navigating to review is allowed even when the page has errors.
    formRef.current?.submit()
    onSubmit()
  }

  async function onClearPage() {
    const confirmed = await openClearFormConfirmation()

    if (!confirmed) {
      return
    }

    /**
     * A cleared field falls back to its configured default value. Fields with no
     * default clear to `null`, except NAME fields: those hold an object, and
     * `null` leaves the sub-inputs rendering the values that were just cleared,
     * so they need an explicitly empty name instead.
     */
    function getClearedValue(field: FieldConfig) {
      const defaultValue = getDefaultValue(field, {})

      if (defaultValue !== undefined) {
        return defaultValue
      }

      const candidate = { config: field, value: formData[field.id] }

      if (!isNameFieldType(candidate)) {
        return null
      }

      return candidate.config.configuration?.name?.middlename
        ? { firstname: '', middlename: '', surname: '' }
        : { firstname: '', surname: '' }
    }

    const clearedPageValues = Object.fromEntries(
      page.fields
        .filter((field) => !isNonInteractiveFieldType(field))
        .map((field) => [field.id, getClearedValue(field)])
    )

    setFormData({ ...formData, ...clearedPageValues })
    setFormTouched(
      omit(
        formTouched,
        page.fields.map((field) => field.id)
      )
    )
    // Purge cached values of conditionally hidden fields on this page so
    // re-showing them doesn't restore the values that were just cleared
    page.fields.forEach((field) => popHiddenFieldValue(field.id))
  }

  const topActionButtons = page.showClearButton
    ? [
        <Button
          key="clear-form"
          id="clear-form"
          size="small"
          type="secondaryNegative"
          onClick={onClearPage}
        >
          {intl.formatMessage(messages.clear)}
        </Button>
      ]
    : undefined

  const wizardProps = {
    pageTitle: intl.formatMessage(page.title),
    showReviewButton: !hideBackToReview,
    onNextPage,
    onSubmit: handleSubmit
  }
  const fields = (
    <FormFieldGenerator
      ref={formRef}
      attachmentPath={attachmentPath}
      eventConfig={eventConfig}
      fields={page.fields}
      formTouched={formTouched}
      formValues={formData}
      id="pagesSection"
      isCorrection={isCorrection}
      validatorContext={validatorContext}
      onFormChange={setFormData}
      onTouchedChange={setFormTouched}
    />
  )

  if (page.type === PageTypes.enum.VERIFICATION) {
    return (
      <VerificationWizard {...wizardProps} pageConfig={page}>
        {fields}
      </VerificationWizard>
    )
  }

  return (
    <>
      <FormWizard
        {...wizardProps}
        continueButtonText={continueButtonText}
        topActionButtons={topActionButtons}
      >
        {fields}
      </FormWizard>
      {clearFormModal}
    </>
  )
}
