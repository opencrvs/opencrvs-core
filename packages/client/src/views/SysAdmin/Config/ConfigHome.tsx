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
import { injectIntl, IntlShape, WrappedComponentProps } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import styled from 'styled-components'
import { SysAdminContentWrapper } from '@client/views/SysAdmin/SysAdminContentWrapper'
import { Button } from '@opencrvs/components/lib/buttons'
import { messages } from '@client/i18n/messages/views/config'
import {
  DataSection,
  ToggleMenu,
  TopBar
} from '@opencrvs/components/lib/interface'
import { VerticalThreeDots } from '@opencrvs/components/lib/icons'

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

const ColoredDataSection = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  width: 776px;
  position: absolute;
  top: 81px;
  left: 162px;
  padding-left: 32px;
  padding-right: 47px;
  padding-bottom: 37px;
  border: 1px solid '#D7DCDE';
  box-sizing: border-box;
  border-radius: 4px;
`

const ListTitleDiv = styled.div`
  width: 645px;
  height: 46px;
  ${({ theme }) => theme.fonts.bodyStyle};
`

const TopBarContainer = styled.div`
  position: absolute;
  left: 0px;
  top: 64px;
  width: 100%;
  height: 48px;
`

type Props = WrappedComponentProps &
  Pick<RouteComponentProps, 'history'> & {
    offlineResources: IOfflineData
  }

interface State {
  selectedSubMenuItem: string
}

const SUB_MENU_ID = {
  certificatesConfig: 'Certificates'
}
function getMenuItems(intl: IntlShape) {
  const menuItems = [
    {
      label: intl.formatMessage(messages.previewTemplate),
      handler: () => {
        alert('Preview clicked')
      }
    },
    {
      label: intl.formatMessage(messages.printTemplate),
      handler: () => {
        alert('Print clicked')
      }
    },
    {
      label: intl.formatMessage(messages.downloadTemplate),
      handler: () => {
        alert('Download clicked')
      }
    },
    {
      label: intl.formatMessage(messages.uploadTemplate),
      handler: () => {
        alert('Upload clicked')
      }
    }
  ]
  return menuItems
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

    const CertificateSection = {
      title: intl.formatMessage(messages.listTitle),
      items: [
        {
          id: 'birth',
          label: intl.formatMessage(messages.birthTemplate),
          value: intl.formatMessage(messages.birthDefaultTempDesc),
          actionsMenu: (
            <ToggleMenu
              id={`template-birth-action-menu`}
              toggleButton={<VerticalThreeDots />}
              menuItems={getMenuItems(intl)}
            />
          )
        },
        {
          id: 'death',
          label: intl.formatMessage(messages.deathTemplate),
          value: intl.formatMessage(messages.deathDefaultTempDesc),
          actionsMenu: (
            <ToggleMenu
              id={`template-death-action-menu`}
              toggleButton={<VerticalThreeDots />}
              menuItems={getMenuItems(intl)}
            />
          )
        }
      ]
    }

    return (
      <SysAdminContentWrapper
        subMenuComponent={
          <TopBarContainer>
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
            </TopBar>
          </TopBarContainer>
        }
        isCertificatesConfigPage={true}
      >
        {this.state.selectedSubMenuItem === SUB_MENU_ID.certificatesConfig && (
          <ColoredDataSection>
            <DataSection
              title={CertificateSection.title}
              items={CertificateSection.items}
              responsiveContents={
                <ListTitleDiv>
                  {intl.formatMessage(messages.listDetails)}
                </ListTitleDiv>
              }
              isConfigPage={true}
            />
          </ColoredDataSection>
        )}
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
