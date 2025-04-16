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

import React from 'react'
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

  const currentPageIdx = visiblePages.findIndex((p) => p.id === pageId)

  function onNextPage() {
    const nextPage = visiblePages[currentPageIdx + 1]

    if (nextPage) {
      onPageChange(nextPage.id)
      document.getElementById(MAIN_CONTENT_ANCHOR_ID)?.scrollTo({ top: 0 })
      return
    }

    onSubmit()
    document.getElementById(MAIN_CONTENT_ANCHOR_ID)?.scrollTo({ top: 0 })
    return
  }

  function onPreviousPage() {
    const previousPage = visiblePages[currentPageIdx - 1]

    if (previousPage) {
      onPageChange(previousPage.id)
      document.getElementById(MAIN_CONTENT_ANCHOR_ID)?.scrollTo({ top: 0 })
    }
  }

  const page = visiblePages.find((p) => p.id === pageId)

  if (!page) {
    // TODO CIHAN: handle this error nicely
    throw new Error('Page not found')
  }

  const wizardProps = {
    currentPage: pageIdx,
    pageTitle: intl.formatMessage(page.title),
    showReviewButton,
    // CIHAN TODO: ONKS TÄÄ OK?
    totalPages: visiblePages.length,
    onNextPage: onNextPage,
    onPreviousPage: onPreviousPage,
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
