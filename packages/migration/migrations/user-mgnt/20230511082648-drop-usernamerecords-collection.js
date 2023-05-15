export const up = async (db, client) => {
  const session = client.startSession()

  try {
    const collections = await db.listCollections().toArray()
    const collectionExists = collections.some(
      (collection) => collection.name === 'usernamerecords'
    )
    if (collectionExists) {
      await db.dropCollection('usernamerecords')
      console.log(`UsernameRecord collection dropped`)
    } else {
      console.log(`UsernameRecord collection does not exist`)
    }
  } finally {
    await session.endSession()
  }
}

export const down = async (db, client) => {}
