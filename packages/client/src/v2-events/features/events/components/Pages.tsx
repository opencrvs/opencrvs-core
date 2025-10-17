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
  PageConfig,
  ValidatorContext
} from '@opencrvs/commons/client'
import { MAIN_CONTENT_ANCHOR_ID } from '@opencrvs/components/lib/Frame/components/SkipToContent'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { makeFormFieldIdFormikCompatible } from '@client/v2-events/components/forms/utils'
import { mapFieldsToValues } from '@client/v2-events/components/forms/FormFieldGenerator/FormFieldGenerator'
import { useSystemVariables } from '@client/v2-events/hooks/useSystemVariables'
import { useEventFormData } from '../useEventFormData'
import { VerificationWizard } from './VerificationWizard'
import { FormWizard } from './FormWizard'
import { AvailableActionTypes } from './Action/utils'

interface PagesProps {
  form: EventState
  setFormData: (dec: EventState) => void
  pageId: string
  showReviewButton?: boolean
  formPages: PageConfig[]
  onPageChange: (nextPageId: string) => void
  onSubmit: () => void
  validatorContext: ValidatorContext
  continueButtonText?: string
  eventConfig?: EventConfig
  validateBeforeNextPage?: boolean
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
  isCorrection = false,
  validatorContext
}: PagesProps & DeclarationProps) {
  const intl = useIntl()
  const visiblePages = formPages.filter((page) =>
    isPageVisible(page, form, validatorContext)
  )

  const pageIdx = visiblePages.findIndex((p) => p.id === pageId)
  const page = pageIdx === -1 ? visiblePages[0] : visiblePages[pageIdx]
  const [validateAllFields, setValidateAllFields] = useState(false)

  const { setAllTouchedFields, touchedFields: initialTouchedFields } =
    useEventFormData()

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

  const systemVariables = useSystemVariables()

  function onNextPage() {
    // Ensure that defaultValues end up in the zustand state
    // This solution is not ideal, as the current way default values work is:
    //   1. They are updated in to the formik state as 'initialValues' in <FormFieldGenerator/>
    //   2. They are updated in to the zustand state here
    //
    // I tried to improve this by updating the default values directly into the zustand state on form initialisation, but it caused other issues.
    // I decided to leave it this way for now, since it works, but we should overhaul the default values logic at some point.
    const defaultValues = mapFieldsToValues(page.fields, systemVariables)
    setFormData({ ...defaultValues, ...form })

    // Before switching to the next page, we need to mark all fields in the current page as touched
    // so that when we get back to the page, we show validation errors for all fields in the page.
    setAllTouchedFields(
      page.fields.reduce((touched, { id: fieldId }) => {
        return { ...touched, [makeFormFieldIdFormikCompatible(fieldId)]: true }
      }, initialTouchedFields)
    )

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
      id="pagesSection"
      // In some Action page forms, the form data itself is not the complete declaration.
      // We still merge the optional `declaration` prop into the initial form values so that
      // read-only declaration data is available for Data components or calculations.
      // Example: Print Certificate action.
      initialValues={{ ...declaration, ...form }}
      isCorrection={isCorrection}
      validateAllFields={validateAllFields}
      validatorContext={validatorContext}
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
