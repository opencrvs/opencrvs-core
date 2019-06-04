import { connect } from 'react-redux'
import { getLanguage } from '@login/i18n/selectors'
import { Page, IPage } from '@login/common/Page'
import { IStoreState } from '@login/store'
import { withRouter } from 'react-router'
import { DarkPage } from '@login/common/DarkPage'

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
