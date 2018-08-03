import { connect } from 'react-redux'
import { getLanguage } from '../i18n/intlSelectors'
import { Page, IProps, IDispatchProps } from './Page'
import { IStoreState } from '../store'
import { withRouter } from 'react-router'
import * as actions from '../profile/profileActions'

const mapStateToProps = (store: IStoreState): IProps => {
  return {
    language: getLanguage(store)
  }
}

const mapDispatchToProps = {
  checkAuth: actions.checkAuth
}

const pageWrapper = withRouter(Page)

export const PageContainer = connect<IProps, IDispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(pageWrapper)
