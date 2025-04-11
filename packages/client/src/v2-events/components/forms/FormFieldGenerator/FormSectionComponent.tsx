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
import { Field, FieldProps, FormikProps, FormikTouched } from 'formik'
import { cloneDeep, isEqual, set } from 'lodash'
import { WrappedComponentProps as IntlShapeProps } from 'react-intl'
import styled, { keyframes } from 'styled-components'
import {
  EventState,
  EventConfig,
  FieldConfig,
  FieldType,
  FieldValue,
  isFieldEnabled,
  isFieldVisible,
  AddressType,
  TranslationConfig,
  deepMerge
} from '@opencrvs/commons/client'
import { TEXT } from '@client/forms'
import {
  evalExpressionInFieldDefinition,
  getDependentFields,
  hasDefaultValueDependencyInfo,
  makeDatesFormatted,
  makeFormFieldIdFormikCompatible
} from '@client/v2-events/components/forms/utils'
import {
  makeFormFieldIdsFormikCompatible,
  makeFormikFieldIdsOpenCRVSCompatible
} from './utils'
import { GeneratedInputField } from './GeneratedInputField'

type AllProps = {
  id: string
  declaration?: EventState
  eventConfig?: EventConfig
  fields: FieldConfig[]

  className?: string
  readonlyMode?: boolean
  errors: Record<string, { errors: { message: TranslationConfig }[] }>
  onChange: (values: EventState) => void
  setAllFieldsDirty: boolean
  setAllTouchedFields: (touchedFields: FormikTouched<EventState>) => void
  fieldsToShowValidationErrors?: FieldConfig[]
} & IntlShapeProps &
  UsedFormikProps

type UsedFormikProps = Pick<
  FormikProps<EventState>,
  | 'values'
  | 'setTouched'
  | 'setValues'
  | 'touched'
  | 'resetForm'
  | 'setFieldValue'
>

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const FormItem = styled.div<{
  ignoreBottomMargin?: boolean
}>`
  animation: ${fadeIn} 500ms;
  margin-bottom: ${({ ignoreBottomMargin }) =>
    ignoreBottomMargin ? '0px' : '22px'};
`

export class FormSectionComponent extends React.Component<AllProps> {
  componentDidUpdate(prevProps: AllProps) {
    const userChangedForm = !isEqual(this.props.values, prevProps.values)
    const sectionChanged = prevProps.id !== this.props.id

    if (userChangedForm) {
      prevProps.onChange(this.props.values)
    }

    if (sectionChanged) {
      prevProps.resetForm()
      if (this.props.setAllFieldsDirty) {
        this.showValidationErrors(this.props.fields)
      } else if (
        this.props.fieldsToShowValidationErrors &&
        this.props.fieldsToShowValidationErrors.length > 0
      ) {
        this.showValidationErrors(this.props.fieldsToShowValidationErrors)
      }
    }
  }

  componentDidMount() {
    if (this.props.setAllFieldsDirty) {
      this.showValidationErrors(this.props.fields)
    }

    if (window.location.hash) {
      setTimeout(() => {
        const newScroll = document.documentElement.scrollTop - 100
        window.scrollTo(0, newScroll)

        const focusedElementId = window.location.hash.replace('#', '')
        let focusedElement = document.querySelector(
          `input[id*="${focusedElementId}"]`
        ) as HTMLElement | null

        if (focusedElement === null) {
          // Handling for Select
          focusedElement = document.querySelector(
            `${window.location.hash} input`
          ) as HTMLElement | null

          focusedElement?.focus()
        } else {
          // Handling for Input
          focusedElement.focus()
        }
      }, 0)
    }
  }

  showValidationErrors(fields: FieldConfig[]) {
    const touched = fields.reduce((memo, field) => {
      return { ...memo, [field.id]: true }
    }, {})

    void this.props.setTouched(touched)
  }

  setFieldValuesWithDependency = (
    fieldId: string,
    value: FieldValue | undefined
  ) => {
    const updatedValues = cloneDeep(this.props.values)
    set(updatedValues, fieldId, value)

    if (fieldId === 'country') {
      set(
        updatedValues,
        'addressType',
        value === (window.config.COUNTRY || 'FAR')
          ? AddressType.DOMESTIC
          : AddressType.INTERNATIONAL
      )
    }
    const updateDependentFields = (id: string) => {
      const dependentFields = getDependentFields(this.props.fields, id)
      for (const field of dependentFields) {
        if (
          !field.defaultValue ||
          !hasDefaultValueDependencyInfo(field.defaultValue)
        ) {
          continue
        }

        updatedValues[field.id] = evalExpressionInFieldDefinition(
          field.defaultValue.expression,
          { $form: updatedValues }
        )
        updateDependentFields(field.id)
      }
    }

    updateDependentFields(fieldId)

    void this.props.setValues(updatedValues)
  }

  resetDependentSelectValues = (fieldId: string) => {
    const fields = this.props.fields
    const fieldsToReset = fields.filter(
      (field) => field.type === TEXT && field.dependsOn?.includes(fieldId)
    )

    fieldsToReset.forEach((fieldToReset) => {
      void this.props.setFieldValue(fieldToReset.id, '')
      this.resetDependentSelectValues(fieldToReset.id)
    })
  }

  render() {
    const {
      values,
      fields: fieldsWithDotIds,
      touched,
      intl,
      className,
      declaration,
      readonlyMode
    } = this.props

    const language = this.props.intl.locale

    const errors = makeFormFieldIdsFormikCompatible(this.props.errors)

    const fields = fieldsWithDotIds.map((field) => ({
      ...field,
      id: makeFormFieldIdFormikCompatible(field.id)
    }))

    const valuesWithFormattedDate = makeDatesFormatted(fieldsWithDotIds, values)
    const form = makeFormikFieldIdsOpenCRVSCompatible(valuesWithFormattedDate)

    const completeForm = deepMerge(declaration ?? {}, form)

    return (
      <section className={className}>
        {fields.map((field) => {
          let error: string
          const visibleError = errors[field.id]?.errors[0]?.message

          if (visibleError) {
            error = intl.formatMessage(visibleError)
          }

          if (!isFieldVisible(field, completeForm)) {
            return null
          }

          const isDisabled = !isFieldEnabled(field, completeForm)

          return (
            <FormItem
              key={`${field.id}${language}`}
              ignoreBottomMargin={field.type === FieldType.PAGE_HEADER}
            >
              <Field name={field.id}>
                {}
                {(formikFieldProps: FieldProps) => {
                  return (
                    <GeneratedInputField
                      {...formikFieldProps.field}
                      disabled={isDisabled}
                      error={isDisabled ? '' : error}
                      eventConfig={this.props.eventConfig}
                      fieldDefinition={field}
                      form={completeForm}
                      readonlyMode={readonlyMode}
                      setFieldValue={this.setFieldValuesWithDependency}
                      touched={touched[field.id] ?? false}
                    />
                  )
                }}
              </Field>
            </FormItem>
          )
        })}
      </section>
    )
  }
}
