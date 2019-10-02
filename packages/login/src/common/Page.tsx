import * as React from 'react'
import styled from 'styled-components'
import { RouteComponentProps } from 'react-router'
import { LoginHeader } from '@login/common/LoginHeader'

export interface IPage {
  submitting: boolean
  language?: string
}

const languageFromProps = ({ language }: IPage) => language

const StyledPage = styled.div.attrs<IPage>({})`
  background: ${({ theme }) => theme.colors.background};
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  * {
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  *:before,
  *:after {
    box-sizing: border-box;
  }

  @font-face {
    /* stylelint-disable-next-line opencrvs/no-font-styles */
    font-family: ${({ theme }) => theme.fonts.semiBoldFont};
    src:
      url('/fonts/notosans-semibold-webfont-en.ttf')
      format('truetype');
  }

  @font-face {
    /* stylelint-disable-next-line opencrvs/no-font-styles */
    font-family: ${({ theme }) => theme.fonts.regularFont};
    src:
    url('/fonts/notosans-regular-webfont-en.ttf')
      format('truetype');
  }

  @font-face {
    /* stylelint-disable-next-line opencrvs/no-font-styles */
    font-family: ${({ theme }) => theme.fonts.semiBoldFont};
    src:
      url('/fonts/notosans-semibold-webfont-${languageFromProps}.ttf')
      format('truetype');
  }

  @font-face {
    /* stylelint-disable-next-line opencrvs/no-font-styles */
    font-family: ${({ theme }) => theme.fonts.regularFont};
    src:
      url('/fonts/notosans-regular-webfont-${languageFromProps}.ttf')
      format('truetype');
  }

`

export class Page extends React.Component<IPage & RouteComponentProps<{}>> {
  render() {
    const { children } = this.props
    return (
      <div>
        <StyledPage {...this.props}>{children}</StyledPage>
      </div>
    )
  }
}
