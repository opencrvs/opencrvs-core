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

import React, { useEffect, useMemo } from 'react'
import { useIntl } from 'react-intl'
import {
  ActionFormData,
  FieldConfig,
  FieldValue,
  FormPage
} from '@opencrvs/commons/client'
import { FormWizard } from '@opencrvs/components'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { usePagination } from '@client/v2-events/hooks/usePagination'
import { flatten } from 'lodash'

import { handleDefaultValue } from '@client/v2-events/components/forms/utils'
type FormData = Record<string, FieldValue>

const mapFieldsToValues = (fields: FieldConfig[], formData: FormData) =>
  fields.reduce((memo, field) => {
    const fieldInitialValue = handleDefaultValue(field, formData)
    return { ...memo, [field.id]: fieldInitialValue }
  }, {})

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
  submitButtonText,
  setFormData,
  children
}: {
  form: ActionFormData
  setFormData: (data: ActionFormData) => void
  pageId: string
  showReviewButton?: boolean
  formPages: FormPage[]
  onFormPageChange: (nextPageId: string) => void
  onSubmit: () => void
  submitButtonText?: string
  children?: (page: FormPage) => React.ReactNode
}) {
  const intl = useIntl()

  const initialForm = useMemo(() => {
    // If the form already has any values, it means that the form has been initialized previously
    // So we don't want to reinitialize it
    if (Object.keys(form).length > 0) {
      return form
    }

    // Initialize form with default values
    const allFields = flatten(formPages.map((page) => page.fields))
    const fieldsWithDefaults = allFields.filter(
      (field) =>
        field.defaultValue &&
        field.defaultValue !== null &&
        field.defaultValue !== undefined
    )

    return mapFieldsToValues(fieldsWithDefaults, form)
  }, [])

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
      {children ? (
        children(page)
      ) : (
        <FormFieldGenerator
          fields={page.fields}
          formData={form}
          id="locationForm"
          initialValues={initialForm}
          setAllFieldsDirty={false}
          onChange={(values) => setFormData(values)}
        />
      )}
    </FormWizard>
  )
}
