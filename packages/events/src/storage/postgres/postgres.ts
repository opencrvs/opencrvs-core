// import { createPool, sql } from 'slonik'
// import { env } from '@events/environment'

// // Slonik automatically manages connection pooling.
// const pool = createPool(env.EVENTS_POSTGRES_URL)

// export async function getDb() {
//   // Optional: perform a test query to ensure connection is live.
//   await pool.connect(async (connection) => {
//     await connection.query(sql`SELECT 1`)
//   })

//   return pool
// }
