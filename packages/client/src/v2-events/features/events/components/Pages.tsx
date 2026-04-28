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
import { useIntl } from 'react-intl'
import {
  EventState,
  EventConfig,
  isPageVisible,
  PageTypes,
  PageConfig,
  ValidatorContext
} from '@opencrvs/commons/client'
import { MAIN_CONTENT_ANCHOR_ID } from '@opencrvs/components/lib/Frame/components/SkipToContent'
import {
  FormFieldGenerator,
  FormFieldGeneratorHandle
} from '@client/v2-events/components/forms/FormFieldGenerator'
import { useEventFormData } from '../useEventFormData'
import { VerificationWizard } from './VerificationWizard'
import { FormWizard } from './FormWizard'
import { AvailableActionTypes } from './Action/utils'

interface PagesProps {
  formData: EventState
  setFormData: (form: EventState) => void
  pageId: string
  showReviewButton?: boolean
  formPages: PageConfig[]
  onPageChange: (nextPageId: string) => void
  onSubmit: () => void
  validatorContext: ValidatorContext
  continueButtonText?: string
  eventConfig?: EventConfig
  attachmentPath: string
  isCorrection?: boolean
}

type DeclarationProps =
  | {
      actionType: AvailableActionTypes
      declaration?: undefined
    }
  | {
      declaration: EventState
    }
/**
 *
 * Reusable component for rendering a form with pagination. Used by different action forms
 */
export function Pages({
  formData,
  showReviewButton,
  attachmentPath,
  formPages,
  onPageChange,
  onSubmit,
  pageId,
  continueButtonText,
  setFormData,
  eventConfig,
  declaration,
  // When isCorrection is true, we should disabled fields with 'uncorrectable' set to true, or skip pages where all fields have 'uncorrectable' set to true
  isCorrection = false,
  validatorContext
}: PagesProps & DeclarationProps) {
  const intl = useIntl()
  const visiblePages = formPages.filter((page) =>
    isPageVisible(page, formData, validatorContext)
  )

  const pageIdx = visiblePages.findIndex((p) => p.id === pageId)
  const page = pageIdx === -1 ? visiblePages[0] : visiblePages[pageIdx]
  const formRef = useRef<FormFieldGeneratorHandle>(null)

  const { formTouched, setFormTouched } = useEventFormData()

  useEffect(() => {
    // If page changes, scroll to the top of the page using the anchor element ID
    document.getElementById(MAIN_CONTENT_ANCHOR_ID)?.scrollTo({ top: 0 })
  }, [pageId])

  function switchToNextPage() {
    const nextPageIdx = pageIdx + 1
    const nextPage =
      nextPageIdx < visiblePages.length ? visiblePages[nextPageIdx] : undefined

    // If there is a next page on the form available, navigate to it.
    // Otherwise, submit the form.
    return nextPage ? onPageChange(nextPage.id) : onSubmit()
  }

  // values is used on the verification page wizard to set the verification page result
  function onNextPage(values?: EventState) {
    const errors = formRef.current?.submit(values) ?? []
    // onValidSubmit (i.e. switchToNextPage) is called as part of submit only if
    // there are no errors in the form. But if the current page doesn't require
    // completion to continue and there are errors on the page, we manually call
    // switchToNextPage.
    if (!page.requireCompletionToContinue && errors.length > 0) {
      switchToNextPage()
    }
  }

  function onPreviousPage() {
    const previousPageIdx = pageIdx - 1
    const previousPage =
      previousPageIdx >= 0 ? visiblePages[previousPageIdx] : undefined

    if (previousPage) {
      return onPageChange(previousPage.id)
    }
  }

  const wizardProps = {
    currentPage: pageIdx,
    pageTitle: intl.formatMessage(page.title),
    showReviewButton,
    onNextPage,
    onPreviousPage,
    onSubmit
  }
  const fields = (
    <FormFieldGenerator
      ref={formRef}
      attachmentPath={attachmentPath}
      eventConfig={eventConfig}
      fields={page.fields}
      // This makes the declaration available in the validations/conditionals of
      // the form without bleeding into the current form values
      formContext={declaration}
      formTouched={formTouched}
      formValues={formData}
      id="pagesSection"
      isCorrection={isCorrection}
      validatorContext={validatorContext}
      onFormChange={setFormData}
      onTouchedChange={setFormTouched}
      onValidSubmit={switchToNextPage}
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
    <FormWizard {...wizardProps} continueButtonText={continueButtonText}>
      {fields}
    </FormWizard>
  )
}
