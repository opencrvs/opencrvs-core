import { getForms } from '@resources/bgd/features/forms/service'

export async function formsHandler() {
  return getForms()
}
