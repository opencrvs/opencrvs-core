export interface IIntLabelPayload {
  messageDescriptor: ReactIntl.FormattedMessage.MessageDescriptor
  messageValues?: { [valueKey: string]: string }
}

export interface IApplicantNamePayload {
  [language: string]: string[] // corresponding field names
}
