/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
// default theme for style guide website in JSS - editing this file has no effect on the OpenCRVS application styles
require('dotenv').config()
const { styleGuideCountryFonts } = require('./styleguide.fonts')

const country = process.env.REACT_APP_COUNTRY || 'gbr'
const language = process.env.REACT_APP_LANGUAGE || 'en'

const fontFaces = [
  {
    fontFamily: styleGuideCountryFonts[country][language].regularFontFamily,
    fontStyle: 'normal',
    src: `url('notosans-regular-webfont-en.ttf') format('truetype')`
  },
  {
    fontFamily: styleGuideCountryFonts[country][language].semiBoldFontFamily,
    fontStyle: 'normal',
    src: `url('notosans-semibold-webfont-en.ttf') format('truetype')`
  }
]

const colors = {
  danger: '#D53F3F',
  dark: '#000',
  grey: '#83898F',
  light: '#fff',
  lightGrey: '#A7B0B2',
  paleGrey: '#C1C7C9',
  primary: '#35495D',
  secondary: '#5E93ED',
  tertiary: '#373D3F'
}

const theme = {
  '@font-face': fontFaces,
  color: {
    base: colors.dark,
    baseBackground: colors.light,
    border: colors.paleGrey,
    codeBackground: colors.paleGrey,
    error: colors.error,
    light: colors.grey,
    lightest: colors.lightGrey,
    link: colors.primary,
    linkHover: colors.tertiary,
    name: colors.primary,
    sidebarBackground: colors.primary,
    type: colors.secondary
  },
  fontFamily: {
    base:
      '"' +
      styleGuideCountryFonts[country].regularFontFamily +
      '", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", ' +
      '"Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", ' +
      'sans-serif',
    bold:
      '"' +
      styleGuideCountryFonts[country].semiBoldFontFamily +
      '", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", ' +
      '"Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", ' +
      'sans-serif',
    light:
      '"' +
      styleGuideCountryFonts[country].regularFontFamily +
      '", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", ' +
      '"Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", ' +
      'sans-serif',
    monospace: 'Consolas, "Liberation Mono", Menlo, monospace',
    regular:
      '"' +
      styleGuideCountryFonts[country].regularFontFamily +
      '", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", ' +
      '"Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", ' +
      'sans-serif'
  },
  fontSize: {
    base: 15,
    text: 16,
    small: 13,
    h1: 38,
    h2: 32,
    h3: 18,
    h4: 18,
    h5: 16,
    h6: 16
  },
  maxWidth: 865,
  sidebarWidth: 240
}

const rhythm = (value = 1, unit = 'rem', basis = 1.5) =>
  Array.isArray(value)
    ? value.map(v => `${basis * v}${unit}`).join(' ')
    : `${basis * value}${unit}`

const styles = {
  ComponentsList: {
    heading: {
      fontWeight: '700 !important'
    }
  },
  Heading: {
    heading1: {
      display: 'block',
      position: 'relative',
      paddingBottom: rhythm(0.75),
      marginBottom: rhythm(0.75),
      fontWeight: 700,
      '&:before': {
        content: '""',
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: rhythm(3),
        height: '4px',
        backgroundColor: colors.primary,
        borderRadius: '4px'
      },
      '& > a': {
        fontWeight: '700 !important'
      }
    },
    heading2: {
      marginBottom: rhythm(0.5)
    },
    heading3: {
      borderBottom: `thin solid ${colors.lightGrey}`,
      paddingBottom: rhythm(0.25),
      marginBottom: rhythm(1),
      textTransform: 'uppercase',
      fontWeight: '700'
    }
  },
  ReactComponent: {
    tabs: {
      backgroundColor: colors.paleGrey,
      overflow: 'auto'
    },
    tabButtons: {
      paddingLeft: '2%',
      marginBottom: 0
    }
  },
  SectionHeading: {
    sectionName: {
      display: 'block',
      paddingTop: `${rhythm(1)} !important`,
      textDecoration: 'none !important',
      '&:hover': {
        opacity: 0.75
      }
    }
  },
  StyleGuide: {
    '@font-face': fontFaces,
    content: {
      paddingTop: rhythm(2.5),
      '@media (max-width: 600px)': {
        padding: rhythm(1)
      }
    },
    logo: {
      border: 0,
      paddingBottom: 0,
      '& .rsg-logo': {
        display: 'block',
        color: colors.light,
        margin: rhythm(-0.5),
        padding: rhythm(0.5),
        fontSize: theme.fontSize.h3,
        fontFamily: theme.fontFamily.base,
        transition: 'all 250ms ease',
        cursor: 'pointer',
        '&:after, &:hover:after': {
          content: '"\\2197"',
          position: 'absolute',
          top: 0,
          right: 0,
          padding: rhythm(0.5),
          opacity: 0.25,
          transition: 'all 250ms ease',
          cursor: 'pointer'
        },
        '&:hover:after': {
          opacity: 0.75,
          color: colors.dark
        }
      },
      '& .rsg-logo-name, & .rsg-logo-version': {
        display: 'inline-block',
        verticalAlign: 'middle',
        pointerEvents: 'none'
      },
      '& .rsg-logo-name': {
        fontWeight: 700
      },
      '& .rsg-logo-version': {
        marginLeft: rhythm(0.25),
        opacity: 0.5
      }
    },
    sidebar: {
      border: 0,
      '& li > a': {
        color: `${colors.light} !important`
      }
    }
  },
  TabButton: {
    button: {
      width: '100%'
    },
    isActive: {
      border: 0
    }
  },
  Logo: {
    logo: {
      color: `${colors.light} !important`
    }
  },
  Table: {
    table: {
      width: '96%',
      marginLeft: '2%',
      marginTop: rhythm(0.5),
      marginBottom: rhythm(0.5),
      minWidth: '600px'
    },
    cellHeading: {
      borderBottom: `thin solid ${colors.lightGrey}`
    },
    cell: {
      paddingBottom: 0,
      '& p': {
        marginBottom: `${rhythm(0.125)} !important`
      },
      '& div[class*="para"]': {
        marginBottom: `${rhythm(0.125)} !important`
      }
    }
  }
}

module.exports = {
  styles,
  theme
}
