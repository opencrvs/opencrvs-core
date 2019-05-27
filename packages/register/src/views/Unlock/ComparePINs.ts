import * as bcrypt from 'bcryptjs'

// wrapping bcrypt.compare in a separate file
// and exporting this function for tests
async function comparePins(pin1: string, pin2: string) {
  return await bcrypt.compare(pin1, pin2)
}

export const pinOps = {
  comparePins
}
