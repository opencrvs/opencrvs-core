export const HOME = '/'
export const SELECT_VITAL_EVENT = '/events'
export const SELECT_INFORMANT = '/events/birth'

export const DRAFT_BIRTH_PARENT_FORM = '/drafts/:draftId/events/birth/parent'
export const DRAFT_BIRTH_PARENT_FORM_TAB =
  '/drafts/:draftId/events/birth/parent/:tabId'

export const DRAFT_DEATH_FORM = '/drafts/:draftId/events/death'
export const DRAFT_DEATH_FORM_TAB = '/drafts/:draftId/events/death/:tabId'

export const REVIEW_EVENT_PARENT_FORM_TAB =
  '/reviews/:draftId/events/:event/parent/:tabId'

export const SAVED_REGISTRATION = '/saved'
export const REJECTED_REGISTRATION = '/rejected'
export const SEARCH_RESULT = '/search-result/:searchText?'
export const MY_RECORDS = '/my-records'
export const MY_DRAFTS = '/my-drafts'
export const REVIEW_DUPLICATES = '/duplicates/:applicationId'
export const CONFIRMATION_SCREEN = '/confirm'
export const PRINT_CERTIFICATE = '/print/:registrationId/:eventType'

export const WORK_QUEUE = '/work-queue'
export const WORK_QUEUE_TAB = '/work-queue/:tabId'
