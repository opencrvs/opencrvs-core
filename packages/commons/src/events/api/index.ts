export const ActionConfirmationResponseCodes = {
  FailInUncontrolledManner: 500, // Endpoint fails in an uncontrolled manner
  ActionRejected: 400, // Synchronous flow failed
  Success: 200, // Synchronous flow succeeded
  RequiresProcessing: 202 // Asynchronous flow succeeded, this expects that either the confirm or reject callback is called
} as const
