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
const FormItem = styled.div`
  margin-bottom: 2em;
`

const FormSectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.lightFont};
  color: ${({ theme }) => theme.colors.copy};
`

type InputProps = ISelectProps | ITextInputProps | IDateFieldProps

type GeneratedInputFieldProps = { field: Ii18nFormField } & Omit<
  IInputFieldProps,
  'id'
> &
  InputProps

function GeneratedInputField({ field, ...props }: GeneratedInputFieldProps) {
  if (field.type === 'select') {
    return (
      <InputField component={Select} id={field.name} {...field} {...props} />
    )
  }
  if (field.type === 'radioGroup') {
    return (
      <InputField
        component={RadioGroup}
        id={field.name}
        {...field}
        {...props}
      />
    )
  }

  if (field.type === 'date') {
    return (
      <InputField component={DateField} id={field.name} {...field} {...props} />
    )
  }
  if (field.type === 'textarea') {
    return (
      <InputField component={TextArea} id={field.name} {...field} {...props} />
    )
  }
  return (
    <InputField component={TextInput} id={field.name} {...field} {...props} />
  )
}

const toObject = (fields: IFormField[]) =>
  fields.reduce(
    (memo, field) => ({ ...memo, [field.name]: field.initialValue }),
    {}
  )

interface IFormSectionProps {
  fields: IFormField[]
  title: string
  id: string
  onChange: (values: IFormSectionData) => void
}

type Props = IFormSectionProps &
  FormikProps<IFormSectionData> &
  InjectedIntlProps

class FormSectionComponent extends React.Component<Props> {
  componentWillReceiveProps(nextProps: Props) {
    if (!isEqual(nextProps.values, this.props.values)) {
      this.props.onChange(nextProps.values)
    }
  }
  render() {
    const {
      handleSubmit,
      handleChange,
      handleBlur,
      values,
      fields,
      id,
      intl,
      title
    } = this.props
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
            return (
              <FormItem key={`${field.name}`}>
                <GeneratedInputField
                  field={internationaliseFieldObject(field)}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values[field.name]}
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
  enableReinitialize: true,
  mapPropsToValues: props => toObject(props.fields),
  handleSubmit: values => {
    console.log(values)
  }
})(injectIntl(FormSectionComponent))
