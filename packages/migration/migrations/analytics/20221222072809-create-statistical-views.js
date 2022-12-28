export const up = async (db, client) => {}

export const down = async (db, client) => {
  await db.collection('registrations').drop()
  await db.collection('corrections').drop()
  await db.collection('populationEstimatesPerDay').drop()
}
