import gql from 'graphql-tag'
import * as React from 'react'
import styled, { StyledFunction } from 'styled-components'
import { Query } from 'react-apollo'

interface IRegistration {
  children?: React.ReactChild
  className?: string
}

class RegistrationsListQuery extends React.Component<IRegistration, {}> {
  render() {
    return (
      <Query
        query={gql`
          {
            listRegistrations(status: "declared") {
              id
              mother {
                gender
                name {
                  givenName
                  familyName
                }
              }
              father {
                gender
                name {
                  givenName
                  familyName
                }
              }
              child {
                gender
                name {
                  givenName
                  familyName
                }
              }
              createdAt
            }
          }
        `}
      >
        {({ loading, error, data }) => {
          if (loading) {
            return <p>Loading...</p>
          }
          if (error) {
            return <p className={this.props.className}>Error :(</p>
          }
          return (
            <p className={this.props.className}>
              Mother's name:{' '}
              {data.listRegistrations[0].mother.name[0].givenName}
            </p>
          )
        }}
      </Query>
    )
  }
}

const styledRegistrations: StyledFunction<
  IRegistration & React.HTMLProps<HTMLInputElement>
> = styled(RegistrationsListQuery)

export const RegistrationList = styledRegistrations`
text-decoration: underline;
`
