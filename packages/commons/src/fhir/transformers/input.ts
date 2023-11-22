/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { UUID } from '../../uuid'
import { TaskStatus } from '../task'

export interface HumanName {
  use?: string
  firstNames?: string
  familyName?: string
  marriedLastName?: string
}

interface UserIdentifier {
  use?: string
  system?: string
  value?: string
}

const enum Status {
  active = 'active',
  deactivated = 'deactivated',
  pending = 'pending',
  disabled = 'disabled'
}

type DateString = string

const enum SystemRoleType {
  FIELD_AGENT = 'FIELD_AGENT',
  REGISTRATION_AGENT = 'REGISTRATION_AGENT',
  LOCAL_REGISTRAR = 'LOCAL_REGISTRAR',
  LOCAL_SYSTEM_ADMIN = 'LOCAL_SYSTEM_ADMIN',
  NATIONAL_SYSTEM_ADMIN = 'NATIONAL_SYSTEM_ADMIN',
  PERFORMANCE_MANAGEMENT = 'PERFORMANCE_MANAGEMENT',
  NATIONAL_REGISTRAR = 'NATIONAL_REGISTRAR'
}

/*
 * Enums get converted to string unions so that types generated from GraphQL
 * can be converted to these our core types
 */
type EnumToStringUnion<T extends Record<any, any>> = `${T[keyof T]}`

interface User {
  id?: string
  name: Array<HumanName>
  identifier?: Array<UserIdentifier | null>
  username?: string
  mobile?: string
  password?: string
  status?: EnumToStringUnion<typeof Status>
  systemRole: EnumToStringUnion<typeof SystemRoleType>
  role?: string
  email?: string
  primaryOffice?: string
  catchmentArea?: Array<string | null>
  device?: string
  signature?: Signature
}

interface Signature {
  data: string
  type?: string
}

export interface Attachment {
  _fhirID?: string
  contentType?: string
  data?: string
  uri?: string
  status?: EnumToStringUnion<typeof AttachmentStatus>
  originalFileName?: string
  systemFileName?: string
  type?: string
  description?: string
  subject?: string
  createdAt?: DateString
}

const enum AttachmentStatus {
  approved = 'approved',
  validated = 'validated',
  deleted = 'deleted'
}
const enum RegistrationType {
  BIRTH = 'BIRTH',
  DEATH = 'DEATH',
  MARRIAGE = 'MARRIAGE'
}

interface RegWorkflow {
  type?: EnumToStringUnion<typeof TaskStatus>
  user?: User
  timestamp?: DateString
  reason?: string
  comments?: Array<Comment | null>
  location?: Location
  timeLoggedMS?: number
}

interface Comment {
  user?: User
  comment?: string
  createdAt?: DateString
}

const enum TelecomSystem {
  other = 'other',
  phone = 'phone',
  fax = 'fax',
  email = 'email',
  pager = 'pager',
  url = 'url',
  sms = 'sms'
}
const enum TelecomUse {
  home = 'home',
  work = 'work',
  temp = 'temp',
  old = 'old',
  mobile = 'mobile'
}

const enum AddressUse {
  home = 'home',
  work = 'work',
  temp = 'temp',
  old = 'old'
}
export interface ContactPoint {
  system?: EnumToStringUnion<typeof TelecomSystem>
  value?: string
  use?: EnumToStringUnion<typeof TelecomUse>
}
interface Location {
  _fhirID?: string
  identifier?: Array<string | null>
  status?: string
  name?: string
  alias?: Array<string | null>
  description?: string
  partOf?: string
  type?: string
  telecom?: Array<ContactPoint | null>
  address?: AddressInput
  longitude?: number
  latitude?: number
  altitude?: number
  geoData?: string
}
const enum AddressType {
  PRIMARY_ADDRESS = 'PRIMARY_ADDRESS',
  SECONDARY_ADDRESS = 'SECONDARY_ADDRESS',
  postal = 'postal',
  physical = 'physical',
  both = 'both'
}
export interface AddressInput {
  use?: EnumToStringUnion<typeof AddressUse>
  type?: EnumToStringUnion<typeof AddressType>
  text?: string
  line?: Array<string>
  city?: string
  district?: string
  state?: string
  partOf?: string
  postalCode?: string
  country?: string
  from?: DateString
  to?: DateString
}
interface Registration {
  _fhirID?: string
  draftId?: string
  trackingId?: string
  mosipAid?: string
  registrationNumber?: string
  paperFormID?: string
  page?: string
  book?: string
  informantsSignature?: string
  groomSignature?: string
  brideSignature?: string
  witnessOneSignature?: string
  witnessTwoSignature?: string
  informantType?: string
  otherInformantType?: string
  contactPhoneNumber?: string
  contactEmail?: string
  status?: Array<RegWorkflow | null>
  type?: EnumToStringUnion<typeof RegistrationType>
  inCompleteFields?: string
  attachments?: Array<Attachment>
  certificates?: Array<Certificate | null>
  location?: Location
  correction?: Correction
}
interface Certificate {
  collector?: RelatedPerson
  hasShowedVerifiedDocument?: boolean
  payments?: Array<Payment | null>
  data?: string
}
interface Deceased {
  deceased?: boolean
  deathDate?: string
}

const enum PaymentType {
  MANUAL = 'MANUAL'
}

