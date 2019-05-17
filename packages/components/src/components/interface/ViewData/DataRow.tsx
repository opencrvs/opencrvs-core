import * as React from 'react'
import styled from 'styled-components'
import { LinkButton } from '../../buttons'

const Container = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  border-bottom: 1px solid rgb(193, 199, 201);
  font-size: 18px;
  font-feature-settings: 'pnum' on, 'lnum' on;
  padding: 16px 8px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    flex-direction: column;
  }
`
const DataContainer = styled.div`
  display: flex;
  flex-grow: 1;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    flex-direction: column;
  }
`
const Label = styled.label`
  flex: 1;
  font-weight: 600;
  line-height: 26px;
`
const Value = styled.div`
  flex: 1;
  line-height: 27px;
`

const Tip = styled.div`
  flex: 1;
  color: rgb(112, 124, 128);
  line-height: 24px;
  font-size: 16px;
`
const Action = styled.div`
  width: auto;
  font-size: 16px;
`
interface IAction {
  label: string
  disabled?: boolean
  handler?: () => void
}

export interface IDataProps {
  label: string
  value?: string
  tip?: string
  action?: IAction
}

export class DataRow extends React.Component<IDataProps> {
  render() {
    const { label, value, tip, action } = this.props

    return (
      <Container>
        <DataContainer>
          <Label>{label}</Label>
          {value && <Value>{value}</Value>}
          {tip && <Tip>{tip}</Tip>}
        </DataContainer>
        {action && (
          <Action>
            <LinkButton disabled={action.disabled} onClick={action.handler}>
              {action.label}
            </LinkButton>
          </Action>
        )}
      </Container>
    )
  }
}
