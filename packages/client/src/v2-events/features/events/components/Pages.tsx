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
  PageTypes,
  PageConfig
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
  onPageChange,
  onSubmit,
  continueButtonText,
  setFormData,
  disableContinue = false,
  eventConfig,
  declaration
}: {
  form: EventState
  setFormData: (dec: EventState) => void
  pageId: string
  showReviewButton?: boolean
  formPages: PageConfig[]
  onPageChange: (nextPageId: string) => void
  onSubmit: () => void
  continueButtonText?: string
  disableContinue?: boolean
  eventConfig?: EventConfig
  declaration?: EventState
}) {
  const intl = useIntl()
  const visiblePages = formPages.filter((page) => isPageVisible(page, form))
  const pageIdx = visiblePages.findIndex((p) => p.id === pageId)

  const {
    page: currentPage,
    next,
    previous,
    total
  } = usePagination(visiblePages.length, Math.max(pageIdx, 0))
  const page = visiblePages[currentPage]

  useEffect(() => {
    const pageChanged = visiblePages[currentPage].id !== pageId

    if (pageChanged) {
      onPageChange(visiblePages[currentPage].id)

      // We use the main content anchor id to scroll to the top of the frame when page changes
      document.getElementById(MAIN_CONTENT_ANCHOR_ID)?.scrollTo({ top: 0 })
    }
  }, [pageId, currentPage, visiblePages, onPageChange])

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
      declaration={declaration}
      eventConfig={eventConfig}
      fields={page.fields}
      form={form}
      id="locationForm"
      initialValues={form}
      setAllFieldsDirty={false}
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
    <FormWizard
      {...wizardProps}
      continueButtonText={continueButtonText}
      disableContinue={disableContinue}
    >
      {fields}
    </FormWizard>
  )
}
