import * as React from 'react'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { IDraft } from 'src/drafts'
import {
  goToTab as goToTabAction,
  goToHome as goToHomeAction
} from 'src/navigation'
import { getUserDetails } from 'src/profile/profileSelectors'
import { IStoreState } from 'src/store'
import { IUserDetails } from 'src/utils/userUtils'
import { StatusProgress } from '@opencrvs/components/lib/icons'
import { SubPage, Spinner } from '@opencrvs/components/lib/interface'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'
import { getDraftApplicantFullName } from 'src/utils/draftUtils'
import styled from 'styled-components'
import { createNamesMap } from 'src/utils/data-formatting'
import { formatLongDate } from 'src/utils/date-formatting'
import { GQLHumanName, GQLQuery } from '@opencrvs/gateway/src/graphql/schema.d'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { Event } from '@opencrvs/register/src/forms'
import {
  DRAFT_BIRTH_PARENT_FORM,
  DRAFT_DEATH_FORM
} from 'src/navigation/routes'
import { Query } from 'react-apollo'
import { FETCH_REGISTRATION_BY_COMPOSITION } from './queries'
import * as Sentry from '@sentry/browser'

const HistoryWrapper = styled.div`
  padding: 10px 0px;
  flex: 1;
  display: flex;
  flex-direction: row;
  color: ${({ theme }) => theme.colors.copy};
  font-family: ${({ theme }) => theme.fonts.regularFont};
  &:last-child {
    margin-bottom: 0;
  }
`
const StyledLabel = styled.label`
  margin-right: 3px;
`
const StyledValue = styled.span`
  font-family: ${({ theme }) => theme.fonts.boldFont};
`
const Separator = styled.div`
  height: 20px;
  width: 1px;
  margin: 1px 8px;
  background: ${({ theme }) => theme.colors.copyAlpha80};
`
const ValueContainer = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  line-height: 1.3em;
`
const StatusContainer = styled.div`
  flex: 1;
  margin-left: 10px;
`
const ActionButton = styled(PrimaryButton)`
  margin: 20px 25px 30px;
`
const QuerySpinner = styled(Spinner)`
  width: 70px;
  height: 70px;
  top: 150px !important;
`
const SpinnerContainer = styled.div`
  min-height: 70px;
  min-width: 70px;
  display: flex;
  justify-content: center;
