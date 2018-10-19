export const resolvers = {
  Query: {
    listNotifications(_: unknown, { locations, status }: unknown) {
      // query composition
      return [{ id: '123' }, { id: '321' }]
    }
  },
  Mutation: {
    createNotification(_: unknown, { details }: unknown) {
      // create bundle of resources - some sort of mapping
      // put resources in a composition
      // save composition
      return details
    }
  },
  Notification: {}
}
