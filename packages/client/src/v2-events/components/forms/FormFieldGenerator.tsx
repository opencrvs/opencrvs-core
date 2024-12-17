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
import { InputField } from '@client/components/form/InputField'
import {
  DATE,
  HIDDEN,
  IFormFieldValue,
  IFormSectionData,
  PARAGRAPH,
  TEXT
} from '@client/forms'
import { IAdvancedSearchFormState } from '@client/search/advancedSearch/utils'
import { DateField } from '@opencrvs/components/lib/DateField'
import { Text } from '@opencrvs/components/lib/Text'
import { TextInput } from '@opencrvs/components/lib/TextInput'
import * as React from 'react'
import styled, { keyframes } from 'styled-components'
import {
  evalExpressionInFieldDefinition,
  flatten,
  getConditionalActionsForField,
  getDependentFields,
  handleInitialValue,
  hasInitialValueDependencyInfo,
  unflatten
} from './utils'
import { Errors, getValidationErrorsForForm } from './validation'

import { FieldConfig } from '@opencrvs/commons'
import {
  Field,
  FieldProps,
  Formik,
  FormikProps,
  FormikTouched,
  FormikValues
} from 'formik'
import { cloneDeep, isEqual, set } from 'lodash'
import {
  WrappedComponentProps as IntlShapeProps,
  MessageDescriptor,
  useIntl
} from 'react-intl'

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

type GeneratedInputFieldProps = {
  fieldDefinition: FieldConfig
  fields: FieldConfig[]
  values: IFormSectionData
  setFieldValue: (name: string, value: IFormFieldValue) => void
  onClick?: () => void
  onChange: (e: React.ChangeEvent) => void
  onBlur: (e: React.FocusEvent) => void
  resetDependentSelectValues: (name: string) => void
  value: IFormFieldValue
  touched: boolean
  error: string
  formData: IFormSectionData
  disabled?: boolean
  onUploadingStateChanged?: (isUploading: boolean) => void
  requiredErrorMessage?: MessageDescriptor
  setFieldTouched: (name: string, isTouched?: boolean) => void
}

const GeneratedInputField = React.memo<GeneratedInputFieldProps>(
  ({
    fieldDefinition,
    onChange,
    onBlur,
    setFieldValue,
    resetDependentSelectValues,
    error,
    touched,
    value,
    formData,
    disabled,
    setFieldTouched,
    requiredErrorMessage,
    fields,
    values
  }) => {
    const intl = useIntl()

    const inputFieldProps = {
      id: fieldDefinition.id,
      label: intl.formatMessage(fieldDefinition.label),
      // helperText: fieldDefinition.helperText,
      // tooltip: fieldDefinition.tooltip,
      // description: fieldDefinition.description,
      required: fieldDefinition.required,
      disabled: fieldDefinition.disabled,
      // prefix: fieldDefinition.prefix,
      // postfix: fieldDefinition.postfix,
      // unit: fieldDefinition.unit,
      // hideAsterisk: fieldDefinition.hideAsterisk,
      // hideInputHeader: fieldDefinition.hideHeader,
      error,
      touched
    }

    const inputProps = {
      id: fieldDefinition.id,
      name: fieldDefinition.id,
      onChange,
      onBlur,
      value,
      disabled: fieldDefinition.disabled ?? disabled,
      error: Boolean(error),
      touched: Boolean(touched),
      placeholder:
        fieldDefinition.placeholder &&
        intl.formatMessage(fieldDefinition.placeholder)
    }

    if (fieldDefinition.type === DATE) {
      return (
        <InputField {...inputFieldProps}>
          <DateField
            {...inputProps}
            onChange={(val: string) => setFieldValue(fieldDefinition.id, val)}
            value={value as string}
          />
        </InputField>
      )
    }

    if (fieldDefinition.type === PARAGRAPH) {
      const label = fieldDefinition.label as unknown as MessageDescriptor & {
        values: Record<string, string>
      }
      const values = label.values || {}

      const message = intl.formatMessage(label, {
        ...values,
        [fieldDefinition.id]: value as any
      })

      return (
        <Text
          variant={fieldDefinition.options.fontVariant ?? 'reg16'}
          element="p"
        >
          <span dangerouslySetInnerHTML={{ __html: message }} />
        </Text>
      )
    }

    if (fieldDefinition.type === HIDDEN) {
      const { error, touched, ...allowedInputProps } = inputProps

      return (
        <input
          type="hidden"
          {...allowedInputProps}
          value={inputProps.value as string}
        />
      )
    }
    if (fieldDefinition.type === TEXT) {
      return (
        <InputField {...inputFieldProps}>
          <TextInput
            type="text"
            {...inputProps}
            value={inputProps.value as string}
            maxLength={fieldDefinition.options?.maxLength}
            isDisabled={disabled}
          />
        </InputField>
      )
    }
    return <div>Unsupported field type {fieldDefinition.type}</div>
  }
)

GeneratedInputField.displayName = 'MemoizedGeneratedInputField'

type FormData = Record<string, IFormFieldValue>

const mapFieldsToValues = (fields: FieldConfig[], formData: FormData) =>
  fields.reduce((memo, field) => {
    const fieldInitialValue = handleInitialValue(field, formData)
    return { ...memo, [field.id]: fieldInitialValue }
  }, {})

type ISetTouchedFunction = (touched: FormikTouched<FormikValues>) => void

