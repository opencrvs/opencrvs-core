import styled from 'styled-components'
import React = require('react')

interface IProps {
  status: JSX.Element
  text: string
}

const StyledStatus = styled.span`
  font-family: ${({ theme }) => theme.fonts.boldFont};
  background-color: rgba(150, 150, 150, 0.1);
  border-radius: 17px;
  padding: 5px 10px 5px 7px;
  margin: 2px 5px 2px 0;
  display: flex;
  align-items: center;
  height: 32px;
  & span {
    color: ${({ theme }) => theme.colors.placeholder};
    text-transform: uppercase;
    margin-left: 5px;
    font-size: 14px;
    font-weight: bold;
    letter-spacing: 0.58px;
  }
`

export class Chip extends React.Component<IProps> {
  render() {
    return (
      <StyledStatus>
        {this.props.status}
        <span>{this.props.text}</span>
      </StyledStatus>
    )
  }
}
