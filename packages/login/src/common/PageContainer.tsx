import { connect } from 'react-redux'
import { getLanguage } from '../i18n/intlSelectors'
import { Page, IPage } from './Page'
import { IStoreState } from '../store'
import { withRouter } from 'react-router'

const mapStateToProps = (store: IStoreState): IPage => {
  return {
    language: getLanguage(store)
  }
}

export const PageContainer = withRouter(
  connect<IPage, {}>(mapStateToProps)(Page)
)
