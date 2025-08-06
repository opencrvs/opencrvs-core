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

import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import {
  EventState,
  EventConfig,
  isPageVisible,
  PageTypes,
  PageConfig
} from '@opencrvs/commons/client'
import { MAIN_CONTENT_ANCHOR_ID } from '@opencrvs/components/lib/Frame/components/SkipToContent'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { VerificationWizard } from './VerificationWizard'
import { FormWizard } from './FormWizard'
/**
 *
 * Reusable component for rendering a form with pagination. Used by different action forms
 */
export function Pages({
  form,
  showReviewButton,
  formPages,
  onPageChange,
  onSubmit,
  pageId,
  continueButtonText,
  setFormData,
  eventConfig,
  declaration,
  validateBeforeNextPage = false,
  // When isCorrection is true, we should disabled fields with 'uncorrectable' set to true, or skip pages where all fields have 'uncorrectable' set to true
  isCorrection = false
}: {
  form: EventState
  setFormData: (dec: EventState) => void
  pageId: string
  showReviewButton?: boolean
  formPages: PageConfig[]
  onPageChange: (nextPageId: string) => void
  onSubmit: () => void
  continueButtonText?: string
  eventConfig?: EventConfig
  declaration?: EventState
  validateBeforeNextPage?: boolean
  isCorrection?: boolean
}) {
  const intl = useIntl()
  const visiblePages = formPages.filter((page) => isPageVisible(page, form))
  const pageIdx = visiblePages.findIndex((p) => p.id === pageId)
  const page = pageIdx === -1 ? visiblePages[0] : visiblePages[pageIdx]
  const [validateAllFields, setValidateAllFields] = useState(false)

  useEffect(() => {
    // If page changes, scroll to the top of the page using the anchor element ID
    document.getElementById(MAIN_CONTENT_ANCHOR_ID)?.scrollTo({ top: 0 })
  }, [pageId])

  function switchToNextPage() {
    // When switching to next page, reset the validateAllFields state to false.
    // Otherwise we would be seeing validation errors right away on the next page.
    setValidateAllFields(false)

    const nextPageIdx = pageIdx + 1
    const nextPage =
      nextPageIdx < visiblePages.length ? visiblePages[nextPageIdx] : undefined

    // If there is a next page on the form available, navigate to it.
    // Otherwise, submit the form.
    return nextPage ? onPageChange(nextPage.id) : onSubmit()
  }

  function onNextPage() {
    // If we are in validateBeforeNextPage mode, we need to validate all fields before moving to the next page.
    // In this case, the actual switching of the page is done on the 'onAllFieldsValidated' callback.
    if (validateBeforeNextPage) {
      setValidateAllFields(true)
      return
    }

    switchToNextPage()
  }

  function onPreviousPage() {
    const previousPageIdx = pageIdx - 1
    const previousPage =
      previousPageIdx >= 0 ? visiblePages[previousPageIdx] : undefined

    if (previousPage) {
      setValidateAllFields(false)
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
      eventConfig={eventConfig}
      fields={page.fields}
      id="locationForm"
      // As initial values we use both the provided declaration data (previously saved to the event)
      // and the form data (which is currently being edited).
      initialValues={{ ...declaration, ...form }}
      isCorrection={isCorrection}
      validateAllFields={validateAllFields}
      onAllFieldsValidated={(success) => {
        setValidateAllFields(false)
        if (success) {
          switchToNextPage()
        }
      }}
      onChange={(values) => setFormData(values)}
    />
  )

  if (page.type === PageTypes.enum.VERIFICATION) {
    return (
      <VerificationWizard
        {...wizardProps}
        pageConfig={page}
        onVerifyAction={(val: boolean) => {
          setFormData({
            ...form,
            [page.id]: val
          })
        }}
      >
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
