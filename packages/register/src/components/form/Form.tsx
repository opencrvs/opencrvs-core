import * as React from 'react'
import { withFormik, FormikProps } from 'formik'
import { isEqual } from 'lodash'
import { InjectedIntlProps, injectIntl, FormattedMessage } from 'react-intl'
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
  RadioGroup,
  SubSectionDivider,
  CheckboxGroup
} from '@opencrvs/components/lib/forms'
import {
  internationaliseFieldObject,
  getConditionalActionsForField
} from 'src/forms/utils'
import styled, { keyframes } from 'src/styled-components'
import { IFormField, Ii18nFormField, IFormSectionData } from 'src/forms'
import { Omit } from 'src/utils'
import { IValidationResult } from 'src/utils/validate'
import {
  localizeInput,
  MetaPropsWithMessageDescriptors
} from 'src/i18n/components/localizeInput'
import { getValidationErrorsForForm } from 'src/forms/validation'
import { addressOptions } from 'src/forms/address'

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
const DocumentUpload = styled.img`
  width: 100%;
`

type InputProps = ISelectProps | ITextInputProps | IDateFieldProps

type GeneratedInputFieldProps = {
  field: Ii18nFormField
  onSetFieldValue: (name: string, value: string | string[]) => void
  onChange: (e: React.ChangeEvent<any>) => void
  meta: MetaPropsWithMessageDescriptors
  description?: FormattedMessage.MessageDescriptor
} & Omit<IInputFieldProps, 'id' | 'meta'> &
  InputProps

const LocalizedInputField = localizeInput(InputField)

const getDynamicSelectOptions = (
  field: IFormField,
  values: IFormSectionData
) => {
  switch (field.name) {
    case 'district':
      return addressOptions[values.state].districts

    case 'districtPermanent':
      return addressOptions[values.statePermanent].districts

    case 'addressLine4':
      if (
        addressOptions[values.state][values.district] &&
        addressOptions[values.state][values.district].upazilas
      ) {
        return addressOptions[values.state][values.district].upazilas
      } else {
        return []
      }
    case 'addressLine4Permanent':
      if (
        addressOptions[values.statePermanent][values.districtPermanent] &&
        addressOptions[values.statePermanent][values.districtPermanent].upazilas
      ) {
        return addressOptions[values.statePermanent][values.districtPermanent]
          .upazilas
      } else {
        return []
      }
    case 'addressLine3Options1':
      if (
        addressOptions[values.state][values.district] &&
        addressOptions[values.state][values.district][values.addressLine4] &&
        addressOptions[values.state][values.district][values.addressLine4]
          .unions
      ) {
        return addressOptions[values.state][values.district][
          values.addressLine4
        ].unions
      } else {
        return []
      }
    case 'addressLine3Options1Permanent':
      if (
        addressOptions[values.statePermanent][values.districtPermanent] &&
        addressOptions[values.statePermanent][values.districtPermanent][
          values.addressLine4Permanent
        ] &&
        addressOptions[values.statePermanent][values.districtPermanent][
          values.addressLine4Permanent
        ].unions
      ) {
        return addressOptions[values.statePermanent][values.districtPermanent][
          values.addressLine4Permanent
        ].unions
      } else {
        return []
      }
    default:
      return []
  }
}

function generateDynamicOptionsForField(
  field: IFormField,
  values: IFormSectionData
) {
  return {
    ...field,
    options: field.dynamicOptions
      ? getDynamicSelectOptions(field, values)
      : field.options
  }
}

function GeneratedInputField({
  field,
  onChange,
  onSetFieldValue,
  ...props
}: GeneratedInputFieldProps) {
  if (field.type === 'select') {
    return (
      <LocalizedInputField
        component={Select}
        id={field.name}
        onChange={(value: string) => onSetFieldValue(field.name, value)}
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
        onChange={(value: string) => onSetFieldValue(field.name, value)}
        {...field}
        {...props}
      />
    )
  }
  if (field.type === 'checkboxGroup') {
    return (
      <LocalizedInputField
        component={CheckboxGroup}
        id={field.name}
        onChange={(value: string[]) => onSetFieldValue(field.name, value)}
        {...field}
        {...props}
      />
    )
  }

  if (field.type === 'date') {
    return (
      <LocalizedInputField
        component={DateField}
        onChange={(value: string) => onSetFieldValue(field.name, value)}
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
        id={field.name}
        onChange={onChange}
        {...field}
        {...props}
      />
    )
  }
  if (field.type === 'subSection') {
    return (
      <SubSectionDivider
        key={`${field.name}`}
        label={field.label}
        {...field}
        {...props}
      />
    )
  }
  if (field.type === 'documents') {
    return (
      <DocumentUpload
        src="/assets/document-upload.png"
        alt="Dummy document upload"
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
  render() {
    const {
      handleSubmit,
      handleChange,
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

            const conditionalActions: string[] = getConditionalActionsForField(
              field,
              values
            )

            if (conditionalActions.includes('hide')) {
              return null
            }

            return (
              <FormItem key={`${field.name}`}>
                <GeneratedInputField
                  field={internationaliseFieldObject(
                    intl,
                    generateDynamicOptionsForField(field, values)
                  )}
                  onBlur={this.handleBlur}
                  value={values[field.name]}
                  onChange={handleChange}
                  meta={meta}
                  onSetFieldValue={setFieldValue}
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
  validate: (values, props: IFormSectionProps) =>
    getValidationErrorsForForm(props.fields, values)
})(injectIntl(FormSectionComponent))
