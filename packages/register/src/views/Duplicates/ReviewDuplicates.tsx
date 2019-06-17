import * as React from 'react'
import {
  ActionPage,
  Box,
  Modal,
  Spinner
} from '@opencrvs/components/lib/interface'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { Duplicate } from '@opencrvs/components/lib/icons'
import { Mutation, Query } from 'react-apollo'
import styled from '@register/styledComponents'
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl'
import { SEARCH_RESULT } from '@register/navigation/routes'
import { DuplicateDetails, Action } from '@register/components/DuplicateDetails'
import { Event } from '@register/forms'
import { NotDuplicateConfirmation } from '@register/views/Duplicates/NotDuplicateConfirmation'
import { RouteComponentProps } from 'react-router'

import gql from 'graphql-tag'
import {
  createNamesMap,
  extractCommentFragmentValue
} from '@register/utils/data-formatting'
import { connect } from 'react-redux'
import { IStoreState } from '@register/store'
import {
  GQLBirthRegistration,
  GQLHumanName,
  GQLRegWorkflow,
  GQLUser,
  GQLIdentityType,
  GQLLocation,
  GQLRegStatus,
  GQLComment
} from '@opencrvs/gateway/src/graphql/schema'
import { formatLongDate } from '@register/utils/date-formatting'
import * as Sentry from '@sentry/browser'

interface IMatchParams {
  applicationId: string
}

const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
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
  },
  back: {
    id: 'menu.back',
    defaultMessage: 'Back',
    description: 'Title of the back link'
  },
  rejectButton: {
    id: 'register.duplicates.button.reject',
    defaultMessage: 'Reject',
    description: 'Title of the reject button'
  },
  rejectDescription: {
    id: 'register.duplicates.modal.reject',
    defaultMessage:
      'Are you sure you want to reject this application for being a duplicate ?',
    description: 'Description of the reject modal'
  },
  male: {
    id: 'register.duplicates.male',
    defaultMessage: 'Male',
    description: 'The duplicates text for male'
  },
  female: {
    id: 'register.duplicates.female',
    defaultMessage: 'Female',
    description: 'The duplicates text for female'
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
  queryError: {
    id: 'register.duplicates.queryError',
    defaultMessage: 'An error occurred while fetching data',
    description: 'The error message shown when a query fails'
  }
})

const StyledSpinner = styled(Spinner)`
  margin: 50% auto;
`

const Container = styled.div`
  margin: 35px 250px 0px 250px;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin-left: 20px;
    margin-right: 20px;
  }
`

const TitleBox = styled(Box)`
  ${({ theme }) => theme.fonts.bigBodyStyle};
`

const Header = styled.span`
  ${({ theme }) => theme.fonts.bodyBoldStyle};
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
const BackButton = styled.a`
  text-decoration: underline;
  color: ${({ theme }) => theme.colors.primary};
`

const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.error};
  ${({ theme }) => theme.fonts.bodyStyle};
  text-align: center;
  margin-top: 100px;
`

export const FETCH_DUPLICATES = gql`
  query fetchDuplicates($id: ID!) {
    fetchBirthRegistration(id: $id) {
      id
      registration {
        id
        duplicates
      }
    }
  }
`

export function createDuplicateDetailsQuery(ids: string[]) {
  const listQueryParams = () => {
    return ids.map((id, i) => `$duplicate${i}Id: ID!`).join(', ')
  }

  const writeQueryForId = (id: string, i: number) => `
    duplicate${i}: fetchBirthRegistration(id: $duplicate${i}Id) {
      createdAt
      id
      registration {
        id
        trackingId
        type
        status {
          type
          timestamp
          user {
            name {
              use
              firstNames
              familyName
            }
            role
          }
          office {
            name
          }
          comments {
            comment
          }
        }
      }
      child {
        id
        name {
          use
          firstNames
          familyName
        }
        birthDate
        gender
      }
      mother {
        id
        name {
          use
          firstNames
          familyName
        }
        birthDate
        gender
        identifier {
          id
          type
        }
      }
      father {
        id
        name {
          use
          firstNames
          familyName
        }
        birthDate
        gender
        identifier {
          id
          type
        }
      }
    }`

  return gql`
    query fetchDuplicateDetails(${listQueryParams()}) {
      ${ids.map((id, i) => writeQueryForId(id, i)).join(',\n')}
    }
  `
}
export const rejectMutation = gql`
  mutation submitEventAsRejected($id: String!, $reason: String!) {
    markEventAsVoided(id: $id, reason: $reason)
  }
`
export const notADuplicateMutation = gql`
  mutation submitNotADuplicateMutation($id: String!, $duplicateId: String!) {
    notADuplicate(id: $id, duplicateId: $duplicateId)
  }
`
interface IState {
  selectedCompositionID: string
  showRejectModal: boolean
  showNotDuplicateModal: boolean
}
type Props = InjectedIntlProps &
  RouteComponentProps<IMatchParams> & { language: string }
