import { pinOps } from '@register/views/Unlock/ComparePINs'
import * as bcrypt from 'bcryptjs'

describe('Compare two PINs', () => {
  const pin = '1212'
  const salt = bcrypt.genSaltSync(10)
  const hash = bcrypt.hashSync(pin, salt)

  it('should return true when PINs match', async () => {
    const result = await pinOps.comparePins(pin, hash)
    expect(result).toBe(true)
  })

  it('should return false when PINs do not match', async () => {
    const pin2 = '2121'
    const result = await pinOps.comparePins(pin2, hash)
    expect(result).toBe(false)
  })
})
