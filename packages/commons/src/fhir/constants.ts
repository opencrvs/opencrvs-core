export const OPENCRVS_SPECIFICATION_URL = 'http://opencrvs.org/specs/'
export const FHIR_SPECIFICATION_URL = 'http://hl7.org/fhir/StructureDefinition/'
export const ORIGINAL_FILE_NAME_SYSTEM =
  'http://opencrvs.org/specs/id/original-file-name'
export const SYSTEM_FILE_NAME_SYSTEM =
  'http://opencrvs.org/specs/id/system-file-name'

export const FHIR_OBSERVATION_CATEGORY_URL =
  'http://hl7.org/fhir/observation-category'
export const DOWNLOADED_EXTENSION_URL =
  `${OPENCRVS_SPECIFICATION_URL}extension/regDownloaded` as const
export const REINSTATED_EXTENSION_URL =
  `${OPENCRVS_SPECIFICATION_URL}extension/regReinstated` as const
export const ASSIGNED_EXTENSION_URL =
  `${OPENCRVS_SPECIFICATION_URL}extension/regAssigned` as const
export const VERIFIED_EXTENSION_URL =
  `${OPENCRVS_SPECIFICATION_URL}extension/regVerified` as const
export const UNASSIGNED_EXTENSION_URL =
  `${OPENCRVS_SPECIFICATION_URL}extension/regUnassigned` as const
export const MAKE_CORRECTION_EXTENSION_URL =
  `${OPENCRVS_SPECIFICATION_URL}extension/makeCorrection` as const
export const REQUEST_CORRECTION_OTHER_REASON_EXTENSION_URL =
  `${OPENCRVS_SPECIFICATION_URL}extension/otherReason` as const
export const REQUESTING_INDIVIDUAL =
  `${OPENCRVS_SPECIFICATION_URL}extension/requestingIndividual` as const
export const REQUESTING_INDIVIDUAL_OTHER =
  `${OPENCRVS_SPECIFICATION_URL}extension/requestingIndividualOther` as const
export const HAS_SHOWED_VERIFIED_DOCUMENT =
  `${OPENCRVS_SPECIFICATION_URL}extension/hasShowedVerifiedDocument` as const
export const PAYMENT_DETAILS =
  `${OPENCRVS_SPECIFICATION_URL}extension/paymentDetails` as const
export const NO_SUPPORTING_DOCUMENTATION_REQUIRED =
  `${OPENCRVS_SPECIFICATION_URL}extension/noSupportingDocumentationRequired` as const
export const VIEWED_EXTENSION_URL =
  `http://opencrvs.org/specs/extension/regViewed` as const
export const MARKED_AS_NOT_DUPLICATE =
  `${OPENCRVS_SPECIFICATION_URL}extension/markedAsNotDuplicate` as const
export const MARKED_AS_DUPLICATE =
  `${OPENCRVS_SPECIFICATION_URL}extension/markedAsDuplicate` as const
export const DUPLICATE_TRACKING_ID =
  `${OPENCRVS_SPECIFICATION_URL}extension/duplicateTrackingId` as const
export const FLAGGED_AS_POTENTIAL_DUPLICATE =
  `${OPENCRVS_SPECIFICATION_URL}extension/flaggedAsPotentialDuplicate` as const
