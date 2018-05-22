import { injectGlobal } from 'styled-components'
import { resolve } from 'url'
import { globalColors } from './colors'

process.env.REACT_APP_CDN =
  process.env.REACT_APP_CDN ||
  'https://s3.eu-west-2.amazonaws.com/opencrvs-dev/'
process.env.REACT_APP_LANGUAGE = process.env.REACT_APP_LANGUAGE || 'en'

export const NotoSansLight = resolve(
  process.env.REACT_APP_CDN,
  `notosans-light-webfont-${process.env.REACT_APP_LANGUAGE}.woff`
)

export const NotoSansRegular = resolve(
  process.env.REACT_APP_CDN,
  `notosans-regular-webfont-${process.env.REACT_APP_LANGUAGE}.woff`
)
export const NotoSansBold = resolve(
  process.env.REACT_APP_CDN,
  `notosans-bold-webfont-${process.env.REACT_APP_LANGUAGE}.woff`
)

const globalStyles = injectGlobal`
  * {
    box-sizing: border-box;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  *:before,
  *:after {
    box-sizing: border-box;
  }

  @font-face {
    font-family: 'NotoSansLight';
    src: url('${NotoSansLight}')format('woff');
    font-weight: 300;
    font-style: normal;
  }

  @font-face {
    font-family: 'NotoSansRegular';
    src: url('${NotoSansRegular}')format('woff');
    font-style: normal;
  }

  body {
    background-color: ${globalColors.backgroundGray};
  }

`
export const addGlobalStyles = () => {
  return globalStyles
}
