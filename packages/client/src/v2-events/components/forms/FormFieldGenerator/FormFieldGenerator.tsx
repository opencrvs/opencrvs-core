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

import React, { forwardRef, useImperativeHandle, useRef } from 'react'
import { Formik, FormikProps, FormikTouched } from 'formik'
import { noop, pick } from 'lodash'
import { useIntl } from 'react-intl'
import {
  buildFormState,
  EventConfig,
  EventState,
  FieldConfig,
  FieldType,
  flattenFormState,
  FormState,
  IndexMap,
  mapFormState,
  ValidatorContext
} from '@opencrvs/commons/client'
import { getValidationErrorsForForm } from '@client/v2-events/components/forms/validation'
import { useFormInitialValues } from '@client/v2-events/hooks/useFormInitialValues'
import {
  makeFormFieldIdsFormikCompatible,
  makeFormikFieldIdsOpenCRVSCompatible
} from './utils'
import { FormSectionComponent } from './FormSectionComponent'

export interface FormFieldGeneratorHandle {
  /**
   *  @param extraValues optional extra values that are included in the
   *  payload that's bubbled up using onFormChange
   *  Submit does four things:
   *  1. Marks all the current page fields as touched and bubbles that change
   *  using onTouchedChange if provided.
   *  2. Bubbles the current page values up (along with the extra values) using
   *  onFormChange if provided.
   *  3. If there are no errors present in the form for the currently visible
   *  fields, calls the onValidSubmit callback if provided.
   *  4. Returns the form errors
   */
  submit: (extraValues?: EventState) => string[]
}

export interface FormFieldGeneratorPropsWithoutRef {
  /** form id */
  id: string
  readonlyMode?: boolean
  className?: string
  /**
   * Read only context values that are made available in the
   * form validations/conditionals
   */
  formContext?: EventState
  attachmentPath?: string
  /** Which fields are generated */
  fields: FieldConfig[]
  eventConfig?: EventConfig
  /** Full form values, the page values are plucked out of it */
  formValues?: EventState
  /** Full form touched values, the page touched values are plucked out of it */
  formTouched?: IndexMap<FormState<boolean>>
  onFormChange?: (values: EventState) => void
  onTouchedChange?: (touched: IndexMap<FormState<boolean>>) => void
  /** Called when the form is submitted and all fields are valid */
  onValidSubmit?: () => void
  isCorrection?: boolean
  validatorContext: ValidatorContext
}

export const FormFieldGenerator = forwardRef<
  FormFieldGeneratorHandle,
  FormFieldGeneratorPropsWithoutRef
>(
  (
    {
      onFormChange,
      onTouchedChange,
      fields,
      formContext,
      formValues,
      className,
      eventConfig,
      attachmentPath = '',
      readonlyMode,
      id,
      onValidSubmit,
      isCorrection = false,
      formTouched,
      validatorContext
    },
    ref
  ) => {
    const formikRef = useRef<FormikProps<EventState>>(null)

    const fullForm = { ...formContext, ...formValues }

    useImperativeHandle(ref, () => ({
      /*
       * Most of this function can be replaced with a call to `formik.submit` if
       * the initialValues provided to formik contains initial values for all
       * the fields as `formik.submit` uses that as basis for figuring out all
       * the fields that need to be touched during submit, while the
       * onValidSubmit could be passed as the onSubmit callback. Currently we
       * are simulating most of it by hand.
       */
      submit: (extraValues?: EventState) => {
        const allTouched = buildFormState(fields, (field) => {
          if (field.type === FieldType.NAME) {
            return {
              firstname: true,
              middlename: true,
              surname: true
            }
          } else if (field.type === FieldType.ADDRESS) {
            return {
              country: true,
              administrativeArea: true,
              streetLevelDetails: (
                field.configuration?.streetAddressForm ?? []
              ).reduce(
                (acc, streetField) => {
                  acc[streetField.id] = true
                  return acc
                },
                {} as Record<string, boolean>
              )
            }
          }
          return true
        }) as FormikTouched<EventState>

        void formikRef.current?.setTouched(
          makeFormFieldIdsFormikCompatible(allTouched)
        )
        onTouchedChange?.({ ...formTouched, ...allTouched })
        onFormChange?.({
          ...formValues,
          ...(formikRef.current?.values &&
            makeFormikFieldIdsOpenCRVSCompatible(formikRef.current.values)),
          ...extraValues
        })
        const currentErrors = flattenFormState(formikRef.current?.errors)
          .map(([, errs]) => errs)
          .filter((err) => err !== undefined)
        if (currentErrors.length === 0) {
          onValidSubmit?.()
        }
        return currentErrors
      }
    }))
    const intl = useIntl()
    const { getInitialValues } = useFormInitialValues()
    const initialValues = getInitialValues(fields, formValues ?? {}, {
      validator: validatorContext,
      form: formContext ?? {}
    })
    const formikCompatibleInitialValues =
      makeFormFieldIdsFormikCompatible(initialValues)
    const formikCompatibleInitialTouched = makeFormFieldIdsFormikCompatible(
      pick(
        formTouched,
        fields.map((field) => field.id)
      )
    )

    return (
      <Formik<EventState>
        enableReinitialize={true}
        initialTouched={
          // Our form values are nested but to make the implementation easier,
          // we manually assert the value to be nested only when dealing with
          // field groups e.g. form group, name, address etc.
          formikCompatibleInitialTouched as Record<string, boolean>
        }
        initialValues={formikCompatibleInitialValues}
        innerRef={formikRef}
        validate={(values) =>
          makeFormFieldIdsFormikCompatible(
            mapFormState(
              getValidationErrorsForForm(
                fields,
                {
                  ...fullForm,
                  ...makeFormikFieldIdsOpenCRVSCompatible(values)
                },
                validatorContext
              ),
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              (errs) => errs[0]?.message && intl.formatMessage(errs[0].message)
            )
          )
        }
        validateOnChange={false}
        validateOnMount={true}
        onSubmit={noop}
      >
        {(formikProps) => {
          return (
            <FormSectionComponent
              attachmentPath={attachmentPath}
              className={className}
              eventConfig={eventConfig}
              fields={fields}
              fullForm={{
                ...fullForm,
                ...makeFormikFieldIdsOpenCRVSCompatible(formikProps.values)
              }}
              id={id}
              isCorrection={isCorrection}
              readonlyMode={readonlyMode}
              resetForm={formikProps.resetForm}
              setTouched={formikProps.setTouched}
              setValues={formikProps.setValues}
              touched={formikProps.touched}
              validatorContext={validatorContext}
              values={formikProps.values}
              onFormChange={(cb) => onFormChange?.(cb(formValues ?? {}))}
              onTouchedChange={(cb) => onTouchedChange?.(cb(formTouched ?? {}))}
            />
          )
        }}
      </Formik>
    )
  }
)
