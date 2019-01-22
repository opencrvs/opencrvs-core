import * as React from 'react'
import { ActionPage, Box, Spinner } from '@opencrvs/components/lib/interface'
import { Duplicate } from '@opencrvs/components/lib/icons'
import styled from 'src/styled-components'
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl'
import { WORK_QUEUE } from 'src/navigation/routes'
import {
  DuplicateDetails,
  Event,
  Action
} from 'src/components/DuplicateDetails'
import { Query } from 'react-apollo'
import { RouteComponentProps } from 'react-router'
import gql from 'graphql-tag'
import { createNamesMap } from 'src/utils/data-formating'
import { connect } from 'react-redux'
import { IStoreState } from 'src/store'
import {
  GQLBirthRegistration,
  GQLHumanName,
  GQLRegWorkflow,
  GQLUser,
  GQLIdentityType,
  GQLLocation,
  GQLRegStatus
} from '@opencrvs/gateway/src/graphql/schema'

interface IMatchParams {
  applicationId: string
}

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
    id: 'register.duplicates.field-agent',
    defaultMessage: 'Field agent',
    description: 'The duplicates text for field agent'
  },
  REGISTRAR: {
    id: 'register.duplicates.registrar',
    defaultMessage: 'Registrar',
    description: 'The duplicates text for registrar'
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

const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-family: ${({ theme }) => theme.fonts.lightFont};
  text-align: center;
  margin-top: 100px;
`

export const FETCH_DUPLICATES = gql`
  query fetchDuplicates($id: ID!) {
    fetchBirthRegistration(id: $id) {
      id
      registration {
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
        }
      }
      child {
        name {
          use
          firstNames
          familyName
        }
        birthDate
        gender
      }
      mother {
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

class ReviewDuplicatesClass extends React.Component<
  InjectedIntlProps & RouteComponentProps<IMatchParams> & { language: string }
> {
  formatData(
    data: { [key: string]: GQLBirthRegistration },
    language: string,
    intl: ReactIntl.InjectedIntl
  ) {
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
      const userNamesMap =
        rec.registration &&
        rec.registration.status &&
        rec.registration.status[0] &&
        (rec.registration.status[0] as GQLRegWorkflow).user
          ? createNamesMap(((rec.registration.status[0] as GQLRegWorkflow)
              .user as GQLUser).name as GQLHumanName[])
          : {}

      return {
        dateOfApplication: rec.createdAt,
        trackingId: (rec.registration && rec.registration.trackingId) || '',
        event:
          (rec.registration &&
            rec.registration.type &&
            Event[rec.registration.type]) ||
          Event.BIRTH,
        child: {
          name: childNamesMap[language],
          dob: (rec.child && rec.child.birthDate) || '',
          gender:
            (rec.child &&
              rec.child.gender &&
              intl.formatMessage(messages[rec.child.gender])) ||
            ''
        },
        mother: {
          name: motherNamesMap[language],
          dob:
            (rec.mother && rec.mother.birthDate && rec.mother.birthDate) || '',
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
            (rec.father && rec.father.birthDate && rec.father.birthDate) || '',
          id:
            (rec.father &&
              rec.father.identifier &&
              rec.father.identifier[0] &&
              (rec.father.identifier[0] as GQLIdentityType).id) ||
            ''
        },
        regStatusHistory: [
          {
            action:
              (rec.registration &&
                rec.registration.status &&
                rec.registration.status[0] &&
                Action[
                  (rec.registration.status[0] as GQLRegWorkflow)
                    .type as GQLRegStatus
                ]) ||
              Action.DECLARED,
            date:
              (rec.registration &&
                rec.registration.status &&
                rec.registration.status[0] &&
                (rec.registration.status[0] as GQLRegWorkflow).timestamp) ||
              '',
            usersName: userNamesMap[language],
            usersRole:
              (rec.registration &&
                rec.registration.status &&
                rec.registration.status[0] &&
                (rec.registration.status[0] as GQLRegWorkflow).user &&
                ((rec.registration.status[0] as GQLRegWorkflow).user as GQLUser)
                  .role &&
                intl.formatMessage(
                  messages[
                    ((rec.registration.status[0] as GQLRegWorkflow)
                      .user as GQLUser).role as string
                  ]
                )) ||
              '',
            office:
              (rec.registration &&
                rec.registration.status &&
                rec.registration.status[0] &&
                (rec.registration.status[0] as GQLRegWorkflow).office &&
                ((rec.registration.status[0] as GQLRegWorkflow)
                  .office as GQLLocation).name) ||
              ''
          }
        ]
      }
    })
  }

  render() {
    const match = this.props.match
    const applicationId = match.params.applicationId

    return (
      <ActionPage
        goBack={() => {
          window.location.href = WORK_QUEUE
        }}
        title={this.props.intl.formatMessage(messages.pageTitle)}
      >
        <Query
          query={FETCH_DUPLICATES}
          variables={{
            id: applicationId
          }}
        >
          {({ loading, error, data }) => {
            if (loading) {
              return <StyledSpinner id="review-duplicates-spinner" />
            }

            if (
              error ||
              !data.fetchBirthRegistration ||
              !data.fetchBirthRegistration.registration
            ) {
              console.error(error)

              return (
                <ErrorText id="duplicates-error-text">
                  {this.props.intl.formatMessage(messages.queryError)}
                </ErrorText>
              )
            }

            let duplicateIds = [applicationId]
            if (data.fetchBirthRegistration.registration.duplicates) {
              duplicateIds = duplicateIds.concat(
                data.fetchBirthRegistration.registration.duplicates
              )
            }

            const gqlVars = duplicateIds.reduce((vars, id, i) => {
              vars[`duplicate${i}Id`] = id
              return vars
            }, {})

            return (
              <Query
                query={createDuplicateDetailsQuery(duplicateIds)}
                variables={gqlVars}
              >
                {({
                  loading: loadingDetails,
                  error: errorDetails,
                  data: dataDetails
                }) => {
                  if (loadingDetails) {
                    return <StyledSpinner id="review-duplicates-spinner" />
                  }

                  if (errorDetails) {
                    console.error(error)

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
                            data={duplicateData}
                            notDuplicateHandler={() => {
                              alert('Not a duplicate! (°◇°)')
                            }}
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
      </ActionPage>
    )
  }
}

export const ReviewDuplicates = connect((state: IStoreState) => ({
  language: state.i18n.language
}))(injectIntl(ReviewDuplicatesClass))
