import { connect } from 'react-redux'
import { getLanguage } from '../i18n/IntlSelectors'
import { Page } from './Page'

type StateProps = {
  language?: string
}

const mapStateToProps = (store: any): StateProps => {
  return {
    language: getLanguage(store)
  }
}

export const PageContainer = connect<StateProps, {}>(mapStateToProps)(Page)
