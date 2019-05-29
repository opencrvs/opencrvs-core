import * as React from 'react'
import styled from 'styled-components'
import { Button } from '../../../buttons'
import { Selector } from '../../../icons'

export interface ICustomProps {
  selected?: boolean
}

export type IMenuItemContainerProps = ICustomProps &
  React.InputHTMLAttributes<HTMLInputElement>

const Item = styled(Button).attrs<IMenuItemContainerProps>({})`
  color: ${({ theme, selected }) =>
    selected ? theme.colors.white : theme.colors.disabled};
  ${({ theme }) => theme.fonts.bodyBoldStyle};
`

const ItemContainer = styled.div`
  position: relative;
  height: 100%;
  margin-right: 8px;
`

const ItemSelector = styled(Selector)`
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
`

interface IProps {
  selected: boolean
  onClick?: () => void
}

export class MenuItem extends React.Component<IProps> {
  render() {
    return (
      <ItemContainer>
        <Item selected={this.props.selected} onClick={this.props.onClick}>
          {this.props.children}
        </Item>
        {this.props.selected ? <ItemSelector /> : <></>}
      </ItemContainer>
    )
  }
}
