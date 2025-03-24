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

import React, { useEffect } from 'react'
import { useIntl } from 'react-intl'
import {
  EventState,
  EventConfig,
  isPageVisible,
  FormPageConfig,
  FormPageType
} from '@opencrvs/commons/client'
import { MAIN_CONTENT_ANCHOR_ID } from '@opencrvs/components/lib/Frame/components/SkipToContent'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { usePagination } from '@client/v2-events/hooks/usePagination'
import { VerificationWizard } from './VerificationWizard'
import { FormWizard } from './FormWizard'
/**
 *
 * Reusable component for rendering a form with pagination. Used by different action forms
 */
export function Pages({
  form,
  pageId,
  showReviewButton,
  formPages,
  onFormPageChange,
  onSubmit,
  continueButtonText,
  setFormData,
  disableContinue = false,
  eventConfig,
  eventDeclarationData
}: {
  form: EventState
  setFormData: (data: EventState) => void
  pageId: string
  showReviewButton?: boolean
  formPages: FormPageConfig[]
  onFormPageChange: (nextPageId: string) => void
  onSubmit: () => void
  continueButtonText?: string
  disableContinue?: boolean
  eventConfig?: EventConfig
  eventDeclarationData?: EventState
}) {
  const intl = useIntl()

  const pageIdx = formPages.findIndex((p) => p.id === pageId)

  const pages = formPages.filter((page) =>
    isPageVisible(page, { ...form, ...eventDeclarationData })
  )

  const {
    page: currentPage,
    next,
    previous,
    total
  } = usePagination(pages.length, Math.max(pageIdx, 0))
  const page = pages[currentPage]

  useEffect(() => {
    const pageChanged = pages[currentPage].id !== pageId

    if (pageChanged) {
      onFormPageChange(pages[currentPage].id)

      // We use the main content anchor id to scroll to the top of the frame when page changes
      document.getElementById(MAIN_CONTENT_ANCHOR_ID)?.scrollTo({ top: 0 })
    }
  }, [pageId, currentPage, pages, onFormPageChange])

  const wizardProps = {
    currentPage,
    pageTitle: intl.formatMessage(page.title),
    showReviewButton,
    totalPages: total,
    onNextPage: next,
    onPreviousPage: previous,
    onSubmit
  }

  const fields = (
    <FormFieldGenerator
      eventConfig={eventConfig}
      eventDeclarationData={eventDeclarationData}
      fields={page.fields}
      formData={form}
      id="locationForm"
      initialValues={form}
      setAllFieldsDirty={false}
      onChange={(values) => setFormData(values)}
    />
  )

  if (page.type === FormPageType.VERIFICATION) {
    return (
      <VerificationWizard
        {...wizardProps}
        pageConfig={page.actions}
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

  const wizardProps = {
    currentPage,
    pageTitle: intl.formatMessage(page.title),
    showReviewButton,
    totalPages: total,
    onNextPage: next,
    onPreviousPage: previous,
    onSubmit
  }

  const fields = (
    <FormFieldGenerator
      eventConfig={eventConfig}
      eventDeclarationData={eventDeclarationData}
      fields={page.fields}
      formData={form}
      id="locationForm"
      initialValues={form}
      setAllFieldsDirty={false}
      onChange={(values) => setFormData(values)}
    />
  )

  if (page.type === FormPageType.VERIFICATION) {
    return (
      <VerificationWizard
        {...wizardProps}
        pageConfig={page.actions}
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
    <FormWizard
      {...wizardProps}
      continueButtonText={continueButtonText}
      disableContinue={disableContinue}
    >
      {fields}
    </FormWizard>
  )
}
