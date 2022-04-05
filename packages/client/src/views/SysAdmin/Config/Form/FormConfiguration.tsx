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
import {
  IListRowProps,
  ListView,
  ToggleMenu
} from '@opencrvs/components/lib/interface'
import { VerticalThreeDots } from '@opencrvs/components/lib/icons'
import { LinkButton } from '@opencrvs/components/lib/buttons'
import styled from 'styled-components'
import { fetchDraft } from '@client/forms/configuration/actions'
import { IFormDraftData, IHistory } from '@client/forms/configuration/reducer'
import { getFormDraftData } from '@client/forms/configuration/selector'

type Props = WrappedComponentProps &
  Pick<RouteComponentProps, 'history'> & {
    userDetails: IUserDetails | null
    offlineResources: IOfflineData
    offlineCountryConfiguration: IOfflineData
    fetchDraft: typeof fetchDraft
    formDraftData: IFormDraftData
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
  DRAFTS = 'drafts',
  IN_PREVIEW = 'in preview'
}

class FormConfigComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      activeTabId: TABS.PUBLISHED
    }
  }
  async componentDidMount() {
    this.props.fetchDraft()
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

  getMenuItemsForDrafts = (intl: IntlShape) => {
    const menuItems = [
      {
        label: intl.formatMessage(messages.previewFormConfiguration),
        handler: () => {}
      },
      {
        label: intl.formatMessage(messages.deleteDraftMenuButton),
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
  getHistorydata = (
    histories: IHistory[],
    eventType: string
  ): IListRowProps[] => {
    const historyData = histories.map((history) => ({
      label: <LabelColor>{`${eventType} v${history.version}`}</LabelColor>,
      value: <ValueColor>{`-${history.comment}`}</ValueColor>
    }))
    return historyData
  }

  getItemsForDraftsTab = (formDraft: IFormDraftData) => {
    const formsForDraftsTab: IListRowProps[] = formDraft
      ? [
          {
            label: (
              <LabelColor>{`Birth v${formDraft.birth.version}`}</LabelColor>
            ),
            value: <ValueColor>{`-${formDraft.birth.comment}`}</ValueColor>,
            actionsMenu: (
              <StyledActionBar>
                <LinkButton onClick={() => {}}>
                  {this.props.intl.formatMessage(
                    messages.formConfigEditButtonLabel
                  )}
                </LinkButton>
                <ToggleMenu
                  id={`form-death-action-menu`}
                  toggleButton={<VerticalThreeDots />}
                  menuItems={this.getMenuItemsForDrafts(this.props.intl)}
                />
              </StyledActionBar>
            )
          },
          {
            label: (
              <LabelColor>{`Death v${formDraft.death.version}`}</LabelColor>
            ),
            value: <ValueColor>{`-${formDraft.death.comment}`}</ValueColor>,
            actionsMenu: (
              <StyledActionBar>
                <LinkButton onClick={() => {}}>
                  {this.props.intl.formatMessage(
                    messages.formConfigEditButtonLabel
                  )}
                </LinkButton>
                <ToggleMenu
                  id={`form-death-action-menu`}
                  toggleButton={<VerticalThreeDots />}
                  menuItems={this.getMenuItemsForDrafts(this.props.intl)}
                />
              </StyledActionBar>
            )
          }
        ]
      : [
          {
            label: <LabelColor>Birth </LabelColor>,
            action: {
              label: this.props.intl.formatMessage(
                messages.formConfigureButtonLabel
              )
            }
          },
          {
            label: <LabelColor>Death </LabelColor>,
            action: {
              label: this.props.intl.formatMessage(
                messages.formConfigureButtonLabel
              )
            }
          }
        ]
    if (
      formDraft &&
      formDraft.birth.history &&
      formDraft.birth.history.length > 0
    ) {
      const birthHistories = this.getHistorydata(
        formDraft.birth.history,
        formDraft.birth.event
      )
      if (birthHistories.length > 0) {
        birthHistories.forEach((data) =>
          formsForDraftsTab.push(data as IListRowProps)
        )
      }
    }
    if (
      formDraft &&
      formDraft.death.history &&
      formDraft.death.history.length > 0
    ) {
      const deathHistories = this.getHistorydata(
        formDraft.death.history,
        formDraft.death.event
      )
      if (deathHistories.length > 0) {
        deathHistories.forEach((data) =>
          formsForDraftsTab.push(data as IListRowProps)
        )
      }
    }
    return formsForDraftsTab
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

    const formsForPreviewTab = [
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
        action: {
          label: intl.formatMessage(messages.formConfigureButtonLabel)
        }
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
                id: TABS.DRAFTS,
                title: intl.formatMessage(messages.formConfigDraftsTabLabel)
              },
              {
                id: TABS.IN_PREVIEW,
                title: intl.formatMessage(messages.formConfigInPreviewTabLabel)
              },
              {
                id: TABS.PUBLISHED,
                title: intl.formatMessage(messages.formConfigPublishedTabLabel)
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
                : this.state.activeTabId === TABS.DRAFTS
                ? this.getItemsForDraftsTab(
                    this.props.formDraftData && this.props.formDraftData
                  )
                : formsForPreviewTab
            }
            isConfigPage={true}
          />
        </Content>
      </SysAdminContentWrapper>
    )
  }
}

const mapDispatchToProps = {
  fetchDraft
}

function mapStateToProps(state: IStoreState) {
  return {
    offlineResources: getOfflineData(state),
    userDetails: getUserDetails(state),
    offlineCountryConfiguration: getOfflineData(state),
    formDraftData: getFormDraftData(state)
  }
}

export const FormConfiguration = connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(FormConfigComponent))
