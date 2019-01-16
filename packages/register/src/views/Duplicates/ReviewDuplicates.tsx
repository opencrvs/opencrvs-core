import * as React from 'react'
import { ActionPage, Box, Modal } from '@opencrvs/components/lib/interface'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { Duplicate } from '@opencrvs/components/lib/icons'
import gql from 'graphql-tag'
import { Mutation } from 'react-apollo'
import styled from 'src/styled-components'
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl'
import { WORK_QUEUE } from 'src/navigation/routes'

const messages = defineMessages({
  title: {
    id: 'register.duplicates.title',
    defaultMessage: 'Possible duplicates found',
    description: 'The title of the text box in the duplicates page'
  },
  description: {
    id: 'register.duplicates.description',
    defaultMessage:
      'The following application has been flagged as a possible duplicate of an existing registered record.',
    description: 'The description at the top of the duplicates page'
  },
  pageTitle: {
    id: 'register.duplicates.pageTitle',
    defaultMessage: 'Possible duplicate',
    description: 'The duplicates page title'
  }
})

const Container = styled.div`
  margin: 35px 250px 0px 250px;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin-left: 20px;
    margin-right: 20px;
  }
`

const TitleBox = styled(Box)`
  font-family: ${({ theme }) => theme.fonts.regularFont};
  font-size: 18px;
`

const Header = styled.span`
  font-family: ${({ theme }) => theme.fonts.boldFont};
  display: flex;
  align-items: center;
`

const HeaderText = styled.span`
  margin-left: 14px;
`

const rejectMutation = gql`
  mutation submitBirthAsRejected($id: ID!) {
    markBirthAsVoided(id: $id, reason: "Duplicate")
  }
`

class ReviewDuplicatesClass extends React.Component<InjectedIntlProps> {
  successfulSubmission = (response: string) => {
    const { history } = this.props
    history.push(SAVED_REGISTRATION, {
      ID: response
    })
  }

  render() {
    const { intl } = this.props
    return (
      <ActionPage
        goBack={() => {
          window.location.href = WORK_QUEUE
        }}
        title={intl.formatMessage(messages.pageTitle)}
      >
        <Container>
          <TitleBox>
            <Header>
              <Duplicate />
              <HeaderText>{intl.formatMessage(messages.title)}</HeaderText>
            </Header>
            <p>{intl.formatMessage(messages.description)}</p>
          </TitleBox>
          <Mutation mutation={rejectMutation} variables={{ id: '22' }}>
            {(submitBirthAsRejected, { data }) => {
              if (data && data.markBirthAsVoided) {
                this.successfulSubmission(data.markBirthAsVoided)
              }
              return (
                <Modal
                  title="Are you ready to submit?"
                  actions={[
                    <PrimaryButton
                      key="submit"
                      id="submit_confirm"
                      onClick={() => submitBirthAsRejected()}
                    >
                      {intl.formatMessage(messages.submitButton)}
                    </PrimaryButton>,
                    <PreviewButton
                      key="preview"
                      onClick={() => {
                        this.toggleSubmitModalOpen()
                        if (document.documentElement) {
                          document.documentElement.scrollTop = 0
                        }
                      }}
                    >
                      {intl.formatMessage(messages.preview)}
                    </PreviewButton>
                  ]}
                  show={this.state.showSubmitModal}
                  handleClose={this.toggleSubmitModalOpen}
                >
                  {intl.formatMessage(messages.submitDescription)}
                </Modal>
              )
            }}
          </Mutation>
        </Container>
      </ActionPage>
    )
  }
}

export const ReviewDuplicates = injectIntl(ReviewDuplicatesClass)
