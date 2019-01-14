import * as React from 'react'
import { ActionPage, Box } from '@opencrvs/components/lib/interface'
import { Duplicate } from '@opencrvs/components/lib/icons'
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
    margin-left: 0px;
    margin-right: 0px;
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

class ReviewDuplicatesClass extends React.Component<InjectedIntlProps> {
  render() {
    return (
      <ActionPage
        goBack={() => {
          window.location.href = WORK_QUEUE
        }}
        title={this.props.intl.formatMessage(messages.pageTitle)}
      >
        <Container>
          <TitleBox>
            <Header>
              <Duplicate />
              <HeaderText>
                {this.props.intl.formatMessage(messages.title)}
              </HeaderText>
            </Header>
            <p>{this.props.intl.formatMessage(messages.description)}</p>
          </TitleBox>
        </Container>
      </ActionPage>
    )
  }
}

export const ReviewDuplicates = injectIntl(ReviewDuplicatesClass)
