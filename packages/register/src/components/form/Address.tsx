import * as React from 'react'
import styled from 'styled-components'
import { FormikProps } from 'formik'
import { InjectedIntlProps, injectIntl, FormattedMessage } from 'react-intl'
import { IFormField, IFormSectionData } from '../../forms'
import { FormItem, GeneratedInputField } from './Form'
import { internationaliseFieldObject } from '../../forms/utils'

const AddressWrapper = styled.div`
  margin-top: 8px;
  margin-bottom: 10px;
`

export interface IAddress {
  defaultCountry?: string
  defaultState?: string
  defaultDistrict?: string
  label: FormattedMessage.MessageDescriptor
  fields: IFormField[]
  id: string
}

interface IState {
  country?: string
  state?: string
  district?: string
}

type RelevantFormikProps = Pick<
  FormikProps<IFormSectionData>,
  'values' | 'errors' | 'handleChange' | 'handleBlur'
>

type Props = IAddress & RelevantFormikProps & InjectedIntlProps

class AddressComponent extends React.Component<Props, IState> {
  constructor(props: Props) {
    super(props)
    if (props.defaultCountry) {
      this.state = {
        country: props.defaultCountry
      }
    }
    if (props.defaultState) {
      this.state = {
        country: props.defaultState
      }
    }
    if (props.defaultDistrict) {
      this.state = {
        country: props.defaultDistrict
      }
    }
  }

  change = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.name === 'country') {
      this.setState({ country: event.target.value })
    }
    if (event.target.name === 'state') {
      this.setState({ state: event.target.value })
    }
    if (event.target.name === 'district') {
      this.setState({ district: event.target.value })
    }
  }

  render() {
    const {
      handleChange,
      handleBlur,
      values,
      id,
      fields,
      intl,
      label
    } = this.props
    return (
      <AddressWrapper id={id}>
        {intl.formatMessage(label)}
        {fields.map(field => {
          return (
            <FormItem key={`${field.name}`}>
              <GeneratedInputField
                field={internationaliseFieldObject(field, intl)}
                onChange={handleChange}
                onBlur={handleBlur}
                value={values[field.name]}
              />
            </FormItem>
          )
        })}
      </AddressWrapper>
    )
  }
}

export const Address = injectIntl(AddressComponent)
