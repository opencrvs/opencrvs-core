import { connect } from 'react-redux'
import { IntlProvider } from 'react-intl'

import { getLanguage, getMessages } from '@performance/i18n/selectors'
import { IStoreState } from '@performance/store'
import { IntlMessages } from '@performance/i18n/reducer'

type StateProps = {
  locale: string
  messages: IntlMessages
}

const mapStateToProps = (store: IStoreState): StateProps => {
  return {
    locale: getLanguage(store),
    messages: getMessages(store)
  }
}

export const I18nContainer = connect<StateProps, {}, {}, IStoreState>(
  mapStateToProps
)(IntlProvider)
