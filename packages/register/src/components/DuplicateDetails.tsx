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
import { defineMessages, injectIntl, InjectedIntlProps } from 'react-intl'

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

const messages = defineMessages({
  name: {
    id: 'register.duplicates.details.name',
    defaultMessage: 'Name',
    description: 'Name label'
  },
  dob: {
    id: 'register.duplicates.details.dob',
    defaultMessage: 'D.o.B.',
    description: 'Date of birth label'
  },
  gender: {
    id: 'register.duplicates.details.gender',
    defaultMessage: 'Gender',
    description: 'Gender label'
  },
  dateOfApplication: {
    id: 'register.duplicates.details.dateOfApplication',
    defaultMessage: 'Date of application',
    description: 'Date of application label'
  },
  trackingId: {
    id: 'register.duplicates.details.trackingId',
    defaultMessage: 'Tracking ID',
    description: 'Tracking ID label'
  },
  notDuplicate: {
    id: 'register.duplicates.details.notDuplicate',
    defaultMessage: 'Not a duplicate?',
    description: 'A Question which is a link: Not a duplicate?'
  },
  mother: {
    id: 'register.duplicates.details.mother',
    defaultMessage: 'Mother',
    description: 'Mother section label'
  },
  father: {
    id: 'register.duplicates.details.father',
    defaultMessage: 'Father',
    description: 'Father section label'
  },
  id: {
    id: 'register.duplicates.details.id',
    defaultMessage: 'ID',
    description: 'ID Label'
  },
  applicationState: {
    id: 'register.duplicates.details.applicationState',
    defaultMessage: 'Application {action} on',
    description: 'A label to describe when the application was actioned on'
  },
  by: {
    id: 'register.duplicates.details.by',
    defaultMessage: 'By',
    description: 'Label for By (the person who performed the action)'
  },
  review: {
    id: 'register.duplicates.details.review',
    defaultMessage: 'Review',
    description: 'A label from the review button'
  },
  birth: {
    id: 'register.duplicates.details.birthEvent',
    defaultMessage: 'Birth',
    description: 'A label from the birth event'
  },
  death: {
    id: 'register.duplicates.details.deathEvent',
    defaultMessage: 'Death',
    description: 'A label from the death event'
  },
  application: {
    id: 'register.duplicates.details.application',
    defaultMessage: 'application',
    description: 'A label for application'
  },
  submitted: {
    id: 'register.duplicates.details.submitted',
    defaultMessage: 'submitted',
    description: 'A label for submitted'
  },
  rejected: {
    id: 'register.duplicates.details.rejected',
    defaultMessage: 'rejected',
    description: 'A label for rejected'
  },
  registered: {
    id: 'register.duplicates.details.registered',
    defaultMessage: 'registered',
    description: 'A label for registered'
  },
  certified: {
    id: 'register.duplicates.details.certified',
    defaultMessage: 'certified',
    description: 'A label for certified'
  }
})

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

class DuplicateDetailsClass extends React.Component<
  IProps & InjectedIntlProps
> {
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
    const { data, intl } = this.props

    return (
      <DetailsBox currentStatus={currentStatus}>
        <DetailTextContainer>
          <DetailText>
            <b>{intl.formatMessage(messages.name)}:</b> {data.child.name}
            <br />
            <b>{intl.formatMessage(messages.dob)}:</b> {data.child.dob}
            <br />
            <b>{intl.formatMessage(messages.gender)}:</b> {data.child.gender}
            <br />
            <b>{intl.formatMessage(messages.dateOfApplication)}:</b>{' '}
            {data.dateOfApplication}
            <br />
            <b>{intl.formatMessage(messages.trackingId)}:</b> {data.trackingId}
            <br />
            <br />
          </DetailText>
          {this.props.notDuplicateHandler && (
            <Link onClick={this.props.notDuplicateHandler}>
              {intl.formatMessage(messages.notDuplicate)}
            </Link>
          )}
        </DetailTextContainer>
        <DetailTextSplitContainer>
          {data.mother && (
            <DetailText>
              <b>{intl.formatMessage(messages.mother)}</b>
              <br />
              <b>{intl.formatMessage(messages.name)}:</b> {data.mother.name}
              <br />
              <b>{intl.formatMessage(messages.dob)}:</b> {data.mother.dob}
              <br />
              <b>{intl.formatMessage(messages.gender)}:</b> {data.mother.gender}
              <br />
              <b>{intl.formatMessage(messages.id)}:</b> {data.mother.id}
              <br />
            </DetailText>
          )}
          {data.father && (
            <DetailText>
              <b>{intl.formatMessage(messages.father)}</b>
              <br />
              <b>{intl.formatMessage(messages.name)}:</b> {data.father.name}
              <br />
              <b>{intl.formatMessage(messages.dob)}:</b> {data.father.dob}
              <br />
              <b>{intl.formatMessage(messages.gender)}:</b> {data.father.gender}
              <br />
              <b>{intl.formatMessage(messages.id)}:</b> {data.father.id}
              <br />
            </DetailText>
          )}
        </DetailTextSplitContainer>
        <Separator />
        <TagContainer>
          <Chip
            status={<StatusGray />}
            text={intl.formatHTMLMessage(messages[data.event])}
          />
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
                <b>
                  {intl.formatMessage(messages.applicationState, {
                    action: intl.formatMessage(messages[status.action])
                  })}
                  :
                </b>{' '}
                {status.date}
                <br />
                <b>{intl.formatMessage(messages.by)}:</b> {status.usersName}
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
            <PrimaryButton>{intl.formatMessage(messages.review)}</PrimaryButton>
          </>
        )}
      </DetailsBox>
    )
  }
}

export const DuplicateDetails = injectIntl<IProps>(DuplicateDetailsClass)
