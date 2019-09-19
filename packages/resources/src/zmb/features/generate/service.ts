export async function generateRegistrationNumber(
  trackingId: string
): Promise<string> {
  /* adding current year */
  let brn = new Date().getFullYear().toString()

  /* appending tracking id */
  brn = brn.concat(trackingId)

  return brn
}
