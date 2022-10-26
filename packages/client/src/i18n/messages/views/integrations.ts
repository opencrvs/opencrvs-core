import { defineMessages } from 'react-intl'

const messagesToDefine = {
  createClient: {
    id: 'integrations.createClient',
    defaultMessage: 'Create client',
    description: 'Label for the button creating client'
  },

  pageIntroduction: {
    id: 'integrations.pageIntroduction',
    defaultMessage:
      'For each new client that needs to integrate with OpenCRVS you can create unique client IDs. A number of integration use cases are currently supported, based on both API and webhook technologies.',
    description: 'Label for the text integration page intorduction'
  }
}

export const integrationMessages = defineMessages(messagesToDefine)