const enum PaymentOutcomeType {
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
  PARTIAL = 'PARTIAL'
}
interface Payment {
  paymentId?: string
  type?: EnumToStringUnion<typeof PaymentType>
  total?: number
  amount?: number
  outcome?: EnumToStringUnion<typeof PaymentOutcomeType>
  date?: DateString
  data?: string
}
interface Identity {
  id?: string
  type?: string
  otherType?: string
  fieldsModifiedByIdentity?: Array<string | null>
}
const enum Gender {
  male = 'male',
  female = 'female',
  other = 'other',
  unknown = 'unknown'
}
interface RelatedPerson {
  id?: string
  _fhirID?: string
  _fhirIDPatient?: string
  relationship?: string
  otherRelationship?: string
  affidavit?: Array<Attachment>
  exactDateOfBirthUnknown?: boolean
  identifier?: Array<Identity | null>
  name?: Array<HumanName | null>
  telecom?: Array<ContactPoint | null>
  gender?: EnumToStringUnion<typeof Gender>
  birthDate?: string
  age?: number
  maritalStatus?: string
  occupation?: string
  detailsExist?: boolean
  reasonNotApplying?: string
  dateOfMarriage?: DateString
  multipleBirth?: number
  address?: Array<AddressInput | null>
  photo?: Array<Attachment>
  deceased?: Deceased
  nationality?: Array<string | null>
  educationalAttainment?: string
  ageOfIndividualInYears?: number
}
interface CorrectionPayment {
  _fhirID?: string
  attachmentData?: string
  type: EnumToStringUnion<typeof PaymentType>
  amount: number
  outcome: EnumToStringUnion<typeof PaymentOutcomeType>
  date: DateString
}
interface CorrectionValue {
  section: string
  fieldName: string
  oldValue?: string | number | boolean
  newValue: string | number | boolean
}

interface Correction {
  requester: string
  requesterOther?: string
  hasShowedVerifiedDocument: boolean
  noSupportingDocumentationRequired: boolean
  attachments: Array<Attachment>
  payment?: CorrectionPayment
  values: Array<CorrectionValue>
  location: Location
  reason: string
  otherReason: string
  note: string
}
interface ObservationFHIRIDS {
  maleDependentsOfDeceased?: UUID | string
  femaleDependentsOfDeceased?: UUID | string
  mannerOfDeath?: UUID | string
  deathDescription?: UUID | string
  causeOfDeathEstablished?: UUID | string
  causeOfDeathMethod?: UUID | string
  causeOfDeath?: UUID | string
  birthType?: UUID | string
  typeOfMarriage?: UUID | string
  weightAtBirth?: UUID | string
  attendantAtBirth?: UUID | string
  childrenBornAliveToMother?: UUID | string
  foetalDeathsToMother?: UUID | string
  lastPreviousLiveBirth?: UUID | string
}

interface FHIRIDMap {
  composition?: string
  encounter?: string
  eventLocation?: string
  questionnaireResponse?: string
  observation?: ObservationFHIRIDS
}
interface Person {
  _fhirID?: string
  identifier?: Array<Identity | null>
  name?: Array<HumanName | null>
  telecom?: Array<ContactPoint | null>
  gender?: EnumToStringUnion<typeof Gender>
  birthDate?: string
  age?: number
  maritalStatus?: string
  occupation?: string
  detailsExist?: boolean
  reasonNotApplying?: string
  dateOfMarriage?: DateString
  multipleBirth?: number
  address?: Array<AddressInput | null>
  photo?: Array<Attachment>
  deceased?: Deceased
  nationality?: Array<string | null>
  educationalAttainment?: string
  ageOfIndividualInYears?: number
}
export interface IdentityType {
  id?: string
  type?: string
  otherType?: string
  fieldsModifiedByIdentity?: Array<string | null>
}
export interface QuestionnaireQuestion {
  fieldId?: string
  value?: string
}
export interface BirthRegistration {
  _fhirIDMap?: FHIRIDMap
  registration?: Registration
  child?: Person
  mother?: Person
  father?: Person
  informant?: RelatedPerson
  eventLocation?: Location
  birthType?: string
  questionnaire?: Array<QuestionnaireQuestion | null>
  weightAtBirth?: number
  attendantAtBirth?: string
  otherAttendantAtBirth?: string
  childrenBornAliveToMother?: number
  foetalDeathsToMother?: number
  lastPreviousLiveBirth?: DateString
  createdAt?: DateString
  updatedAt?: DateString
}
interface MedicalPractitioner {
  name?: string
  qualification?: string
  lastVisitDate?: DateString
}
export interface DeathRegistration {
  _fhirIDMap?: FHIRIDMap
  registration?: Registration
  deceased?: Person
  informant?: RelatedPerson
  mother?: Person
  father?: Person
  spouse?: Person
  eventLocation?: Location
  questionnaire?: Array<QuestionnaireQuestion | null>
  mannerOfDeath?: string
  deathDescription?: string
  causeOfDeathMethod?: string
  causeOfDeathEstablished?: string
  causeOfDeath?: string
  maleDependentsOfDeceased?: number
  femaleDependentsOfDeceased?: number
  medicalPractitioner?: MedicalPractitioner
  createdAt?: DateString
  updatedAt?: DateString
}

export interface MarriageRegistration {
  _fhirIDMap?: FHIRIDMap
  registration?: Registration
  informant?: RelatedPerson
  bride?: Person
  groom?: Person
  witnessOne?: RelatedPerson
  witnessTwo?: RelatedPerson
  eventLocation?: Location
  typeOfMarriage?: string
  questionnaire?: Array<QuestionnaireQuestion | null>
  createdAt?: DateString
  updatedAt?: DateString
}
