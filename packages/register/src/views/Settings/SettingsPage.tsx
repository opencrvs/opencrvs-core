import * as React from 'react'
import { connect } from 'react-redux'
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl'
import { IStoreState } from 'src/store'
import { getUserDetails } from 'src/profile/profileSelectors'
import { IUserDetails } from 'src/utils/userUtils'
import { GQLHumanName } from '@opencrvs/gateway/src/graphql/schema'
import styled from 'src/styled-components'
import { Header } from 'src/components/interface/Header/Header'
import { AvatarLarge, Avatar } from '@opencrvs/components/lib/icons'
import { DataSection } from '@opencrvs/components/lib/interface/ViewData'

const messages = defineMessages({
  settings_title: {
    id: 'settings.title',
    defaultMessage: 'Settings',
    description: 'Title of the settings page'
  },
  profile_title: {
    id: 'profile.title',
    defaultMessage: 'Profile',
    description: 'Profile header'
  },
  security_title: {
    id: 'security.title',
    defaultMessage: 'Security',
    description: 'Security header'
  },
  account_title: {
    id: 'account.title',
    defaultMessage: 'Account',
    description: 'Account header'
  },
  system_title: {
    id: 'system.title',
    defaultMessage: 'System',
    description: 'System header'
  },
  label_english_name: {
    id: 'label.nameEN',
    defaultMessage: 'English name',
    description: 'English name label'
  },
  label_bangla_name: {
    id: 'label.nameBN',
    defaultMessage: 'Bangla name',
    description: 'Bangla name label'
  },
  label_phone: {
    id: 'label.phone',
    defaultMessage: 'Phone number',
    description: 'Phone label'
  },
  label_role: {
    id: 'label.role',
    defaultMessage: 'Role',
    description: 'Role label'
  },
  label_password: {
    id: 'label.password',
    defaultMessage: 'Password',
    description: 'Password label'
  },
  label_pin: {
    id: 'label.pin',
    defaultMessage: 'PIN',
    description: 'PIN label'
  },
  label_language: {
    id: 'label.language',
    defaultMessage: 'Language',
    description: 'language label'
  },
  action_change: {
    id: 'action.change',
    defaultMessage: 'Change',
    description: 'Change action'
  },
  FIELD_AGENT: {
    id: 'register.home.header.FIELD_AGENT',
    defaultMessage: 'Field Agent',
    description: 'The description for FIELD_AGENT role'
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
  }
})

const Container = styled.div`
  ${({ theme }) => theme.fonts.regularFont};
  color: ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => theme.colors.white};
  box-shadow: 0px 2px 6px rgba(53, 67, 93, 0.32);
  padding: 40px 80px;
  margin: 36px auto 0;
  width: 1156px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin: 0;
    padding: 24px 0;
    width: 100%;
    min-height: 100vh;
    margin-top: 0;
    box-shadow: 0 0 0 rgba(0, 0, 0, 0);
  }
`

const SettingsTitle = styled.div`
  ${({ theme }) => theme.fonts.h1Style};
  height: 72px;
  margin-left: 24px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`
const Content = styled.div`
  display: flex;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    flex-direction: column-reverse;
  }
`
const Left = styled.div`
  margin: 0 16px;
  flex-grow: 1;
`
const Right = styled.div`
  display: flex;
  padding-top: 80px;
  margin-left: 112px;
  & .desktop {
    display: block;
  }
  & .tablet {
    display: none;
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    padding-top: 0;
    margin-left: 24px;
    & .desktop {
      display: none;
    }
    & .tablet {
      display: block;
    }
  }
`

type IProps = InjectedIntlProps & {
  language: string
  userDetails: IUserDetails
}

class SettingsView extends React.Component<IProps> {
  render() {
    const { userDetails, intl } = this.props
    let bengaliName = ''
    if (userDetails && userDetails.name) {
      const nameObj = userDetails.name.find(
        (storedName: GQLHumanName) => storedName.use === 'bn'
      ) as GQLHumanName
      bengaliName = `${String(nameObj.firstNames)} ${String(
        nameObj.familyName
      )}`
    }

    let englishName = ''
    if (userDetails && userDetails.name) {
      const nameObj = userDetails.name.find(
        (storedName: GQLHumanName) => storedName.use === 'en'
      ) as GQLHumanName
      englishName = `${String(nameObj.firstNames)} ${String(
        nameObj.familyName
      )}`
    }

    const role =
      userDetails && userDetails.role
        ? intl.formatMessage(messages[userDetails.role])
        : ''

    const sections = [
      {
        title: intl.formatMessage(messages.profile_title),
        items: [
          {
            label: intl.formatMessage(messages.label_bangla_name),
            value: bengaliName,
            action: {
              label: intl.formatMessage(messages.action_change),
              disabled: true
            }
          },
          {
            label: intl.formatMessage(messages.label_english_name),
            value: englishName,
            action: {
              label: intl.formatMessage(messages.action_change),
              disabled: true
            }
          },
          {
            label: intl.formatMessage(messages.label_phone),
            value: '01711111111',
            action: {
              label: intl.formatMessage(messages.action_change),
              disabled: true
            }
          }
        ]
      },
      {
        title: intl.formatMessage(messages.account_title),
        items: [
          {
            label: intl.formatMessage(messages.label_role),
            value: role,
            action: {
              label: intl.formatMessage(messages.action_change),
              disabled: true
            }
          }
        ]
      },
      {
        title: intl.formatMessage(messages.security_title),
        items: [
          {
            label: intl.formatMessage(messages.label_password),
            placeHolder: 'Last change 4 days ago',
            action: {
              label: intl.formatMessage(messages.action_change),
              disabled: true
            }
          },
          {
            label: intl.formatMessage(messages.label_pin),
            placeHolder: 'Last change 4 days ago',
            action: {
              label: intl.formatMessage(messages.action_change),
              disabled: true
            }
          }
        ]
      },
      {
        title: intl.formatMessage(messages.system_title),
        items: [
          {
            label: intl.formatMessage(messages.label_language),
            value: 'English',
            action: {
              label: intl.formatMessage(messages.action_change)
            }
          }
        ]
      }
    ]
    return (
      <>
        <Header title={intl.formatMessage(messages.settings_title)} />
        <Container>
          <SettingsTitle>
            {intl.formatMessage(messages.settings_title)}
          </SettingsTitle>
          <Content>
            <Left>
              {sections.map((sec, index: number) => (
                <DataSection key={index} {...sec} />
              ))}
            </Left>
            <Right>
              <Avatar className="tablet" />
              <AvatarLarge className="desktop" />
            </Right>
          </Content>
        </Container>
      </>
    )
  }
}

export const SettingsPage = connect(
  (store: IStoreState) => ({
    language: store.i18n.language,
    userDetails: getUserDetails(store)
  }),
  {}
)(injectIntl<IProps>(SettingsView))
