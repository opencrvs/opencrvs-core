import { connect } from 'react-redux'
import { addLocaleData, IntlProvider } from 'react-intl'
import en from 'react-intl/locale-data/en'
import bn from 'react-intl/locale-data/bn'

import { getLanguage, getMessages } from '@performance/i18n/selectors'
import { IStoreState } from '@performance/store'
import { IntlMessages } from '@performance/i18n/reducer'

addLocaleData([...en, ...bn])

type StateProps = {
  locale?: string
  messages: IntlMessages
}

const mapStateToProps = (store: IStoreState): StateProps => {
  return {
    locale: getLanguage(store),
    messages: getMessages(store)
  }
}

export const I18nContainer = connect<StateProps, {}, StateProps, IStoreState>(
  mapStateToProps
)(IntlProvider) as any
