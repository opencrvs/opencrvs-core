import * as React from 'react'
import { ActionPage, Box, Spinner } from '@opencrvs/components/lib/interface'
import { Duplicate } from '@opencrvs/components/lib/icons'
import styled from 'src/styled-components'
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl'
import { WORK_QUEUE } from 'src/navigation/routes'
import { DuplicateDetails, Event } from 'src/components/DuplicateDetails'
import { Query } from 'react-apollo'
import { RouteComponentProps } from 'react-router'
import gql from 'graphql-tag'
import { createNamesMap } from 'src/utils/data-formating'
import { connect } from 'react-redux'
import { IStoreState } from 'src/store'

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

class ReviewDuplicatesClass extends React.Component<
  InjectedIntlProps & RouteComponentProps<IMatchParams> & { language: string }
> {
  FETCH_DUPLICATES = gql`
    query fetchDuplicates($id: ID!) {
      fetchBirthRegistration(id: $id) {
        id
        registration {
          duplicates
        }
      }
    }
  `

  createDuplicateDetailsQuery(ids: string[]) {
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

  formatData(data: any, language: string, intl: ReactIntl.InjectedIntl) {
    return Object.keys(data).map((key: any) => {
      const rec = data[key]

      const childNamesMap = createNamesMap(rec.child.name)
      const motherNamesMap = createNamesMap(rec.mother.name)
      const fatherNamesMap = createNamesMap(rec.father.name)
      const userNamesMap = createNamesMap(rec.registration.status[0].user.name)

      return {
        dateOfApplication: rec.createdAt,
        trackingId: rec.registration.trackingId,
        event: Event[rec.registration.type],
        child: {
          name: childNamesMap[language],
          dob: rec.child.birthDate,
          gender: intl.formatMessage(messages[rec.child.gender])
        },
        mother: {
          name: motherNamesMap[language],
          dob: rec.mother.birthDate,
          id: rec.mother.identifier[0].id
        },
        father: {
          name: fatherNamesMap[language],
          dob: rec.father.birthDate,
          id: rec.father.identifier[0].id
        },
        regStatusHistory: [
          {
            action: rec.registration.status[0].type,
            date: rec.registration.status[0].timestamp,
            usersName: userNamesMap[language],
            usersRole: intl.formatMessage(
              messages[rec.registration.status[0].user.role]
            ),
            office: rec.registration.status[0].office.name
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
          query={this.FETCH_DUPLICATES}
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
              return <span>ERROR! :(</span>
            }

            const duplicateIds = [applicationId]
            if (data.fetchBirthRegistration.registration.duplicates) {
              duplicateIds.concat(
                data.fetchBirthRegistration.registration.duplicates
              )
            }

            const gqlVars = duplicateIds.reduce((vars, id, i) => {
              vars[`duplicate${i}Id`] = id
              return vars
            }, {})

            return (
              <Query
                query={this.createDuplicateDetailsQuery(duplicateIds)}
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

                  if (error) {
                    return <span>ERROR! :(</span>
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
                        ).map((duplicateData: any, i: number) => (
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
