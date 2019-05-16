import * as React from 'react'
import styled from 'styled-components'
import { RouteComponentProps } from 'react-router'
import { IPage } from './Page'
import { Spinner } from '@opencrvs/components/lib/interface'
import { getTheme } from '@opencrvs/components/lib/theme'

const languageFromProps = ({ language }: IPage) => language

const StyledPage = styled.div.attrs<IPage>({})`
  ${({ theme }) => theme.gradients.gradientNightshade};
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;

  ${({ submitting }) =>
    submitting && `justify-content: center; align-items: center;`}

  * {
    box-sizing: border-box;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: subpixel-antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  *:before,
  *:after {
    box-sizing: border-box;
  }

  @font-face {
    font-family: ${({ theme }) => theme.fonts.regularFont};
    src:
      url('/fonts/notosans-regular-webfont-en.ttf')
      format('truetype');
    font-style: normal;
  }

  @font-face {
    font-family: ${({ theme }) => theme.fonts.regularFont};
    src:
      url('/fonts/notosans-regular-webfont-${languageFromProps}.ttf')
      format('truetype');
    font-style: normal;
  }

`

export class DarkPage extends React.Component<IPage & RouteComponentProps<{}>> {
  render() {
    const { children, submitting } = this.props
    return (
      <div>
        <StyledPage {...this.props}>
          {submitting ? (
            <Spinner
              id="login-submitting-spinner"
              baseColor={
                getTheme(window.config.COUNTRY, window.config.LANGUAGE).colors
                  .gradientDark
              }
            />
          ) : (
            children
          )}
        </StyledPage>
      </div>
    )
  }
}
