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
import { Button } from '@opencrvs/components/lib/buttons'
import { messages } from '@client/i18n/messages/views/config'
import { TopBar } from '@opencrvs/components/lib/interface'

const HeaderContainer = styled.div`
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;

  & > :first-child {
    margin-right: 24px;
  }
`

const SubMenuTab = styled(Button)<{ active: boolean }>`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.subtitleStyle};
  margin-left: 88px;
  padding-top: 15px;
  padding-bottom: 12px;
  border-radius: 0;
  flex-shrink: 0;
  outline: none;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    margin-left: 8px;
  }
  ${({ active }) =>
    active
      ? 'border-bottom: 3px solid #5E93ED'
      : 'border-bottom: 3px solid transparent'};
  & > div {
    padding: 0 8px;
  }
  :first-child > div {
    position: relative;
    padding-left: 0;
  }
  & div > div {
    margin-right: 8px;
  }
  &:focus {
    outline: none;
    background: ${({ theme }) => theme.colors.focus};
    color: ${({ theme }) => theme.colors.copy};
  }
  &:not([data-focus-visible-added]) {
    background: transparent;
    outline: none;
    color: ${({ theme }) => theme.colors.copy};
  }
`
type Props = WrappedComponentProps &
  Pick<RouteComponentProps, 'history'> & {
    offlineResources: IOfflineData
  }

interface State {
  selectedSubMenuItem: string
}

const SUB_MENU_ID = {
  certificatesConfig: 'Certificates',
  applicationsSettings: 'Application Settings'
}

class ConfigHomeComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      selectedSubMenuItem: ''
    }
  }

  render() {
    const { intl, offlineResources } = this.props

    return (
      <SysAdminContentWrapper
        subMenuComponent={
          <TopBar id="top-bar">
            <SubMenuTab
              id={`tab_${SUB_MENU_ID.certificatesConfig}`}
              key={SUB_MENU_ID.certificatesConfig}
              active={
                this.state.selectedSubMenuItem ===
                SUB_MENU_ID.certificatesConfig
              }
              onClick={() =>
                this.setState({
                  selectedSubMenuItem: SUB_MENU_ID.certificatesConfig
                })
              }
            >
              {SUB_MENU_ID.certificatesConfig}
            </SubMenuTab>
            <SubMenuTab
              id={`tab_${SUB_MENU_ID.applicationsSettings}`}
              key={SUB_MENU_ID.applicationsSettings}
              active={
                this.state.selectedSubMenuItem ===
                SUB_MENU_ID.applicationsSettings
              }
              onClick={() =>
                this.setState({
                  selectedSubMenuItem: SUB_MENU_ID.applicationsSettings
                })
              }
            >
              {SUB_MENU_ID.applicationsSettings}
            </SubMenuTab>
          </TopBar>
        }
      >
        <Container></Container>
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
