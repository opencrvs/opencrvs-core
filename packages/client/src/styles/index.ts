
import { Colors } from '@opencrvs/components/lib/Colors'
import { LocaleThemes } from '@opencrvs/components/lib/LocaleThemes'

const locale = process.env.REACT_APP_LOCALE
  ? process.env.REACT_APP_LOCALE
  : 'gb'

export const globalStyles = `
  * {
    box-sizing: border-box;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  @font-face {
    font-family: ${LocaleThemes[locale].lightFontFamily};
    src: url('/fonts/notosans-light-webfont-${process.env.REACT_APP_LANGUAGE}.woff') format('woff');
    font-weight: 300;
    font-style: normal;
  }

  @font-face {
    font-family: ${LocaleThemes[locale].regularFontFamily};
    src: url('/fonts/notosans-regular-webfont-${process.env.REACT_APP_LANGUAGE}.woff') format('woff');
    font-style: normal;
  }

  @font-face {
    font-family: ${LocaleThemes[locale].boldFontFamily};
    src: url('/fonts/notosans-bold-webfont-${process.env.REACT_APP_LANGUAGE}.woff') format('woff');
    font-style: normal;
  }

  *:before,
  *:after {
    box-sizing: border-box;
  }

  body {
    background-color: ${Colors.background};
    margin: 0;
    padding: 0;
    font-family: ${LocaleThemes[locale].lightFontFamily};
  }

`

export const lightFont = LocaleThemes[locale].lightFontFamily
export const regularFont = LocaleThemes[locale].regularFontFamily
export const boldFont = LocaleThemes[locale].boldFontFamily
