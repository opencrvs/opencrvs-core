import * as React from 'react'
import { Box, Chip } from '@opencrvs/components/lib/interface'
import styled from '@register/styledComponents'
import {
  StatusGray,
  StatusOrange,
  StatusGreen,
  StatusRejected,
  StatusCollected,
  Delete
} from '@opencrvs/components/lib/icons'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { defineMessages, injectIntl, InjectedIntlProps } from 'react-intl'
import { connect } from 'react-redux'
import { goToPage as goToPageAction } from '@register/navigation'
import { REVIEW_EVENT_PARENT_FORM_PAGE } from '@register/navigation/routes'
import Moment from 'react-moment'
import { getRejectionReasonDisplayValue } from '@register/views/SearchResult/SearchResult'

export enum Event {
  BIRTH = 'BIRTH',
  DEATH = 'DEATH'
}

export enum Action {
  DECLARED = 'DECLARED',
  REJECTED = 'REJECTED',
  REGISTERED = 'REGISTERED',
  CERTIFIED = 'CERTIFIED'
}

interface IProps {
  id: string
  duplicateContextId: string
  data: {
    id: string
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
      id: string
    }
    father?: {
      name: string
      dob: string
      id: string
    }
    regStatusHistory: Array<{
      action: Action
      date: string
      usersName: string
      usersRole: string
      office: string
      reasons?: string
    }>
  }
  notDuplicateHandler?: () => void
  rejectHandler?: () => void
  goToPage: typeof goToPageAction
}

const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
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
  reason: {
    id: 'register.duplicates.details.reason',
    defaultMessage: 'Reason',
    description: 'Label for Reason the application was rejected'
  },
  review: {
    id: 'register.duplicates.details.review',
    defaultMessage: 'Review',
    description: 'A label from the review button'
  },
  BIRTH: {
    id: 'register.duplicates.details.birthEvent',
    defaultMessage: 'Birth',
    description: 'A label from the birth event'
  },
  DEATH: {
    id: 'register.duplicates.details.deathEvent',
    defaultMessage: 'Death',
    description: 'A label from the death event'
  },
  application: {
    id: 'register.duplicates.details.application',
    defaultMessage: 'application',
    description: 'A label for application'
  },
  DECLARED: {
    id: 'register.duplicates.details.submitted',
    defaultMessage: 'submitted',
    description: 'A label for submitted'
  },
  REJECTED: {
    id: 'register.duplicates.details.rejected',
    defaultMessage: 'rejected',
    description: 'A label for rejected'
  },
  REGISTERED: {
    id: 'register.duplicates.details.registered',
    defaultMessage: 'registered',
    description: 'A label for registered'
  },
  CERTIFIED: {
    id: 'register.duplicates.details.certified',
    defaultMessage: 'certified',
    description: 'A label for certified'
  },
  rejectLinkText: {
    id: 'register.duplicates.button.reject',
    defaultMessage: 'Reject',
    description: 'A label for reject link'
  }
})

const DetailsBox = styled(Box).attrs<{ id: string; currentStatus: string }>({})`
  border-top: ${({ theme }) => ` 4px solid ${theme.colors.primary}`};
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
  ${({ theme }) => theme.fonts.bodyStyle};
  color: ${({ theme }) => theme.colors.copy};
`

const DetailTextSplitContainer = styled(DetailText)`
  display: flex;
  justify-content: stretch;
  cursor: pointer;
`

const Link = styled.a`
  ${({ theme }) => theme.fonts.bodyStyle};
  color: ${({ theme }) => theme.colors.primary};
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

const RejectApplication = styled.a`
  ${({ theme }) => theme.fonts.bodyStyle};
  color: ${({ theme }) => theme.colors.error};
  text-decoration: underline;
  cursor: pointer;
  margin-left: 60px;
  svg {
    margin-right: 15px;
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.sm}px) {
    margin-left: 30px;
  }
