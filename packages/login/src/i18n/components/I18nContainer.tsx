import { connect } from 'react-redux'
import { IntlProvider } from 'react-intl'

import { getLanguage, getMessages } from '@login/i18n/selectors'
import { IStoreState } from '@login/i18n/../store'
import { IntlMessages } from '@login/i18n/reducer'

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

export const IntlContainer = connect<StateProps, {}, {}, IStoreState>(
  mapStateToProps
)(IntlProvider)
