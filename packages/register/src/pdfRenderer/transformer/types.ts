export interface IIntLabelPayload {
  messageDescriptor: ReactIntl.FormattedMessage.MessageDescriptor
  messageValues?: { [valueKey: string]: string }
}

export interface IConditionalIntLabelPayload {
  [option: string]: ReactIntl.FormattedMessage.MessageDescriptor
}
export interface IApplicantNamePayload {
  [language: string]: string[] // corresponding field names
}

export interface IFeildValuePayload {
  valueKey: string // ex: child.dob
}

export interface IDateFeildValuePayload {
  valueKey?: string // ex: child.dob
  format: string
}
