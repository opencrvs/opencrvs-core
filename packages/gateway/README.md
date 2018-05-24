## Set up Environment Variables

Create a .env file with the following settings

```
PORT = 7070
NODE_ENV = DEVELOPMENT
LOG_LEVEL = 1
APP_NAME = OPENCRVS_API_GATEWAY
```

## Running the gateway

```
yarn start
```

to launch project with nodemon running.

## Examples

In this early stage two demonstrative graphQL queries exist that can be tried out. With everything started (run `yarn dev` in the root of the OpenCRVS repo), visit `http://localhost:7070/graphiql` to access the Graph*i*QL IDE for GraphQL. There you can paste in the following and run them.

```graphql
mutation create {
  createRegistration(details: {
    mother: {gender: "female", name: [{givenName: "Jane", familyName: "Doe"}]},
    father: {gender: "male",name: [{givenName: "Jack", familyName: "Doe"}]},
    child: {gender: "male",name: [{givenName: "Baby", familyName: "Doe"}]},
    createdAt: "2018-05-23T14:44:58+02:00"
  })
}

query list {
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
```