import * as React from 'react'
import styled from '@register/styledComponents'
import { ActionPage, Box } from '@opencrvs/components/lib/interface'
import { FormFieldGenerator } from '@register/components/form'
import { IFormSectionData, Event, Action } from '@register/forms'
import { hasFormError } from '@register/forms/utils'
import { IRejectRegistrationForm } from '@opencrvs/register/src/review/reject-registration'
import { IStoreState } from '@opencrvs/register/src/store'
import { connect } from 'react-redux'
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { getRejectForm } from '@opencrvs/register/src/review/selectors'
import { goToSearchResult } from '@register/navigation'
import {
  MutationProvider,
  MutationContext
} from '@register/views/DataProvider/MutationProvider'

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
const StyledPrimaryButton = styled(PrimaryButton)`
  box-shadow: 0 0 22px 0 rgba(0, 0, 0, 0.23);
`
interface IState {
  data: IFormSectionData
  enableUploadButton: boolean
}
interface IProps {
  draftId: string
  event: Event
  duplicate?: boolean
  onBack: () => void
  confirmRejectionEvent: () => void
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

  processSubmitData = () => {
    const reasons = this.state.data.rejectionReason as string[]
    let reason
    if (reasons) {
      reason = reasons.join()
    } else {
      reason = ''
    }
    return {
      id: this.props.draftId,
      reason,
      comment: this.state.data.rejectionCommentForHealthWorker
    }
  }

  render = () => {
    const { event, form, intl, confirmRejectionEvent, duplicate } = this.props
    const { fields } = form
    if (duplicate) {
      fields.map(field => {
        if (field.name === 'rejectionReason') {
          field.initialValue = ['duplicate']
        }
      })
    }

    return (
      <MutationProvider
        event={event}
        action={Action.REJECT_APPLICATION}
        payload={this.processSubmitData()}
        onCompleted={confirmRejectionEvent}
      >
        <MutationContext.Consumer>
          {({ mutation }) => (
            <OverlayContainer id="reject-registration-form-container">
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

                    <StyledPrimaryButton
                      id="submit_reject_form"
                      // @ts-ignore
                      onClick={() => mutation()}
                      disabled={!this.state.enableUploadButton}
                    >
                      {intl.formatMessage(messages.rejectionReasonSubmit)}
                    </StyledPrimaryButton>
                  </Box>
                </FormContainer>
              </ActionPage>
            </OverlayContainer>
          )}
        </MutationContext.Consumer>
      </MutationProvider>
    )
  }
}

export const RejectRegistrationForm = connect(
  (state: IStoreState) => ({
    language: state.i18n.language,
    form: getRejectForm(state)
  }),
  {
    goToSearchResult
  }
)(injectIntl(RejectRegistrationView))
