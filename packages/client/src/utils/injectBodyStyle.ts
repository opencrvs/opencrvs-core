import { LocaleThemes } from '@opencrvs/components/lib/LocaleThemes'
import { config } from '../config'
import { Colors } from '@opencrvs/components/lib/Colors'
import { Fonts } from '@opencrvs/components/lib/Fonts'

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
    -webkit-text-stroke: 0.45px;
  }

  @font-face {
    font-family: ${LocaleThemes[config.LOCALE].lightFontFamily};
    src: url('/fonts/notosans-light-webfont-${
      config.LANGUAGE
    }.woff') format('woff');
    font-weight: 300;
    font-style: normal;
  }

  @font-face {
    font-family: ${LocaleThemes[config.LOCALE].regularFontFamily};
    src: url('/fonts/notosans-regular-webfont-${
      config.LANGUAGE
    }.woff') format('woff');
    font-style: normal;
  }

  @font-face {
    font-family: ${LocaleThemes[config.LOCALE].boldFontFamily};
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
    background-color: ${Colors.background};
    ${Fonts.defaultFontStyle}
  }

`
