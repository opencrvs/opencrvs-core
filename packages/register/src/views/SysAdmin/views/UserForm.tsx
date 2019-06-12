import * as React from 'react'
import styled from 'src/styled-components'
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl'
import { FormFieldGenerator } from 'src/components/form'
import { IFormSection, IFormSectionData } from 'src/forms'
import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { IStoreState } from 'src/store'
import { ActionPageLight } from '@opencrvs/components/lib/interface'
import { goToHome } from 'src/navigation'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'

const messages = defineMessages({
  continue: {
    id: 'button.continue',
    defaultMessage: 'Continue',
    description: 'Continue button label'
  }
})
const Container = styled.div`
  ${({ theme }) => theme.fonts.regularFont};
  ${({ theme }) => theme.shadows.mistyShadow};
  color: ${({ theme }) => theme.colors.copy};
  background: ${({ theme }) => theme.colors.white};
  padding: 24px 32px;
  margin: 36px auto 0;
  max-width: 940px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin: 0;
    padding: 24px;
    width: 100%;
    min-height: 100vh;
    margin-top: 0;
    box-shadow: 0 0 0 rgba(0, 0, 0, 0);
  }
`

const FormTitle = styled.div`
  ${({ theme }) => theme.fonts.h1Style};
  height: 72px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`

const Action = styled.div`
  margin-top: 32px;
`
type State = {
  data: IFormSectionData
}

type IProps = {
  userForm: IFormSection
}

type IFullProps = InjectedIntlProps & IProps & { dispatch: Dispatch }

class UserFormComponent extends React.Component<IFullProps, State> {
  constructor(props: IFullProps) {
    super(props)
    this.state = {
      data: {}
    }
  }

  storeData = (documentData: IFormSectionData) => {
    console.log(JSON.stringify(documentData))
    this.setState({
      data: documentData
    })
  }

  render = () => {
    const { dispatch, userForm, intl } = this.props
    return (
      <>
        <ActionPageLight
          title={intl.formatMessage(userForm.title)}
          goBack={() => {
            dispatch(goToHome())
          }}
        >
          <Container>
            <FormTitle>{intl.formatMessage(userForm.title)}</FormTitle>
            <FormFieldGenerator
              id={userForm.id}
              onChange={this.storeData}
              setAllFieldsDirty={false}
              fields={userForm.fields}
            />
            <Action>
              <PrimaryButton>
                {intl.formatMessage(messages.continue)}
              </PrimaryButton>
            </Action>
          </Container>
        </ActionPageLight>
      </>
    )
  }
}

function mapStatetoProps(state: IStoreState) {
  return {
    language: state.i18n.language,
    userForm: state.userForm.userForm
  }
}

export const UserForm = connect((state: IStoreState) => mapStatetoProps)(
  injectIntl<IFullProps>(UserFormComponent)
)
