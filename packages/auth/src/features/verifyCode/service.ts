import fetch from 'node-fetch'

export async function generateVerificationCode(nonce: string, mobile: string) {
  return '12345'
}

export async function sendVerificationCode(
  mobile: string,
  verificationCode: string
): Promise<void> {
  return undefined
}
