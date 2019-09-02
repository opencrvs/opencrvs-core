import { connect } from 'react-redux'
import { IntlProvider } from 'react-intl'

import { getLanguage, getMessages } from '@register/i18n/selectors'
import { IStoreState } from '@register/store'
import { IntlMessages } from '@register/i18n/reducer'

type StateProps = {
  locale: string
  messages: IntlMessages
}

const mapStateToProps = (state: IStoreState): StateProps => {
  const locale = getLanguage(state)

  return {
    locale,
    messages: getMessages(state)
  }
}

export const I18nContainer = connect<StateProps, {}, {}, IStoreState>(
  mapStateToProps
)(IntlProvider)
