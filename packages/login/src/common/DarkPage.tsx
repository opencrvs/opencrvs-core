import * as React from 'react'
import styled from 'styled-components'
import { RouteComponentProps } from 'react-router'
import { IPage } from '@login/common/Page'
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
    -webkit-font-smoothing: subpixel-antialiased;
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
