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

import { IntlProvider } from 'react-intl'
import React from 'react'
import { IntlMessages, IntlState } from '@client/i18n/reducer'
import { useSelector } from 'react-redux'

import 'moment/locale/bn'

type StateProps = {
  language: string
  messages: IntlMessages
}

export const I18nContainer: React.FC = () => {
  const { language, messages } = useSelector<IntlState, StateProps>(
    (state: IntlState) => {
      return {
        language: state.language,
        messages: state.messages
      }
    }
  )
  return <IntlProvider locale={language} messages={messages} />
}
