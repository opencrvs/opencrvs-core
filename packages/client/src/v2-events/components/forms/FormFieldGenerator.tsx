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
import { FetchButtonField } from '@client/components/form/FetchButton'
import { InputField } from '@client/components/form/InputField'
import {
  BIG_NUMBER,
  BULLET_LIST,
  BUTTON,
  CHECKBOX,
  CHECKBOX_GROUP,
  DATE,
  DATE_RANGE_PICKER,
  DependencyInfo,
  DIVIDER,
  FETCH_BUTTON,
  FIELD_GROUP_TITLE,
  FIELD_WITH_DYNAMIC_DEFINITIONS,
  HEADING3,
  HIDDEN,
  HTTP,
  IDateRangePickerValue,
  IDynamicFormField,
  IFormData,
  IFormField,
  IFormFieldValue,
  IFormSectionData,
  Ii18nButtonFormField,
  Ii18nFormField,
  Ii18nTextFormField,
  InitialValue,
  LINK,
  LOCATION_SEARCH_INPUT,
  NUMBER,
  PARAGRAPH,
  RADIO_GROUP,
  REDIRECT,
  SELECT_WITH_DYNAMIC_OPTIONS,
  SELECT_WITH_OPTIONS,
  SUBSECTION_HEADER,
  TEL,
  TEXT,
  TEXTAREA,
  TIME,
  WARNING
} from '@client/forms'
import { Errors, getValidationErrorsForForm } from '@client/forms/validation'
import { Checkbox, CheckboxGroup } from '@opencrvs/components/lib/Checkbox'
import { DateField } from '@opencrvs/components/lib/DateField'
import { ErrorText } from '@opencrvs/components/lib/ErrorText'
import { Link } from '@opencrvs/components/lib/Link'
import { RadioGroup } from '@opencrvs/components/lib/Radio'
import { Select } from '@opencrvs/components/lib/Select'
import { Text } from '@opencrvs/components/lib/Text'
import { TextArea } from '@opencrvs/components/lib/TextArea'
import { TextInput } from '@opencrvs/components/lib/TextInput'
import { TimeField } from '@opencrvs/components/lib/TimeField'
import * as React from 'react'
import styled, { keyframes } from 'styled-components'
import {
  evalExpressionInFieldDefinition,
  flatten,
  getConditionalActionsForField,
  getDependentFields,
  getFieldType,
  handleInitialValue,
  internationaliseFieldObject,
  unflatten
} from './utils'

import { DateRangePickerForFormField } from '@client/components/DateRangePickerForFormField'
import { ButtonField } from '@client/components/form/Button'
import { RedirectField } from '@client/components/form/Redirect'

import { buttonMessages } from '@client/i18n/messages/buttons'
import { IAdvancedSearchFormState } from '@client/search/advancedSearch/utils'
import { isMobileDevice } from '@client/utils/commonUtils'
import { REGEXP_NUMBER_INPUT_NON_NUMERIC } from '@client/utils/constants'
import { BulletList, Divider } from '@opencrvs/components'
import { Heading2, Heading3 } from '@opencrvs/components/lib/Headings/Headings'
import { LocationSearch } from '@opencrvs/components/lib/LocationSearch'
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

function handleSelectFocus(id: string, isSearchable: boolean) {
  if (isMobileDevice() && isSearchable) {
    setTimeout(() => {
      const inputElement = document.getElementById(`${id}-form-input`)

      if (inputElement) {
        inputElement.scrollIntoView({
          behavior: 'smooth'
        })
      }
    }, 20)
  }
}

