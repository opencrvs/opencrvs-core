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
// Use alpha-2 country codes

const fonts = {
  bgd: {
    bn: {
      semiBoldFontFamily: 'noto_sans_bengali_semi_bold',
      regularFontFamily: 'noto_sans_bengali_regular'
    },
    en: {
      semiBoldFontFamily: 'noto_sans_semi_bold',
      regularFontFamily: 'noto_sans_regular'
    }
  },
  gbr: {
    en: {
      semiBoldFontFamily: 'noto_sans_semi_bold',
      regularFontFamily: 'noto_sans_regular'
    }
  },
  za: {
    en: {
      semiBoldFontFamily: 'noto_sans_semi_bold',
      regularFontFamily: 'noto_sans_regular'
    }
  }
}

module.exports = {
  styleGuideCountryFonts: fonts
}
