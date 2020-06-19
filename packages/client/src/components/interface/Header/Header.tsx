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
import {
  buttonMessages,
  constantsMessages,
  userMessages
} from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/header'
import {
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
import {
  BRN_DRN_TEXT,
  FIELD_AGENT_ROLES,
  NAME_TEXT,
  PHONE_TEXT,
  SYS_ADMIN_ROLES,
  TRACKING_ID_TEXT
} from '@client/utils/constants'
import { getIndividualNameObj, IUserDetails } from '@client/utils/userUtils'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import {
  ApplicationBlack,
  ApplicationBlue,
  ArrowBack,
  BRN,
  Hamburger,
  HelpBlack,
  HelpBlue,
  Location,
  LogoutBlack,
  LogoutBlue,
  Phone,
  Plus,
  SearchDark,
  SettingsBlack,
  SettingsBlue,
  StatsBlack,
  StatsBlue,
  SystemBlack,
  SystemBlue,
  TrackingID,
  User
} from '@opencrvs/components/lib/icons'
import {
  AppHeader,
  ExpandingMenu,
  ISearchType,
  SearchTool
} from '@opencrvs/components/lib/interface'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import styled from 'styled-components'

type IProps = IntlShapeProps & {
  userDetails: IUserDetails | null
  redirectToAuthentication: typeof redirectToAuthentication
  language: string
  goToSearchResult: typeof goToSearchResult
  goToEvents: typeof goToEventsAction
  goToSearch: typeof goToSearch
  goToSettings: typeof goToSettings
  goToHomeAction: typeof goToHome
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
  PERFORMANCE,
  TEAM,
  USERS
}

const StyledPrimaryButton = styled(PrimaryButton)`
  ${({ theme }) => theme.shadows.mistyShadow};
  width: 42px;
  height: 42px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
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

    let menuItems: any[] = []
    if (userDetails && userDetails.role) {
      if (!SYS_ADMIN_ROLES.includes(userDetails.role)) {
        menuItems = menuItems.concat([
          {
            icon: <ApplicationBlack />,
            iconHover: <ApplicationBlue />,
            label: this.props.intl.formatMessage(
              constantsMessages.applicationTitle
            ),
            onClick: this.props.goToHomeAction
          }
        ])
      }
      if (!FIELD_AGENT_ROLES.includes(userDetails.role)) {
        menuItems = menuItems.concat([
          {
            icon: <StatsBlack />,
            iconHover: <StatsBlue />,
            label: this.props.intl.formatMessage(
              constantsMessages.performanceTitle
            ),
            onClick: () => this.goToPerformanceView(this.props)
          },
          {
            icon: <SystemBlack />,
            iconHover: <SystemBlue />,
            label: this.props.intl.formatMessage(messages.teamTitle),
            onClick: () => this.goToTeamView(this.props)
          }
        ])
      }
    }
    menuItems = menuItems.concat([
      {
        icon: <SettingsBlack />,
        iconHover: <SettingsBlue />,
        label: this.props.intl.formatMessage(messages.settingsTitle),
        onClick: this.props.goToSettings
      },
      {
        icon: <HelpBlack />,
        iconHover: <HelpBlue />,
        label: this.props.intl.formatMessage(messages.helpTitle),
        onClick: () => alert('Help!')
      },
      {
        icon: <LogoutBlack />,
        iconHover: <LogoutBlue />,
        label: this.props.intl.formatMessage(buttonMessages.logout),
        secondary: true,
        onClick: this.logout
      }
    ])

    const userInfo = { name, role }

    return (
      <>
        <Hamburger />
        <ExpandingMenu
          menuItems={menuItems}
          userDetails={userInfo}
          showMenu={this.state.showMenu}
          menuCollapse={() => false}
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
    this.setState(prevState => ({ showMenu: !prevState.showMenu }))
  }

  renderSearchInput(props: IProps, isMobile?: boolean) {
    const { intl, searchText, selectedSearchType, language } = props

    const searchTypeList: ISearchType[] = [
      {
        label: intl.formatMessage(constantsMessages.trackingId),
        value: TRACKING_ID_TEXT,
        icon: <TrackingID />,
        invertIcon: <TrackingID color="invert" />,
        placeHolderText: intl.formatMessage(messages.placeHolderTrackingId),
        isDefault: true
      },
      {
        label: intl.formatMessage(messages.typeBrnDrn),
        value: BRN_DRN_TEXT,
        icon: <BRN />,
        invertIcon: <BRN color="invert" />,
        placeHolderText: intl.formatMessage(messages.placeHolderBrnDrn)
      },
      {
        label: intl.formatMessage(messages.typePhone),
        value: PHONE_TEXT,
        icon: <Phone />,
        invertIcon: <Phone color="invert" />,
        placeHolderText: intl.formatMessage(messages.placeHolderPhone)
      },
      {
        label: intl.formatMessage(messages.typeName),
        value: NAME_TEXT,
        icon: <User />,
        invertIcon: <User color="invert" />,
        placeHolderText: intl.formatMessage(messages.placeholderName)
      }
    ]

    return (
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
    )
  }

  goToTeamView(props: IProps) {
    const { userDetails, goToTeamUserListAction, goToTeamSearchAction } = props
    if (userDetails && userDetails.role) {
      if (SYS_ADMIN_ROLES.includes(userDetails.role)) {
        return goToTeamSearchAction()
      } else {
        return goToTeamUserListAction(
          {
            id:
              (userDetails.primaryOffice && userDetails.primaryOffice.id) || '',
            searchableText:
              (userDetails.primaryOffice && userDetails.primaryOffice.name) ||
              '',
            displayLabel:
              (userDetails.primaryOffice && userDetails.primaryOffice.name) ||
              ''
          },
          true
        )
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
      if (SYS_ADMIN_ROLES.includes(userDetails.role)) {
        return goToPerformanceHomeAction()
      } else {
        const locationId =
          userDetails.catchmentArea &&
          userDetails.catchmentArea[0] &&
          userDetails.catchmentArea[0].id
        return (
          (locationId && goToOperationalReportAction(locationId)) ||
          goToPerformanceHomeAction()
        )
      }
    }
  }

  render() {
    const {
      intl,
      userDetails,
      enableMenuSelection = true,
      goToHomeAction,
      activeMenuItem
    } = this.props
    const title =
      this.props.title ||
      intl.formatMessage(
        activeMenuItem === ACTIVE_MENU_ITEM.PERFORMANCE
          ? constantsMessages.performanceTitle
          : userDetails &&
            userDetails.role &&
            SYS_ADMIN_ROLES.includes(userDetails.role)
          ? messages.teamTitle
          : constantsMessages.applicationTitle
      )

    let menuItems: any[] = []

    if (userDetails && userDetails.role) {
      if (!SYS_ADMIN_ROLES.includes(userDetails.role)) {
        menuItems = menuItems.concat([
          {
            key: 'application',
            title: intl.formatMessage(constantsMessages.applicationTitle),
            onClick: goToHomeAction,
            selected:
              enableMenuSelection &&
              activeMenuItem === ACTIVE_MENU_ITEM.APPLICATIONS
          }
        ])
      }
      if (!FIELD_AGENT_ROLES.includes(userDetails.role)) {
        menuItems = menuItems.concat([
          {
            key: 'performance',
            title: intl.formatMessage(constantsMessages.performanceTitle),
            onClick: () => this.goToPerformanceView(this.props),
            selected:
              enableMenuSelection &&
              activeMenuItem === ACTIVE_MENU_ITEM.PERFORMANCE
          },
          {
            key: 'team',
            title: intl.formatMessage(messages.teamTitle),
            onClick: () => this.goToTeamView(this.props),
            selected:
              enableMenuSelection && activeMenuItem === ACTIVE_MENU_ITEM.TEAM
          }
        ])
      }
    }

    let rightMenu = [
      {
        element: (
          <StyledPrimaryButton
            key="newEvent"
            id="header_new_event"
            onClick={this.props.goToEvents}
            icon={() => <Plus />}
          />
        )
      },
      {
        element: this.renderSearchInput(this.props)
      },
      {
        element: <ProfileMenu key="profileMenu" />
      }
    ]

    if (activeMenuItem !== ACTIVE_MENU_ITEM.APPLICATIONS) {
      rightMenu = [
        {
          element: <ProfileMenu key="profileMenu" />
        }
      ]
    }

    const mobileHeaderActionProps = this.getMobileHeaderActionProps(
      activeMenuItem
    )

    return (
      <>
        <AppHeader
          menuItems={menuItems}
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
      : window.location.href.includes('team/users')
      ? ACTIVE_MENU_ITEM.USERS
      : window.location.href.includes('team')
      ? ACTIVE_MENU_ITEM.TEAM
      : ACTIVE_MENU_ITEM.APPLICATIONS,
    language: store.i18n.language,
    userDetails: getUserDetails(store)
  }),
  {
    redirectToAuthentication,
    goToSearchResult,
    goToSearch,
    goToSettings,
    goToEvents: goToEventsAction,
    goToHomeAction: goToHome,
    goToPerformanceHomeAction: goToPerformanceHome,
    goToOperationalReportAction: goToOperationalReport,
    goToPerformanceReportListAction: goToPerformanceReportList,
    goToTeamSearchAction: goToTeamSearch,
    goToTeamUserListAction: goToTeamUserList
  }
)(injectIntl<'intl', IProps>(HeaderComp))