type GeneratedInputFieldProps = {
  fieldDefinition: Ii18nFormField
  fields: IFormField[]
  values: IFormSectionData
  setFieldValue: (name: string, value: IFormFieldValue) => void
  onClick?: () => void
  onChange: (e: React.ChangeEvent<any>) => void
  onBlur: (e: React.FocusEvent<any>) => void
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
    const inputFieldProps = {
      id: fieldDefinition.name,
      label: fieldDefinition.label,
      helperText: fieldDefinition.helperText,
      tooltip: fieldDefinition.tooltip,
      description: fieldDefinition.description,
      required: fieldDefinition.required,
      disabled: fieldDefinition.disabled,
      prefix: fieldDefinition.prefix,
      postfix: fieldDefinition.postfix,
      unit: fieldDefinition.unit,
      hideAsterisk: fieldDefinition.hideAsterisk,
      hideInputHeader: fieldDefinition.hideHeader,
      error,
      touched
    }

    const intl = useIntl()
    const onChangeGroupInput = React.useCallback(
      (val: string) => setFieldValue(fieldDefinition.name, val),
      [fieldDefinition.name, setFieldValue]
    )

    const inputProps = {
      id: fieldDefinition.name,
      onChange,
      onBlur,
      value,
      disabled: fieldDefinition.disabled ?? disabled,
      error: Boolean(error),
      touched: Boolean(touched),
      placeholder: fieldDefinition.placeholder
    }
    if (fieldDefinition.type === SELECT_WITH_OPTIONS) {
      return (
        <InputField {...inputFieldProps}>
          <Select
            {...inputProps}
            isDisabled={fieldDefinition.disabled}
            value={value as string}
            onChange={(val: string) => {
              setFieldValue(fieldDefinition.name, val)
              resetDependentSelectValues(fieldDefinition.name)
            }}
            onFocus={() =>
              handleSelectFocus(
                fieldDefinition.name,
                fieldDefinition.options.length > 10
              )
            }
            options={fieldDefinition.options}
          />
        </InputField>
      )
    }

    if (fieldDefinition.type === RADIO_GROUP) {
      return (
        <InputField {...inputFieldProps}>
          <RadioGroup
            {...inputProps}
            size={fieldDefinition.size}
            onChange={(val: string) => {
              resetDependentSelectValues(fieldDefinition.name)
              setFieldValue(fieldDefinition.name, val)
            }}
            options={fieldDefinition.options}
            name={fieldDefinition.name}
            value={value as string}
            notice={fieldDefinition.notice}
            flexDirection={fieldDefinition.flexDirection}
          />
        </InputField>
      )
    }

    if (fieldDefinition.type === CHECKBOX_GROUP) {
      return (
        <InputField {...inputFieldProps}>
          <CheckboxGroup
            {...inputProps}
            options={fieldDefinition.options}
            name={fieldDefinition.name}
            value={value as string[]}
            onChange={(val: string[]) =>
              setFieldValue(fieldDefinition.name, val)
            }
          />
        </InputField>
      )
    }

    if (fieldDefinition.type === CHECKBOX) {
      const { checkedValue = true, uncheckedValue = false } = fieldDefinition
      return (
        <InputField {...inputFieldProps}>
          <Checkbox
            {...inputProps}
            label={fieldDefinition.label}
            name={fieldDefinition.name}
            value={String(value)}
            selected={(value as string) === checkedValue}
            onChange={(event: { target: { value: string } }) =>
              setFieldValue(
                fieldDefinition.name,
                event.target.value === String(checkedValue)
                  ? uncheckedValue
                  : checkedValue
              )
            }
          />
        </InputField>
      )
    }

    if (fieldDefinition.type === DATE) {
      return (
        <InputField {...inputFieldProps}>
          <DateField
            {...inputProps}
            notice={fieldDefinition.notice}
            ignorePlaceHolder={fieldDefinition.ignorePlaceHolder}
            onChange={(val: string) => setFieldValue(fieldDefinition.name, val)}
            value={value as string}
          />
        </InputField>
      )
    }
    if (fieldDefinition.type === TIME) {
      return (
        <InputField {...inputFieldProps}>
          <TimeField
            {...inputProps}
            ignorePlaceHolder={fieldDefinition.ignorePlaceHolder}
            onChange={onChangeGroupInput}
            value={value as string}
          />
        </InputField>
      )
    }
    if (fieldDefinition.type === DATE_RANGE_PICKER) {
      return (
        <InputField {...inputFieldProps}>
          <DateRangePickerForFormField
            inputProps={{ ...inputProps }}
            notice={fieldDefinition.notice}
            ignorePlaceHolder={fieldDefinition.ignorePlaceHolder}
            onChange={(val: IDateRangePickerValue) =>
              setFieldValue(fieldDefinition.name, val)
            }
            value={value as IDateRangePickerValue}
          />
        </InputField>
      )
    }
    if (fieldDefinition.type === TEXTAREA) {
      return (
        <InputField {...inputFieldProps}>
          <TextArea
            {...inputProps}
            maxLength={fieldDefinition.maxLength}
            value={value.toString()}
          />
        </InputField>
      )
    }
    if (fieldDefinition.type === TEL) {
      return (
        <InputField {...inputFieldProps}>
          <TextInput
            type="tel"
            {...inputProps}
            isSmallSized={fieldDefinition.isSmallSized}
            value={inputProps.value as string}
          />
        </InputField>
      )
    }
    if (fieldDefinition.type === DIVIDER) {
      return <Divider />
    }
    if (fieldDefinition.type === HEADING3) {
      return <Heading3>{fieldDefinition.label}</Heading3>
    }
    if (fieldDefinition.type === SUBSECTION_HEADER) {
      return (
        <>
          <Heading2>{fieldDefinition.label}</Heading2>
        </>
      )
    }
    if (fieldDefinition.type === FIELD_GROUP_TITLE) {
      return <Heading3>{fieldDefinition.label}</Heading3>
    }
    if (fieldDefinition.type === PARAGRAPH) {
      const label = fieldDefinition.label as unknown as MessageDescriptor & {
        values: Record<string, string>
      }
      const values = label.values || {}

      const message = intl.formatMessage(label, {
        ...values,
        [fieldDefinition.name]: value as any
      })

      return (
        <Text variant={fieldDefinition.fontVariant ?? 'reg16'} element="p">
          <span dangerouslySetInnerHTML={{ __html: message }} />
        </Text>
      )
    }
    if (fieldDefinition.type === BULLET_LIST) {
      return (
        <BulletList
          font={'reg16'}
          {...inputProps}
          items={fieldDefinition.items}
        />
      )
    }
    if (fieldDefinition.type === NUMBER) {
      return (
        <InputField {...inputFieldProps}>
          <TextInput
            type="number"
            step={fieldDefinition.step}
            max={fieldDefinition.max}
            {...inputProps}
            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key.match(REGEXP_NUMBER_INPUT_NON_NUMERIC)) {
                e.preventDefault()
              }
              const maxLength = fieldDefinition.maxLength
              if (maxLength && e.currentTarget.value.length >= maxLength) {
                e.preventDefault()
              }
            }}
            value={inputProps.value as string}
            maxLength={fieldDefinition.maxLength}
            onWheel={(event: React.WheelEvent<HTMLInputElement>) => {
              event.currentTarget.blur()
            }}
          />
        </InputField>
      )
    }
    if (fieldDefinition.type === BIG_NUMBER) {
      return (
        <InputField {...inputFieldProps}>
          <TextInput
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            step={fieldDefinition.step}
            {...inputProps}
            value={inputProps.value as string}
            onWheel={(event: React.WheelEvent<HTMLInputElement>) => {
              event.currentTarget.blur()
            }}
          />
        </InputField>
      )
    }
    if (fieldDefinition.type === WARNING) {
      return <ErrorText>{fieldDefinition.label}</ErrorText>
    }

    if (fieldDefinition.type === LINK) {
      return (
        <Link
          type="reg16"
          onClick={() => setFieldValue(fieldDefinition.name, true)}
        >
          {fieldDefinition.label}
        </Link>
      )
    }

    if (
      fieldDefinition.type === LOCATION_SEARCH_INPUT &&
      fieldDefinition.locationList
    ) {
      const selectedLocation = fieldDefinition.locationList.find(
        (location) => location.id === value
      )

      return (
        <InputField {...inputFieldProps}>
          <LocationSearch
            buttonLabel={intl.formatMessage(buttonMessages.search)}
            {...inputProps}
            selectedLocation={selectedLocation}
            locationList={fieldDefinition.locationList}
            searchHandler={(item) => {
              setFieldValue(fieldDefinition.name, item.id)
            }}
          />
        </InputField>
      )
    }

    if (fieldDefinition.type === FETCH_BUTTON) {
      return (
        <FetchButtonField
          id={fieldDefinition.name}
          queryData={fieldDefinition.queryData}
          modalTitle={fieldDefinition.modalTitle}
          label={fieldDefinition.label}
          successTitle={fieldDefinition.successTitle}
          errorTitle={fieldDefinition.errorTitle}
          onFetch={fieldDefinition.onFetch}
          isDisabled={disabled}
        />
      )
    }

    if (fieldDefinition.type === REDIRECT) {
      return (
        <RedirectField
          to={fieldDefinition.options.url}
          form={values}
          draft={formData}
        />
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

    if (fieldDefinition.type === HTTP) {
      return null
    }

    if (fieldDefinition.type === BUTTON) {
      return (
        <InputField {...inputFieldProps}>
          <ButtonField
            fields={fields}
            fieldDefinition={fieldDefinition as Ii18nButtonFormField}
            values={values}
            formData={formData}
            setFieldValue={setFieldValue}
            disabled={disabled}
            setFieldTouched={setFieldTouched}
          />
        </InputField>
      )
    }

    return (
      <InputField {...inputFieldProps}>
        <TextInput
          type="text"
          {...inputProps}
          value={inputProps.value as string}
          maxLength={(fieldDefinition as Ii18nTextFormField).maxLength}
          isDisabled={disabled}
        />
      </InputField>
    )
  },

  // This is a hack to workaround slow renders of Selects.
  // A proper solution would not pass new props to this component everytime,
  // rather they should pass the variable / function references.
  // This may be achieved by useMemo / useCallback'ing the props before passing.

  // If the function returns false, props are not equal and it will re-render
  // If function returns true, they are equal and no rerender happens
  (prevProps, nextProps) =>
    prevProps.fieldDefinition.type === 'SELECT_WITH_OPTIONS' &&
    nextProps.fieldDefinition.type === 'SELECT_WITH_OPTIONS' &&
    prevProps.value === nextProps.value &&
    prevProps.touched === nextProps.touched &&
    prevProps.error === nextProps.error &&
    prevProps.disabled === nextProps.disabled &&
    isEqual(
      prevProps.fieldDefinition.options,
      nextProps.fieldDefinition.options
    )
)

