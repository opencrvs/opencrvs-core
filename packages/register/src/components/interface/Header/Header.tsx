import * as React from 'react'
import {
  AppHeader,
  ExpandingMenu,
  SearchTool,
  ISearchType
} from '@opencrvs/components/lib/interface'
import {
  Hamburger,
  SearchDark,
  ApplicationBlack,
  ApplicationBlue,
  StatsBlack,
  StatsBlue,
  SettingsBlack,
  SettingsBlue,
  HelpBlack,
  HelpBlue,
  LogoutBlack,
  LogoutBlue,
  TrackingID,
  BRN,
  Phone,
  ArrowBack,
  Plus,
  SystemBlack,
  SystemBlue
} from '@opencrvs/components/lib/icons'
import { IconButton } from '@opencrvs/components/lib/buttons'
import { storage } from '@register/storage'
import { SCREEN_LOCK } from '@register/components/ProtectedPage'
import { connect } from 'react-redux'
import { getUserDetails } from '@register/profile/profileSelectors'
import { IUserDetails, getIndividualNameObj } from '@register/utils/userUtils'
import { redirectToAuthentication } from '@register/profile/profileActions'
import { IStoreState } from '@register/store'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import {
  goToHome,
  goToPerformance,
  goToSearchResult,
  goToSearch,
  goToSettings,
  goToEvents as goToEventsAction
} from '@register/navigation'
import { ProfileMenu } from '@register/components/ProfileMenu'
import {
  TRACKING_ID_TEXT,
  BRN_DRN_TEXT,
  PHONE_TEXT,
  SYS_ADMIN_ROLES
} from '@register/utils/constants'
import styled from 'styled-components'
import { messages } from '@register/i18n/messages/views/header'
import {
  constantsMessages,
  buttonMessages,
  userMessages
} from '@register/i18n/messages'
import { grid } from '@opencrvs/components/lib/grid'

type IProps = IntlShapeProps & {
  userDetails: IUserDetails | null
  redirectToAuthentication: typeof redirectToAuthentication
  language: string
  title?: string
  goToSearchResult: typeof goToSearchResult
  goToEvents: typeof goToEventsAction
  goToSearch: typeof goToSearch
  goToSettings: typeof goToSettings
  goToHomeAction: typeof goToHome
  goToPerformanceAction: typeof goToPerformance
  searchText?: string
  selectedSearchType?: string
  mobileSearchBar?: boolean
  enableMenuSelection?: boolean
}
interface IState {
  showMenu: boolean
  showLogoutModal: boolean
}

const StyledPrimaryButton = styled(IconButton)`
  ${({ theme }) => theme.shadows.mistyShadow};

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
        onClick: goToPerformance
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

  logout = () => {
    storage.removeItem(SCREEN_LOCK)
    this.props.redirectToAuthentication()
  }

  toggleMenu = () => {
    this.setState(prevState => ({ showMenu: !prevState.showMenu }))
  }

  renderSearchInput(props: IProps, isMobile?: boolean) {
    const { intl, searchText, selectedSearchType } = props

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
      }
    ]

    return (
      <SearchTool
        key="searchMenu"
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
      enableMenuSelection,
      goToHomeAction,
      goToPerformanceAction
    } = this.props
    const title =
      this.props.title || intl.formatMessage(constantsMessages.applicationTitle)

    let menuItems = [
      {
        key: 'application',
        title: intl.formatMessage(constantsMessages.applicationTitle),
        onClick: goToHomeAction,
        selected: enableMenuSelection !== undefined ? enableMenuSelection : true
      },
      {
        key: 'performance',
        title: intl.formatMessage(constantsMessages.performanceTitle),
        onClick: goToPerformanceAction,
        selected: false
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

    if (
      userDetails &&
      userDetails.role &&
      SYS_ADMIN_ROLES.includes(userDetails.role)
    ) {
      menuItems = [
        {
          key: 'sysadmin',
          title: intl.formatMessage(messages.systemTitle),
          onClick: goToHome,
          selected: true
        }
      ]

      rightMenu = [
        {
          element: <ProfileMenu key="profileMenu" />
        }
      ]
    }

    const mobileHeaderActionProps = this.props.mobileSearchBar
      ? {
          mobileLeft: {
            icon: () => <ArrowBack />,
            handler: () => window.history.back()
          },
          mobileBody: this.renderSearchInput(this.props, true)
        }
      : {
          mobileLeft: {
            icon: () => this.hamburger(),
            handler: this.toggleMenu
          },
          mobileRight: {
            icon: () => <SearchDark />,
            handler: () => this.props.goToSearch()
          }
        }

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
    goToPerformanceAction: goToPerformance
  }
)(injectIntl<'intl', IProps>(HeaderComp))
