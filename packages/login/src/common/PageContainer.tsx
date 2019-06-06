import { connect } from 'react-redux'
import { getLanguage } from '@login/i18n/selectors'
import { Page, IPage } from '@login/common/Page'
import { IStoreState } from '@login/store'
import { withRouter, RouteComponentProps } from 'react-router'
import { DarkPage } from '@login/common/DarkPage'

const mapStateToProps = (store: IStoreState): IPage => {
  return {
    language: getLanguage(store),
    submitting: store.login.submitting
  }
}

export const PageContainer = withRouter(
  connect<IPage, {}, IPage & RouteComponentProps<{}>, IStoreState>(
    mapStateToProps
  )(Page)
) as any

export const DarkPageContainer = withRouter(
  connect<IPage, {}, IPage & RouteComponentProps<{}>, IStoreState>(
    mapStateToProps
  )(DarkPage)
) as any
