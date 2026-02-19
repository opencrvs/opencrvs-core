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

import React, { forwardRef, useEffect, useImperativeHandle } from 'react'
import { Formik, FormikErrors, FormikTouched, useFormikContext } from 'formik'
import styled, { keyframes } from 'styled-components'
import { EventState, FieldType } from '@opencrvs/commons/client'
import { getValidationErrorsForForm } from '@client/v2-events/components/forms/validation'
import {
  makeFormFieldIdsFormikCompatible,
  makeFormikFieldIdsOpenCRVSCompatible
} from './utils'
import { GeneratedInputFieldV2 } from './components/GeneratedInputFieldV2'
import { useFormState } from './hooks/useFormState'
import { useVisibleFieldsV2 } from './hooks/useVisibleFieldsV2'

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const FormItem = styled.div<{ ignoreBottomMargin?: boolean }>`
  animation: ${fadeIn} 500ms;
  margin-bottom: ${({ ignoreBottomMargin }) =>
    ignoreBottomMargin ? '0px' : '22px'};
`

interface FormPageProps {
  pageId: string
  initialPageValues: EventState
  initialTouched: FormikTouched<EventState>
}

function focusElementByHash() {
  const hash = window.location.hash.slice(1)
  if (!hash) {
    return
  }

  const input =
    document.querySelector<HTMLElement>(`input[id*="${hash}"]`) ??
    document.querySelector<HTMLElement>(`${window.location.hash} input`)

  input?.focus()
  window.scrollTo(0, document.documentElement.scrollTop - 100)
}

export interface FormPageRef {
  submitForm: () => FormikErrors<EventState>
}

const PageContent = forwardRef<FormPageRef>((_, ref) => {
  const { errors, submitForm } = useFormikContext<EventState>()
  const { pageFields } = useFormState()
  const visibleFields = useVisibleFieldsV2(pageFields)

  useEffect(() => {
    focusElementByHash()
  }, [])

  useImperativeHandle(ref, () => ({
    submitForm: () => {
      // This reveals all validation errors
      void submitForm()
      return makeFormikFieldIdsOpenCRVSCompatible(errors)
    }
  }))

  return (
    <section>
      {visibleFields.map((field) => {
        return (
          <FormItem
            key={field.id}
            ignoreBottomMargin={field.type === FieldType.PAGE_HEADER}
          >
            <GeneratedInputFieldV2 fieldDefinition={field} />
          </FormItem>
        )
      })}
    </section>
  )
})

export const FormPage = forwardRef<FormPageRef, FormPageProps>(
  ({ pageId, initialPageValues, initialTouched }, ref) => {
    const formikCompatibleInitialValues =
      makeFormFieldIdsFormikCompatible(initialPageValues)
    const formikCompatibleInitialTouched =
      makeFormFieldIdsFormikCompatible(initialTouched)

    const { pageFields, validatorContext } = useFormState()

    return (
      <Formik<EventState>
        key={pageId}
        initialTouched={formikCompatibleInitialTouched}
        initialValues={formikCompatibleInitialValues}
        validate={(values) =>
          makeFormFieldIdsFormikCompatible(
            getValidationErrorsForForm(
              pageFields,
              makeFormikFieldIdsOpenCRVSCompatible(values),
              validatorContext
            )
          )
        }
        onSubmit={() => {}}
      >
        <PageContent ref={ref} />
      </Formik>
    )
  }
)
