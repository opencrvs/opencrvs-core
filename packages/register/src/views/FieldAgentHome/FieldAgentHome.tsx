import * as React from 'react'
import { connect } from 'react-redux'
import { InjectedIntlProps, injectIntl } from 'react-intl'
import { RouteComponentProps } from 'react-router'
import { getLanguage } from '@opencrvs/register/src/i18n/selectors'
import { IStoreState } from '@opencrvs/register/src/store'
import { goToEvents as goToEventsAction } from 'src/navigation'
import { ISearchInputProps } from '@opencrvs/components/lib/interface'

import { IUserDetails } from '../../utils/userUtils'
import { getUserDetails } from 'src/profile/profileSelectors'
import { Header } from 'src/components/interface/Header/Header'
import { FIELD_AGENT_ROLE } from 'src/utils/constants'

interface IFieldAgentHomeProps {
  language: string
  userDetails: IUserDetails
  goToEvents: typeof goToEventsAction
  draftCount: string
}

type FullProps = IFieldAgentHomeProps &
  InjectedIntlProps &
  ISearchInputProps &
  RouteComponentProps<{}>

class FieldAgentHomeView extends React.Component<FullProps> {
  render() {
    const { userDetails } = this.props
    const isFieldAgent =
      userDetails && userDetails.name && userDetails.role === FIELD_AGENT_ROLE
    return (
      <>
        {isFieldAgent && (
          <>
            <Header />
          </>
        )}
      </>
    )
  }
}

const mapStateToProps = (store: IStoreState) => {
  store.drafts.drafts = store.drafts.drafts || []
  const draftCount = store.drafts.drafts.length.toString()
  return {
    draftCount,
    language: getLanguage(store),
    userDetails: getUserDetails(store)
  }
}
export const FieldAgentHome = connect(
  mapStateToProps,
  {
    goToEvents: goToEventsAction
  }
)(injectIntl(FieldAgentHomeView))
