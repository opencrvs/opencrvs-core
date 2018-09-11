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
  IConditional
} from '../../forms'
import { Omit } from '../../utils'
import { addressOptions } from '../../forms/address'

export const FormItem = styled.div`
  margin-bottom: 2em;
`

const FormSectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.lightFont};
  color: ${({ theme }) => theme.colors.copy};
`

const getConditionalActions = (
  field: IFormField,
  values: IFormSectionData
): string[] => {
  if (!field.conditionals) {
    return []
  }
  return field.conditionals
    .filter(conditional =>
      /* tslint:disable-next-line: no-eval */
      eval(conditional.expression)
    )
    .map((conditional: IConditional) => conditional.action)
}

type InputProps = ISelectProps | ITextInputProps | IDateFieldProps

type GeneratedInputFieldProps = {
  field: Ii18nFormField
  values: IFormSectionData
  onChange: (e: React.ChangeEvent<any>) => void
  onSetFieldValue: (name: string, value: string) => void
} & Omit<IInputFieldProps, 'id'> &
  InputProps

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
  values,
  onChange,
  onSetFieldValue,
  ...props
}: GeneratedInputFieldProps) {
  if (field.type === 'select') {
    return (
      <InputField
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
      <InputField
        component={RadioGroup}
        id={field.name}
        onChange={(value: string) => onSetFieldValue(field.name, value)}
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

  return (
    <InputField
      component={TextInput}
      id={field.name}
      onChange={onChange}
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
      title
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
            const conditionalActions: string[] = getConditionalActions(
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
                  onBlur={handleBlur}
                  values={values}
                  onChange={handleChange}
                  onSetFieldValue={setFieldValue}
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
  mapPropsToValues: props => fieldsToValues(props.fields),
  handleSubmit: values => {
    console.log(values)
  }
})(injectIntl(FormSectionComponent))
