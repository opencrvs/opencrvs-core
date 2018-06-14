import { localeThemes } from '@opencrvs/components/lib/localeThemes'
import { config } from '../config'
import { colors } from '@opencrvs/components/lib/colors'
import { fonts } from '@opencrvs/components/lib/fonts'

// STYLED-COMPONENTS REQUIRE @font-face TO BE INJECTED.
// DO NOT APPLY FURTHER STYLES TO OPENCRVS IN THIS FILE.
// WE USE injectBodyStyle SUPPORT MULTIPLE LARGE LANGUAGE
// FONTS PER LOCALE e.g. ARABIC, BENGALI, MANDARIN ...

export const injectBodyStyle = `
  * {
    box-sizing: border-box;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: subpixel-antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  @font-face {
    font-family: ${localeThemes[config.LOCALE].lightFontFamily};
    src: url('/fonts/notosans-light-webfont-${
      config.LANGUAGE
    }.woff') format('woff');
    font-weight: 300;
    font-style: normal;
  }

  @font-face {
    font-family: ${localeThemes[config.LOCALE].regularFontFamily};
    src: url('/fonts/notosans-regular-webfont-${
      config.LANGUAGE
    }.woff') format('woff');
    font-style: normal;
  }

  @font-face {
    font-family: ${localeThemes[config.LOCALE].boldFontFamily};
    src: url('/fonts/notosans-bold-webfont-${
      config.LANGUAGE
    }.woff') format('woff');
    font-style: normal;
  }

  *:before,
  *:after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 0;
    background-color: ${colors.background};
    ${fonts.defaultFontStyle}
  }

  h1 {
    ${fonts.h1FontStyle}
  }

  h2 {
    ${fonts.h2FontStyle}
  }

  h3 {
    ${fonts.h3FontStyle}
  }



`
