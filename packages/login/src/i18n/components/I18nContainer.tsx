import { connect } from 'react-redux'
import { addLocaleData, IntlProvider } from 'react-intl'
import * as en from 'react-intl/locale-data/en'
import * as bn from 'react-intl/locale-data/bn'

import { getLanguage, getMessages } from '../selectors'
import { IStoreState } from '../../store'
import { IntlMessages } from '../reducer'

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

export const IntlContainer = connect<StateProps, {}>(mapStateToProps)(
  IntlProvider
)
