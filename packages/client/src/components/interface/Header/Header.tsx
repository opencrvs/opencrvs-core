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
import {
  ApplicationBlack,
  ApplicationBlue,
  ArrowBack,
  BRN,
  Hamburger,
  HelpBlack,
  HelpBlue,
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
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { storage } from '@client/storage'
import { SCREEN_LOCK } from '@client/components/ProtectedPage'
import { connect } from 'react-redux'
import { getUserDetails } from '@client/profile/profileSelectors'
import { IUserDetails, getIndividualNameObj } from '@client/utils/userUtils'
import { redirectToAuthentication } from '@client/profile/profileActions'
import { IStoreState } from '@client/store'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import {
  goToHome,
  goToPerformanceReportList,
  goToSearch,
  goToSearchResult,
  goToSettings,
  goToEvents as goToEventsAction,
  goToPerformanceHome
} from '@client/navigation'
import { ProfileMenu } from '@client/components/ProfileMenu'
import {
  BRN_DRN_TEXT,
  PHONE_TEXT,
  SYS_ADMIN_ROLES,
  TRACKING_ID_TEXT,
  NAME_TEXT
} from '@client/utils/constants'
import styled from 'styled-components'
import { messages } from '@client/i18n/messages/views/header'
import {
  constantsMessages,
  buttonMessages,
  userMessages
} from '@client/i18n/messages'
import * as React from 'react'

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
  activeMenuItem: ACTIVE_MENU_ITEM
  title?: string
  searchText?: string
  selectedSearchType?: string
  mobileSearchBar?: boolean
  enableMenuSelection?: boolean
}
interface IState {
  showMenu: boolean
  showLogoutModal: boolean
}

enum ACTIVE_MENU_ITEM {
  APPLICATIONS,
  PERFORMANCE
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

    let menuItems = [
      {
        icon: <ApplicationBlack />,
        iconHover: <ApplicationBlue />,
        label: this.props.intl.formatMessage(
          constantsMessages.applicationTitle
        ),
        onClick: this.props.goToHomeAction
      },
      {
        icon: <StatsBlack />,
        iconHover: <StatsBlue />,
        label: this.props.intl.formatMessage(
          constantsMessages.performanceTitle
        ),
        onClick: this.props.goToPerformanceReportListAction
      },
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
    ]

    if (
      userDetails &&
      userDetails.role &&
      SYS_ADMIN_ROLES.includes(userDetails.role)
    ) {
      menuItems = [
        {
          icon: <SystemBlack />,
          iconHover: <SystemBlue />,
          label: this.props.intl.formatMessage(messages.systemTitle),
          onClick: this.props.goToHomeAction
        },
        {
          icon: <StatsBlack />,
          iconHover: <StatsBlue />,
          label: this.props.intl.formatMessage(
            constantsMessages.performanceTitle
          ),
          onClick: this.props.goToPerformanceHomeAction
        },
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
      ]
    }

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
    if (activeMenuItem === ACTIVE_MENU_ITEM.PERFORMANCE) {
      return {
        mobileLeft: {
          icon: () => this.hamburger(),
          handler: this.toggleMenu
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

  render() {
    const {
      intl,
      userDetails,
      enableMenuSelection = true,
      goToHomeAction,
      goToPerformanceHomeAction,
      goToPerformanceReportListAction,
      activeMenuItem
    } = this.props
    const title =
      this.props.title ||
      intl.formatMessage(
        activeMenuItem === ACTIVE_MENU_ITEM.PERFORMANCE
          ? constantsMessages.performanceTitle
          : constantsMessages.applicationTitle
      )

    let menuItems = [
      {
        key: 'application',
        title: intl.formatMessage(constantsMessages.applicationTitle),
        onClick: goToHomeAction,
        selected:
          enableMenuSelection &&
          activeMenuItem === ACTIVE_MENU_ITEM.APPLICATIONS
      },
      {
        key: 'performance',
        title: intl.formatMessage(constantsMessages.performanceTitle),
        onClick: goToPerformanceReportListAction,
        selected:
          enableMenuSelection && activeMenuItem === ACTIVE_MENU_ITEM.PERFORMANCE
      }
    ]

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

    if (activeMenuItem === ACTIVE_MENU_ITEM.PERFORMANCE) {
      rightMenu = [
        {
          element: <ProfileMenu key="profileMenu" />
        }
      ]
    }

    if (
      userDetails &&
      userDetails.role &&
      SYS_ADMIN_ROLES.includes(userDetails.role)
    ) {
      menuItems = [
        {
          key: 'performance',
          title: intl.formatMessage(constantsMessages.performanceTitle),
          onClick: goToHomeAction,
          selected:
            enableMenuSelection &&
            activeMenuItem === ACTIVE_MENU_ITEM.PERFORMANCE
        },
        {
          key: 'team',
          title: intl.formatMessage(messages.teamTitle),
          onClick: goToHomeAction,
          selected:
            enableMenuSelection &&
            activeMenuItem !== ACTIVE_MENU_ITEM.PERFORMANCE
        }
      ]

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
    goToPerformanceReportListAction: goToPerformanceReportList
  }
)(injectIntl<'intl', IProps>(HeaderComp))
