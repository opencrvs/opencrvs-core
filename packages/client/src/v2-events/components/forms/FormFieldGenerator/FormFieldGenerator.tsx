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
import { useDefaultValue } from '@client/v2-events/hooks/useDefaultValue'
import {
  makeFormFieldIdsFormikCompatible,
  makeFormikFieldIdsOpenCRVSCompatible
} from './utils'
import { FormSectionComponent } from './FormSectionComponent'

export interface FormFieldGeneratorHandle {
  submit: (extraValues?: EventState) => string[]
}

export interface FormFieldGeneratorProps {
  /** form id */
  id: string
  readonlyMode?: boolean
  className?: string
  /**
   * Read only context values that are made available in the
   * form validations/conditionals
   */
  formContext?: EventState
  /** Which fields are generated */
  fields: FieldConfig[]
  eventConfig?: EventConfig
  /** Full form values, the page values are plucked out of it */
  formValues?: EventState
  /** Full form touched values, the page values are plucked out of it */
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
  FormFieldGeneratorProps
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
    const getDefaultValues = useDefaultValue()
    const defaultPageValues = getDefaultValues(fields)

    //@todo: move the logic inside NAME field
    // const updateTouchFields = (
    //   touched: FormikTouched<Record<string, boolean | undefined>>
    // ) => {
    //   const newlyTouched =
    //     Object.keys(touched).length > 0 &&
    //     !isEqual(touched, touchedFields) &&
    //     Object.keys(touched).filter((key) => !(key in touchedFields))
    //
    //   if (newlyTouched && newlyTouched.length > 0) {
    //     const newlyTouchedFields = parentId
    //       ? newlyTouched.reduce((prev, fieldId) => {
    //           let markParentDirty = false
    //           if (eventConfig) {
    //             const fieldConfig = getDeclarationFields(eventConfig).find(
    //               (x) => x.id === makeFormikFieldIdOpenCRVSCompatible(parentId)
    //             )
    //             /**
    //              * For NAME fields with hideSubFieldError enabled, we need to mark its parent as dirty to ensure proper validation error
    //              * message is shown at Name field level, since subfield validation error message is hidden
    //              */
    //             markParentDirty =
    //               fieldConfig?.type === FieldType.NAME &&
    //               !!fieldConfig.configuration?.showParentFieldError
    //           }
    //
    //           return {
    //             ...prev,
    //             /**
    //              * If we are touching  `firstname` from `child____name`,
    //              * we mark `child____name____firstname` as dirty
    //              */
    //             [joinValues([parentId, fieldId], FIELD_SEPARATOR)]: true,
    //             ...(markParentDirty && {
    //               [parentId]: true
    //             })
    //           }
    //         }, {})
    //       : touched
    //   }
    //   setAllTouchedFields(deepMerge(touchedFields, touched))
    // }

    const formikCompatibleInitialValues = makeFormFieldIdsFormikCompatible({
      ...defaultPageValues,
      ...pick(
        formValues,
        fields.map((field) => field.id)
      )
    })
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
        validateOnMount={true}
        onSubmit={noop}
      >
        {(formikProps) => {
          return (
            <FormSectionComponent
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
              setErrors={formikProps.setErrors}
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
