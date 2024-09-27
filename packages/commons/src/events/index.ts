export function isLegacyFormType(event: string) {
  return ['BIRTH', 'DEATH', 'MARRIAGE'].includes(event)
}
