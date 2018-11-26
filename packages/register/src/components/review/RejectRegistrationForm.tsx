import * as React from 'react'
import styled from 'styled-components'
import { ActionPage, Box } from '@opencrvs/components/lib/interface'
import { FormFieldGenerator } from 'src/components/form'
import { IFormSectionData } from 'src/forms'
import { hasFormError } from 'src/forms/utils'
import { IRejectRegistrationForm } from '@opencrvs/register/src/review/reject-registration'
import { IStoreState } from '@opencrvs/register/src/store'
import { connect } from 'react-redux'
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { getRejectForm } from '@opencrvs/register/src/review/selectors'

const messages = defineMessages({
  back: {
    id: 'menu.back',
    defaultMessage: 'Back',
    description: 'Back button in the menu'
  },
  rejectionFormTitle: {
    id: 'review.rejection.form.title',
    defaultMessage: 'Reasons for rejection',
    description: 'Rejection form title'
  },
  rejectionReasonSubmit: {
    id: 'review.rejection.form.submitButton',
    defaultMessage: 'Submit rejection',
    description: 'Rejection form submit button'
  }
})

const FormContainer = styled.div`
  padding: 35px 25px;
`
export const OverlayContainer = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.background};
  z-index: 4;
  width: 100%;
  height: 100%;
  overflow-y: scroll;
`
interface IState {
  data: IFormSectionData
  enableUploadButton: boolean
}

interface IProps {
  onBack: () => void
}

type IFullProps = InjectedIntlProps & IProps & { form: IRejectRegistrationForm }

class RejectRegistrationView extends React.Component<IFullProps, IState> {
  constructor(props: IFullProps) {
    super(props)
    this.state = {
      data: {},
      enableUploadButton: false
    }
  }

  storeData = (rejectionFormData: IFormSectionData) => {
    this.setState(
      () => ({ data: rejectionFormData }),
      () =>
        this.setState(() => ({
          enableUploadButton: this.shouldEnableUploadButton(rejectionFormData)
        }))
    )
  }

  shouldEnableUploadButton = (rejectionFormData: IFormSectionData) => {
    return (
      rejectionFormData &&
      !hasFormError(this.props.form.fields, rejectionFormData)
    )
  }

  submitData = () => {
    /* TODO submit rejection*/
  }

  render = () => {
    const { form, intl } = this.props
    const { fields } = form
    return (
      <OverlayContainer>
        <ActionPage
          title={intl.formatMessage(messages.rejectionFormTitle)}
          backLabel={intl.formatMessage(messages.back)}
          goBack={this.props.onBack}
        >
          <FormContainer>
            <Box>
              <FormFieldGenerator
                id="reject_form"
                fields={fields}
                onChange={this.storeData}
                setAllFieldsDirty={false}
              />

              <PrimaryButton
                id="submit_reject_form"
                onClick={this.submitData}
                disabled={!this.state.enableUploadButton}
              >
                {intl.formatMessage(messages.rejectionReasonSubmit)}
              </PrimaryButton>
            </Box>
          </FormContainer>
        </ActionPage>
      </OverlayContainer>
    )
  }
}

export const RejectRegistrationForm = connect((state: IStoreState) => ({
  language: state.i18n.language,
  form: getRejectForm(state)
}))(injectIntl(RejectRegistrationView))
