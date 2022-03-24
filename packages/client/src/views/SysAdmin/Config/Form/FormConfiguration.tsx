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
import { injectIntl, WrappedComponentProps, IntlShape } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { getUserDetails } from '@client/profile/profileSelectors'
import { IUserDetails } from '@client/utils/userUtils'
import { SysAdminContentWrapper } from '@client/views/SysAdmin/SysAdminContentWrapper'
import { Content } from '@opencrvs/components/lib/interface/Content'
import { messages } from '@client/i18n/messages/views/config'
import { ListView, ToggleMenu } from '@opencrvs/components/lib/interface'
import { VerticalThreeDots } from '@opencrvs/components/lib/icons'
import { LinkButton } from '@opencrvs/components/lib/buttons'
import styled from 'styled-components'

type Props = WrappedComponentProps &
  Pick<RouteComponentProps, 'history'> & {
    userDetails: IUserDetails | null
    offlineResources: IOfflineData
    offlineCountryConfiguration: IOfflineData
  }

interface State {
  activeTabId: string
}

const StyledActionBar = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: -8px;
  padding-right: 40px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    flex-direction: column;
    margin-left: auto;
  }
`

const LabelColor = styled.div`
  color: ${({ theme }) => theme.colors.copy};
`
const ValueColor = styled.div`
  color: ${({ theme }) => theme.colors.supportingCopy};
`
export enum TABS {
  PUBLISHED = 'published',
  DRAFTS = 'drafts'
}

class FormConfigComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      activeTabId: TABS.PUBLISHED
    }
  }

  getMenuItems = (intl: IntlShape) => {
    const menuItems = [
      {
        label: intl.formatMessage(messages.previewFormConfiguration),
        handler: () => {}
      },
      {
        label: intl.formatMessage(messages.finalizeFormConfiguration),
        handler: () => {}
      }
    ]
    return menuItems
  }

  onChangeTab = (tabId: string) => {
    this.setState({
      activeTabId: tabId
    })
  }
  render() {
    const { intl } = this.props
    const formsForPublishedTab = [
      {
        label: (
          <LabelColor>
            {intl.formatMessage(messages.birthFormConfigLabel)}
          </LabelColor>
        ),
        value: (
          <ValueColor>
            {intl.formatMessage(messages.formConfigDefaultConfig)}
          </ValueColor>
        ),
        actionsMenu: (
          <StyledActionBar>
            <LinkButton onClick={() => {}}>
              {intl.formatMessage(messages.formConfigureButtonLabel)}
            </LinkButton>
            <ToggleMenu
              id={`form-birth-action-menu`}
              toggleButton={<VerticalThreeDots />}
              menuItems={this.getMenuItems(intl)}
            />
          </StyledActionBar>
        )
      },
      {
        label: (
          <LabelColor>
            {intl.formatMessage(messages.deathFormConfigLabel)}
          </LabelColor>
        ),
        value: (
          <ValueColor>
            {intl.formatMessage(messages.formConfigDefaultConfig)}
          </ValueColor>
        ),
        actionsMenu: (
          <StyledActionBar>
            <LinkButton onClick={() => {}}>
              {intl.formatMessage(messages.formConfigureButtonLabel)}
            </LinkButton>
            <ToggleMenu
              id={`form-death-action-menu`}
              toggleButton={<VerticalThreeDots />}
              menuItems={this.getMenuItems(intl)}
            />
          </StyledActionBar>
        )
      }
    ]
    const formsForDraftsTab = [
      {
        label: <LabelColor>Birth v.01</LabelColor>,
        value: <ValueColor>Data</ValueColor>,
        action: {
          label: intl.formatMessage(messages.formConfigureButtonLabel)
        }
      },
      {
        label: <LabelColor>Birth v.02</LabelColor>,
        value: <ValueColor>Data</ValueColor>,
        action: {
          label: intl.formatMessage(messages.formConfigureButtonLabel)
        }
      }
    ]
    return (
      <SysAdminContentWrapper isCertificatesConfigPage>
        <Content
          title={intl.formatMessage(messages.formConfigPageTitle)}
          titleColor={'grey600'}
          subtitle={intl.formatMessage(messages.formConfigPageSubTitle)}
          tabs={{
            sections: [
              {
                id: TABS.PUBLISHED,
                title: intl.formatMessage(messages.formConfigPublishedTabLabel)
              },
              {
                id: TABS.DRAFTS,
                title: intl.formatMessage(messages.formConfigDraftsTabLabel)
              }
            ],
            activeTabId: this.state.activeTabId,
            onTabClick: (tabId: string) => this.onChangeTab(tabId)
          }}
        >
          <ListView
            items={
              this.state.activeTabId === TABS.PUBLISHED
                ? formsForPublishedTab
                : formsForDraftsTab
            }
            isConfigPage={true}
          />
        </Content>
      </SysAdminContentWrapper>
    )
  }
}

function mapStateToProps(state: IStoreState) {
  return {
    offlineResources: getOfflineData(state),
    userDetails: getUserDetails(state),
    offlineCountryConfiguration: getOfflineData(state)
  }
}

export const FormConfiguration = connect(mapStateToProps)(
  injectIntl(FormConfigComponent)
)
