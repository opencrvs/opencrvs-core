import * as React from 'react'
import { withFormik } from 'formik'

import {
  InputField,
  TextInput,
  Select,
  DateField,
  TextArea,
  RadioGroup
} from '@opencrvs/components/lib/forms'

import { InjectedIntlProps, injectIntl } from 'react-intl'
import styled from '../../styled-components'
import { IFormField, Ii18nFormField, Ii18nSelectOption } from '../../forms'

const FormItem = styled.div`
  margin-bottom: 2em;
`

const FormSectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.lightFont};
  color: ${({ theme }) => theme.colors.copy};
`

function getInputField(field: Ii18nFormField) {
  if (field.type === 'select') {
    return (
      <InputField
        component={Select}
        options={field.options}
        required={field.required}
        id={field.name}
        label={field.label}
        prefix={field.prefix}
        postfix={field.postfix}
      />
    )
  }
  if (field.type === 'radioGroup') {
    return <InputField component={RadioGroup} id={field.name} {...field} />
  }

  if (field.type === 'date') {
    return <InputField component={DateField} id={field.name} {...field} />
  }
  if (field.type === 'textarea') {
    return <InputField component={TextArea} id={field.name} {...field} />
  }
  return <InputField component={TextInput} id={field.name} {...field} />
}

interface IFormSectionProps {
  fields: IFormField[]
  title: string
  id: string
  handleSubmit: () => void
}

function FormSectionComponent({
  handleSubmit,
  fields,
  title,
  id,
  intl
}: IFormSectionProps & InjectedIntlProps) {
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

  return (
    <section>
      <FormSectionTitle id={`form_section_title_${id}`}>
        {title}
      </FormSectionTitle>
      <form onSubmit={handleSubmit}>
        {fields.map(field => {
          return (
            <FormItem key={`${field.name}`}>
              {getInputField(internationaliseFieldObject(field))}
            </FormItem>
          )
        })}
      </form>
    </section>
  )
}

export const Form = injectIntl(
  withFormik<
    { fields: IFormField[]; title: string; id: string } & InjectedIntlProps,
    any
  >({
    handleSubmit: values => {
      console.log(values)
    }
  })(FormSectionComponent)
)
