export const resolvers = {
  Query: {
    listRegistrations(_: any, { locations, status }: any) {
      // query composition
      return [{ trackingID: '123' }, { trackingID: '321' }]
    }
  },
  Mutation: {
    createRegistration(_: any, { details }: any) {
      // create bundle of resources - some sort of mapping
      // put resources in a composition
      // save composition
      return details
    }
  },
  Registration: {}
}