class ReviewDuplicatesClass extends React.Component<Props, IState> {
  constructor(props: Props) {
    super(props)
    this.state = {
      selectedCompositionID: '',
      showRejectModal: false,
      showNotDuplicateModal: false
    }
  }

  formatData(
    data: { [key: string]: GQLBirthRegistration },
    language: string,
    intl: ReactIntl.InjectedIntl
  ) {
    const { locale } = this.props.intl

    return Object.keys(data).map(key => {
      const rec = data[key]

      const childNamesMap =
        rec.child && rec.child.name
          ? createNamesMap(rec.child.name as GQLHumanName[])
          : {}
      const motherNamesMap =
        rec.mother && rec.mother.name
          ? createNamesMap(rec.mother.name as GQLHumanName[])
          : {}
      const fatherNamesMap =
        rec.father && rec.father.name
          ? createNamesMap(rec.father.name as GQLHumanName[])
          : {}
      const userNamesMap = (index: number) =>
        rec.registration &&
        rec.registration.status &&
        rec.registration.status[index] &&
        (rec.registration.status[index] as GQLRegWorkflow).user
          ? createNamesMap(((rec.registration.status[index] as GQLRegWorkflow)
              .user as GQLUser).name as GQLHumanName[])
          : {}

      return {
        id: rec.id,
        dateOfApplication: rec.createdAt,
        trackingId: (rec.registration && rec.registration.trackingId) || '',
        event:
          (rec.registration &&
            rec.registration.type &&
            Event[rec.registration.type]) ||
          Event.BIRTH,
        child: {
          name: childNamesMap[language],
          dob:
            (rec.child &&
              rec.child.birthDate &&
              formatLongDate(rec.child.birthDate, locale)) ||
            '',
          gender:
            (rec.child &&
              rec.child.gender &&
              intl.formatMessage(messages[rec.child.gender])) ||
            ''
        },
        mother: {
          name: motherNamesMap[language],
          dob:
            (rec.mother &&
              rec.mother.birthDate &&
              formatLongDate(rec.mother.birthDate, locale)) ||
            '',
          id:
            (rec.mother &&
              rec.mother.identifier &&
              rec.mother.identifier[0] &&
              (rec.mother.identifier[0] as GQLIdentityType).id) ||
            ''
        },
        father: {
          name: fatherNamesMap[language],
          dob:
            (rec.father &&
              rec.father.birthDate &&
              formatLongDate(rec.father.birthDate, locale)) ||
            '',
          id:
            (rec.father &&
              rec.father.identifier &&
              rec.father.identifier[0] &&
              (rec.father.identifier[0] as GQLIdentityType).id) ||
            ''
        },
        regStatusHistory:
          (rec.registration &&
            rec.registration.status &&
            rec.registration.status
              // @ts-ignore
              .map((status: GQLRegWorkflow, index: number) => {
                let reasonString = ''
                if (status.comments) {
                  reasonString = extractCommentFragmentValue(
                    status.comments as GQLComment[],
                    'reason'
                  )
                }

                return {
                  action:
                    Action[status.type as GQLRegStatus] || Action.DECLARED,
                  date: formatLongDate(status.timestamp, locale) || '',
                  usersName: userNamesMap(index)[language],
                  usersRole:
                    (status.user &&
                      (status.user as GQLUser).role &&
                      intl.formatMessage(
                        messages[(status.user as GQLUser).role as string]
                      )) ||
                    '',
                  office:
                    (status.office && (status.office as GQLLocation).name) ||
                    '',
                  reasons: reasonString
                }
              })
              .reverse()) ||
          []
      }
    })
  }
  toggleRejectModal = (id: string = '') => {
    this.setState((prevState: IState) => ({
      selectedCompositionID: id,
      showRejectModal: !prevState.showRejectModal
    }))
  }
  toggleNotDuplicateModal = (id: string = '') => {
    this.setState((prevState: IState) => ({
      selectedCompositionID: id,
      showNotDuplicateModal: !prevState.showNotDuplicateModal
    }))
  }
  successfulRejection = (response: string) => {
    this.toggleRejectModal()
    window.location.reload()
  }

  successfulDuplicateRemoval = (response: string) => {
    this.toggleNotDuplicateModal()
    if (response === this.state.selectedCompositionID) {
      window.location.assign(SEARCH_RESULT)
    } else {
      window.location.reload()
    }
  }

