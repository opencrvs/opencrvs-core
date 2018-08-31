import * as React from 'react'
import { default as ReactSelect } from 'react-select'
import styled from 'styled-components'
import { Props } from 'react-select/lib/Select'

export interface ISelectProps {
  error?: boolean
  touched?: boolean
}

const StyledSelect = styled(ReactSelect).attrs<ISelectProps>({})`
  width: 100%;

  ${({ theme }) => theme.fonts.defaultFontStyle};
  .react-select__control {
    background: ${({ theme }) => theme.colors.inputBackground};
    border-radius: 0;
    border: 0;
    box-shadow: none;
    font-size: 16px;
    border-bottom: solid 1px
      ${({ error, touched, theme }) =>
        error && touched ? theme.colors.error : theme.colors.disabled};
  }

  .react-select__option {
    color: ${({ theme }) => theme.colors.copy};
    font-size: 14px;
  }

  .react-select__control--is-focused {
    border: 0;
    border-bottom: solid 1px ${({ theme }) => theme.colors.accent};
  }
`

export class Select extends React.Component<Props<any>> {
  render() {
    return <StyledSelect classNamePrefix="react-select" {...this.props} />
  }
}
