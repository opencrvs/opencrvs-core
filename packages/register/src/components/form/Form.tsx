import * as React from 'react'
import { withFormik, FormikProps } from 'formik'
import { isEqual } from 'lodash'
import { InjectedIntlProps, injectIntl } from 'react-intl'

import {
  InputField,
  TextInput,
  Select,
  DateField,
  TextArea
} from '@opencrvs/components/lib/forms'
import styled from '../../styled-components'
import { IFormField, Ii18nFormField, Ii18nSelectOption } from '../../forms'

const FormItem = styled.div`
  margin-bottom: 2em;
`

const FormSectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.lightFont};
  color: ${({ theme }) => theme.colors.copy};
`

function GeneratedInputField(
  { field, ...props }: { field: IFormField } & any /* TODO */
) {
  if (field.type === 'select') {
    return (
      <InputField
        component={Select}
        options={field.options}
        required={field.required}
        id={field.name}
        pref
        ix={field.prefix}
        postfix={field.postfix}
        label={props.label}
      />
    )
  }
  if (field.type === 'date') {
    return <InputField component={DateField} id={field.name} {...field} />
  }
  if (field.type === 'textarea') {
    return <InputField component={TextArea} id={field.name} {...field} />
  }
  return <InputField component={TextInput} id={field.name} {...field} />
}

const toObject = (fields: IFormField[]) =>
  fields.reduce(
    (memo, field) => ({ ...memo, [field.name]: field.initialValue }),
    {}
  )

interface IFormProps {
  fields: IFormField[]
  title: string
  id: string
  onChange: (values: any) => void
}

class FormSection extends React.Component<
  IFormProps & FormikProps<any> & InjectedIntlProps
> {
  componentWillReceiveProps(nextProps: any) {
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

export const Form = withFormik<IFormProps, any>({
  enableReinitialize: true,
  mapPropsToValues: props => toObject(props.fields),
  handleSubmit: values => {
    console.log(values)
  }
})(injectIntl(FormSection))
