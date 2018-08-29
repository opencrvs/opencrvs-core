import * as React from 'react'
import { withFormik } from 'formik'

import {
  InputField,
  TextInput,
  Select,
  RadioGroup
} from '@opencrvs/components/lib/forms'

import styled from '../../styled-components'
import { IFormField } from '../../forms'

const FormItem = styled.div`
  margin-bottom: 2em;
`

const FormSectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.lightFont};
  color: ${({ theme }) => theme.colors.copy};
`

function getInputField(field: IFormField) {
  if (field.type === 'select') {
    return (
      <InputField
        component={Select}
        options={field.options}
        required={field.required}
        id={field.name}
        label={field.label}
      />
    )
  }
  if (field.type === 'radioGroup') {
    return (
      <InputField
        component={RadioGroup}
        options={field.options}
        required={field.required}
        id={field.name}
        label={field.label}
      />
    )
  }
  return (
    <InputField
      component={TextInput}
      required={field.required}
      id={field.name}
      label={field.label}
    />
  )
}

const FormSection = ({
  handleSubmit,
  fields,
  title
}: {
  handleSubmit: () => void
  fields: IFormField[]
  title: string
}) => {
  return (
    <section>
      <FormSectionTitle id="form_section_title">{title}</FormSectionTitle>
      <form onSubmit={handleSubmit}>
        {fields.map(field => {
          return (
            <FormItem key={`${field.name}`}>{getInputField(field)}</FormItem>
          )
        })}
      </form>
    </section>
  )
}

export const Form = withFormik<{ fields: IFormField[]; title: string }, any>({
  handleSubmit: values => {
    console.log(values)
  }
})(FormSection)