type ExposedProps = {
  fields: FieldConfig[]
  id: string
  fieldsToShowValidationErrors?: FieldConfig[]
  setAllFieldsDirty: boolean
  onChange: (values: IFormSectionData) => void
  formData: Record<string, IFormFieldValue>
  onSetTouched?: (func: ISetTouchedFunction) => void
  requiredErrorMessage?: MessageDescriptor
  onUploadingStateChanged?: (isUploading: boolean) => void
  initialValues?: IAdvancedSearchFormState
}

type AllProps = ExposedProps & IntlShapeProps & FormikProps<IFormSectionData>

class FormSectionComponent extends React.Component<AllProps> {
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

  async componentDidMount() {
    if (this.props.setAllFieldsDirty) {
      this.showValidationErrors(this.props.fields)
    }

    if (this.props.onSetTouched) {
      this.props.onSetTouched(this.props.setTouched)
    }

    if (window.location.hash) {
      setTimeout(() => {
        const newScroll = document.documentElement.scrollTop - 100
        window.scrollTo(0, newScroll)

        const focusedElementId = window.location.hash.replace('#', '')
        let focusedElement = document.querySelector(
          `input[id*="${focusedElementId}"]`
        ) as HTMLElement
        if (focusedElement === null) {
          // Handling for Select
          focusedElement = document.querySelector(
            `${window.location.hash} input`
          ) as HTMLElement
          focusedElement && focusedElement.focus()
        } else {
          // Handling for Input
          focusedElement && focusedElement.focus()
        }
      }, 0)
    }
  }

  showValidationErrors(fields: FieldConfig[]) {
    const touched = fields.reduce((memo, field) => {
      return { ...memo, [field.id]: true }
    }, {})

    this.props.setTouched(touched)
  }

  handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    this.props.setFieldTouched(e.target.name)
  }

  setFieldValuesWithDependency = (
    fieldName: string,
    value: IFormFieldValue
  ) => {
    const updatedValues = cloneDeep(this.props.values)
    set(updatedValues, fieldName, value)
    const updateDependentFields = (fieldName: string) => {
      const dependentFields = getDependentFields(this.props.fields, fieldName)
      for (const field of dependentFields) {
        if (
          !field.initialValue ||
          !hasInitialValueDependencyInfo(field.initialValue)
        ) {
          continue
        }

        updatedValues[field.id] = evalExpressionInFieldDefinition(
          field.initialValue.expression,
          { $form: updatedValues }
        )
        updateDependentFields(field.id)
      }
    }
    updateDependentFields(fieldName)

    this.props.setValues(updatedValues)
  }

  resetDependentSelectValues = (fieldName: string) => {
    const fields = this.props.fields
    const fieldsToReset = fields.filter(
      (field) => field.type === TEXT && field.dependsOn?.includes(fieldName)
    )

    fieldsToReset.forEach((fieldToReset) => {
      this.props.setFieldValue(fieldToReset.id, '')
      this.resetDependentSelectValues(fieldToReset.id)
    })
  }

  render() {
    const { values, fields, setFieldTouched, touched, intl, formData } =
      this.props

    const language = this.props.intl.locale

    const errors = this.props.errors as unknown as Errors

    return (
      <section>
        {fields.map((field) => {
          let error: string
          const fieldErrors = errors[field.id] && errors[field.id].errors

          if (fieldErrors && fieldErrors.length > 0) {
            const [firstError] = fieldErrors
            error = intl.formatMessage(firstError.message, firstError.props)
          }

          const conditionalActions: string[] = getConditionalActionsForField(
            field,
            { ...formData, ...values }
          )

          if (conditionalActions.includes('hide')) {
            return null
          }

          const isFieldDisabled = conditionalActions.includes('disable')

          return (
            <FormItem key={`${field.id}${language}`}>
              <Field name={field.id}>
                {(formikFieldProps: FieldProps<any>) => {
                  return (
                    <GeneratedInputField
                      fieldDefinition={field}
                      setFieldValue={this.setFieldValuesWithDependency}
                      setFieldTouched={setFieldTouched}
                      resetDependentSelectValues={
                        this.resetDependentSelectValues
                      }
                      {...formikFieldProps.field}
                      touched={flatten(touched)[field.id] || false}
                      error={isFieldDisabled ? '' : error}
                      formData={formData}
                      fields={fields}
                      values={values}
                      disabled={isFieldDisabled}
                      onUploadingStateChanged={
                        this.props.onUploadingStateChanged
                      }
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

export const FormFieldGenerator: React.FC<ExposedProps> = (props) => {
  const intl = useIntl()

  const nestedFormData = unflatten(props.formData)

  const onChange = (values: IFormSectionData) => {
    props.onChange(flatten(values))
  }

  const initialValues = unflatten<IFormFieldValue>(
    props.initialValues ?? mapFieldsToValues(props.fields, nestedFormData)
  )

  return (
    <Formik<IFormSectionData>
      initialValues={initialValues}
      onSubmit={() => {}}
      validate={(values) =>
        getValidationErrorsForForm(
          props.fields,
          flatten(values),
          props.requiredErrorMessage
        )
      }
    >
      {(formikProps) => {
        return (
          <FormSectionComponent
            {...props}
            {...formikProps}
            intl={intl}
            formData={nestedFormData}
            onChange={onChange}
          />
        )
      }}
    </Formik>
  )
}
