import * as React from 'react'
import { withFormik, FormikProps } from 'formik'
import { isEqual } from 'lodash'
import { InjectedIntlProps, injectIntl } from 'react-intl'
import { internationaliseFieldObject } from '../../forms/utils'
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
  SubSectionDivider
} from '@opencrvs/components/lib/forms'
import styled from '../../styled-components'
import {
  IFormField,
  Ii18nFormField,
  IFormSectionData,
  IConditional,
  IExpression
} from '../../forms'
import { Omit } from '../../utils'

export const FormItem = styled.div`
  margin-bottom: 2em;
`

const FormSectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.lightFont};
  color: ${({ theme }) => theme.colors.copy};
`

const getConditional = (
  conditionals: IConditional[],
  key: string
): IConditional => {
  return conditionals.find(
    (conditional: IConditional) => conditional.action === key
  ) as IConditional
}

const getConditionalValue = (
  conditional: IConditional,
  fieldName: string
): boolean => {
  conditional.expressions.forEach((expression: IExpression) => {
    console.log(expression.code)
    /* tslint:disable-next-line: no-eval */
    if (expression.affects.includes(fieldName) && eval(expression.code)) {
      return true
    } else {
      return false
    }
  })
  return false
}

type InputProps = ISelectProps | ITextInputProps | IDateFieldProps

type GeneratedInputFieldProps = {
  field: Ii18nFormField
  values: IFormSectionData
  conditionals: IConditional[]
  onChange: (e: React.ChangeEvent<any>) => void
  onSetFieldValue: (name: string, value: string) => void
} & Omit<IInputFieldProps, 'id'> &
  InputProps

function GeneratedInputField({
  field,
  values,
  onChange,
  onSetFieldValue,
  conditionals,
  ...props
}: GeneratedInputFieldProps) {
  if (field.type === 'select') {
    return (
      <InputField
        component={Select}
        id={field.name}
        onChange={(value: string) => onSetFieldValue(field.name, value)}
        hide={getConditionalValue(
          getConditional(conditionals, 'hide'),
          field.name
        )}
        {...field}
        {...props}
      />
    )
  }
  if (field.type === 'radioGroup') {
    return (
      <InputField
        component={RadioGroup}
        id={field.name}
        onChange={(value: string) => onSetFieldValue(field.name, value)}
        hide={getConditionalValue(
          getConditional(conditionals, 'hide'),
          field.name
        )}
        {...field}
        {...props}
      />
    )
  }

  if (field.type === 'date') {
    return (
      <InputField
        component={DateField}
        onChange={(value: string) => onSetFieldValue(field.name, value)}
        hide={getConditionalValue(
          getConditional(conditionals, 'hide'),
          field.name
        )}
        id={field.name}
        {...field}
        {...props}
      />
    )
  }
  if (field.type === 'textarea') {
    return (
      <InputField
        component={TextArea}
        id={field.name}
        onChange={onChange}
        hide={getConditionalValue(
          getConditional(conditionals, 'hide'),
          field.name
        )}
        {...field}
        {...props}
      />
    )
  }
  return (
    <InputField
      component={TextInput}
      id={field.name}
      onChange={onChange}
      hide={getConditionalValue(
        getConditional(conditionals, 'hide'),
        field.name
      )}
      {...field}
      {...props}
    />
  )
}

const fieldsToValues = (fields: IFormField[]) =>
  fields.reduce(
    (memo, field) => ({ ...memo, [field.name]: field.initialValue }),
    {}
  )

interface IFormSectionProps {
  fields: IFormField[]
  title: string
  id: string
  conditionals: IConditional[]
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
      setFieldValue,
      id,
      intl,
      title,
      conditionals
    } = this.props

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
            if (field.type === 'subSection') {
              return (
                <SubSectionDivider
                  key={`${field.name}`}
                  label={intl.formatMessage(field.label)}
                  hide={getConditionalValue(
                    getConditional(conditionals, 'hide'),
                    field.name
                  )}
                />
              )
            } else {
              return (
                <FormItem key={`${field.name}`}>
                  <GeneratedInputField
                    field={internationaliseFieldObject(intl, field)}
                    onBlur={handleBlur}
                    values={values}
                    onChange={handleChange}
                    onSetFieldValue={setFieldValue}
                    value={values[field.name]}
                    conditionals={conditionals}
                  />
                </FormItem>
              )
            }
          })}
        </form>
      </section>
    )
  }
}

export const Form = withFormik<IFormSectionProps, IFormSectionData>({
  enableReinitialize: true,
  mapPropsToValues: props => fieldsToValues(props.fields),
  handleSubmit: values => {
    console.log(values)
  }
})(injectIntl(FormSectionComponent))
