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
import { ProfileMenu } from '@client/components/ProfileMenu'
import { SCREEN_LOCK } from '@client/components/ProtectedPage'
import { constantsMessages, userMessages } from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/header'
import {
  goBack,
  goForward,
  goToConfig,
  goToEvents as goToEventsAction,
  goToHome,
  goToOperationalReport,
  goToPerformanceHome,
  goToPerformanceReportList,
  goToSearch,
  goToSearchResult,
  goToSettings,
  goToTeamSearch,
  goToTeamUserList
} from '@client/navigation'
import { redirectToAuthentication } from '@client/profile/profileActions'
import { getUserDetails } from '@client/profile/profileSelectors'
import { storage } from '@client/storage'
import { IStoreState } from '@client/store'
import { withTheme } from '@client/styledComponents'
import {
  BRN_DRN_TEXT,
  NAME_TEXT,
  NATL_ADMIN_ROLES,
  PHONE_TEXT,
  TRACKING_ID_TEXT
} from '@client/utils/constants'
import { getIndividualNameObj, IUserDetails } from '@client/utils/userUtils'
import { CircleButton, PrimaryButton } from '@opencrvs/components/lib/buttons'
import {
  ArrowBack,
  BackArrowDeepBlue,
  ForwardArrowDeepBlue,
  BRN,
  Location,
  Phone,
  Plus,
  SearchDark,
  TrackingID,
  User
} from '@opencrvs/components/lib/icons'
import {
  AppHeader,
  ExpandingMenu,
  ISearchType,
  SearchTool
} from '@opencrvs/components/lib/interface'
import { ITheme } from '@opencrvs/components/lib/theme'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { getJurisdictionLocationIdFromUserDetails } from '@client/views/SysAdmin/Performance/utils'
import { Navigation } from '@client/components/interface/Navigation'
import { Avatar } from '@client/components/Avatar'

type IProps = IntlShapeProps & {
  theme: ITheme
  userDetails: IUserDetails | null
  redirectToAuthentication: typeof redirectToAuthentication
  language: string
  goToSearchResult: typeof goToSearchResult
  goToEvents: typeof goToEventsAction
  goToSearch: typeof goToSearch
  goToSettings: typeof goToSettings
  goBack: typeof goBack
  goForward: typeof goForward
  goToHomeAction: typeof goToHome
  goToConfigAction: typeof goToConfig
  goToPerformanceHomeAction: typeof goToPerformanceHome
  goToPerformanceReportListAction: typeof goToPerformanceReportList
  goToOperationalReportAction: typeof goToOperationalReport
  goToTeamSearchAction: typeof goToTeamSearch
  goToTeamUserListAction: typeof goToTeamUserList
  activeMenuItem: ACTIVE_MENU_ITEM
  title?: string
  searchText?: string
  selectedSearchType?: string
  mobileSearchBar?: boolean
  enableMenuSelection?: boolean
  mapPinClickHandler?: () => void
}
interface IState {
  showMenu: boolean
  showLogoutModal: boolean
}

enum ACTIVE_MENU_ITEM {
  APPLICATIONS,
  CONFIG,
  PERFORMANCE,
  TEAM,
  USERS
}

const StyledPrimaryButton = styled(PrimaryButton)`
  ${({ theme }) => theme.shadows.mistyShadow};
  width: 42px;
  height: 42px;
  border-radius: 100%;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
  &:hover {
    background: ${({ theme }) => theme.colors.indigo600};
  }
  &:focus {
    background: ${({ theme }) => theme.colors.yellow500};
  }
  &:active {
    background: ${({ theme }) => theme.colors.indigo600};
  }
`

