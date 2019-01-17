import * as React from 'react'
import { Box, Chip } from '@opencrvs/components/lib/interface'
import styled from 'src/styled-components'
import {
  StatusGray,
  StatusOrange,
  StatusGreen,
  StatusRejected,
  StatusCollected
} from '@opencrvs/components/lib/icons'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'

export enum Event {
  BIRTH = 'birth',
  DEATH = 'death'
}

export enum Action {
  SUBMITTED = 'submitted',
  REJECTED = 'rejected',
  REGISTERED = 'registered',
  CERTIFIED = 'certified'
}

interface IProps {
  data: {
    dateOfApplication: string
    trackingId: string
    event: Event
    child: {
      name: string
      dob: string
      gender: string
    }
    mother?: {
      name: string
      dob: string
      gender: string
      id: string
    }
    father?: {
      name: string
      dob: string
      gender: string
      id: string
    }
    regStatusHistory: Array<{
      action: Action
      date: string
      usersName: string
      usersRole: string
      office: string
      reason?: string
    }>
  }
  notDuplicateHandler?: () => void
}

const DetailsBox = styled(Box).attrs<{ currentStatus: string }>({})`
  border-top: ${({ theme }) => ` 4px solid ${theme.colors.expandedIndicator}`};
  ${({ currentStatus }) =>
    currentStatus === 'rejected' ? `box-shadow: none` : ''}
`

const Separator = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.background};
  margin: 24px -25px 24px -25px;
`

const DetailTextContainer = styled.div`
  display: flex;
  justify-content: space-between;
`

const DetailText = styled.div`
  flex: 1;
  font-family: ${({ theme }) => theme.fonts.regularFont};
  color: ${({ theme }) => theme.colors.copy};
  font-size: 16px;
`

const DetailTextSplitContainer = styled(DetailText)`
  display: flex;
  justify-content: stretch;
`

const Link = styled.a`
  font-family: ${({ theme }) => theme.fonts.regularFont};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 16px;
  text-decoration: underline;
`

const TagContainer = styled.div`
  display: flex;
`

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
`

const ListItem = styled.div`
  display: flex;
  margin-bottom: 16px;
`

const ListStatusContainer = styled.span`
  margin: 4px 8px;
`

export class DuplicateDetails extends React.Component<IProps> {
  normalizeAction(action: string) {
    if (action === 'submitted') {
      return 'application'
    }

    return action
  }

  renderStatusIcon(action: string) {
    switch (action) {
      case 'submitted':
        return <StatusOrange />
      case 'registered':
        return <StatusGreen />
      case 'rejected':
        return <StatusRejected />
      case 'certified':
        return <StatusCollected />
      default:
        return <StatusGray />
    }
  }

  render() {
    const currentStatus = this.props.data.regStatusHistory.slice(-1)[0].action
    const data = this.props.data

    return (
      <DetailsBox currentStatus={currentStatus}>
        <DetailTextContainer>
          <DetailText>
            <b>Name:</b> {data.child.name}
            <br />
            <b>D.o.B.:</b> {data.child.dob}
            <br />
            <b>Gender:</b> {data.child.gender}
            <br />
            <b>Date of application:</b> {data.dateOfApplication}
            <br />
            <b>Tracking ID:</b> {data.trackingId}
            <br />
            <br />
          </DetailText>
          {this.props.notDuplicateHandler && (
            <Link onClick={this.props.notDuplicateHandler}>
              Not a duplicate?
            </Link>
          )}
        </DetailTextContainer>
        <DetailTextSplitContainer>
          {data.mother && (
            <DetailText>
              <b>Mother</b>
              <br />
              <b>Name:</b> {data.mother.name}
              <br />
              <b>D.o.B.:</b> {data.mother.dob}
              <br />
              <b>Gender:</b> {data.mother.gender}
              <br />
              <b>ID:</b> {data.mother.id}
              <br />
            </DetailText>
          )}
          {data.father && (
            <DetailText>
              <b>Father</b>
              <br />
              <b>Name:</b> {data.father.name}
              <br />
              <b>D.o.B.:</b> {data.father.dob}
              <br />
              <b>Gender:</b> {data.father.gender}
              <br />
              <b>ID:</b> {data.father.id}
              <br />
            </DetailText>
          )}
        </DetailTextSplitContainer>
        <Separator />
        <TagContainer>
          <Chip status={<StatusGray />} text={data.event} />
          <Chip
            status={<StatusOrange />}
            text={this.normalizeAction(currentStatus)}
          />
        </TagContainer>
        <Separator />
        <ListContainer>
          {data.regStatusHistory.map(status => (
            <ListItem>
              <ListStatusContainer>
                {this.renderStatusIcon(status.action)}
              </ListStatusContainer>
              <DetailText>
                <b>Application {status.action} on:</b> {status.date}
                <br />
                <b>By:</b> {status.usersName}
                <br />
                {status.usersRole}
                <br />
                {status.office}
                <br />
              </DetailText>
            </ListItem>
          ))}
        </ListContainer>
        {currentStatus === 'submitted' && (
          <>
            <Separator />
            <PrimaryButton>Review</PrimaryButton>
          </>
        )}
      </DetailsBox>
    )
  }
}
