/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { IOfflineData } from '@client/offline/reducer'
import { getOfflineData } from '@client/offline/selectors'
import { IStoreState } from '@client/store'
import * as React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import styled from 'styled-components'
import { SysAdminContentWrapper } from '@client/views/SysAdmin/SysAdminContentWrapper'
import { Container } from '@opencrvs/components/lib/layout'
import { LinkButton } from '@opencrvs/components/lib/buttons'
import { messages } from '@client/i18n/messages/views/config'

const HeaderContainer = styled.div`
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;

  & > :first-child {
    margin-right: 24px;
  }
`
type Props = WrappedComponentProps &
  Pick<RouteComponentProps, 'history'> & {
    offlineResources: IOfflineData
  }

class ConfigHomeComponent extends React.Component<Props> {
  constructor(props: Props) {
    super(props)
  }

  render() {
    const { intl, offlineResources } = this.props
    return (
      <SysAdminContentWrapper>
        <Container>
          <HeaderContainer>
            <LinkButton
              id="go-to-application-settings"
              className="item"
              onClick={() => {}}
            >
              {intl.formatMessage(messages.applicationSettings)}
            </LinkButton>
            <LinkButton
              id="go-to-certificate-configuration"
              className="item"
              onClick={() => {}}
            >
              {intl.formatMessage(messages.certificateConfiguration)}
            </LinkButton>
          </HeaderContainer>
        </Container>
      </SysAdminContentWrapper>
    )
  }
}

function mapStateToProps(state: IStoreState) {
  return {
    offlineResources: getOfflineData(state)
  }
}

export const ConfigHome = connect(mapStateToProps)(
  injectIntl(ConfigHomeComponent)
)
