// default theme for style guide website in JSS - editing this file has no effect on the OpenCRVS application styles
require('dotenv').config()
const {
  OpenCRVSTheme
} = require('./src/components/themes')

const locale = process.env.REACT_APP_LOCALE || 'gb'

const fontFaces = [{
    fontFamily: OpenCRVSTheme[locale].lightFontFamily,
    fontStyle: 'normal',
    fontWeight: '300',
    src: `url('${process.env.REACT_APP_CDN}notosans-light-webfont-${process.env
			.REACT_APP_LANGUAGE}.woff') format('woff')`
  },
  {
    fontFamily: OpenCRVSTheme[locale].regularFontFamily,
    fontStyle: 'normal',
    src: `url('
      ${process.env.REACT_APP_CDN}notosans-regular-webfont-${process.env.REACT_APP_LANGUAGE}.woff') format('woff')`
  },
  {
    fontFamily: OpenCRVSTheme[locale].boldFontFamily,
    fontStyle: 'normal',
    src: `url('
      ${process.env.REACT_APP_CDN}notosans-bold-webfont-${process.env.REACT_APP_LANGUAGE}.woff') format('woff')`
  }
]

const colors = {
  danger: '#d9534f',
  dark: '#000',
  grey: '#7a898f',
  light: '#fff',
  lightGrey: '#aec0c6',
  paleGrey: '#ebf1f3',
  primary: '#485F88',
  secondary: '#4CA1F2',
  tertiary: '#203a44'
}

const theme = {
  '@font-face': fontFaces,
  color: {
    base: colors.dark,
    baseBackground: colors.light,
    border: colors.paleGrey,
    codeBackground: colors.paleGrey,
    error: colors.danger,
    light: colors.grey,
    lightest: colors.lightGrey,
    link: colors.primary,
    linkHover: colors.tertiary,
    name: colors.primary,
    sidebarBackground: colors.primary,
    type: colors.secondary
  },
  fontFamily: {
    base: '"' +
      OpenCRVSTheme[locale].lightFontFamily +
      '", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", ' +
      '"Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", ' +
      'sans-serif',
    bold: '"' +
      OpenCRVSTheme[locale].boldFontFamily +
      '", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", ' +
      '"Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", ' +
      'sans-serif',
    light: '"' +
      OpenCRVSTheme[locale].lightFontFamily +
      '", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", ' +
      '"Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", ' +
      'sans-serif',
    monospace: 'Consolas, "Liberation Mono", Menlo, monospace',
    regular: '"' +
      OpenCRVSTheme[locale].regularFontFamily +
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
  Array.isArray(value) ? value.map((v) => `${basis * v}${unit}`).join(' ') :
  `${basis * value}${unit}`

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
