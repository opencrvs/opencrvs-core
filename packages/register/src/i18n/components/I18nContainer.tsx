import { connect } from 'react-redux'
import { addLocaleData, IntlProvider } from 'react-intl'
import en from 'react-intl/locale-data/en'
import bn from 'react-intl/locale-data/bn'

import {
  getLanguage,
  getMessages,
  getMessagesLoaded
} from '@register/i18n/selectors'
import { IStoreState } from '@register/store'
import { IntlMessages } from '@register/i18n/reducer'

addLocaleData([...en, ...bn])

type StateProps = {
  locale?: string
  messages: IntlMessages
  key: string
}

const mapStateToProps = (state: IStoreState): StateProps => {
  const locale = getLanguage(state)

  return {
    locale,
    messages: getMessages(state),
    key: locale + getMessagesLoaded(state).toString()
  }
}

export const I18nContainer = connect<StateProps, {}, StateProps, IStoreState>(
  mapStateToProps
)(IntlProvider) as any