  render() {
    const { intl } = this.props
    const match = this.props.match
    const applicationId = match.params.applicationId

    return (
      <ActionPage
        goBack={() => {
          window.location.assign(SEARCH_RESULT)
        }}
        backLabel={intl.formatMessage(messages.back)}
        title={intl.formatMessage(messages.pageTitle)}
      >
        <Query
          query={FETCH_DUPLICATES}
          variables={{
            id: applicationId
          }}
        >
          {({
            loading,
            error,
            data
          }: {
            loading: any
            error?: any
            data: any
          }) => {
            if (loading) {
              return <StyledSpinner id="review-duplicates-spinner" />
            }

            if (
              error ||
              !data.fetchBirthRegistration ||
              !data.fetchBirthRegistration.registration
            ) {
              Sentry.captureException(error)
              console.error(error)

              return (
                <ErrorText id="duplicates-error-text">
                  {this.props.intl.formatMessage(messages.queryError)}
                </ErrorText>
              )
            }

            if (
              !data.fetchBirthRegistration.registration.duplicates ||
              data.fetchBirthRegistration.registration.duplicates.length <= 0
            ) {
              window.location.assign(SEARCH_RESULT)
            }

            let duplicateIds = [applicationId]
            if (data.fetchBirthRegistration.registration.duplicates) {
              duplicateIds = duplicateIds.concat(
                data.fetchBirthRegistration.registration.duplicates
              )
            }

            const gqlVars = duplicateIds.reduce(
              (vars: { [key: string]: string }, id, i) => {
                vars[`duplicate${i}Id`] = id
                return vars
              },
              {}
            )
            return (
              <Query
                query={createDuplicateDetailsQuery(duplicateIds)}
                variables={gqlVars}
              >
                {({
                  loading: loadingDetails,
                  error: errorDetails,
                  data: dataDetails
                }: {
                  loading: any
                  error?: any
                  data: any
                }) => {
                  if (loadingDetails) {
                    return <StyledSpinner id="review-duplicates-spinner" />
                  }

                  if (errorDetails) {
                    Sentry.captureException(errorDetails)
                    console.error(errorDetails)

                    return (
                      <ErrorText id="duplicates-error-text">
                        {this.props.intl.formatMessage(messages.queryError)}
                      </ErrorText>
                    )
                  }

                  return (
                    <Container>
                      <TitleBox>
                        <Header id="review-duplicates-header">
                          <Duplicate />
                          <HeaderText>
                            {this.props.intl.formatMessage(messages.title)}
                          </HeaderText>
                        </Header>
                        <p>
                          {this.props.intl.formatMessage(messages.description)}
                        </p>
                      </TitleBox>
                      <Grid id="review-duplicates-grid">
                        {this.formatData(
                          dataDetails,
                          this.props.language,
                          this.props.intl
                        ).map((duplicateData, i: number) => (
                          <DuplicateDetails
                            id={`duplicate-details-item-${i}`}
                            key={i}
                            duplicateContextId={applicationId}
                            data={duplicateData}
                            notDuplicateHandler={() =>
                              this.toggleNotDuplicateModal(duplicateData.id)
                            }
                            rejectHandler={() =>
                              this.toggleRejectModal(duplicateData.id)
                            }
                          />
                        ))}
                      </Grid>
                    </Container>
                  )
                }}
              </Query>
            )
          }}
        </Query>
        <Mutation
          mutation={rejectMutation}
          variables={{
            id: this.state.selectedCompositionID,
            reason: 'duplicate'
          }}
          onCompleted={(data: any) =>
            this.successfulRejection(data.markEventAsVoided)
          }
        >
          {(submitEventAsRejected: any) => {
            return (
              <Modal
                title={intl.formatMessage(messages.rejectDescription)}
                actions={[
                  <PrimaryButton
                    key="reject"
                    id="reject_confirm"
                    onClick={() => submitEventAsRejected()}
                  >
                    {intl.formatMessage(messages.rejectButton)}
                  </PrimaryButton>,
                  <BackButton
                    key="back"
                    id="back_link"
                    onClick={() => {
                      this.toggleRejectModal()
                      if (document.documentElement) {
                        document.documentElement.scrollTop = 0
                      }
                    }}
                  >
                    {intl.formatMessage(messages.back)}
                  </BackButton>
                ]}
                show={this.state.showRejectModal}
                handleClose={this.toggleRejectModal}
              />
            )
          }}
        </Mutation>
        <Mutation
          mutation={notADuplicateMutation}
          variables={{
            id: applicationId,
            duplicateId: this.state.selectedCompositionID
          }}
          onCompleted={(data: any) =>
            this.successfulDuplicateRemoval(data.notADuplicate)
          }
        >
          {(submitNotADuplicateMutation: any, { data }: { data?: any }) => {
            return (
              <NotDuplicateConfirmation
                handleYes={() => submitNotADuplicateMutation()}
                show={this.state.showNotDuplicateModal}
                handleClose={this.toggleNotDuplicateModal}
              />
            )
          }}
        </Mutation>
      </ActionPage>
    )
  }
}

export const ReviewDuplicates = connect((state: IStoreState) => ({
  language: state.i18n.language
}))(injectIntl(ReviewDuplicatesClass))