const SearchBox = styled.div`
  position: static;
  width: 624px;
  min-width: 220px;
  height: 42px;
  left: calc(50% - 624px / 2 + 24px);
  top: calc(50% - 40px / 2);
  background: ${({ theme }) => theme.colors.grey300};
  box-sizing: border-box;
  border-radius: 100px;
  margin: 0px 12px;
  margin-right: 96px;
  &:focus-within {
    border: 1px solid ${({ theme }) => theme.colors.grey800};
    background: ${({ theme }) => theme.colors.white};
  }
  &:active {
    border: 1px solid ${({ theme }) => theme.colors.yellow500};
  }
  &:focus-within input {
    background: ${({ theme }) => theme.colors.white};
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.xl}px) {
    width: 100%;
    max-width: 507.87px;
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    width: 100%;
    max-width: 334px;
    margin: auto;
  }
`
const HeaderCenter = styled.div`
  padding: 8px 16px;
  height: 64px;
  display: flex;
  flex-direction: row;
  align-items: center;
  background: ${({ theme }) => theme.colors.white};
`
const HeaderLeft = styled.div`
  padding: 8px 16px;
  height: 64px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20px;
  background: ${({ theme }) => theme.colors.white};
`
const HeaderRight = styled.div`
  padding: 8px 16px;
  height: 64px;
  background: ${({ theme }) => theme.colors.white};
`
class HeaderComp extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      showMenu: false,
      showLogoutModal: false
    }
  }

  hamburger = () => {
    const { userDetails, language, intl } = this.props

    let name = ''
    if (userDetails && userDetails.name) {
      const nameObj = getIndividualNameObj(userDetails.name, language)
      name = nameObj
        ? `${String(nameObj.firstNames)} ${String(nameObj.familyName)}`
        : ''
    }

    const role =
      userDetails && userDetails.role
        ? intl.formatMessage(userMessages[userDetails.role])
        : ''

    const avatar = <Avatar name={name} avatar={userDetails?.avatar} />

    const userInfo = { name, role, avatar }

    return (
      <>
        <ExpandingMenu
          showMenu={this.state.showMenu}
          menuCollapse={() => this.toggleMenu()}
          navigation={() => (
            <Navigation
              navigationWidth={320}
              menuCollapse={() => this.toggleMenu()}
              userInfo={userInfo}
            />
          )}
        />
      </>
    )
  }

  getMobileHeaderActionProps(activeMenuItem: ACTIVE_MENU_ITEM) {
    if (
      activeMenuItem === ACTIVE_MENU_ITEM.PERFORMANCE ||
      activeMenuItem === ACTIVE_MENU_ITEM.TEAM
    ) {
      return {
        mobileLeft: {
          icon: () => this.hamburger(),
          handler: this.toggleMenu
        }
      }
    } else if (activeMenuItem === ACTIVE_MENU_ITEM.USERS) {
      if (this.props.mapPinClickHandler) {
        return {
          mobileLeft: {
            icon: () => this.hamburger(),
            handler: this.toggleMenu
          },
          mobileRight: {
            icon: () => <Location inverse />,
            handler: () =>
              this.props.mapPinClickHandler && this.props.mapPinClickHandler()
          }
        }
      } else {
        return {
          mobileLeft: {
            icon: () => this.hamburger(),
            handler: this.toggleMenu
          }
        }
      }
    } else {
      if (this.props.mobileSearchBar) {
        return {
          mobileLeft: {
            icon: () => <ArrowBack />,
            handler: () => window.history.back()
          },
          mobileBody: this.renderSearchInput(this.props, true)
        }
      } else {
        return {
          mobileLeft: {
            icon: () => this.hamburger(),
            handler: this.toggleMenu
          },
          mobileRight: {
            icon: () => <SearchDark />,
            handler: () => this.props.goToSearch()
          }
        }
      }
    }
  }

  logout = () => {
    storage.removeItem(SCREEN_LOCK)
    this.props.redirectToAuthentication()
  }

  toggleMenu = () => {
    this.setState((prevState) => ({ showMenu: !prevState.showMenu }))
  }

  renderSearchInput(props: IProps, isMobile?: boolean) {
    const { intl, searchText, selectedSearchType, language } = props

    const searchTypeList: ISearchType[] = [
      {
        label: intl.formatMessage(constantsMessages.trackingId),
        value: TRACKING_ID_TEXT,
        icon: <TrackingID />,
        invertIcon: <TrackingID color="#4972BB" />,
        placeHolderText: intl.formatMessage(messages.placeHolderTrackingId),
        isDefault: true
      },
      {
        label: intl.formatMessage(messages.typeBrnDrn),
        value: BRN_DRN_TEXT,
        icon: <BRN />,
        invertIcon: <BRN color="#4972BB" />,
        placeHolderText: intl.formatMessage(messages.placeHolderBrnDrn)
      },
      {
        label: intl.formatMessage(messages.typePhone),
        value: PHONE_TEXT,
        icon: <Phone />,
        invertIcon: <Phone color="#4972BB" />,
        placeHolderText: intl.formatMessage(messages.placeHolderPhone)
      },
      {
        label: intl.formatMessage(messages.typeName),
        value: NAME_TEXT,
        icon: <User />,
        invertIcon: <User color="#4972BB" />,
        placeHolderText: intl.formatMessage(messages.placeholderName)
      }
    ]

    return (
      <SearchBox>
        <SearchTool
          key="searchMenu"
          language={language}
          searchText={searchText}
          selectedSearchType={selectedSearchType}
          searchTypeList={searchTypeList}
          searchHandler={(text, type) =>
            props.goToSearchResult(text, type, isMobile)
          }
        />
      </SearchBox>
    )
  }

  goToTeamView(props: IProps) {
    const { userDetails, goToTeamUserListAction, goToTeamSearchAction } = props
    if (userDetails && userDetails.role) {
      if (NATL_ADMIN_ROLES.includes(userDetails.role)) {
        return goToTeamSearchAction()
      } else {
        return goToTeamUserListAction({
          id: (userDetails.primaryOffice && userDetails.primaryOffice.id) || '',
          searchableText:
            (userDetails.primaryOffice && userDetails.primaryOffice.name) || '',
          displayLabel:
            (userDetails.primaryOffice && userDetails.primaryOffice.name) || ''
        })
      }
    }
  }

  goToPerformanceView(props: IProps) {
    const {
      userDetails,
      goToPerformanceHomeAction,
      goToOperationalReportAction
    } = props
    if (userDetails && userDetails.role) {
      if (NATL_ADMIN_ROLES.includes(userDetails.role)) {
        return goToPerformanceHomeAction()
      } else {
        const locationId = getJurisdictionLocationIdFromUserDetails(userDetails)
        return (
          (locationId && goToOperationalReportAction(locationId)) ||
          goToPerformanceHomeAction()
        )
      }
    }
  }

  render() {
    const { intl, activeMenuItem } = this.props
    const title =
      this.props.title ||
      intl.formatMessage(
        activeMenuItem === ACTIVE_MENU_ITEM.PERFORMANCE
          ? constantsMessages.performanceTitle
          : activeMenuItem === ACTIVE_MENU_ITEM.TEAM ||
            activeMenuItem === ACTIVE_MENU_ITEM.USERS
          ? messages.teamTitle
          : activeMenuItem === ACTIVE_MENU_ITEM.CONFIG
          ? constantsMessages.configTitle
          : constantsMessages.applicationTitle
      )

    let rightMenu = [
      {
        element: (
          <HeaderLeft>
            <CircleButton onClick={() => this.props.goBack()}>
              <BackArrowDeepBlue />
            </CircleButton>
            <CircleButton onClick={() => this.props.goForward()}>
              <ForwardArrowDeepBlue />
            </CircleButton>
          </HeaderLeft>
        )
      },
      {
        element: (
          <HeaderCenter>
            <StyledPrimaryButton
              key="newEvent"
              id="header_new_event"
              onClick={this.props.goToEvents}
              icon={() => <Plus />}
            />
            {this.renderSearchInput(this.props)}
          </HeaderCenter>
        )
      },
      {
        element: (
          <HeaderRight>
            <ProfileMenu key="profileMenu" />
          </HeaderRight>
        )
      }
    ]

    if (activeMenuItem !== ACTIVE_MENU_ITEM.APPLICATIONS) {
      rightMenu = [
        {
          element: <ProfileMenu key="profileMenu" />
        }
      ]
    }

    const mobileHeaderActionProps =
      this.getMobileHeaderActionProps(activeMenuItem)

    return (
      <>
        <AppHeader
          id="register_app_header"
          desktopRightMenu={rightMenu}
          title={title}
          {...mobileHeaderActionProps}
        />
      </>
    )
  }
}

export const Header = connect(
  (store: IStoreState) => ({
    activeMenuItem: window.location.href.includes('performance')
      ? ACTIVE_MENU_ITEM.PERFORMANCE
      : window.location.href.includes('team')
      ? ACTIVE_MENU_ITEM.TEAM
      : window.location.href.includes('config')
      ? ACTIVE_MENU_ITEM.CONFIG
      : ACTIVE_MENU_ITEM.APPLICATIONS,
    language: store.i18n.language,
    userDetails: getUserDetails(store)
  }),
  {
    redirectToAuthentication,
    goToSearchResult,
    goToSearch,
    goToSettings,
    goBack,
    goForward,
    goToEvents: goToEventsAction,
    goToHomeAction: goToHome,
    goToConfigAction: goToConfig,
    goToPerformanceHomeAction: goToPerformanceHome,
    goToOperationalReportAction: goToOperationalReport,
    goToPerformanceReportListAction: goToPerformanceReportList,
    goToTeamSearchAction: goToTeamSearch,
    goToTeamUserListAction: goToTeamUserList
  }
)(withTheme(injectIntl<'intl', IProps>(HeaderComp)))