`

enum ApplicationStatus {
  DRAFT_STARTED = 'DRAFT_STARTED',
  DRAFT_MODIFIED = 'DRAFT_MODIFIED',
  DECLARED = 'DECLARED',
  REGISTERED = 'REGISTERED',
  CERTIFIED = 'CERTIFIED',
  REJECTED = 'REJECTED'
}

interface IDetailProps {
  language: string
  applicationId: string
  draft: IDraft
  userDetails: IUserDetails
  goToTab: typeof goToTabAction
  goToHome: typeof goToHomeAction
}

interface IStatus {
  type: ApplicationStatus | null
  practitionerName: string
  timestamp: string | null
  practitionerRole: string
  officeName: string | Array<string | null> | null
}

interface IHistoryData {
  title: string
  history: IStatus[]
  action?: React.ReactElement
}

const messages = defineMessages({
  workflowStatusDateDraftStarted: {
    id: 'register.details.status.dateLabel.draft.started',
    defaultMessage: 'Started on',
    description:
      'Label for the workflow timestamp when the status is draft created'
  },
  workflowStatusDateDraftUpdated: {
    id: 'register.details.status.dateLabel.draft.updateds',
    defaultMessage: 'Updated on',
    description:
      'Label for the workflow timestamp when the status is draft updated'
  },
  workflowStatusDateRegistered: {
    id: 'register.workQueue.listItem.status.dateLabel.registered',
    defaultMessage: 'Registrated on',
    description:
      'Label for the workflow timestamp when the status is registered'
  },
  workflowStatusDateRejected: {
    id: 'register.workQueue.listItem.status.dateLabel.rejected',
    defaultMessage: 'Rejected on',
    description: 'Label for the workflow timestamp when the status is rejected'
  },
  workflowStatusDateCollected: {
    id: 'register.workQueue.listItem.status.dateLabel.collected',
    defaultMessage: 'Printed on',
    description: 'Label for the workflow timestamp when the status is collected'
  },
  workflowPractitionerLabel: {
    id: 'register.workQueue.listItem.status.label.byPractitioner',
    defaultMessage: 'By',
    description: 'Label for the practitioner name in workflow'
  },
  workflowStatusDateApplication: {
    id: 'register.workQueue.listItem.status.dateLabel.application',
    defaultMessage: 'Application submitted on',
    description:
      'Label for the workflow timestamp when the status is application'
  },
  FIELD_AGENT: {
    id: 'register.home.header.FIELD_AGENT',
    defaultMessage: 'Field Agent',
    description: 'The description for FIELD_AGENT role'
  },
  REGISTRATION_CLERK: {
    id: 'register.home.header.REGISTRATION_CLERK',
    defaultMessage: 'Registration Clerk',
    description: 'The description for REGISTRATION_CLERK role'
  },
  LOCAL_REGISTRAR: {
    id: 'register.home.header.LOCAL_REGISTRAR',
    defaultMessage: 'Registrar',
    description: 'The description for LOCAL_REGISTRAR role'
  },
  DISTRICT_REGISTRAR: {
    id: 'register.home.header.DISTRICT_REGISTRAR',
    defaultMessage: 'District Registrar',
    description: 'The description for DISTRICT_REGISTRAR role'
  },
  STATE_REGISTRAR: {
    id: 'register.home.header.STATE_REGISTRAR',
    defaultMessage: 'State Registrar',
    description: 'The description for STATE_REGISTRAR role'
  },
  NATIONAL_REGISTRAR: {
    id: 'register.home.header.NATIONAL_REGISTRAR',
    defaultMessage: 'National Registrar',
    description: 'The description for NATIONAL_REGISTRAR role'
  },
  update: {
    id: 'register.workQueue.list.buttons.update',
    defaultMessage: 'Update',
    description: 'The title of update button in list item actions'
  }
})

function LabelValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <StyledLabel>{label}:</StyledLabel>
      <StyledValue>{value}</StyledValue>
    </div>
  )
}
function ValuesWithSeparator(props: {
  strings: string[]
  separator: React.ReactNode
}): JSX.Element {
  return (
    <ValueContainer>
      {props.strings.map((value, index) => {
        return (
          <React.Fragment key={index}>
            {value}
            {index < props.strings.length - 1 && value.length > 0
              ? props.separator
              : null}
          </React.Fragment>
        )
      })}
    </ValueContainer>
  )
}

function generateHistoryEntry(
  type: ApplicationStatus,
  name: GQLHumanName[] | undefined,
  date: string,
  role: string,
  office: string,
  language: string = 'en'
): IStatus {
  return {
    type,
    practitionerName:
      (name && (createNamesMap(name)[language] as string)) ||
      (name &&
        /* tslint:disable:no-string-literal */
        (createNamesMap(name)['default'] as string)) ||
      /* tslint:enable:no-string-literal */
      '',
    timestamp: (date && formatLongDate(date, language, 'LL')) || null,
    practitionerRole: role,
    officeName: office
  }
}

class DetailView extends React.Component<IDetailProps & InjectedIntlProps> {
  getWorkflowDateLabel = (status: string) => {
    switch (status) {
      case 'DRAFT_STARTED':
        return messages.workflowStatusDateDraftStarted
      case 'DRAFT_MODIFIED':
        return messages.workflowStatusDateDraftUpdated
      case 'APPLICATION':
        return messages.workflowStatusDateApplication
      case 'REGISTERED':
        return messages.workflowStatusDateRegistered
      case 'REJECTED':
        return messages.workflowStatusDateRejected
      case 'CERTIFIED':
        return messages.workflowStatusDateCollected
      default:
        return messages.workflowStatusDateApplication
    }
  }

  generateDraftHistorData = (): IHistoryData => {
    const { draft, userDetails } = this.props
    const history: IStatus[] = []
    history.push(
      generateHistoryEntry(
        ApplicationStatus.DRAFT_STARTED,
        userDetails.name as GQLHumanName[],
        (draft.savedOn && new Date(draft.savedOn).toString()) || '',
        userDetails && userDetails.role
          ? this.props.intl.formatMessage(messages[userDetails.role as string])
          : '',
        (userDetails &&
          userDetails.primaryOffice &&
          userDetails.primaryOffice.name) ||
          ''
      )
    )
    if (draft.modifiedOn) {
      history.push(
        generateHistoryEntry(
          ApplicationStatus.DRAFT_MODIFIED,
          userDetails.name as GQLHumanName[],
          new Date(draft.modifiedOn).toString(),
          userDetails && userDetails.role
            ? this.props.intl.formatMessage(
                messages[userDetails.role as string]
              )
            : '',
          (userDetails &&
            userDetails.primaryOffice &&
            userDetails.primaryOffice.name) ||
            ''
        )
      )
    }
    const tabRoute =
      draft.event === Event.BIRTH ? DRAFT_BIRTH_PARENT_FORM : DRAFT_DEATH_FORM
    return {
      title: getDraftApplicantFullName(draft, this.props.language),
      history,
      action: (
        <ActionButton
          id="draft_update"
          onClick={() =>
            this.props.goToTab(
              tabRoute,
              draft.id,
              '',
              (draft.event && draft.event.toString()) || ''
            )
          }
        >
          {this.props.intl.formatMessage(messages.update)}
        </ActionButton>
      )
    }
  }

  generateGqlHistorData = (data: GQLQuery): IHistoryData | null => {
    return null
  }

  renderHistory(statuses: IStatus[]): JSX.Element[] | null {
    return (
      (statuses &&
        statuses.map((status, i) => {
          const { practitionerName, practitionerRole, officeName } = status
          return (
            <HistoryWrapper key={i}>
              <StatusProgress />
              <StatusContainer>
                <LabelValue
                  label={this.props.intl.formatMessage(
                    this.getWorkflowDateLabel(status.type as string)
                  )}
                  value={status.timestamp || ''}
                />
                <ValueContainer>
                  <StyledLabel>
                    {this.props.intl.formatMessage(
                      messages.workflowPractitionerLabel
                    )}
                    :
                  </StyledLabel>
                  <ValuesWithSeparator
                    strings={[
                      practitionerName,
                      practitionerRole,
                      (officeName && (officeName as string)) || ''
                    ]}
                    separator={<Separator />}
                  />
                </ValueContainer>
              </StatusContainer>
            </HistoryWrapper>
          )
        })) ||
      null
    )
  }

  renderSubPage(historyData: IHistoryData | undefined) {
    return (
      (historyData && (
        <SubPage title={historyData.title} goBack={this.props.goToHome}>
          {this.renderHistory(historyData.history)}
          {historyData.action}
        </SubPage>
      )) ||
      null
    )
  }

  render() {
    return (
      (this.props.draft &&
        this.renderSubPage(this.generateDraftHistorData())) || (
        <>
          <Query
            query={FETCH_REGISTRATION_BY_COMPOSITION}
            variables={{
              id: this.props.applicationId
            }}
          >
            {({ loading, error, data }) => {
              if (error) {
                Sentry.captureException(error)
              } else if (loading) {
                return (
                  <SpinnerContainer>
                    <QuerySpinner id="query-spinner" />
                  </SpinnerContainer>
                )
              }
              // return this.renderSubPage(this.generateGqlHistorData(data))
              return null
            }}
          </Query>
        </>
      )
    )
  }
}

function mapStateToProps(
  state: IStoreState,
  props: RouteComponentProps<{
    applicationStatus: string
    applicationId: string
  }>
) {
  const { match } = props
  return {
    language: state.i18n.language,
    userDetails: getUserDetails(state),
    applicationId: match && match.params && match.params.applicationId,
    draft:
      (state.drafts.drafts &&
        match &&
        match.params &&
        match.params.applicationId &&
        state.drafts.drafts.find(
          application => application.id === match.params.applicationId
        )) ||
      null
  }
}

export const Details = connect(
  mapStateToProps,
  {
    goToTab: goToTabAction,
    goToHome: goToHomeAction
  }
)(injectIntl(DetailView))
