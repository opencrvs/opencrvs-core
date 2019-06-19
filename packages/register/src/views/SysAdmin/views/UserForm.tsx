import * as React from 'react'
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl'
import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import styled from '@register/styledComponents'
import { FormFieldGenerator } from '@register/components/form'
import { IFormSection, IFormSectionData } from '@register/forms'
import { IStoreState } from '@register/store'
import { ActionPageLight } from '@opencrvs/components/lib/interface'
import { goToHome } from '@register/navigation'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'

const messages = defineMessages({
  continue: {
    id: 'button.continue',
    defaultMessage: 'Continue',
    description: 'Continue button label'
  }
})

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
        </ActionPageLight>
      </>
    )
  }
}

function mapStatetoProps(state: IStoreState) {
  return {
    userForm: state.userForm.userForm
  }
}

export const UserForm = connect((state: IStoreState) => mapStatetoProps)(
  injectIntl<IFullProps>(UserFormComponent)
)
