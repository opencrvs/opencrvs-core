import * as React from 'react'
import { withFormik, Field, FormikProps, FieldProps } from 'formik'
import { isEqual } from 'lodash'
import { InjectedIntlProps, injectIntl } from 'react-intl'
import {
  TextInput,
  Select,
  RadioGroup,
  CheckboxGroup,
  DateField,
  TextArea,
  SubSectionDivider
} from '@opencrvs/components/lib/forms'
import { Paragraph } from '@opencrvs/components/lib/typography'
import {
  internationaliseFieldObject,
  getConditionalActionsForField,
  getFieldOptions
} from 'src/forms/utils'

import styled, { keyframes } from 'src/styled-components'

import {
  IFormField,
  Ii18nFormField,
  IFormSectionData,
  IFormFieldValue,
  SELECT_WITH_DYNAMIC_OPTIONS,
  SELECT_WITH_OPTIONS,
  RADIO_GROUP,
  CHECKBOX_GROUP,
  DATE,
  TEXTAREA,
  NUMBER,
  SUBSECTION,
  LIST,
  ISelectFormFieldWithDynamicOptions,
  ISelectFormFieldWithOptions,
  PARAGRAPH,
  IMAGE_UPLOADER_WITH_OPTIONS,
  IFileValue
} from 'src/forms'

import { IValidationResult } from 'src/utils/validate'

import { getValidationErrorsForForm } from 'src/forms/validation'
import { InputField } from 'src/components/form/InputField'
import { FormList } from './FormList'
import { ImageUploadField } from './ImageUploadField'

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const FormItem = styled.div`
  margin-bottom: 2em;
  animation: ${fadeIn} 500ms;
`

const FormSectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.lightFont};
  color: ${({ theme }) => theme.colors.copy};
