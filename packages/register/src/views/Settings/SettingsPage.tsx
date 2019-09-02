import * as React from 'react'
import { connect } from 'react-redux'
import {
  injectIntl,
  WrappedComponentProps as IntlShapeProps,
  FormattedMessage
} from 'react-intl'
import { IStoreState } from '@register/store'
import { getUserDetails } from '@register/profile/profileSelectors'
import { IUserDetails } from '@register/utils/userUtils'
import { GQLHumanName } from '@opencrvs/gateway/src/graphql/schema'
import styled from '@register/styledComponents'
import { Header } from '@register/components/interface/Header/Header'
import { AvatarLarge, Avatar } from '@opencrvs/components/lib/icons'
import { DataSection } from '@opencrvs/components/lib/interface/ViewData'
import {
  ResponsiveModal,
  NOTIFICATION_TYPE,
  Notification
} from '@opencrvs/components/lib/interface'
import { Select } from '@opencrvs/components/lib/forms'
import { PrimaryButton, TertiaryButton } from '@opencrvs/components/lib/buttons'
import {
  userMessages as messages,
  buttonMessages,
  constantsMessages
} from '@register/i18n/messages'
import { modifyUserDetails as modifyUserDetailsAction } from '@register/profile/profileActions'
import { getDefaultLanguage, getAvailableLanguages } from '@register/i18n/utils'
import { IntlState } from '@register/i18n/reducer'

const Container = styled.div`
  ${({ theme }) => theme.fonts.regularFont};
  ${({ theme }) => theme.shadows.mistyShadow};
  color: ${({ theme }) => theme.colors.copy};
  background: ${({ theme }) => theme.colors.white};
  padding: 40px 80px;
  margin: 36px auto;
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
  margin-left: 16px;
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

const Message = styled.div`
  margin-bottom: 16px;
`
const Label = styled.label`
  margin-bottom: 8px;
`
const ApplyButton = styled(PrimaryButton)`
  height: 40px;
  & div {
    padding: 0 8px;
  }
`
const CancelButton = styled(TertiaryButton)`
  height: 40px;
  & div {
    padding: 0;
  }
