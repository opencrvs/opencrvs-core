export const up = async (db, client) => {
  await db.collection('configs').updateMany(
    {},
    {
      $set: {
        LOGIN_BACKGROUND: {
          backgroundColor: '36304E'
        }
      }
    }
  )
}

export const down = async (db, client) => {
  await db.collection('configs').updateMany(
    {},
    {
      $unset: {
        LOGIN_BACKGROUND: ''
      }
    }
  )
}