`

type GeneratedInputFieldProps = {
  fieldDefinition: Ii18nFormField
  onSetFieldValue: (name: string, value: IFormFieldValue) => void
  onChange: (e: React.ChangeEvent<any>) => void
  onBlur: (e: React.FocusEvent<any>) => void
  resetDependentSelectValues: (name: string) => void
  value: IFormFieldValue
  touched: boolean
  error: string
}

function GeneratedInputField({
  fieldDefinition,
  onChange,
  onBlur,
  onSetFieldValue,
  resetDependentSelectValues,
  error,
  touched,
  value
}: GeneratedInputFieldProps) {
  const inputFieldProps = {
    id: fieldDefinition.name,
    label: fieldDefinition.label,
    description: fieldDefinition.description,
    required: fieldDefinition.required,
    disabled: fieldDefinition.disabled,
    prefix: fieldDefinition.prefix,
    postfix: fieldDefinition.postfix,
    error,
    touched
  }

  const inputProps = {
    id: fieldDefinition.name,
    onChange,
    onBlur,
    value,
    disabled: fieldDefinition.disabled,
    error: Boolean(error),
    touched: Boolean(touched)
  }

  if (fieldDefinition.type === SELECT_WITH_OPTIONS) {
    return (
      <InputField {...inputFieldProps}>
        <Select
          {...inputProps}
          value={value as string}
          onChange={(val: string) => {
            resetDependentSelectValues(fieldDefinition.name)
            onSetFieldValue(fieldDefinition.name, val)
          }}
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
          onChange={(val: string) => onSetFieldValue(fieldDefinition.name, val)}
          options={fieldDefinition.options}
          name={fieldDefinition.name}
          value={value as string}
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
            onSetFieldValue(fieldDefinition.name, val)
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
          onChange={(val: string) => onSetFieldValue(fieldDefinition.name, val)}
          value={inputProps.value as string}
        />
      </InputField>
    )
  }
  if (fieldDefinition.type === TEXTAREA) {
    return (
      <InputField {...inputFieldProps}>
        <TextArea {...inputProps} />
      </InputField>
    )
  }
  if (fieldDefinition.type === SUBSECTION) {
    return (
      <InputField {...inputFieldProps}>
        <SubSectionDivider label={fieldDefinition.label} />
      </InputField>
    )
  }
  if (fieldDefinition.type === PARAGRAPH) {
    return <Paragraph>{fieldDefinition.label}</Paragraph>
  }
  if (fieldDefinition.type === LIST) {
    return <FormList list={fieldDefinition.items} />
  }
  if (fieldDefinition.type === NUMBER) {
    return (
      <InputField {...inputFieldProps}>
        <TextInput
          type="number"
          step={fieldDefinition.step}
          {...inputProps}
          value={inputProps.value as string}
        />
      </InputField>
    )
  }
  if (fieldDefinition.type === IMAGE_UPLOADER_WITH_OPTIONS) {
    return (
      <ImageUploadField
        id={inputProps.id}
        title={fieldDefinition.label}
        nestedSection={fieldDefinition.nestedSection}
        files={value as IFileValue[]}
        onComplete={(files: IFileValue[]) =>
          onSetFieldValue(fieldDefinition.name, files)
        }
      />
    )
  }

  return (
    <InputField {...inputFieldProps}>
      <TextInput
        type="text"
        {...inputProps}
        value={inputProps.value as string}
      />
    </InputField>
  )
}

const mapFieldsToValues = (fields: IFormField[]) =>
  fields.reduce(
    (memo, field) => ({ ...memo, [field.name]: field.initialValue }),
    {}
  )

interface IFormSectionProps {
  fields: IFormField[]
  title?: string
  id: string
  setAllFieldsDirty: boolean
  onChange: (values: IFormSectionData) => void
}

type Props = IFormSectionProps &
  FormikProps<IFormSectionData> &
  InjectedIntlProps

class FormSectionComponent extends React.Component<Props> {
  componentWillReceiveProps(nextProps: Props) {
    const userChangedForm = !isEqual(nextProps.values, this.props.values)
    const sectionChanged = this.props.id !== nextProps.id

    if (userChangedForm) {
      this.props.onChange(nextProps.values)
    }

    if (sectionChanged) {
      this.props.resetForm()
      if (nextProps.setAllFieldsDirty) {
        this.showValidationErrors(nextProps.fields)
      }
    }
  }
  componentDidMount() {
    if (this.props.setAllFieldsDirty) {
      this.showValidationErrors(this.props.fields)
    }
  }
  showValidationErrors(fields: IFormField[]) {
    const touched = fields.reduce(
      (memo, { name }) => ({ ...memo, [name]: true }),
      {}
    )

    this.props.setTouched(touched)
  }
  handleBlur = (e: React.FocusEvent<any>) => {
    this.props.setFieldTouched(e.target.name)
  }
  resetDependentSelectValues = (fieldName: string) => {
    const fields = this.props.fields
    const fieldToReset = fields.find(
      field =>
        field.type === SELECT_WITH_DYNAMIC_OPTIONS &&
        field.dynamicOptions.dependency === fieldName
    )
    if (fieldToReset) {
      this.props.setFieldValue(fieldToReset.name, '')
    }
  }
  render() {
    const {
      handleSubmit,
      values,
      fields,
      setFieldValue,
      touched,
      id,
      intl,
      title
    } = this.props

    const errors = (this.props.errors as any) as {
      [key: string]: IValidationResult[]
    }

    /*
     * HACK
     *
     * No idea why, but when "fields" prop is changed from outside,
     * "values" still reflect the old version for one render.
     *
     * This causes React to throw an error. You can see this happening by doing:
     *
     * if (fields.length > Object.keys(values).length) {
     *   console.log({ fields, values })
     * }
     */
    const fieldsWithValuesDefined = fields.filter(
      field => values[field.name] !== undefined
    )

    return (
      <section>
        {title && (
          <FormSectionTitle id={`form_section_title_${id}`}>
            {title}
          </FormSectionTitle>
        )}
        <form onSubmit={handleSubmit}>
          {fieldsWithValuesDefined.map(field => {
            let error: string
            const fieldErrors = errors[field.name]
            if (fieldErrors && fieldErrors.length > 0) {
              const [firstError] = fieldErrors
              error = intl.formatMessage(firstError.message, firstError.props)
            }

            const conditionalActions: string[] = getConditionalActionsForField(
              field,
              values
            )

            if (conditionalActions.includes('hide')) {
              return null
            }

            const withDynamicallyGeneratedFields =
              field.type === SELECT_WITH_DYNAMIC_OPTIONS
                ? ({
                    ...field,
                    type: SELECT_WITH_OPTIONS,
                    options: getFieldOptions(
                      field as ISelectFormFieldWithDynamicOptions,
                      values
                    )
                  } as ISelectFormFieldWithOptions)
                : field

            return (
              <FormItem key={`${field.name}`}>
                <Field name={field.name}>
                  {(formikFieldProps: FieldProps<any>) => (
                    <GeneratedInputField
                      fieldDefinition={internationaliseFieldObject(
                        intl,
                        withDynamicallyGeneratedFields
                      )}
                      onSetFieldValue={setFieldValue}
                      resetDependentSelectValues={
                        this.resetDependentSelectValues
                      }
                      {...formikFieldProps.field}
                      touched={touched[field.name] || false}
                      error={error}
                    />
                  )}
                </Field>
              </FormItem>
            )
          })}
        </form>
      </section>
    )
  }
}

export const Form = withFormik<IFormSectionProps, IFormSectionData>({
  mapPropsToValues: props => mapFieldsToValues(props.fields),
  handleSubmit: values => {
    console.log(values)
  },
  validate: (values, props: IFormSectionProps) =>
    getValidationErrorsForForm(props.fields, values)
})(injectIntl(FormSectionComponent))
