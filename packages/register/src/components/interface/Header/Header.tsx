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
import { IUserDetails } from '@register/utils/userUtils'
import { redirectToAuthentication } from '@register/profile/profileActions'
import { IStoreState } from '@register/store'
import { GQLHumanName } from '@opencrvs/gateway/src/graphql/schema'
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl'
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
import styled from '@register/styledComponents'

type IProps = InjectedIntlProps & {
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

const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  FIELD_AGENT: {
    id: 'register.home.header.FIELD_AGENT',
    defaultMessage: 'Field Agent',
    description: 'The description for FIELD_AGENT role'
  },
  LOCAL_SYSTEM_ADMIN: {
    id: 'register.home.header.LOCAL_SYSTEM_ADMIN',
    defaultMessage: 'Sysadmin',
    description: 'The description for Sysadmin role'
  },
  REGISTRATION_CLERK: {
    id: 'register.home.header.REGISTRATION_CLERK',
    defaultMessage: 'Registration Clerk',
    description: 'The description for REGISTRATION_CLERK role'
  },
  LOCAL_REGISTRAR: {
    id: 'register.home.header.LOCAL_REGISTRAR',
    defaultMessage: 'Registrar',
    description: 'The description for LOCAL_REGISTRAR role'
  },
  DISTRICT_REGISTRAR: {
    id: 'register.home.header.DISTRICT_REGISTRAR',
    defaultMessage: 'District Registrar',
    description: 'The description for DISTRICT_REGISTRAR role'
  },
  STATE_REGISTRAR: {
    id: 'register.home.header.STATE_REGISTRAR',
    defaultMessage: 'State Registrar',
    description: 'The description for STATE_REGISTRAR role'
  },
  NATIONAL_REGISTRAR: {
    id: 'register.home.header.NATIONAL_REGISTRAR',
    defaultMessage: 'National Registrar',
    description: 'The description for NATIONAL_REGISTRAR role'
  },
  typeTrackingId: {
    id: 'register.home.header.typeTrackingId',
    defaultMessage: 'Tracking ID',
    description: 'Search menu tracking id type'
  },
  typeBrnDrn: {
    id: 'register.home.header.typeBrnDrn',
    defaultMessage: 'BRN/DRN',
    description: 'Search menu brn drn type'
  },
  typePhone: {
    id: 'register.home.header.typePhone',
    defaultMessage: 'Phone No.',
    description: 'Search menu phone no type'
  },
  placeHolderTrackingId: {
    id: 'register.home.header.placeHolderTrackingId',
    defaultMessage: 'Enter Tracking ID',
    description: 'Search menu tracking id place holder'
  },
  placeHolderBrnDrn: {
    id: 'register.home.header.placeHolderBrnDrn',
    defaultMessage: 'Enter BRN/DRN',
    description: 'Search menu brn drn place holder'
  },
  placeHolderPhone: {
    id: 'register.home.header.placeHolderPhone',
    defaultMessage: 'Enter Phone No.',
    description: 'Search menu phone no place holder'
  },
  defaultTitle: {
    id: 'register.home.header.defaultTitle',
    defaultMessage: 'Applications',
    description: 'Header default title'
  },
  applicationTitle: {
    id: 'register.home.header.applicationTitle',
    defaultMessage: 'Applications',
    description: 'Application title'
  },
  performanceTitle: {
    id: 'register.home.header.performanceTitle',
    defaultMessage: 'Performance',
    description: 'Performance title'
  },
  systemTitle: {
    id: 'register.home.header.systemTitle',
    defaultMessage: 'System',
    description: 'System title'
  },
  settingsTitle: {
    id: 'register.home.header.settingsTitle',
    defaultMessage: 'Settings',
    description: 'settings title'
  },
  helpTitle: {
    id: 'register.home.header.helpTitle',
    defaultMessage: 'Help',
    description: 'Help title'
  },
  logoutTitle: {
    id: 'register.home.header.logoutTitle',
    defaultMessage: 'Logout',
    description: 'logout title'
  }
})

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
      const nameObj = userDetails.name.find(
        (storedName: GQLHumanName | null) => {
          const name = storedName as GQLHumanName
          return name.use === language
        }
      ) as GQLHumanName
      name = nameObj
        ? `${String(nameObj.firstNames)} ${String(nameObj.familyName)}`
        : ''
    }

    const role =
      userDetails && userDetails.role
        ? intl.formatMessage(messages[userDetails.role])
        : ''

    let menuItems = [
      {
        icon: <ApplicationBlack />,
        iconHover: <ApplicationBlue />,
        label: this.props.intl.formatMessage(messages.applicationTitle),
        onClick: this.props.goToHomeAction
      },
      {
        icon: <StatsBlack />,
        iconHover: <StatsBlue />,
        label: this.props.intl.formatMessage(messages.performanceTitle),
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
        label: this.props.intl.formatMessage(messages.logoutTitle),
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
          label: this.props.intl.formatMessage(messages.logoutTitle),
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
        label: intl.formatMessage(messages.typeTrackingId),
        value: TRACKING_ID_TEXT,
        icon: <TrackingID />,
        placeHolderText: intl.formatMessage(messages.placeHolderTrackingId),
        isDefault: true
      },
      {
        label: intl.formatMessage(messages.typeBrnDrn),
        value: BRN_DRN_TEXT,
        icon: <BRN />,
        placeHolderText: intl.formatMessage(messages.placeHolderBrnDrn)
      },
      {
        label: intl.formatMessage(messages.typePhone),
        value: PHONE_TEXT,
        icon: <Phone />,
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
    const title = this.props.title || intl.formatMessage(messages.defaultTitle)

    let menuItems = [
      {
        key: 'application',
        title: intl.formatMessage(messages.applicationTitle),
        onClick: goToHomeAction,
        selected: enableMenuSelection !== undefined ? enableMenuSelection : true
      },
      {
        key: 'performance',
        title: intl.formatMessage(messages.performanceTitle),
        onClick: goToPerformanceAction,
        selected: false
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
    }

    const rightMenu = [
      {
        element: (
          <StyledPrimaryButton
            key="newEvent"
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
)(injectIntl<IProps>(HeaderComp))
