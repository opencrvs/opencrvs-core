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
import { ActionFormData, FormPage } from '@opencrvs/commons/client'
import { FormWizard } from '@opencrvs/components'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { usePagination } from '@client/v2-events/hooks/usePagination'

/**
 *
 * Reusable component for rendering a form with pagination. Used by different action forms
 */
export function Pages({
  eventId,
  pageId,
  showReviewButton,
  formPages,
  form,
  onFormPageChange,
  onSubmit,
  prefixChildren,
  submitButtonText,
  setFormData
}: {
  eventId: string
  pageId: string
  form: ActionFormData
  setFormData: (data: ActionFormData) => void
  showReviewButton?: boolean
  formPages: FormPage[]
  onFormPageChange: (nextPageId: string) => void
  onSubmit: () => void
  /**
   * @TODO: Remember to add a comment explaining why and how it's used.
   */
  prefixChildren?: React.ReactNode
  submitButtonText?: string
}) {
  const intl = useIntl()

  const pageIdx = formPages.findIndex((p) => p.id === pageId)

  const {
    page: currentPage,
    next,
    previous,
    total
  } = usePagination(formPages.length, Math.max(pageIdx, 0))
  const page = formPages[currentPage]

  useEffect(() => {
    const pageChanged = formPages[currentPage].id !== pageId

    if (pageChanged) {
      onFormPageChange(formPages[currentPage].id)
    }
  }, [pageId, currentPage, formPages, onFormPageChange])

  return (
    <FormWizard
      currentPage={currentPage}
      pageTitle={intl.formatMessage(page.title)}
      showReviewButton={showReviewButton}
      submitButtonText={submitButtonText}
      totalPages={total}
      onNextPage={next}
      onPreviousPage={previous}
      onSubmit={onSubmit}
    >
      {prefixChildren}
      <FormFieldGenerator
        fields={page.fields}
        formData={form}
        id="locationForm"
        initialValues={form}
        setAllFieldsDirty={false}
        onChange={(values) => setFormData(values)}
      />
    </FormWizard>
  )
}
