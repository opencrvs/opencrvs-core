import * as React from 'react'
import { withFormik } from 'formik'

import { InputField } from '@opencrvs/components/lib/forms'

import styled from '../../styled-components'
import { IFormField } from '../../forms'

const FormItem = styled.div`
  margin-bottom: 2em;
`

const FormSectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.lightFont};
`

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
            <FormItem key={`${field.name}`}>
              <InputField
                id={field.name}
                type={field.type}
                label={field.label}
              />
            </FormItem>
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
