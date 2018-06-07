import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { App } from './App'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools'
import { graphql, print } from 'graphql'
import { ApolloLink, Observable } from 'apollo-link'
import ApolloClient from 'apollo-client'

const schemaString = `
  type Address {
    use: String
    type: String
    text: String
    line: [String]
    city: String
    district: String
    state: String
    postalCode: String
    country: String
    from: Date
    to: Date
  }

  input AddressInput {
    use: String
    type: String
    text: String
    line: [String]
    city: String
    district: String
    state: String
    postalCode: String
    country: String
    from: Date
    to: Date
  }

  type Attachment {
    id: ID!
    data: String
    status: String
    originalFileName: String
    systemFileName: String
    createdAt: Date
  }

  input AttachmentInput {
    data: String
    status: String
    originalFileName: String
    systemFileName: String
    createdAt: Date
  }

  type ContactPoint {
    system: String
    value: String
    use: String
  }

  input ContactPointInput {
    system: String
    value: String
    use: String
  }

  scalar Date

  type HumanName {
    use: String
    givenName: String
    familyName: String
  }

  input HumanNameInput {
    use: String
    givenName: String
    familyName: String
  }

  type Location {
    id: ID!
    identifier: [ID]
    status: String
    name: String
    alias: [String]
    description: String
    telecom: [ContactPoint]
    address: Address
    longitude: Float
    latitude: Float
    altitude: Float
  }

  input LocationInput {
    identifier: [ID]
    status: String
    name: String
    alias: [String]
    description: String
    telecom: [ContactPointInput]
    address: AddressInput
    longitude: Float
    latitude: Float
    altitude: Float
  }

  type Mutation {
    createNotification(details: NotificationInput!): Notification!
    voidNotification(id: ID!): Notification
    createRegistration(details: RegistrationInput!): ID!
    updateRegistration(id: ID!, details: RegistrationInput!): Registration!
    markAsVerified(id: ID!): Registration
    markAsRegistered(id: ID!): Registration
    markAsCertified(id: ID!): Registration
    markAsVoided(id: ID!, reason: String!): Registration
  }

  type Notification {
    id: ID!
    child: Person
    mother: Person
    father: Person
    informant: Person
    location: Location
    createdAt: Date
    updatedAt: Date
  }

  input NotificationInput {
    child: PersonInput
    mother: PersonInput
    father: PersonInput
    informant: PersonInput
    location: LocationInput
    createdAt: Date
    updatedAt: Date
  }

  type Person {
    id: ID
    identifier: [ID]
    name: [HumanName]
    telecom: [ContactPoint]
    gender: String
    birthDate: String
    address: [Address]
    photo: Attachment
  }

  input PersonInput {
    identifier: [ID]
    name: [HumanNameInput]
    telecom: [ContactPointInput]
    gender: String
    birthDate: String
    address: [AddressInput]
    photo: AttachmentInput
  }

  type Query {
    listNotifications(locationIds: [String], status: String, userId: String, from: Date, to: Date): [Notification]
    listRegistrations(locationIds: [String], status: String, userId: String, from: Date, to: Date): [Registration]
  }

  type Registration {
    id: ID!
    trackingID: String
    registrationNumber: String
    paperFormID: String
    status: RegStatus
    child: Person
    mother: Person
    father: Person
    informant: Person
    attachments: [Attachment]
    location: Location
    createdAt: Date
    updatedAt: Date
  }

  input RegistrationInput {
    trackingID: String
    registrationNumber: String
    paperFormID: String
    status: RegStatus
    child: PersonInput
    mother: PersonInput
    father: PersonInput
    informant: PersonInput
    attachments: [AttachmentInput]
    location: LocationInput
    createdAt: Date
    updatedAt: Date
  }

  enum RegStatus {
    DECLARED
    VERIFIED
    REGISTERED
    CERTIFIED
  }
  `
const schema = makeExecutableSchema({
  typeDefs: schemaString
})

addMockFunctionsToSchema({
  schema,
  mocks: {
    Date: () => {
      return new Date()
    }
  }
})

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new ApolloLink(operation => {
    return new Observable(observer => {
      const { query, operationName, variables } = operation

      graphql(schema, print(query), null, null, variables, operationName)
        .then(result => {
          observer.next(result)
          observer.complete()
        })
        .catch(observer.error.bind(observer))
    })
  })
})

it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(<App client={client} />, div)
  ReactDOM.unmountComponentAtNode(div)
})
