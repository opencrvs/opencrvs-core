import { getForms } from '@resources/zmb/features/forms/service'

export async function formsHandler() {
  return getForms()
}
