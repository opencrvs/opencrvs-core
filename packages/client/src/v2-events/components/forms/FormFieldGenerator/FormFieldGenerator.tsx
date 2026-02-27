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
import { Formik } from 'formik'
import { noop, pick } from 'lodash'
import { useIntl } from 'react-intl'
import {
  EventConfig,
  EventState,
  FieldConfig,
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

export interface FormFieldGeneratorProps {
  /** form id */
  id: string
  fieldsToShowValidationErrors?: FieldConfig[]
  validateAllFields?: boolean
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
  onAllFieldsValidated?: (success: boolean) => void
  isCorrection?: boolean
  validatorContext: ValidatorContext
}

export const FormFieldGenerator: React.FC<FormFieldGeneratorProps> = React.memo(
  ({
    onFormChange,
    onTouchedChange,
    fields,
    formContext,
    formValues,
    className,
    eventConfig,
    fieldsToShowValidationErrors,
    validateAllFields = false,
    readonlyMode,
    id,
    onAllFieldsValidated,
    isCorrection = false,
    formTouched,
    validatorContext
  }) => {
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
        validate={(values) =>
          makeFormFieldIdsFormikCompatible(
            mapFormState(
              getValidationErrorsForForm(
                fields,
                {
                  ...formContext,
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
              errors={formikProps.errors}
              eventConfig={eventConfig}
              fields={fields}
              fieldsToShowValidationErrors={fieldsToShowValidationErrors}
              formContext={formContext}
              fullForm={{
                ...formValues,
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
              validateAllFields={validateAllFields}
              validatorContext={validatorContext}
              values={formikProps.values}
              onAllFieldsValidated={onAllFieldsValidated}
              onFormChange={(cb) => onFormChange?.(cb(formValues ?? {}))}
              onTouchedChange={(cb) => onTouchedChange?.(cb(formTouched ?? {}))}
            />
          )
        }}
      </Formik>
    )
  }
)
