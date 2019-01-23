import { IFormSection, ViewType, DATE } from 'src/forms'
import { defineMessages } from 'react-intl'
import { dateFormat } from 'src/utils/validate'

const messages = defineMessages({
  deathEventTab: {
    id: 'register.form.tabs.deathEventTab',
    defaultMessage: 'Event'
  },
  deathEventTitle: {
    id: 'register.form.section.deathEventTitle',
    defaultMessage: 'Event details'
  }
})
export const eventSection: IFormSection = {
  id: 'deathEvent',
  viewType: 'form' as ViewType,
  name: messages.deathEventTab,
  title: messages.deathEventTitle,
  fields: []
}
