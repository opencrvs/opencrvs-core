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
import { ToggleMenu } from '@opencrvs/components/lib/interface'
import { VerticalThreeDots } from '@opencrvs/components/lib/icons'
import { LinkButton } from '@opencrvs/components/lib/buttons'
import styled from 'styled-components'
import { fetchDraft } from '@client/forms/configuration/actions'
import { IFormDraftData, IHistory } from '@client/forms/configuration/reducer'
import { getFormDraftData } from '@client/forms/configuration/selector'
import {
  ListViewItemSimplified,
  ListViewSimplified
} from '@opencrvs/components/lib/interface/ListViewSimplified/ListViewSimplified'

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

const LabelColor = styled.span`
  color: ${({ theme }) => theme.colors.copy};
`
const ValueColor = styled.span`
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
  getHistorydata = (histories: IHistory[], eventType: string) => {
    const historyData = histories.map((history) => (
      <ListViewItemSimplified
        label={<LabelColor>{`${eventType} v${history.version}`}</LabelColor>}
        value={<ValueColor>{`-${history.comment}`}</ValueColor>}
      />
    ))
    return historyData
  }

  getItemsForDraftsTab = (formDraft: IFormDraftData) => {
    const formsForDraftsTab = (
      <>
        <ListViewItemSimplified
          label={
            <LabelColor>{`${
              formDraft && formDraft.birth ? formDraft.birth.event : `Birth`
            } v${
              formDraft && formDraft.birth ? formDraft.birth.version : `0`
            }`}</LabelColor>
          }
          value={
            formDraft &&
            formDraft.birth && (
              <ValueColor>{`-${formDraft.birth.comment}`}</ValueColor>
            )
          }
          actions={[
            <LinkButton onClick={() => {}}>
              {this.props.intl.formatMessage(messages.formConfigureButtonLabel)}
            </LinkButton>,
            formDraft && formDraft.birth ? (
              <ToggleMenu
                id={`form-death-action-menu`}
                toggleButton={<VerticalThreeDots />}
                menuItems={this.getMenuItemsForDrafts(this.props.intl)}
              />
            ) : (
              <></>
            )
          ]}
        />
        {formDraft &&
          formDraft.birth &&
          formDraft.birth.history &&
          formDraft.birth.history.length > 0 &&
          this.getHistorydata(formDraft.birth.history, formDraft.birth.event)}
        <ListViewItemSimplified
          label={
            <LabelColor>{`${
              formDraft && formDraft.death ? formDraft.death.event : `Death`
            } v${
              formDraft && formDraft.death ? formDraft.death.version : `0`
            }`}</LabelColor>
          }
          value={
            formDraft &&
            formDraft.death && (
              <ValueColor>{`-${formDraft.death.comment}`}</ValueColor>
            )
          }
          actions={[
            <LinkButton onClick={() => {}}>
              {this.props.intl.formatMessage(messages.formConfigureButtonLabel)}
            </LinkButton>,
            formDraft && formDraft.death ? (
              <ToggleMenu
                id={`form-death-action-menu`}
                toggleButton={<VerticalThreeDots />}
                menuItems={this.getMenuItemsForDrafts(this.props.intl)}
              />
            ) : (
              <></>
            )
          ]}
        />
        {formDraft &&
          formDraft.death &&
          formDraft.death.history &&
          formDraft.death.history.length > 0 &&
          this.getHistorydata(formDraft.death.history, formDraft.death.event)}
      </>
    )
    return formsForDraftsTab
  }

  render() {
    const { intl } = this.props
    const formsForPublishedTab = (
      <>
        <ListViewItemSimplified
          label={
            <LabelColor>
              {intl.formatMessage(messages.birthFormConfigLabel)}
            </LabelColor>
          }
          value={
            <ValueColor>
              {intl.formatMessage(messages.formConfigDefaultConfig)}
            </ValueColor>
          }
          actions={[
            <LinkButton onClick={() => {}}>
              {intl.formatMessage(messages.formConfigureButtonLabel)}
            </LinkButton>,
            <ToggleMenu
              id={`form-birth-action-menu`}
              toggleButton={<VerticalThreeDots />}
              menuItems={this.getMenuItems(intl)}
            />
          ]}
        />

        <ListViewItemSimplified
          label={
            <LabelColor>
              {intl.formatMessage(messages.deathFormConfigLabel)}
            </LabelColor>
          }
          value={
            <ValueColor>
              {intl.formatMessage(messages.formConfigDefaultConfig)}
            </ValueColor>
          }
          actions={[
            <LinkButton onClick={() => {}}>
              {intl.formatMessage(messages.formConfigureButtonLabel)}
            </LinkButton>,
            <ToggleMenu
              id={`form-death-action-menu`}
              toggleButton={<VerticalThreeDots />}
              menuItems={this.getMenuItems(intl)}
            />
          ]}
        />
      </>
    )

    const formsForPreviewTab = (
      <>
        <ListViewItemSimplified
          label={
            <LabelColor>
              {intl.formatMessage(messages.birthFormConfigLabel)}
            </LabelColor>
          }
          value={
            <ValueColor>
              {intl.formatMessage(messages.formConfigDefaultConfig)}
            </ValueColor>
          }
          actions={[
            <LinkButton>
              {intl.formatMessage(messages.formConfigureButtonLabel)}
            </LinkButton>
          ]}
        />
        <ListViewItemSimplified
          label={
            <LabelColor>
              {intl.formatMessage(messages.deathFormConfigLabel)}
            </LabelColor>
          }
          value={
            <ValueColor>
              {intl.formatMessage(messages.formConfigDefaultConfig)}
            </ValueColor>
          }
          actions={[
            <LinkButton>
              {intl.formatMessage(messages.formConfigureButtonLabel)}
            </LinkButton>
          ]}
        />
      </>
    )
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
          <ListViewSimplified
            bottomBorder={true}
            children={
              this.state.activeTabId == TABS.IN_PREVIEW ? (
                formsForPreviewTab
              ) : this.state.activeTabId == TABS.PUBLISHED ? (
                formsForPublishedTab
              ) : this.state.activeTabId == TABS.DRAFTS ? (
                this.getItemsForDraftsTab(this.props.formDraftData)
              ) : (
                <></>
              )
            }
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
