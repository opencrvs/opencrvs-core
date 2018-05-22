import { injectGlobal } from 'styled-components'
import { resolve } from 'url'
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

  body {
    background-color: ${globalColors.backgroundGray};
  }

`
export const addGlobalStyles = () => {
  return globalStyles
}
