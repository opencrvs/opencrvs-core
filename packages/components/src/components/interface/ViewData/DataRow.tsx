import * as React from 'react'
import styled from 'styled-components'
import { LinkButton } from '../../buttons'

const Container = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dividerDark};
  padding: 16px 8px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    flex-direction: column;
  }
`
const DataContainer = styled.div`
  ${({ theme }) => theme.fonts.bigBody};
  display: flex;
  flex-grow: 1;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    flex-direction: column;
  }
`
const Label = styled.label`
  ${({ theme }) => theme.fonts.bigBodyBoldStyle};
  flex: 1;
`
const Value = styled.div`
  ${({ theme }) => theme.fonts.bigBodyStyle};
  flex: 1;
`

const PlaceHolder = styled.div`
  ${({ theme }) => theme.fonts.bodyStyle};
  color: ${({ theme }) => theme.colors.placeholder};
  flex: 1;
`
const Action = styled.div`
  width: auto;
`
interface IAction {
  id?: string
  label: string
  disabled?: boolean
  handler?: () => void
}

export interface IDataProps {
  label: string
  value?: string
  placeHolder?: string
  action?: IAction
}

export class DataRow extends React.Component<IDataProps> {
  render() {
    const { label, value, placeHolder, action } = this.props

    return (
      <Container>
        <DataContainer>
          <Label>{label}</Label>
          {value && <Value>{value}</Value>}
          {placeHolder && <PlaceHolder>{placeHolder}</PlaceHolder>}
        </DataContainer>
        {action && (
          <Action>
            <LinkButton
              id={action.id}
              disabled={action.disabled}
              onClick={action.handler}
            >
              {action.label}
            </LinkButton>
          </Action>
        )}
      </Container>
    )
  }
}
