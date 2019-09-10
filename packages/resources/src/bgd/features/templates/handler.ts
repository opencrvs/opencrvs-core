import { getTemplates } from '@resources/bgd/features/templates/service'

export async function templatesHandler() {
  return await getTemplates()
}
