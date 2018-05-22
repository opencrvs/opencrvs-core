import { injectGlobal } from 'styled-components'
import { globalColors } from './colors'

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
    src : url('fonts/notosans-light-webfont.woff')format('woff');
    font-weight: 300;
    font-style: normal;
  }

  @font-face {
    font-family: 'NotoSansRegular';
    src : url('fonts/notosans-regular-webfont.woff')format('woff');
    font-style: normal;
  }

  body {
    background-color: ${globalColors.backgroundGray};
  }

`
export const addGlobalStyles = () => {
  return globalStyles
}
