import * as React from 'react'
import { withFormik, FormikProps } from 'formik'
import { isEqual } from 'lodash'
import { InjectedIntlProps, injectIntl } from 'react-intl'

import {
  InputField,
  TextInput,
  Select,
  DateField,
  TextArea,
  ISelectProps,
  IDateFieldProps,
  ITextInputProps,
  IInputFieldProps,
  RadioGroup
} from '@opencrvs/components/lib/forms'
import styled from '../../styled-components'
import {
  IFormField,
  Ii18nFormField,
  Ii18nSelectOption,
  IFormSectionData
} from '../../forms'
import { Omit } from '../../utils'
import { IValidationResult } from '../../utils/validate'
import {
  localizeInput,
  MetaPropsWithMessageDescriptors
} from '../../i18n/components/localizeInput'
import { getValidationErrorsForForm } from '../../forms/validation'

const FormItem = styled.div`
  margin-bottom: 2em;
`

const FormSectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.lightFont};
  color: ${({ theme }) => theme.colors.copy};
`

type InputProps = ISelectProps | ITextInputProps | IDateFieldProps

type GeneratedInputFieldProps = {
  field: Ii18nFormField
  setFieldValue: (name: string, value: string) => void
  onChange: (e: React.ChangeEvent<any>) => void
  meta: MetaPropsWithMessageDescriptors
} & Omit<Omit<IInputFieldProps, 'id'>, 'meta'> &
  InputProps

const LocalizedInputField = localizeInput(InputField)

function GeneratedInputField({
  field,
  onChange,
  setFieldValue,
  ...props
}: GeneratedInputFieldProps) {
  if (field.type === 'select') {
    return (
      <LocalizedInputField
        component={Select}
        id={field.name}
        onChange={(value: string) => setFieldValue(field.name, value)}
        {...field}
        {...props}
      />
    )
  }
  if (field.type === 'radioGroup') {
    return (
      <LocalizedInputField
        component={RadioGroup}
        id={field.name}
        onChange={(value: string) => setFieldValue(field.name, value)}
        {...field}
        {...props}
      />
    )
  }

  if (field.type === 'date') {
    return (
      <LocalizedInputField
        onChange={(value: string) => setFieldValue(field.name, value)}
        component={DateField}
        id={field.name}
        {...field}
        {...props}
      />
    )
  }
  if (field.type === 'textarea') {
    return (
      <LocalizedInputField
        component={TextArea}
        onChange={onChange}
        id={field.name}
        {...field}
        {...props}
      />
    )
  }
  return (
    <LocalizedInputField
      component={TextInput}
      id={field.name}
      onChange={onChange}
      {...field}
      {...props}
    />
  )
}

const mapFieldsToValues = (fields: IFormField[]) =>
  fields.reduce(
    (memo, field) => ({ ...memo, [field.name]: field.initialValue }),
    {}
  )

interface IFormSectionProps {
  fields: IFormField[]
  title: string
  id: string
  showValidationErrors: boolean
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
      this.showValidationErrors(nextProps.fields)
    }
  }
  componentDidMount() {
    this.showValidationErrors(this.props.fields)
  }
  showValidationErrors(fields: IFormField[]) {
    const touched = fields.reduce(
      (memo, { name }) => ({ ...memo, [name]: true }),
      {}
    )

    this.props.setTouched(touched)
  }
  render() {
    const {
      handleSubmit,
      handleChange,
      handleBlur,
      values,
      fields,
      setFieldValue,
      touched,
      id,
      intl,
      title
    } = this.props

    const errors = this.props.errors as {
      [key: string]: IValidationResult[]
    }

    function internationaliseFieldObject(field: IFormField): Ii18nFormField {
      return {
        ...field,
        label: intl.formatMessage(field.label),
        options: field.options
          ? field.options.map(opt => {
              return {
                ...opt,
                label: intl.formatMessage(opt.label)
              } as Ii18nSelectOption
            })
          : undefined
      } as Ii18nFormField
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
        <FormSectionTitle id={`form_section_title_${id}`}>
          {title}
        </FormSectionTitle>
        <form onSubmit={handleSubmit}>
          {fieldsWithValuesDefined.map(field => {
            const meta = {
              touched: touched[field.name]
            } as MetaPropsWithMessageDescriptors

            const fieldErrors = errors[field.name]
            if (fieldErrors && fieldErrors.length > 0) {
              const [firstError] = fieldErrors
              meta.error = firstError
            }

            return (
              <FormItem key={`${field.name}`}>
                <GeneratedInputField
                  field={internationaliseFieldObject(field)}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  setFieldValue={setFieldValue}
                  value={values[field.name]}
                  meta={meta}
                />
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
  validate: (values, props: IFormSectionProps) => {
    if (!props.showValidationErrors) {
      return {}
    }

    return getValidationErrorsForForm(props.fields, values)
  }
})(injectIntl(FormSectionComponent))
