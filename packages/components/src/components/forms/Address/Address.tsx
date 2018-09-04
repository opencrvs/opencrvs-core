import * as React from 'react'
import styled from 'styled-components'

const AddressWrapper = styled.div`
  margin-top: 8px;
  margin-bottom: 10px;
  border-top: solid 1px ${({ theme }) => theme.colors.background};
  width: calc(100% + 50px);
  margin-left: -25px;
  padding: 35px 25px;
`

const Title = styled.h2`
  font-family: ${({ theme }) => theme.fonts.lightFont};
  color: ${({ theme }) => theme.colors.copy};
`

interface IAddressValues {
  [key: string]: string
}

export interface IAddressProps {
  defaultCountry?: string
  defaultState?: string
  defaultDistrict?: string
  label: string
  id: string
  values: IAddressValues
}

interface IState {
  country?: string
  state?: string
  district?: string
}

export class Address extends React.Component<IAddressProps, IState> {
  constructor(props: IAddressProps) {
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
    const { id, label, values } = this.props
    return (
      <AddressWrapper id={id}>
        <Title>{label}</Title>
      </AddressWrapper>
    )
  }
}
