import * as React from 'react'
import { ActionPage, Box } from '@opencrvs/components/lib/interface'
import { Duplicate } from '@opencrvs/components/lib/icons'
import styled from 'src/styled-components'
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl'
import { WORK_QUEUE } from 'src/navigation/routes'
import {
  DuplicateDetails,
  Action as RegAction,
  Event
} from 'src/components/DuplicateDetails'

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

const Grid = styled.div`
  margin-top: 24px;
  display: grid;
  grid-gap: 20px;
  grid-template-columns: auto auto;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    grid-template-columns: auto;
  }
`

const mockDupeData = [
  {
    dateOfApplication: '17.01.2019',
    trackingId: '1234567890',
    event: Event.BIRTH,
    child: {
      name: 'Isa Annika Gomes',
      dob: '10.10.2018',
      gender: 'Female'
    },
    mother: {
      name: 'Jane Gomes',
      dob: '01.01.1950',
      gender: 'Female',
      id: '321'
    },
    father: {
      name: 'Jack Gomes',
      dob: '01.02.1955',
      gender: 'Male',
      id: '123'
    },
    regStatusHistory: [
      {
        action: RegAction.SUBMITTED,
        date: '17.01.2019',
        usersName: 'Ryan Crichton',
        usersRole: 'Family Welfare Assistant',
        office: 'Gazipur Union Health Clinic'
      }
    ]
  },
  {
    dateOfApplication: '17.01.2019',
    trackingId: '1234567890',
    event: Event.BIRTH,
    child: {
      name: 'Isa Annika Gomes',
      dob: '10.10.2018',
      gender: 'Female'
    },
    mother: {
      name: 'Jane Gomes',
      dob: '01.01.1950',
      gender: 'Female',
      id: '321'
    },
    father: {
      name: 'Jack Gomes',
      dob: '01.02.1955',
      gender: 'Male',
      id: '123'
    },
    regStatusHistory: [
      {
        action: RegAction.SUBMITTED,
        date: '17.01.2019',
        usersName: 'Ryan Crichton',
        usersRole: 'Family Welfare Assistant',
        office: 'Gazipur Union Health Clinic',
        reason: ''
      },
      {
        action: RegAction.REJECTED,
        date: '17.01.2019',
        usersName: 'Euan Millar',
        usersRole: 'Registrar',
        office: 'Gazipur Union Registration Office',
        reason: 'Duplicate'
      }
    ]
  },
  {
    dateOfApplication: '17.01.2019',
    trackingId: '1234567890',
    event: Event.BIRTH,
    child: {
      name: 'Isa Annika Gomes',
      dob: '10.10.2018',
      gender: 'Female'
    },
    mother: {
      name: 'Jane Gomes',
      dob: '01.01.1950',
      gender: 'Female',
      id: '321'
    },
    father: {
      name: 'Jack Gomes',
      dob: '01.02.1955',
      gender: 'Male',
      id: '123'
    },
    regStatusHistory: [
      {
        action: RegAction.SUBMITTED,
        date: '17.01.2019',
        usersName: 'Ryan Crichton',
        usersRole: 'Family Welfare Assistant',
        office: 'Gazipur Union Health Clinic',
        reason: ''
      },
      {
        action: RegAction.REGISTERED,
        date: '17.01.2019',
        usersName: 'Ryan Crichton',
        usersRole: 'Family Welfare Assistant',
        office: 'Gazipur Union Health Clinic'
      }
    ]
  }
]

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
          <Grid>
            {mockDupeData.map(data => (
              <DuplicateDetails data={data} />
            ))}
          </Grid>
        </Container>
      </ActionPage>
    )
  }
}

export const ReviewDuplicates = injectIntl(ReviewDuplicatesClass)
