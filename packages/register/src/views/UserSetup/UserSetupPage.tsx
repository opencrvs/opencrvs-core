import * as React from 'react'
import styled from 'styled-components'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import { connect } from 'react-redux'
import { getUserDetails } from 'src/profile/profileSelectors'
import { IStoreState } from 'src/store'
import { IUserDetails } from 'src/utils/userUtils'
import { createNamesMap } from 'src/utils/data-formatting'
import { GQLHumanName } from '@opencrvs/gateway/src/graphql/schema'

const Wrapper = styled.div`
  position: relative;
  top: 218px;
`

export class UserSetupView extends React.Component<
  { userDetails: IUserDetails } & InjectedIntlProps
> {
  render() {
    const { intl, userDetails } = this.props
    return (
      <Wrapper>
        <p>
          {(userDetails.name &&
            (createNamesMap(userDetails.name as GQLHumanName[])[
              intl.locale
            ] as string)) ||
            ''}
        </p>
        <p>
          {' '}
          {userDetails.type
            ? `${userDetails.type} - ${userDetails.role}`
            : `${userDetails.role}`}
        </p>
      </Wrapper>
    )
  }
}

export const UserSetupPage = connect(
  function mapStateToProps(state: IStoreState) {
    return {
      userDetails: getUserDetails(state)
    }
  },
  null
)(injectIntl(UserSetupView))
