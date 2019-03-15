export const resolvers = {
  Query: {
    listNotifications(_: any, { locations, status }: any) {
      // query composition
      return [{ id: '123' }, { id: '321' }]
    }
  },
  Mutation: {
    async createNotification(_: any, { details }: { details: any }) {
      // create bundle of resources - some sort of mapping
      // put resources in a composition
      // save composition
      return { details }
    }
  },
  Notification: {}
}
