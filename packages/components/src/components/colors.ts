const colorDictionary = {
  blackStormy: '#35495D',
  blueDeepSea: '#4C68C1',
  blueBabyBaby: '#5E93ED',
  purpleDrafty: '#8049B7',
  orangeAmber: '#F1B162',
  redDanger: '#D53F3F',
  greenPeaPea: '#49B78D',
  blueCrystal: '#4A8AD7',
  yellowFocus: '#EDC55E',
  white: '#FFFFFF',
  black: '#000000',
  blueHover: '#F2F6FE',
  greyBlackMetal: '#373D3F',
  greyRaven: '#555F61',
  greyDarkSteel: '#707C80',
  greySteel: '#A7B0B2',
  greyGrey: '#C1C7C9',
  greySmoky: '#DADEDF',
  greyPearl: '#F2F3F4',
  nightshadeDark: '#42506B',
  nightshadeLight: '#485F88',
  darkSteel: '#707C80'
}

export const gradients = {
  gradientNightshade:
    'background: linear-gradient(180deg, #42506B 0%, #485F88 100%)',
  gradientSkyDark:
    'background: linear-gradient(180deg, #3C55A3 0%, #4C68C1 100%)',
  gradientSkyLight:
    'background: linear-gradient(180deg, #6291CD 0%, #AACAF3 100%)'
}

export const shadows = {
  mistyShadow: 'box-shadow: 0px 2px 6px rgba(53, 67, 93, 0.32)',
  thickShadow: 'box-shadow: 0px 2px 8px rgba(53, 67, 93, 0.54)'
}

export const colors = {
  primary: colorDictionary.blueDeepSea,
  secondary: colorDictionary.blueBabyBaby,
  tertiary: colorDictionary.blueDeepSea,
  error: colorDictionary.redDanger,
  warning: colorDictionary.orangeAmber,
  copy: colorDictionary.blackStormy,
  placeholder: colorDictionary.greyDarkSteel,
  background: colorDictionary.greyPearl,
  disabled: colorDictionary.greySmoky,
  success: colorDictionary.greenPeaPea,
  white: colorDictionary.white,
  black: colorDictionary.black,
  focus: colorDictionary.yellowFocus,

  // Exceptions - Try to use one of the above before creating exceptions
  chartAreaGradientStart: colorDictionary.greySmoky,
  chartAreaGradientEnd: colorDictionary.blueHover,
  dropdownHover: colorDictionary.blueHover,
  menuBackground: colorDictionary.blackStormy,
  gradientDark: colorDictionary.nightshadeDark,
  gradientLight: colorDictionary.nightshadeLight,
  secondaryLabel: colorDictionary.darkSteel,

  // Dividers
  dividerLight: colorDictionary.greyPearl,
  dividerDark: colorDictionary.greyGrey,

  // Scrollbars
  scrollBarGrey: colorDictionary.greySteel
}
