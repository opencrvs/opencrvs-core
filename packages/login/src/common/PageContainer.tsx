import { connect } from 'react-redux'
import { getLanguage } from '../i18n/selectors'
import { Page, IPage } from './Page'
import { IStoreState } from '../store'
import { withRouter } from 'react-router'
import { DarkPage } from './DarkPage'

const mapStateToProps = (store: IStoreState): IPage => {
  return {
    language: getLanguage(store),
    submitting: store.login.submitting
  }
}

export const PageContainer = withRouter(
  connect<IPage, {}>(mapStateToProps)(Page)
)

export const DarkPageContainer = withRouter(
  connect<IPage, {}>(mapStateToProps)(DarkPage)
)