`
const ConditionalSeparator = styled(Separator)`
  display: none;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.sm}px) {
    border: 0px;
    display: block;
  }
`

class DuplicateDetailsClass extends React.Component<
  IProps & InjectedIntlProps
> {
  normalizeAction(action: string) {
    if (action === 'DECLARED') {
      return 'application'
    }

    return action
  }

  renderStatusIcon(action: string) {
    switch (action) {
      case 'DECLARED':
        return <StatusOrange />
      case 'REGISTERED':
        return <StatusGreen />
      case 'REJECTED':
        return <StatusRejected />
      case 'CERTIFIED':
        return <StatusCollected />
      default:
        return <StatusGray />
    }
  }

  render() {
    const currentStatus = this.props.data.regStatusHistory.slice(-1)[0].action
    const {
      data,
      intl,
      notDuplicateHandler,
      rejectHandler,
      duplicateContextId
    } = this.props

    return (
      <DetailsBox id={`detail_box_${data.id}`} currentStatus={currentStatus}>
        <DetailTextContainer>
          <DetailText>
            <b>{intl.formatMessage(messages.name)}:</b> {data.child.name}
            <br />
            <b>{intl.formatMessage(messages.dob)}:</b> {data.child.dob}
            <br />
            <b>{intl.formatMessage(messages.gender)}:</b> {data.child.gender}
            <br />
            <b>{intl.formatMessage(messages.dateOfApplication)}:</b>{' '}
            <Moment format="DD-MM-YYYY">{data.dateOfApplication}</Moment>
            <br />
            <b>{intl.formatMessage(messages.trackingId)}:</b> {data.trackingId}
            <br />
            <br />
          </DetailText>
          {notDuplicateHandler && (
            <Link
              id={`not_duplicate_link_${data.id}`}
              onClick={notDuplicateHandler}
            >
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
              <b>{intl.formatMessage(messages.id)}:</b> {data.father.id}
              <br />
            </DetailText>
          )}
        </DetailTextSplitContainer>
        <Separator />
        <TagContainer>
          <Chip
            status={<StatusGray />}
            text={intl.formatHTMLMessage(messages[data.event.toUpperCase()])}
          />
          <Chip
            status={this.renderStatusIcon(currentStatus)}
            text={this.normalizeAction(currentStatus)}
          />
        </TagContainer>
        <Separator />
        <ListContainer>
          {data.regStatusHistory.map((status, i) => (
            <ListItem key={i}>
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
                {status.action === Action.REJECTED && status.reasons && (
                  <>
                    <b>{intl.formatMessage(messages.reason)}:</b>{' '}
                    {status.reasons
                      .split(',')
                      .map(reason =>
                        intl.formatMessage(
                          getRejectionReasonDisplayValue(reason)
                        )
                      )
                      .join(', ')}
                  </>
                )}
                <br />
              </DetailText>
            </ListItem>
          ))}
        </ListContainer>
        {currentStatus === Action.DECLARED && (
          <>
            <Separator />
            <PrimaryButton
              id={`review_link_${data.id}`}
              onClick={() => {
                this.props.goToPage(
                  REVIEW_EVENT_PARENT_FORM_PAGE,
                  data.id,
                  'review',
                  'birth',
                  '',
                  { duplicate: true, duplicateContextId }
                )
              }}
            >
              {intl.formatMessage(messages.review)}
            </PrimaryButton>
            {rejectHandler && (
              <>
                <ConditionalSeparator />
                <RejectApplication
                  id={`reject_link_${data.id}`}
                  onClick={rejectHandler}
                >
                  <Delete />
                  {intl.formatMessage(messages.rejectLinkText)}
                </RejectApplication>
              </>
            )}
          </>
        )}
      </DetailsBox>
    )
  }
}

export const DuplicateDetails = connect(
  null,
  {
    goToPage: goToPageAction
  }
)(injectIntl<IProps>(DuplicateDetailsClass))