GeneratedInputField.displayName = 'MemoizedGeneratedInputField'

type FormData = Record<string, any>

const mapFieldsToValues = (fields: IFormField[], formData: FormData) =>
  fields.reduce((memo, field) => {
    const fieldInitialValue = handleInitialValue(
      field.initialValue as InitialValue,
      formData
    )
    return { ...memo, [field.name]: fieldInitialValue }
  }, {})

type ISetTouchedFunction = (touched: FormikTouched<FormikValues>) => void

type ExposedProps = {
  fields: IFormField[]
  id: string
  fieldsToShowValidationErrors?: IFormField[]
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

  showValidationErrors(fields: IFormField[]) {
    const touched = fields.reduce((memo, field) => {
      return { ...memo, [field.name]: true }
    }, {})

    this.props.setTouched(touched)
  }

  handleBlur = (e: React.FocusEvent<any>) => {
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
        updatedValues[field.name] = evalExpressionInFieldDefinition(
          (field.initialValue as DependencyInfo).expression,
          { $form: updatedValues }
        )
        updateDependentFields(field.name)
      }
    }
    updateDependentFields(fieldName)

    this.props.setValues(updatedValues)
  }

  resetDependentSelectValues = (fieldName: string) => {
    const fields = this.props.fields
    const fieldsToReset = fields.filter(
      (field) =>
        (field.type === SELECT_WITH_DYNAMIC_OPTIONS &&
          field.dynamicOptions.dependency === fieldName) ||
        (field.type === TEXT && field.dependency === fieldName)
    )

    fieldsToReset.forEach((fieldToReset) => {
      this.props.setFieldValue(fieldToReset.name, '')
      this.resetDependentSelectValues(fieldToReset.name)
    })
  }

  render() {
    const { values, fields, setFieldTouched, touched, intl, formData } =
      this.props

    const language = this.props.intl.locale

    const errors = this.props.errors as unknown as Errors

    const sectionName = this.props.id.split('-')[0]

    return (
      <section>
        {fields.map((field) => {
          let error: string
          const fieldErrors = errors[field.name] && errors[field.name].errors

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
          const isDateField =
            field.type === DATE ||
            (field.type === FIELD_WITH_DYNAMIC_DEFINITIONS &&
              getFieldType(field as IDynamicFormField, values) === DATE)

          const isDateRangePickerField = field.type === DATE_RANGE_PICKER

          const dateFields = [
            `${field.name}-dd`,
            `${field.name}-mm`,
            `${field.name}-yyyy`
          ]
          // for date range picker fields
          const dateRangeFields = [
            `${field.name}exact-dd`,
            `${field.name}exact-mm`,
            `${field.name}exact-yyyy`
          ]

          const areFieldsTouched = (fields: string[]) =>
            fields.every((field) => touched[field])

          if (isDateField && areFieldsTouched(dateFields)) {
            touched[field.name] = areFieldsTouched(dateFields)
          }

          if (isDateRangePickerField && areFieldsTouched(dateRangeFields)) {
            touched[field.name] = areFieldsTouched(dateRangeFields)
          }

          const withDynamicallyGeneratedFields = field

          if (
            field.type === FETCH_BUTTON ||
            field.type === FIELD_WITH_DYNAMIC_DEFINITIONS ||
            field.type === SELECT_WITH_DYNAMIC_OPTIONS ||
            field.type === BUTTON
          ) {
            return (
              <FormItem
                key={`${field.name}`}
                ignoreBottomMargin={field.ignoreBottomMargin}
              >
                <Field name={field.name.replaceAll('.', '___')}>
                  {(formikFieldProps: FieldProps<any>) => (
                    <GeneratedInputField
                      fieldDefinition={internationaliseFieldObject(
                        intl,
                        withDynamicallyGeneratedFields
                      )}
                      setFieldValue={this.setFieldValuesWithDependency}
                      setFieldTouched={setFieldTouched}
                      resetDependentSelectValues={
                        this.resetDependentSelectValues
                      }
                      {...formikFieldProps.field}
                      touched={touched[field.name] || false}
                      error={error}
                      fields={fields}
                      values={values}
                      formData={formData}
                      disabled={isFieldDisabled}
                    />
                  )}
                </Field>
              </FormItem>
            )
          } else {
            return (
              <FormItem
                key={`${field.name}${language}`}
                ignoreBottomMargin={field.ignoreBottomMargin}
              >
                <Field name={field.name.replaceAll('.', '___')}>
                  {(formikFieldProps: FieldProps<any>) => {
                    return (
                      <GeneratedInputField
                        fieldDefinition={internationaliseFieldObject(
                          intl,
                          withDynamicallyGeneratedFields
                        )}
                        setFieldValue={this.setFieldValuesWithDependency}
                        setFieldTouched={setFieldTouched}
                        resetDependentSelectValues={
                          this.resetDependentSelectValues
                        }
                        {...formikFieldProps.field}
                        touched={touched[field.name] || false}
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
          }
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

  return (
    <Formik<IFormSectionData>
      initialValues={
        props.initialValues ?? mapFieldsToValues(props.fields, nestedFormData)
      }
      onSubmit={() => {}}
      validate={(values) =>
        getValidationErrorsForForm(
          props.fields,
          values,
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
