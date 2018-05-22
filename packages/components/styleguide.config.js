process.env.REACT_APP_CDN = process.env.REACT_APP_CDN ||
  'https://s3.eu-west-2.amazonaws.com/opencrvs-dev/'

module.exports = {
  components: 'src/components/**/*.{ts,tsx}',
  propsParser: require('react-docgen-typescript').parse,
  styleguideDir: './lib',
  webpackConfig: require('react-scripts-ts/config/webpack.config.dev.js'),
  styleguideComponents: {
    Wrapper: path.join(__dirname, 'src/themes')
  },
  styles: {
    StyleGuide: {
      '@global body': {
        '@font-face': [{
            fontFamily: 'NotoSansLight',
            src: `url(${process.env.REACT_APP_CDN}notosans-light-webfont-${process.env.REACT_APP_LANGUAGE}.woff)`
          },
          {
            fontFamily: 'NotoSansRegular',
            src: `url(${process.env.REACT_APP_CDN}notosans-regular-webfont-${process.env.REACT_APP_LANGUAGE}.woff)`
          }
        ]
      },
    },
  },
};
