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
import { SubPage } from '@opencrvs/components/lib/interface'
import {
  IStatus,
  GQLRegStatus
} from '@opencrvs/components/lib/interface/GridTable/types'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'
import { Event, IFormSectionData } from 'src/forms'
import styled from 'styled-components'
import { createNamesMap } from 'src/utils/data-formatting'
import { formatLongDate } from 'src/utils/date-formatting'
import { GQLHumanName } from '@opencrvs/gateway/src/graphql/schema.d'

const HistoryWrapper = styled.div`
  padding: 10px 25px;
  margin: 20px 0px;
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
const ExpansionContentContainer = styled.div`
  flex: 1;
  margin-left: 10px;
`

interface IDetailProps {
  language: string
  applicationId: string
  draft: IDraft
  userDetails: IUserDetails
  goToTab: typeof goToTabAction
  goToHome: typeof goToHomeAction
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

const getFullName = (
  sectionData: IFormSectionData,
  language: string = 'en'
): string => {
  let fullName = ''

  if (language === 'en') {
    if (sectionData.firstNames) {
      fullName = `${sectionData.firstNamesEng as string} ${sectionData.familyNameEng as string}`
    } else {
      fullName = sectionData.familyNameEng as string
    }
  } else {
    if (sectionData.firstNames) {
      fullName = `${sectionData.firstNames as string} ${sectionData.familyName as string}`
    } else {
      fullName = sectionData.familyName as string
    }
  }
  return fullName
}

class DetailView extends React.Component<IDetailProps & InjectedIntlProps> {
  getDraftApplicantName() {
    const draft = this.props.draft
    switch (draft.event) {
      case Event.BIRTH:
        return getFullName(draft.data.child, this.props.language)
      case Event.DEATH:
        return getFullName(draft.data.deceased, this.props.language)
      default:
        return ''
    }
  }
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
  renderHistory(statuses: IStatus[]): JSX.Element[] | null {
    return (
      (statuses &&
        statuses.map((status, i) => {
          const { practitionerName, practitionerRole, officeName } = status
          return (
            <HistoryWrapper key={i}>
              <StatusProgress />
              <ExpansionContentContainer>
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
              </ExpansionContentContainer>
            </HistoryWrapper>
          )
        })) ||
      null
    )
  }
  render() {
    const { draft, goToHome, userDetails } = this.props
    const status: IStatus[] = []
    status.push({
      type: GQLRegStatus.DRAFT_STARTED,
      practitionerName:
        (userDetails &&
          userDetails.name &&
          (createNamesMap(userDetails.name as GQLHumanName[])[
            this.props.language
          ] as string)) ||
        (userDetails &&
          userDetails.name &&
          /* tslint:disable:no-string-literal */
          (createNamesMap(userDetails.name as GQLHumanName[])[
            'default'
          ] as string)) ||
        /* tslint:enable:no-string-literal */
        '',
      timestamp:
        (draft.savedOn &&
          formatLongDate(String(draft.savedOn), this.props.intl.locale)) ||
        null,
      practitionerRole:
        userDetails && userDetails.role
          ? this.props.intl.formatMessage(messages[userDetails.role as string])
          : '',
      officeName:
        (userDetails &&
          userDetails.primaryOffice &&
          userDetails.primaryOffice.name) ||
        ''
    })
    if (draft.modifiedOn) {
      status.push({
        type: GQLRegStatus.DRAFT_MODIFIED,
        practitionerName:
          (userDetails &&
            userDetails.name &&
            (createNamesMap(userDetails.name as GQLHumanName[])[
              this.props.language
            ] as string)) ||
          (userDetails &&
            userDetails.name &&
            /* tslint:disable:no-string-literal */
            (createNamesMap(userDetails.name as GQLHumanName[])[
              'default'
            ] as string)) ||
          /* tslint:enable:no-string-literal */
          '',
        timestamp:
          (draft.modifiedOn &&
            formatLongDate(String(draft.modifiedOn), this.props.intl.locale)) ||
          null,
        practitionerRole:
          userDetails && userDetails.role
            ? this.props.intl.formatMessage(
                messages[userDetails.role as string]
              )
            : '',
        officeName:
          (userDetails &&
            userDetails.primaryOffice &&
            userDetails.primaryOffice.name) ||
          ''
      })
    }
    return (
      draft && (
        <SubPage title={this.getDraftApplicantName()} goBack={goToHome}>
          {this.renderHistory(status)}
        </SubPage>
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
      {}
  }
}

export const Details = connect(
  mapStateToProps,
  {
    gotoTab: goToTabAction,
    goToHome: goToHomeAction
  }
)(injectIntl(DetailView))