`
type IProps = IntlShapeProps & {
  language: string
  languages: IntlState['languages']
  userDetails: IUserDetails | null
  modifyUserDetails: typeof modifyUserDetailsAction
}

interface IState {
  showLanguageSettings: boolean
  selectedLanguage: string
  showSuccessNotification: boolean
}

interface ILanguageOptions {
  [key: string]: string
}

class SettingsView extends React.Component<IProps & IState, IState> {
  constructor(props: IProps & IState) {
    super(props)
    this.state = {
      showLanguageSettings: false,
      showSuccessNotification: false,
      selectedLanguage: this.props.userDetails
        ? this.props.userDetails.language
        : getDefaultLanguage()
    }
  }

  toggleLanguageSettingsModal = () => {
    this.setState(state => ({
      showLanguageSettings: !state.showLanguageSettings
    }))
  }

  toggleSuccessNotification = () => {
    this.setState(state => ({
      showSuccessNotification: !state.showSuccessNotification
    }))
  }

  cancelLanguageSettings = () => {
    this.setState(state => ({
      selectedLanguage: this.props.userDetails
        ? this.props.userDetails.language
        : getDefaultLanguage(),
      showLanguageSettings: !state.showLanguageSettings
    }))
  }

  changeLanguage = () => {
    if (this.props.userDetails) {
      this.props.userDetails.language = this.state.selectedLanguage
      this.props.modifyUserDetails(this.props.userDetails)

      this.toggleLanguageSettingsModal()
      this.toggleSuccessNotification()
    }
  }

  render() {
    const { userDetails, intl, languages } = this.props
    const langChoice = [] as ILanguageOptions[]
    const availableLangs = getAvailableLanguages()
    availableLangs.forEach((lang: string) => {
      if (languages[lang]) {
        langChoice.push({
          value: lang,
          label: languages[lang].displayName
        })
      }
    })

    let englishName = ''
    if (userDetails && userDetails.name) {
      const nameObj = userDetails.name.find(
        (storedName: GQLHumanName | null) => {
          const name = storedName as GQLHumanName
          return name.use === getDefaultLanguage()
        }
      ) as GQLHumanName

      englishName = `${String(nameObj.firstNames)} ${String(
        nameObj.familyName
      )}`
    }

    const mobile = (userDetails && userDetails.mobile) || ''

    const role =
      userDetails && userDetails.role
        ? intl.formatMessage(messages[userDetails.role])
        : ''
    const sections = [
      {
        title: intl.formatMessage(messages.profileTitle),
        items: [
          {
            label: intl.formatMessage(messages.labelEnglishName),
            value: englishName,
            action: {
              label: intl.formatMessage(buttonMessages.change),
              disabled: true
            }
          },
          {
            label: intl.formatMessage(constantsMessages.labelPhone),
            value: mobile,
            action: {
              label: intl.formatMessage(buttonMessages.change),
              disabled: true
            }
          }
        ]
      },
      {
        title: intl.formatMessage(messages.accountTitle),
        items: [
          {
            label: intl.formatMessage(constantsMessages.labelRole),
            value: role,
            action: {
              label: intl.formatMessage(buttonMessages.change),
              disabled: true
            }
          }
        ]
      },
      {
        title: intl.formatMessage(messages.securityTitle),
        items: [
          {
            label: intl.formatMessage(constantsMessages.labelPassword),
            placeHolder: 'Last change 4 days ago',
            action: {
              label: intl.formatMessage(buttonMessages.change),
              disabled: true
            }
          },
          {
            label: intl.formatMessage(constantsMessages.labelPin),
            placeHolder: 'Last change 4 days ago',
            action: {
              label: intl.formatMessage(buttonMessages.change),
              disabled: true
            }
          }
        ]
      },
      {
        title: intl.formatMessage(messages.systemTitle),
        items: [
          {
            label: intl.formatMessage(constantsMessages.labelLanguage),
            value: languages[this.state.selectedLanguage].displayName,
            action: {
              id: 'BtnChangeLanguage',
              label: intl.formatMessage(buttonMessages.change),
              handler: this.toggleLanguageSettingsModal
            }
          }
        ]
      }
    ]
    return (
      <>
        <Header title={intl.formatMessage(messages.settingsTitle)} />
        <Container>
          <SettingsTitle>
            {intl.formatMessage(messages.settingsTitle)}
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
        <ResponsiveModal
          id="ChangeLanguageModal"
          title={intl.formatMessage(messages.changeLanguageTitle)}
          show={this.state.showLanguageSettings}
          actions={[
            <CancelButton
              key="cancel"
              id="modal_cancel"
              onClick={this.cancelLanguageSettings}
            >
              {intl.formatMessage(buttonMessages.cancel)}
            </CancelButton>,
            <ApplyButton
              key="apply"
              id="apply_change"
              onClick={this.changeLanguage}
            >
              {intl.formatMessage(buttonMessages.apply)}
            </ApplyButton>
          ]}
          handleClose={this.cancelLanguageSettings}
        >
          <Message>
            {intl.formatMessage(messages.changeLanguageMessege)}
          </Message>
          <Label>{intl.formatMessage(constantsMessages.labelLanguage)}</Label>
          <Select
            id="SelectLanguage"
            onChange={(val: string) => {
              this.setState({
                selectedLanguage: val
              })
            }}
            value={this.state.selectedLanguage}
            options={langChoice}
            placeholder=""
          />
        </ResponsiveModal>
        <Notification
          type={NOTIFICATION_TYPE.SUCCESS}
          show={this.state.showSuccessNotification}
          callback={this.toggleSuccessNotification}
        >
          <FormattedMessage
            {...messages.changeLanguageSuccessMessage}
            values={{
              language: languages[this.state.selectedLanguage].displayName
            }}
          />
        </Notification>
      </>
    )
  }
}

export const SettingsPage = connect(
  (store: IStoreState) => ({
    language: store.i18n.language,
    languages: store.i18n.languages,
    userDetails: getUserDetails(store)
  }),
  {
    modifyUserDetails: modifyUserDetailsAction
  }
)(injectIntl(SettingsView))
