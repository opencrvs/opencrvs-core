import { theme } from '@opencrvs/components/lib/themes/theme'
import { globalColors } from './colors'

const locale = process.env.REACT_APP_LOCALE ? process.env.REACT_APP_LOCALE : 'gb'

export const globalStyles = `
  * {
    box-sizing: border-box;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  @font-face {
    font-family: ${theme[locale].lightFontFamily};
    src: url('/fonts/notosans-light-webfont-${process.env.REACT_APP_LANGUAGE}.woff') format('woff');
    font-weight: 300;
    font-style: normal;
  }

  @font-face {
    font-family: ${theme[locale].regularFontFamily};
    src: url('/fonts/notosans-regular-webfont-${process.env.REACT_APP_LANGUAGE}.woff') format('woff');
    font-style: normal;
  }

  @font-face {
    font-family: ${theme[locale].boldFontFamily};
    src: url('/fonts/notosans-bold-webfont-${process.env.REACT_APP_LANGUAGE}.woff') format('woff');
    font-style: normal;
  }

  *:before,
  *:after {
    box-sizing: border-box;
  }

  body {
    background-color: ${globalColors.background};
    margin: 0;
    padding: 0;
    font-family: ${theme[locale].lightFontFamily};
  }

`

export const lightFont = theme[locale].lightFontFamily
export const regularFont = theme[locale].regularFontFamily
export const boldFont = theme[locale].boldFontFamily
