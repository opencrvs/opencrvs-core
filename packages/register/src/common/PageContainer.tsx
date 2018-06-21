import { connect } from 'react-redux'
import { getLanguage } from '../i18n/IntlSelectors'
import { Page } from './Page'
import { IStoreState } from '../store'

type StateProps = {
  language?: string
}

const mapStateToProps = (store: IStoreState): StateProps => {
  return {
    language: getLanguage(store)
  }
}

export const PageContainer = connect<StateProps, {}>(mapStateToProps)(Page)
