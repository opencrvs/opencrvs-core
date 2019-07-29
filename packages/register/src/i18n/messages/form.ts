import { defineMessages } from 'react-intl'

interface IFormMessages {
  accountDetails: ReactIntl.FormattedMessage.MessageDescriptor
  addressLine1: ReactIntl.FormattedMessage.MessageDescriptor
  addressLine2: ReactIntl.FormattedMessage.MessageDescriptor
  addressLine3: ReactIntl.FormattedMessage.MessageDescriptor
  addressLine3CityOption: ReactIntl.FormattedMessage.MessageDescriptor
  addressLine4: ReactIntl.FormattedMessage.MessageDescriptor
  addressSameAsMother: ReactIntl.FormattedMessage.MessageDescriptor
  answer: ReactIntl.FormattedMessage.MessageDescriptor
  applicantIDProof: ReactIntl.FormattedMessage.MessageDescriptor
  applicantName: ReactIntl.FormattedMessage.MessageDescriptor
  applicantOtherRelationship: ReactIntl.FormattedMessage.MessageDescriptor
  applicantsDateOfBirth: ReactIntl.FormattedMessage.MessageDescriptor
  applicantsFamilyName: ReactIntl.FormattedMessage.MessageDescriptor
  applicantsFamilyNameEng: ReactIntl.FormattedMessage.MessageDescriptor
  applicantsGivenNames: ReactIntl.FormattedMessage.MessageDescriptor
  applicantsGivenNamesEng: ReactIntl.FormattedMessage.MessageDescriptor
  applicantsIdType: ReactIntl.FormattedMessage.MessageDescriptor
  applicantsNationality: ReactIntl.FormattedMessage.MessageDescriptor
  applicantsRelationWithDeceased: ReactIntl.FormattedMessage.MessageDescriptor
  applicantTitle: ReactIntl.FormattedMessage.MessageDescriptor
  assignedRegisterOffice: ReactIntl.FormattedMessage.MessageDescriptor
  attendantAtBirth: ReactIntl.FormattedMessage.MessageDescriptor
  attendantAtBirthLayperson: ReactIntl.FormattedMessage.MessageDescriptor
  attendantAtBirthMidwife: ReactIntl.FormattedMessage.MessageDescriptor
  attendantAtBirthNone: ReactIntl.FormattedMessage.MessageDescriptor
  attendantAtBirthNurse: ReactIntl.FormattedMessage.MessageDescriptor
  attendantAtBirthOther: ReactIntl.FormattedMessage.MessageDescriptor
  attendantAtBirthOtherParamedicalPersonnel: ReactIntl.FormattedMessage.MessageDescriptor
  attendantAtBirthPhysician: ReactIntl.FormattedMessage.MessageDescriptor
  attestedBirthRecord: ReactIntl.FormattedMessage.MessageDescriptor
  attestedVaccination: ReactIntl.FormattedMessage.MessageDescriptor
  birthAttendant: ReactIntl.FormattedMessage.MessageDescriptor
  birthLocation: ReactIntl.FormattedMessage.MessageDescriptor
  birthMedicalInstitution: ReactIntl.FormattedMessage.MessageDescriptor
  birthType: ReactIntl.FormattedMessage.MessageDescriptor
  birthTypeHigherMultipleDelivery: ReactIntl.FormattedMessage.MessageDescriptor
  birthTypeQuadruplet: ReactIntl.FormattedMessage.MessageDescriptor
  birthTypeSingle: ReactIntl.FormattedMessage.MessageDescriptor
  birthTypeTriplet: ReactIntl.FormattedMessage.MessageDescriptor
  birthTypeTwin: ReactIntl.FormattedMessage.MessageDescriptor
  causeOfDeathCode: ReactIntl.FormattedMessage.MessageDescriptor
  causeOfDeathEstablished: ReactIntl.FormattedMessage.MessageDescriptor
  causeOfDeathName: ReactIntl.FormattedMessage.MessageDescriptor
  causeOfDeathNotice: ReactIntl.FormattedMessage.MessageDescriptor
  causeOfDeathTitle: ReactIntl.FormattedMessage.MessageDescriptor
  certification: ReactIntl.FormattedMessage.MessageDescriptor
  changeAssignedOffice: ReactIntl.FormattedMessage.MessageDescriptor
  childDateOfBirth: ReactIntl.FormattedMessage.MessageDescriptor
  childFamilyName: ReactIntl.FormattedMessage.MessageDescriptor
  childFamilyNameEng: ReactIntl.FormattedMessage.MessageDescriptor
  childFirstNames: ReactIntl.FormattedMessage.MessageDescriptor
  childFirstNamesEng: ReactIntl.FormattedMessage.MessageDescriptor
  childSex: ReactIntl.FormattedMessage.MessageDescriptor
  childSexFemale: ReactIntl.FormattedMessage.MessageDescriptor
  childSexMale: ReactIntl.FormattedMessage.MessageDescriptor
  childSexOther: ReactIntl.FormattedMessage.MessageDescriptor
  childSexUnknown: ReactIntl.FormattedMessage.MessageDescriptor
  childTab: ReactIntl.FormattedMessage.MessageDescriptor
  childTitle: ReactIntl.FormattedMessage.MessageDescriptor
  commentsOrNotesDescription: ReactIntl.FormattedMessage.MessageDescriptor
  commentsOrNotesLabel: ReactIntl.FormattedMessage.MessageDescriptor
  confirm: ReactIntl.FormattedMessage.MessageDescriptor
  confirmMotherDetails: ReactIntl.FormattedMessage.MessageDescriptor
  contactDetailsBoth: ReactIntl.FormattedMessage.MessageDescriptor
  contactDetailsFather: ReactIntl.FormattedMessage.MessageDescriptor
  contactDetailsMother: ReactIntl.FormattedMessage.MessageDescriptor
  country: ReactIntl.FormattedMessage.MessageDescriptor
  currentAddress: ReactIntl.FormattedMessage.MessageDescriptor
  currentAddressSameAsPermanent: ReactIntl.FormattedMessage.MessageDescriptor
  dateOfMarriage: ReactIntl.FormattedMessage.MessageDescriptor
  daughter: ReactIntl.FormattedMessage.MessageDescriptor
  deathAtFacility: ReactIntl.FormattedMessage.MessageDescriptor
  deathAtOtherLocation: ReactIntl.FormattedMessage.MessageDescriptor
  deathAtPrivateHome: ReactIntl.FormattedMessage.MessageDescriptor
  deathDate: ReactIntl.FormattedMessage.MessageDescriptor
  deathEventName: ReactIntl.FormattedMessage.MessageDescriptor
  deathEventTitle: ReactIntl.FormattedMessage.MessageDescriptor
  deathPlace: ReactIntl.FormattedMessage.MessageDescriptor
  deathPlaceAddress: ReactIntl.FormattedMessage.MessageDescriptor
  deathPlaceAddressOther: ReactIntl.FormattedMessage.MessageDescriptor
  deathPlaceAddressSameAsCurrent: ReactIntl.FormattedMessage.MessageDescriptor
  deathPlaceAddressSameAsPermanent: ReactIntl.FormattedMessage.MessageDescriptor
  deathPlaceAddressType: ReactIntl.FormattedMessage.MessageDescriptor
  deceasedCurrentAddressSameAsPermanent: ReactIntl.FormattedMessage.MessageDescriptor
  deceasedDateOfBirth: ReactIntl.FormattedMessage.MessageDescriptor
  deceasedDeathProof: ReactIntl.FormattedMessage.MessageDescriptor
  deceasedDoBProof: ReactIntl.FormattedMessage.MessageDescriptor
  deceasedFamilyName: ReactIntl.FormattedMessage.MessageDescriptor
  deceasedFamilyNameEng: ReactIntl.FormattedMessage.MessageDescriptor
  deceasedGivenNames: ReactIntl.FormattedMessage.MessageDescriptor
  deceasedGivenNamesEng: ReactIntl.FormattedMessage.MessageDescriptor
  deceasedIDProof: ReactIntl.FormattedMessage.MessageDescriptor
  deceasedIdType: ReactIntl.FormattedMessage.MessageDescriptor
  deceasedName: ReactIntl.FormattedMessage.MessageDescriptor
  deceasedParagraph: ReactIntl.FormattedMessage.MessageDescriptor
  deceasedPermanentAddressProof: ReactIntl.FormattedMessage.MessageDescriptor
  deceasedSex: ReactIntl.FormattedMessage.MessageDescriptor
  deceasedSexFemale: ReactIntl.FormattedMessage.MessageDescriptor
  deceasedSexMale: ReactIntl.FormattedMessage.MessageDescriptor
  deceasedSexOther: ReactIntl.FormattedMessage.MessageDescriptor
  deceasedSexUnknown: ReactIntl.FormattedMessage.MessageDescriptor
  deceasedTitle: ReactIntl.FormattedMessage.MessageDescriptor
  defaultLabel: ReactIntl.FormattedMessage.MessageDescriptor
  deliveryAddress: ReactIntl.FormattedMessage.MessageDescriptor
  deliveryInstitution: ReactIntl.FormattedMessage.MessageDescriptor
  deny: ReactIntl.FormattedMessage.MessageDescriptor
  dischargeCertificate: ReactIntl.FormattedMessage.MessageDescriptor
  district: ReactIntl.FormattedMessage.MessageDescriptor
  docTaxReceipt: ReactIntl.FormattedMessage.MessageDescriptor
  docTypeBR: ReactIntl.FormattedMessage.MessageDescriptor
  docTypeChildAgeProof: ReactIntl.FormattedMessage.MessageDescriptor
  docTypeChildBirthProof: ReactIntl.FormattedMessage.MessageDescriptor
  docTypeCopyOfBurialReceipt: ReactIntl.FormattedMessage.MessageDescriptor
  docTypeDeathCertificate: ReactIntl.FormattedMessage.MessageDescriptor
  docTypeDoctorCertificate: ReactIntl.FormattedMessage.MessageDescriptor
  docTypeEPICard: ReactIntl.FormattedMessage.MessageDescriptor
  docTypeEPIStaffCertificate: ReactIntl.FormattedMessage.MessageDescriptor
  docTypeFuneralReceipt: ReactIntl.FormattedMessage.MessageDescriptor
  docTypeHospitalDischargeCertificate: ReactIntl.FormattedMessage.MessageDescriptor
  docTypeLetterOfDeath: ReactIntl.FormattedMessage.MessageDescriptor
  docTypeNIDBack: ReactIntl.FormattedMessage.MessageDescriptor
  docTypeNIDFront: ReactIntl.FormattedMessage.MessageDescriptor
  docTypeOther: ReactIntl.FormattedMessage.MessageDescriptor
  docTypePassport: ReactIntl.FormattedMessage.MessageDescriptor
  docTypePostMortemReport: ReactIntl.FormattedMessage.MessageDescriptor
  docTypeSC: ReactIntl.FormattedMessage.MessageDescriptor
  documentNumber: ReactIntl.FormattedMessage.MessageDescriptor
  documentsName: ReactIntl.FormattedMessage.MessageDescriptor
  documentsTitle: ReactIntl.FormattedMessage.MessageDescriptor
  documentsUploadName: ReactIntl.FormattedMessage.MessageDescriptor
  documentsUploadTitle: ReactIntl.FormattedMessage.MessageDescriptor
  educationAttainmentISCED1: ReactIntl.FormattedMessage.MessageDescriptor
  educationAttainmentISCED2: ReactIntl.FormattedMessage.MessageDescriptor
  educationAttainmentISCED3: ReactIntl.FormattedMessage.MessageDescriptor
  educationAttainmentISCED4: ReactIntl.FormattedMessage.MessageDescriptor
  educationAttainmentISCED5: ReactIntl.FormattedMessage.MessageDescriptor
  educationAttainmentISCED6: ReactIntl.FormattedMessage.MessageDescriptor
  educationAttainmentNone: ReactIntl.FormattedMessage.MessageDescriptor
  educationAttainmentNotStated: ReactIntl.FormattedMessage.MessageDescriptor
  enterResponse: ReactIntl.FormattedMessage.MessageDescriptor
  familyName: ReactIntl.FormattedMessage.MessageDescriptor
  father: ReactIntl.FormattedMessage.MessageDescriptor
  fatherDateOfBirth: ReactIntl.FormattedMessage.MessageDescriptor
  fatherEducationAttainment: ReactIntl.FormattedMessage.MessageDescriptor
  fatherFamilyName: ReactIntl.FormattedMessage.MessageDescriptor
  fatherFamilyNameEng: ReactIntl.FormattedMessage.MessageDescriptor
  fatherFirstNames: ReactIntl.FormattedMessage.MessageDescriptor
  fatherFirstNamesEng: ReactIntl.FormattedMessage.MessageDescriptor
  fatherName: ReactIntl.FormattedMessage.MessageDescriptor
  fathersDetailsExist: ReactIntl.FormattedMessage.MessageDescriptor
  fatherTitle: ReactIntl.FormattedMessage.MessageDescriptor
  fetchDeceasedDetails: ReactIntl.FormattedMessage.MessageDescriptor
  fetchFatherDetails: ReactIntl.FormattedMessage.MessageDescriptor
  fetchIdentifierModalErrorTitle: ReactIntl.FormattedMessage.MessageDescriptor
  fetchIdentifierModalSuccessTitle: ReactIntl.FormattedMessage.MessageDescriptor
  fetchIdentifierModalTitle: ReactIntl.FormattedMessage.MessageDescriptor
  fetchInformantDetails: ReactIntl.FormattedMessage.MessageDescriptor
  fetchMotherDetails: ReactIntl.FormattedMessage.MessageDescriptor
  fetchPersonByNIDModalErrorText: ReactIntl.FormattedMessage.MessageDescriptor
  fetchPersonByNIDModalInfo: ReactIntl.FormattedMessage.MessageDescriptor
  fetchRegistrationModalErrorText: ReactIntl.FormattedMessage.MessageDescriptor
  fetchRegistrationModalInfo: ReactIntl.FormattedMessage.MessageDescriptor
  firstNameBn: ReactIntl.FormattedMessage.MessageDescriptor
  firstNameEn: ReactIntl.FormattedMessage.MessageDescriptor
  givenNames: ReactIntl.FormattedMessage.MessageDescriptor
  healthInstitution: ReactIntl.FormattedMessage.MessageDescriptor
  hospital: ReactIntl.FormattedMessage.MessageDescriptor
  iD: ReactIntl.FormattedMessage.MessageDescriptor
  iDType: ReactIntl.FormattedMessage.MessageDescriptor
  iDTypeAlienNumber: ReactIntl.FormattedMessage.MessageDescriptor
  iDTypeBRN: ReactIntl.FormattedMessage.MessageDescriptor
  iDTypeDrivingLicense: ReactIntl.FormattedMessage.MessageDescriptor
  iDTypeDRN: ReactIntl.FormattedMessage.MessageDescriptor
  iDTypeNationalID: ReactIntl.FormattedMessage.MessageDescriptor
  iDTypeNoId: ReactIntl.FormattedMessage.MessageDescriptor
  iDTypeOther: ReactIntl.FormattedMessage.MessageDescriptor
  iDTypeOtherLabel: ReactIntl.FormattedMessage.MessageDescriptor
  iDTypePassport: ReactIntl.FormattedMessage.MessageDescriptor
  iDTypeRefugeeNumber: ReactIntl.FormattedMessage.MessageDescriptor
  informantAttestation: ReactIntl.FormattedMessage.MessageDescriptor
  lastNameBn: ReactIntl.FormattedMessage.MessageDescriptor
  lastNameEn: ReactIntl.FormattedMessage.MessageDescriptor
  manner: ReactIntl.FormattedMessage.MessageDescriptor
  mannerAccident: ReactIntl.FormattedMessage.MessageDescriptor
  mannerHomicide: ReactIntl.FormattedMessage.MessageDescriptor
  mannerNatural: ReactIntl.FormattedMessage.MessageDescriptor
  mannerSuicide: ReactIntl.FormattedMessage.MessageDescriptor
  mannerUndetermined: ReactIntl.FormattedMessage.MessageDescriptor
  maritalStatus: ReactIntl.FormattedMessage.MessageDescriptor
  maritalStatusDivorced: ReactIntl.FormattedMessage.MessageDescriptor
  maritalStatusMarried: ReactIntl.FormattedMessage.MessageDescriptor
  maritalStatusNotStated: ReactIntl.FormattedMessage.MessageDescriptor
  maritalStatusSingle: ReactIntl.FormattedMessage.MessageDescriptor
  maritalStatusWidowed: ReactIntl.FormattedMessage.MessageDescriptor
  medicallyCertified: ReactIntl.FormattedMessage.MessageDescriptor
  methodOfCauseOfDeath: ReactIntl.FormattedMessage.MessageDescriptor
  mother: ReactIntl.FormattedMessage.MessageDescriptor
  motherDateOfBirth: ReactIntl.FormattedMessage.MessageDescriptor
  motherEducationAttainment: ReactIntl.FormattedMessage.MessageDescriptor
  motherFamilyName: ReactIntl.FormattedMessage.MessageDescriptor
  motherFamilyNameEng: ReactIntl.FormattedMessage.MessageDescriptor
  motherFirstNames: ReactIntl.FormattedMessage.MessageDescriptor
  motherFirstNamesEng: ReactIntl.FormattedMessage.MessageDescriptor
  motherName: ReactIntl.FormattedMessage.MessageDescriptor
  motherTitle: ReactIntl.FormattedMessage.MessageDescriptor
  multipleBirth: ReactIntl.FormattedMessage.MessageDescriptor
  nationality: ReactIntl.FormattedMessage.MessageDescriptor
  nationalityBangladesh: ReactIntl.FormattedMessage.MessageDescriptor
  NID: ReactIntl.FormattedMessage.MessageDescriptor
  officeLocationId: ReactIntl.FormattedMessage.MessageDescriptor
  optionalLabel: ReactIntl.FormattedMessage.MessageDescriptor
  otherDocuments: ReactIntl.FormattedMessage.MessageDescriptor
  otherHealthInstitution: ReactIntl.FormattedMessage.MessageDescriptor
  otherInstitution: ReactIntl.FormattedMessage.MessageDescriptor
  otherOption: ReactIntl.FormattedMessage.MessageDescriptor
  paragraph45daysTo5Years: ReactIntl.FormattedMessage.MessageDescriptor
  paragraph: ReactIntl.FormattedMessage.MessageDescriptor
  paragraphAbove5Years: ReactIntl.FormattedMessage.MessageDescriptor
  permanentAddress: ReactIntl.FormattedMessage.MessageDescriptor
  permanentAddressSameAsCurrent: ReactIntl.FormattedMessage.MessageDescriptor
  permanentAddressSameAsMother: ReactIntl.FormattedMessage.MessageDescriptor
  phoneNumber: ReactIntl.FormattedMessage.MessageDescriptor
  phoneVerificationWarning: ReactIntl.FormattedMessage.MessageDescriptor
  placeOfBirth: ReactIntl.FormattedMessage.MessageDescriptor
  postCode: ReactIntl.FormattedMessage.MessageDescriptor
  presentBoth: ReactIntl.FormattedMessage.MessageDescriptor
  presentFather: ReactIntl.FormattedMessage.MessageDescriptor
  presentMother: ReactIntl.FormattedMessage.MessageDescriptor
  presentOther: ReactIntl.FormattedMessage.MessageDescriptor
  privateHome: ReactIntl.FormattedMessage.MessageDescriptor
  prompt: ReactIntl.FormattedMessage.MessageDescriptor
  proofOfBirthPlaceAndDate: ReactIntl.FormattedMessage.MessageDescriptor
  proofOfDocCertificateOfChild: ReactIntl.FormattedMessage.MessageDescriptor
  proofOfEPICardOfChild: ReactIntl.FormattedMessage.MessageDescriptor
  proofOfFathersID: ReactIntl.FormattedMessage.MessageDescriptor
  proofOfMothersID: ReactIntl.FormattedMessage.MessageDescriptor
  proofOfParentPermanentAddress: ReactIntl.FormattedMessage.MessageDescriptor
  registrationName: ReactIntl.FormattedMessage.MessageDescriptor
  registrationOffice: ReactIntl.FormattedMessage.MessageDescriptor
  registrationPhoneLabel: ReactIntl.FormattedMessage.MessageDescriptor
  registrationTitle: ReactIntl.FormattedMessage.MessageDescriptor
  relationExtendedFamily: ReactIntl.FormattedMessage.MessageDescriptor
  relationOther: ReactIntl.FormattedMessage.MessageDescriptor
  relationshipPlaceHolder: ReactIntl.FormattedMessage.MessageDescriptor
  searchFieldModalTitle: ReactIntl.FormattedMessage.MessageDescriptor
  searchFieldPlaceHolderText: ReactIntl.FormattedMessage.MessageDescriptor
  securityQuestionLabel: ReactIntl.FormattedMessage.MessageDescriptor
  select: ReactIntl.FormattedMessage.MessageDescriptor
  selectOne: ReactIntl.FormattedMessage.MessageDescriptor
  selectSecurityQuestion: ReactIntl.FormattedMessage.MessageDescriptor
  self: ReactIntl.FormattedMessage.MessageDescriptor
  signedAffidavitConfirmation: ReactIntl.FormattedMessage.MessageDescriptor
  someoneElse: ReactIntl.FormattedMessage.MessageDescriptor
  son: ReactIntl.FormattedMessage.MessageDescriptor
  spouse: ReactIntl.FormattedMessage.MessageDescriptor
  state: ReactIntl.FormattedMessage.MessageDescriptor
  typeOfDocument: ReactIntl.FormattedMessage.MessageDescriptor
  uploadDocForChild: ReactIntl.FormattedMessage.MessageDescriptor
  uploadDocForFather: ReactIntl.FormattedMessage.MessageDescriptor
  uploadDocForMother: ReactIntl.FormattedMessage.MessageDescriptor
  uploadDocForOther: ReactIntl.FormattedMessage.MessageDescriptor
  uploadDocForWhom: ReactIntl.FormattedMessage.MessageDescriptor
  uploadImage: ReactIntl.FormattedMessage.MessageDescriptor
  userDetails: ReactIntl.FormattedMessage.MessageDescriptor
  userDevice: ReactIntl.FormattedMessage.MessageDescriptor
  userFormReviewTitle: ReactIntl.FormattedMessage.MessageDescriptor
  userFormSecurityQuestionsDescription: ReactIntl.FormattedMessage.MessageDescriptor
  userFormSecurityQuestionsHeading: ReactIntl.FormattedMessage.MessageDescriptor
  userFormSecurityQuestionsTitle: ReactIntl.FormattedMessage.MessageDescriptor
  userFormTitle: ReactIntl.FormattedMessage.MessageDescriptor
  verbalAutopsy: ReactIntl.FormattedMessage.MessageDescriptor
  warningNotVerified: ReactIntl.FormattedMessage.MessageDescriptor
  weightAtBirth: ReactIntl.FormattedMessage.MessageDescriptor
  whatDocToUpload: ReactIntl.FormattedMessage.MessageDescriptor
  whoIsPresentLabel: ReactIntl.FormattedMessage.MessageDescriptor
  whoseContactDetailsLabel: ReactIntl.FormattedMessage.MessageDescriptor
  uploadedList: ReactIntl.FormattedMessage.MessageDescriptor
}

const messagesToDefine: IFormMessages = {
  accountDetails: {
    defaultMessage: 'Account details',
    description: 'Account details section',
    id: 'form.section.accountDetails'
  },
  addressLine1: {
    defaultMessage: 'Street and house number',
    description: 'Title for the address line 1',
    id: 'form.field.label.addressLine1'
  },
  addressLine2: {
    defaultMessage: 'Area / Ward / Mouja / Village',
    description: 'Title for the address line 2',
    id: 'form.field.label.addressLine2'
  },
  addressLine3: {
    defaultMessage: 'Union / Municipality / Cantonement',
    description: 'Title for the address line 3 option 1',
    id: 'form.field.label.addressLine3'
  },
  addressLine3CityOption: {
    defaultMessage: 'Ward',
    description: 'Title for the address line 3 option 2',
    id: 'form.field.label.addressLine3CityOption'
  },
  addressLine4: {
    defaultMessage: 'Upazila (Thana) / City',
    description: 'Title for the address line 4',
    id: 'form.field.label.addressLine4'
  },
  addressSameAsMother: {
    defaultMessage: "Is his current address the same as the mother's?",
    description:
      "Title for the radio button to select that the father's current address is the same as the mother's address",
    id: 'form.field.label.addressSameAsMother'
  },
  answer: {
    defaultMessage: 'Answer',
    description: 'Label to show answer to a security question',
    id: 'user.form.securityquestion.answer'
  },
  applicantIDProof: {
    defaultMessage: "Proof of Applicant's ID",
    description: 'Option for radio group field: Type of Document To Upload',
    id: 'form.field.label.applicantIDProof'
  },
  applicantName: {
    defaultMessage: 'Applicant',
    description: 'Form section name for Applicant',
    id: 'form.section.applicant.name'
  },
  applicantOtherRelationship: {
    defaultMessage: 'Other relation',
    description: 'Label for form field: Other relation',
    id: 'form.field.label.applicantOtherRelationship'
  },
  applicantsDateOfBirth: {
    defaultMessage: 'Date of Birth',
    description: 'Label for form field: Date of birth',
    id: 'form.field.label.applicantsDateOfBirth'
  },
  applicantsFamilyName: {
    defaultMessage: 'Last Name(s) in Bengali',
    description: 'Label for form field: Family name',
    id: 'form.field.label.applicantsFamilyName'
  },
  applicantsFamilyNameEng: {
    defaultMessage: 'Last Name(s) in English',
    description: 'Label for form field: Family name in english',
    id: 'form.field.label.applicantsFamilyNameEng'
  },
  applicantsGivenNames: {
    defaultMessage: 'First Name(s) in Bengali',
    description: 'Label for form field: Given names',
    id: 'form.field.label.applicantsGivenNames'
  },
  applicantsGivenNamesEng: {
    defaultMessage: 'First Name(s) in English',
    description: 'Label for form field: Given names in english',
    id: 'form.field.label.applicantsGivenNamesEng'
  },
  applicantsIdType: {
    defaultMessage: 'Type of ID',
    description: 'Label for form field: Existing ID',
    id: 'form.field.label.applicantsIdType'
  },
  applicantsNationality: {
    defaultMessage: 'Nationality',
    description: 'Label for form field: Nationality',
    id: 'form.field.label.applicants.nationality'
  },
  applicantsRelationWithDeceased: {
    defaultMessage: 'Relationship to Deceased',
    description: 'Label for Relationship to Deceased select',
    id: 'form.field.label.applicantsRelationWithDeceased'
  },
  applicantTitle: {
    defaultMessage: "What are the applicant's details?",
    description: 'Form section title for applicants',
    id: 'form.section.applicant.title'
  },
  assignedRegisterOffice: {
    defaultMessage: 'Assigned Register Office',
    description: 'Assigned Register Office section',
    id: 'form.section.assignedRegisterOffice'
  },
  attendantAtBirth: {
    defaultMessage: 'Attendant at birth',
    description: 'Label for form field: Attendant at birth',
    id: 'form.field.label.attendantAtBirth'
  },
  attendantAtBirthLayperson: {
    defaultMessage: 'Layperson',
    description: 'Label for form field: Attendant at birth',
    id: 'form.field.label.attendantAtBirthLayperson'
  },
  attendantAtBirthMidwife: {
    defaultMessage: 'Midwife',
    description: 'Label for form field: Attendant at birth',
    id: 'form.field.label.attendantAtBirthMidwife'
  },
  attendantAtBirthNone: {
    defaultMessage: 'None',
    description: 'Label for form field: Attendant at birth',
    id: 'form.field.label.attendantAtBirthNone'
  },
  attendantAtBirthNurse: {
    defaultMessage: 'Nurse',
    description: 'Label for form field: Attendant at birth',
    id: 'form.field.label.attendantAtBirthNurse'
  },
  attendantAtBirthOther: {
    defaultMessage: 'Other',
    description: 'Label for form field: Attendant at birth',
    id: 'form.field.label.attendantAtBirthOther'
  },
  attendantAtBirthOtherParamedicalPersonnel: {
    defaultMessage: 'Other paramedical personnel',
    description: 'Label for form field: Attendant at birth',
    id: 'form.field.label.attendantAtBirthOtherParamedicalPersonnel'
  },
  attendantAtBirthPhysician: {
    defaultMessage: 'Physician',
    description: 'Label for form field: Attendant at birth',
    id: 'form.field.label.attendantAtBirthPhysician'
  },
  attestedBirthRecord: {
    defaultMessage: 'Attested copy of hospital document or birth record, or',
    description: 'Attested copy of hospital document',
    id: 'form.section.documents.list.attestedBirthRecord'
  },
  attestedVaccination: {
    defaultMessage: 'Attested copy of the vaccination (EPI) card, or',
    description: 'Attested copy of the vaccination card',
    id: 'form.section.documents.list.attestedVaccination'
  },
  birthAttendant: {
    defaultMessage: 'Proof of birth from birth attendant',
    description: 'Document type label for Proof of birth from birth attendant',
    id: 'form.field.label.docTypebirthAttendant'
  },
  birthLocation: {
    defaultMessage: 'Hospital / Clinic',
    description: 'Label for form field: Hospital or Health Institution',
    id: 'form.field.label.birthLocation'
  },
  birthMedicalInstitution: {
    defaultMessage: 'Proof of birth from medical institution',
    description:
      'Document type label for Proof of birth from medical institution',
    id: 'form.field.label.docTypeMedicalInstitution'
  },
  birthType: {
    defaultMessage: 'Type of birth',
    description: 'Label for form field: Type of birth',
    id: 'form.field.label.birthType'
  },
  birthTypeHigherMultipleDelivery: {
    defaultMessage: 'Higher multiple delivery',
    description: 'Label for form field: Type of birth',
    id: 'form.field.label.birthTypeHigherMultipleDelivery'
  },
  birthTypeQuadruplet: {
    defaultMessage: 'Quadruplet',
    description: 'Label for form field: Type of birth',
    id: 'form.field.label.birthTypeQuadruplet'
  },
  birthTypeSingle: {
    defaultMessage: 'Single',
    description: 'Label for form field: Type of birth',
    id: 'form.field.label.birthTypeSingle'
  },
  birthTypeTriplet: {
    defaultMessage: 'Triplet',
    description: 'Label for form field: Type of birth',
    id: 'form.field.label.birthTypeTriplet'
  },
  birthTypeTwin: {
    defaultMessage: 'Twin',
    description: 'Label for form field: Type of birth',
    id: 'form.field.label.birthTypeTwin'
  },
  causeOfDeathCode: {
    defaultMessage: 'Cause of Death Code',
    description: 'Label for form field: Cause of Death Code',
    id: 'form.field.label.causeOfDeathCode'
  },
  causeOfDeathEstablished: {
    defaultMessage: 'Has an official cause of death been established ?',
    description: 'Label for form field: Cause of Death Established',
    id: 'form.field.label.causeOfDeathEstablished'
  },
  causeOfDeathName: {
    defaultMessage: 'What is the official cause of death?',
    description: 'Form section name for Cause of Death',
    id: 'form.section.causeOfDeath.name'
  },
  causeOfDeathNotice: {
    defaultMessage:
      'Official cause of death is not mandatory to submit the application. A cause of death can be added at a later date.',
    description: 'Form section notice for Cause of Death',
    id: 'form.section.causeOfDeathNotice'
  },
  causeOfDeathTitle: {
    defaultMessage: 'What is the official cause of death?',
    description: 'Form section title for Cause of Death',
    id: 'form.section.causeOfDeath.title'
  },
  certification: {
    defaultMessage:
      'Certification regarding NGO worker authorized by registrar in favour of date of birth, or',
    description: 'Certification regarding NGO worker',
    id: 'form.section.documents.list.certification'
  },
  changeAssignedOffice: {
    defaultMessage: 'Change assigned office',
    description: 'Edit button text',
    id: 'form.field.SearchField.changeAssignedOffice'
  },
  childDateOfBirth: {
    defaultMessage: 'Date of birth',
    description: 'Label for form field: Date of birth',
    id: 'form.field.label.childDateOfBirth'
  },
  childFamilyName: {
    defaultMessage: 'Last Name(s) in Bengali',
    description: 'Label for form field: Family name',
    id: 'form.field.label.childFamilyName'
  },
  childFamilyNameEng: {
    defaultMessage: 'Last Name(s) in English',
    description: 'Label for form field: Family name in english',
    id: 'form.field.label.childFamilyNameEng'
  },
  childFirstNames: {
    defaultMessage: 'First Name(s) in Bengali',
    description: 'Label for form field: First names',
    id: 'form.field.label.childFirstNames'
  },
  childFirstNamesEng: {
    defaultMessage: 'First Name(s) in English',
    description: 'Label for form field: First names in english',
    id: 'form.field.label.childFirstNamesEng'
  },
  childSex: {
    defaultMessage: 'Sex',
    description: 'Label for form field: Sex name',
    id: 'form.field.label.childSex'
  },
  childSexFemale: {
    defaultMessage: 'Female',
    description: 'Option for form field: Sex name',
    id: 'form.field.label.childSexFemale'
  },
  childSexMale: {
    defaultMessage: 'Male',
    description: 'Option for form field: Sex name',
    id: 'form.field.label.childSexMale'
  },
  childSexOther: {
    defaultMessage: 'Other',
    description: 'Option for form field: Sex name',
    id: 'form.field.label.childSexOther'
  },
  childSexUnknown: {
    defaultMessage: 'Unknown',
    description: 'Option for form field: Sex name',
    id: 'form.field.label.childSexUnknown'
  },
  childTab: {
    defaultMessage: 'Child',
    description: 'Form section name for Child',
    id: 'birth.form.section.child.name'
  },
  childTitle: {
    defaultMessage: "Child's details",
    description: 'Form section title for Child',
    id: 'birth.form.section.child.title'
  },
  commentsOrNotesDescription: {
    defaultMessage:
      'Use this section to add any comments or notes that might be relevant to the completion and certification of this registration. This information won’t be shared with the informants.',
    description: 'Help text for the notes field',
    id: 'form.field.label.application.commentsOrNotes.description'
  },
  commentsOrNotesLabel: {
    defaultMessage: 'Comments or notes',
    description: 'Input label for comments or notes textarea',
    id: 'form.field.label.application.commentsOrNotes'
  },
  confirm: {
    defaultMessage: 'Yes',
    description: 'confirmation label for yes / no radio button',
    id: 'form.field.label.confirm'
  },
  confirmMotherDetails: {
    defaultMessage:
      'Does their proof of ID document match the following details?',
    description: 'The label for mother details paragraph',
    id: 'form.field.label.print.confirmMotherInformation'
  },
  contactDetailsBoth: {
    defaultMessage: 'Both Parents',
    description: 'Label for "Both Parents" select option',
    id: 'form.field.label.application.whoseContactDetails.both'
  },
  contactDetailsFather: {
    defaultMessage: 'Father',
    description: 'Label for "Father" select option',
    id: 'form.field.label.application.whoseContactDetails.father'
  },
  contactDetailsMother: {
    defaultMessage: 'Mother',
    description: 'Label for "Mother" select option',
    id: 'form.field.label.application.whoseContactDetails.mother'
  },
  country: {
    defaultMessage: 'Country',
    description: 'Title for the country select',
    id: 'form.field.label.country'
  },
  currentAddress: {
    defaultMessage: 'Current Address',
    description: 'Title for the current address fields',
    id: 'form.field.label.currentAddress'
  },
  currentAddressSameAsPermanent: {
    defaultMessage: 'Is her current address the same as her permanent address?',
    description:
      'Title for the radio button to select that the mothers current address is the same as her permanent address',
    id: 'form.field.label.currentAddressSameAsPermanent'
  },
  dateOfMarriage: {
    defaultMessage: 'Date of marriage',
    description: 'Option for form field: Date of marriage',
    id: 'form.field.label.dateOfMarriage'
  },
  daughter: {
    defaultMessage: 'Daughter',
    description: 'Label for option Daughter',
    id: 'form.field.label.applicantRelation.daughter'
  },
  deathAtFacility: {
    defaultMessage: 'What hospital did the death occur at?',
    description: 'Label for form field: Hospital or Health Institution',
    id: 'form.field.label.deathAtFacility'
  },
  deathAtOtherLocation: {
    defaultMessage: 'What is the other address did the death occur at?',
    description: 'Label for form field: Other Location Address',
    id: 'form.field.label.deathAtOtherLocation'
  },
  deathAtPrivateHome: {
    defaultMessage: 'What is the address of the private home?',
    description: 'Label for form field: Private Home Address',
    id: 'form.field.label.deathAtPrivateHome'
  },
  deathDate: {
    defaultMessage:
      'Enter the date in the format day, month and year. For example 24 10 2020.',
    description: 'Label for form field: Date of occurrence',
    id: 'form.field.label.deathDate'
  },
  deathEventName: {
    defaultMessage: 'When did the death occur?',
    description: 'Form section name for Death Event',
    id: 'form.section.deathEvent.name'
  },
  deathEventTitle: {
    defaultMessage: 'When did the death occur?',
    description: 'Form section title for Death Event',
    id: 'form.section.deathEvent.title'
  },
  deathPlace: {
    defaultMessage: 'Place of Occurrence of Death',
    description: 'Title for place of occurrence of death',
    id: 'form.field.label.deathPlace'
  },
  deathPlaceAddress: {
    defaultMessage: 'Where did the death occur?',
    description: 'Label for form field: Place of occurrence of death',
    id: 'form.field.label.deathPlaceAddress'
  },
  deathPlaceAddressOther: {
    defaultMessage: 'Different Address',
    description: 'Option for form field: Place of occurrence of death',
    id: 'form.field.label.deathPlaceAddressOther'
  },
  deathPlaceAddressSameAsCurrent: {
    defaultMessage: 'Current address of the deceased',
    description: 'Option for form field: Place of occurrence of death',
    id: 'form.field.label.deathPlaceAddressSameAsCurrent'
  },
  deathPlaceAddressSameAsPermanent: {
    defaultMessage: 'Permanent address of the deceased',
    description: 'Option for form field: Place of occurrence of death',
    id: 'form.field.label.deathPlaceAddressSameAsPermanent'
  },
  deathPlaceAddressType: {
    defaultMessage: 'Type of Place',
    description: 'Label for form field: Type of place of death occurrence',
    id: 'form.field.label.deathPlaceAddressType'
  },
  deceasedCurrentAddressSameAsPermanent: {
    defaultMessage:
      'Is deceased’s current address the same as their permanent address?',
    description:
      'Title for the radio button to select that the deceased current address is the same as their permanent address',
    id: 'form.field.label.deceasedCurrentAddressSameAsPermanent'
  },
  deceasedDateOfBirth: {
    defaultMessage: 'Date of Birth',
    description: 'Label for form field: Date of birth',
    id: 'form.field.label.deceasedDateOfBirth'
  },
  deceasedDeathProof: {
    defaultMessage: 'Proof of Death of Deceased',
    description: 'Option for radio group field: Type of Document To Upload',
    id: 'form.field.label.deceasedDeathProof'
  },
  deceasedDoBProof: {
    defaultMessage: 'Proof of Date of Birth of Deceased',
    description: 'Option for radio group field: Type of Document To Upload',
    id: 'form.field.label.deceasedDoBProof'
  },
  deceasedFamilyName: {
    defaultMessage: 'Last Name(s) in Bengali',
    description: 'Label for form field: Family name',
    id: 'form.field.label.deceasedFamilyName'
  },
  deceasedFamilyNameEng: {
    defaultMessage: 'Last Name(s) in English',
    description: 'Label for form field: Family name in english',
    id: 'form.field.label.deceasedFamilyNameEng'
  },
  deceasedGivenNames: {
    defaultMessage: 'First Name(s) in Bengali',
    description: 'Label for form field: Given names',
    id: 'form.field.label.deceasedGivenNames'
  },
  deceasedGivenNamesEng: {
    defaultMessage: 'First Name(s) in English',
    description: 'Label for form field: Given names in english',
    id: 'form.field.label.deceasedGivenNamesEng'
  },
  deceasedIDProof: {
    defaultMessage: "Proof of Deceased's ID",
    description: 'Option for radio group field: Type of Document To Upload',
    id: 'form.field.label.deceasedIDProof'
  },
  deceasedIdType: {
    defaultMessage: 'Type of ID',
    description: 'Label for form field: Existing ID',
    id: 'form.field.label.deceasedIdType'
  },
  deceasedName: {
    defaultMessage: 'Deceased',
    description: 'Form section name for Deceased',
    id: 'form.section.deceased.name'
  },
  deceasedParagraph: {
    defaultMessage:
      'For this death registration, the following documents are required:',
    description: 'Documents Paragraph text',
    id: 'form.field.label.deceasedDocumentParagraph'
  },
  deceasedPermanentAddressProof: {
    defaultMessage: 'Proof of Permanent Address of Deceased',
    description: 'Option for radio group field: Type of Document To Upload',
    id: 'form.field.label.deceasedPermanentAddressProof'
  },
  deceasedSex: {
    defaultMessage: 'Sex',
    description: 'Label for form field: Sex name',
    id: 'form.field.label.deceasedSex'
  },
  deceasedSexFemale: {
    defaultMessage: 'Female',
    description: 'Option for form field: Sex name',
    id: 'form.field.label.deceasedSexFemale'
  },
  deceasedSexMale: {
    defaultMessage: 'Male',
    description: 'Option for form field: Sex name',
    id: 'form.field.label.deceasedSexMale'
  },
  deceasedSexOther: {
    defaultMessage: 'Other',
    description: 'Option for form field: Sex name',
    id: 'form.field.label.deceasedSexOther'
  },
  deceasedSexUnknown: {
    defaultMessage: 'Unknown',
    description: 'Option for form field: Sex name',
    id: 'form.field.label.deceasedSexUnknown'
  },
  deceasedTitle: {
    defaultMessage: 'What are the deceased details?',
    description: 'Form section title for Deceased',
    id: 'form.section.deceased.title'
  },
  defaultLabel: {
    defaultMessage: 'Label goes here',
    description: 'default label',
    id: 'form.field.label.defaultLabel'
  },
  deliveryAddress: {
    defaultMessage: 'Address of place of delivery',
    description: 'Label for form field: Address of place of delivery',
    id: 'form.field.label.deliveryAddress'
  },
  deliveryInstitution: {
    defaultMessage: 'Type or select institution',
    description: 'Label for form field: Type or select institution',
    id: 'form.field.label.deliveryInstitution'
  },
  deny: {
    defaultMessage: 'No',
    description: 'deny label for yes / no radio button',
    id: 'form.field.label.deny'
  },
  dischargeCertificate: {
    defaultMessage: 'Discharge Certificate',
    description: 'Document type label for Discharge Certificate',
    id: 'form.field.label.docTypeHospitalDischargeCertificate'
  },
  district: {
    defaultMessage: 'District',
    description: 'Title for the district select',
    id: 'form.field.label.district'
  },
  docTaxReceipt: {
    defaultMessage: 'Receipt of tax payment',
    description: 'Document type label for tax receipt',
    id: 'form.field.label.docTypeTaxReceipt'
  },
  docTypeBR: {
    defaultMessage: 'Birth Registration',
    description: 'Label for select option Birth Registration',
    id: 'form.field.label.docTypeBR'
  },
  docTypeChildAgeProof: {
    defaultMessage: 'Proof of Child Age',
    description: 'Label for select option Child Age Proof',
    id: 'form.field.label.docTypeChildAgeProof'
  },
  docTypeChildBirthProof: {
    defaultMessage: 'Proof of Place and Date of Birth',
    description: 'Label for select option Child Birth Proof',
    id: 'form.field.label.docTypeChildBirthProof'
  },
  docTypeCopyOfBurialReceipt: {
    defaultMessage: 'Certified Copy of Burial Receipt',
    description: 'Label for select option Certified Copy of Burial Receipt',
    id: 'form.field.label.docTypeCopyOfBurialReceipt'
  },
  docTypeDeathCertificate: {
    defaultMessage: 'Attested Certificate of Death',
    description: 'Label for select option Attested Certificate of Death',
    id: 'form.field.label.docTypeDeathCertificate'
  },
  docTypeDoctorCertificate: {
    defaultMessage: 'Doctor Certificate',
    description: 'Label for select option Doctor Certificate',
    id: 'form.field.label.docTypeDoctorCertificate'
  },
  docTypeEPICard: {
    defaultMessage: 'EPI Card',
    description: 'Label for select option EPI Card',
    id: 'form.field.label.docTypeEPICard'
  },
  docTypeEPIStaffCertificate: {
    defaultMessage: 'EPI Staff Certificate',
    description: 'Label for select option EPI Card',
    id: 'form.field.label.docTypeEPIStaffCertificate'
  },
  docTypeFuneralReceipt: {
    defaultMessage: 'Certified Copy of Funeral Receipt',
    description: 'Label for select option Certified Copy of Funeral Receipt',
    id: 'form.field.label.docTypeFuneralReceipt'
  },
  docTypeHospitalDischargeCertificate: {
    defaultMessage: 'Hospital Discharge Certificate',
    description: 'Label for select option Hospital Discharge Certificate',
    id: 'form.field.label.docTypeHospitalDischargeCertificate'
  },
  docTypeLetterOfDeath: {
    defaultMessage: 'Attested Letter of Death',
    description: 'Label for select option Attested Letter of Death',
    id: 'form.field.label.docTypeLetterOfDeath'
  },
  docTypeNIDBack: {
    defaultMessage: 'National ID (back)',
    description: 'Label for select option radio option NID back',
    id: 'form.field.label.docTypeNIDBack'
  },
  docTypeNIDFront: {
    defaultMessage: 'National ID (front)',
    description: 'Label for select option radio option NID front',
    id: 'form.field.label.docTypeNIDFront'
  },
  docTypeOther: {
    defaultMessage: 'Other',
    description: 'Label for radio option Other',
    id: 'form.field.label.docTypeOther'
  },
  docTypePassport: {
    defaultMessage: 'Passport',
    description: 'Label for radio option Passport',
    id: 'form.field.label.docTypePassport'
  },
  docTypePostMortemReport: {
    defaultMessage: 'Certified Post Mortem Report',
    description: 'Label for select option Post Mortem Report',
    id: 'form.field.label.docTypePostMortemReport'
  },
  docTypeSC: {
    defaultMessage: 'School Certificate',
    description: 'Label for radio option School Certificate',
    id: 'form.field.label.docTypeSC'
  },
  documentNumber: {
    defaultMessage: 'Document number',
    description: 'Label for document number input field',
    id: 'form.field.label.print.documentNumber'
  },
  documentsName: {
    defaultMessage: 'Documents',
    description: 'Form section name for Documents',
    id: 'form.section.documents.name'
  },
  documentsTitle: {
    defaultMessage: 'Supporting documents',
    description: 'Form section title for Documents',
    id: 'form.section.documents.title'
  },
  documentsUploadName: {
    defaultMessage: 'Documents Upload',
    description: 'Form section name for Documents Upload',
    id: 'form.section.upload.documentsName'
  },
  documentsUploadTitle: {
    defaultMessage: 'Supporting documents',
    description: 'Form section title for Documents',
    id: 'form.section.upload.documentsTitle'
  },
  educationAttainmentISCED1: {
    defaultMessage: 'Primary',
    description: 'Option for form field: ISCED1 education',
    id: 'form.field.label.educationAttainmentISCED1'
  },
  educationAttainmentISCED2: {
    defaultMessage: 'Lower secondary',
    description: 'Option for form field: ISCED2 education',
    id: 'form.field.label.educationAttainmentISCED2'
  },
  educationAttainmentISCED3: {
    defaultMessage: 'Upper secondary',
    description: 'Option for form field: ISCED3 education',
    id: 'form.field.label.educationAttainmentISCED3'
  },
  educationAttainmentISCED4: {
    defaultMessage: 'Post secondary',
    description: 'Option for form field: ISCED4 education',
    id: 'form.field.label.educationAttainmentISCED4'
  },
  educationAttainmentISCED5: {
    defaultMessage: 'First stage tertiary',
    description: 'Option for form field: ISCED5 education',
    id: 'form.field.label.educationAttainmentISCED5'
  },
  educationAttainmentISCED6: {
    defaultMessage: 'Second stage tertiary',
    description: 'Option for form field: ISCED6 education',
    id: 'form.field.label.educationAttainmentISCED6'
  },
  educationAttainmentNone: {
    defaultMessage: 'No schooling',
    description: 'Option for form field: no education',
    id: 'form.field.label.educationAttainmentNone'
  },
  educationAttainmentNotStated: {
    defaultMessage: 'Not stated',
    description: 'Option for form field: not stated education',
    id: 'form.field.label.educationAttainmentNotStated'
  },
  enterResponse: {
    defaultMessage: 'Enter a response to your chosen security question',
    description: 'Label to input an answer to a security question',
    id: 'user.form.securityquestion.enterResponse'
  },
  familyName: {
    defaultMessage: 'Family name',
    description: 'Label for family name text input',
    id: 'form.field.label.print.otherPersonFamilyName'
  },
  father: {
    defaultMessage: 'Father',
    description: 'Label for option Father',
    id: 'form.field.label.applicantRelation.father'
  },
  fatherDateOfBirth: {
    defaultMessage: 'Date of birth',
    description: 'Label for form field: Date of birth',
    id: 'form.field.label.fatherDateOfBirth'
  },
  fatherEducationAttainment: {
    defaultMessage: "Father's level of formal education attained",
    description: 'Label for form field: Father education',
    id: 'form.field.label.fatherEducationAttainment'
  },
  fatherFamilyName: {
    defaultMessage: 'Last Name(s) in Bengali',
    description: 'Label for form field: Family name',
    id: 'form.field.label.fatherFamilyName'
  },
  fatherFamilyNameEng: {
    defaultMessage: 'Last Name(s) in English',
    description: 'Label for form field: Family name in english',
    id: 'form.field.label.fatherFamilyNameEng'
  },
  fatherFirstNames: {
    defaultMessage: 'First Name(s) in Bengali',
    description: 'Label for form field: First name',
    id: 'form.field.label.fatherFirstNames'
  },
  fatherFirstNamesEng: {
    defaultMessage: 'First Name(s) in English',
    description: 'Label for form field: First names in english',
    id: 'form.field.label.fatherFirstNamesEng'
  },
  fatherName: {
    defaultMessage: 'Father',
    description: 'Form section name for Father',
    id: 'form.section.father.name'
  },
  fathersDetailsExist: {
    defaultMessage: "Do you have the father's details?",
    description: "Question to ask the user if they have the father's details",
    id: 'form.field.label.fathersDetailsExist'
  },
  fatherTitle: {
    defaultMessage: "Father's details",
    description: 'Form section title for Father',
    id: 'form.section.father.title'
  },
  fetchDeceasedDetails: {
    defaultMessage: "Retrieve Deceased's Details",
    description: 'Label for loader button',
    id: 'form.field.label.fetchDeceasedDetails'
  },
  fetchFatherDetails: {
    defaultMessage: "Retrieve Father's Details",
    description: 'Label for loader button',
    id: 'form.field.label.fetchFatherDetails'
  },
  fetchIdentifierModalErrorTitle: {
    defaultMessage: 'Invalid Id',
    description: 'Label for fetch modal error title',
    id: 'form.field.label.fetchIdentifierModalErrorTitle'
  },
  fetchIdentifierModalSuccessTitle: {
    defaultMessage: 'ID valid',
    description: 'Label for fetch modal success title',
    id: 'form.field.label.fetchIdentifierModalSuccessTitle'
  },
  fetchIdentifierModalTitle: {
    defaultMessage: 'Checking',
    description: 'Label for fetch modal title',
    id: 'form.field.label.fetchIdentifierModalTitle'
  },
  fetchInformantDetails: {
    defaultMessage: "Retrieve Informant's Details",
    description: 'Label for loader button',
    id: 'form.field.label.fetchInformantDetails'
  },
  fetchMotherDetails: {
    defaultMessage: "Retrieve Mother's Details",
    description: 'Label for loader button',
    id: 'form.field.label.fetchMotherDetails'
  },
  fetchPersonByNIDModalErrorText: {
    defaultMessage: 'No person found for provided NID',
    description: 'Label for fetch modal error title',
    id: 'form.field.label.fetchPersonByNIDModalErrorText'
  },
  fetchPersonByNIDModalInfo: {
    defaultMessage: 'National ID',
    description: 'Label for loader button',
    id: 'form.field.label.fetchPersonByNIDModalInfo'
  },
  fetchRegistrationModalErrorText: {
    defaultMessage: 'No registration found for provided BRN',
    description: 'Label for fetch modal error title',
    id: 'form.field.label.fetchRegistrationModalErrorText'
  },
  fetchRegistrationModalInfo: {
    defaultMessage: 'Birth Registration Number',
    description: 'Label for loader button',
    id: 'form.field.label.fetchRegistrationModalInfo'
  },
  firstNameBn: {
    defaultMessage: 'Bengali first name',
    description: 'Bengali first name',
    id: 'form.field.label.firstNameBN'
  },
  firstNameEn: {
    defaultMessage: 'English first name',
    description: 'English first name',
    id: 'form.field.label.firstNameEN'
  },
  givenNames: {
    defaultMessage: 'Given name',
    description: 'Label for given name text input',
    id: 'form.field.label.print.otherPersonGivenNames'
  },
  healthInstitution: {
    defaultMessage: 'Health Institution',
    description: 'Select item for Health Institution',
    id: 'form.field.label.healthInstitution'
  },
  hospital: {
    defaultMessage: 'Hospital',
    description: 'Select item for hospital',
    id: 'form.field.label.hospital'
  },
  iD: {
    defaultMessage: 'ID Number',
    description: 'Label for form field: ID Number',
    id: 'form.field.label.iD'
  },
  iDType: {
    defaultMessage: 'Type of ID',
    description: 'Label for form field: Type of ID',
    id: 'form.field.label.iDType'
  },
  iDTypeAlienNumber: {
    defaultMessage: 'Alien Number',
    description: 'Option for form field: Type of ID',
    id: 'form.field.label.iDTypeAlienNumber'
  },
  iDTypeBRN: {
    defaultMessage: 'Birth Registration Number',
    description: 'Option for form field: Type of ID',
    id: 'form.field.label.iDTypeBRN'
  },
  iDTypeDrivingLicense: {
    defaultMessage: 'Drivers License',
    description: 'Option for form field: Type of ID',
    id: 'form.field.label.iDTypeDrivingLicense'
  },
  iDTypeDRN: {
    defaultMessage: 'Death Registration Number',
    description: 'Option for form field: Type of ID',
    id: 'form.field.label.iDTypeDRN'
  },
  iDTypeNationalID: {
    defaultMessage: 'National ID',
    description: 'Option for form field: Type of ID',
    id: 'form.field.label.iDTypeNationalID'
  },
  iDTypeNoId: {
    defaultMessage: 'No ID available',
    description: 'Option for form field: Type of ID',
    id: 'form.field.label.iDTypeNoID'
  },
  iDTypeOther: {
    defaultMessage: 'Other',
    description: 'Option for form field: Type of ID',
    id: 'form.field.label.iDTypeOther'
  },
  iDTypeOtherLabel: {
    defaultMessage: 'Other type of ID',
    description: 'Label for form field: Other type of ID',
    id: 'form.field.label.iDTypeOtherLabel'
  },
  iDTypePassport: {
    defaultMessage: 'Passport',
    description: 'Option for form field: Type of ID',
    id: 'form.field.label.iDTypePassport'
  },
  iDTypeRefugeeNumber: {
    defaultMessage: 'Refugee Number',
    description: 'Option for form field: Type of ID',
    id: 'form.field.label.iDTypeRefugeeNumber'
  },
  informantAttestation: {
    defaultMessage: 'Attestation of the informant, or',
    description: 'Attested document of the informant',
    id: 'form.section.documents.list.informantAttestation'
  },
  lastNameBn: {
    defaultMessage: 'Bengali last name',
    description: 'Bengali last name',
    id: 'form.field.label.lastNameBN'
  },
  lastNameEn: {
    defaultMessage: 'English last name',
    description: 'English last name',
    id: 'form.field.label.lastNameEN'
  },
  manner: {
    defaultMessage: 'What was the manner of death?',
    description: 'Label for form field: Manner of death',
    id: 'form.field.label.mannerOfDeath'
  },
  mannerAccident: {
    defaultMessage: 'Accident',
    description: 'Option for form field: Manner of death',
    id: 'form.field.label.mannerOfDeathAccident'
  },
  mannerHomicide: {
    defaultMessage: 'Homicide',
    description: 'Option for form field: Manner of death',
    id: 'form.field.label.mannerOfDeathHomicide'
  },
  mannerNatural: {
    defaultMessage: 'Natural causes',
    description: 'Option for form field: Manner of death',
    id: 'form.field.label.mannerOfDeathNatural'
  },
  mannerSuicide: {
    defaultMessage: 'Suicide',
    description: 'Option for form field: Manner of death',
    id: 'form.field.label.mannerOfDeathSuicide'
  },
  mannerUndetermined: {
    defaultMessage: 'Manner undetermined',
    description: 'Option for form field: Manner of death',
    id: 'form.field.label.mannerOfDeathUndetermined'
  },
  maritalStatus: {
    defaultMessage: 'Marital status',
    description: 'Label for form field: Marital status',
    id: 'form.field.label.maritalStatus'
  },
  maritalStatusDivorced: {
    defaultMessage: 'Divorced',
    description: 'Option for form field: Marital status',
    id: 'form.field.label.maritalStatusDivorced'
  },
  maritalStatusMarried: {
    defaultMessage: 'Married',
    description: 'Option for form field: Marital status',
    id: 'form.field.label.maritalStatusMarried'
  },
  maritalStatusNotStated: {
    defaultMessage: 'Not stated',
    description: 'Option for form field: Marital status',
    id: 'form.field.label.maritalStatusNotStated'
  },
  maritalStatusSingle: {
    defaultMessage: 'Unmarried',
    description: 'Option for form field: Marital status',
    id: 'form.field.label.maritalStatusSingle'
  },
  maritalStatusWidowed: {
    defaultMessage: 'Widowed',
    description: 'Option for form field: Marital status',
    id: 'form.field.label.maritalStatusWidowed'
  },
  medicallyCertified: {
    defaultMessage: 'Medically Certified Cause of Death',
    description: 'Option for form field: Method of Cause of Death',
    id: 'form.field.label.medicallyCertified'
  },
  methodOfCauseOfDeath: {
    defaultMessage: 'Method of Cause of Death',
    description: 'Label for form field: Method of Cause of Death',
    id: 'form.field.label.methodOfCauseOfDeath'
  },
  mother: {
    defaultMessage: 'Mother',
    description: 'Label for option Mother',
    id: 'form.field.label.applicantRelation.mother'
  },
  motherDateOfBirth: {
    defaultMessage: 'Date of birth',
    description: 'Label for form field: Date of birth',
    id: 'form.field.label.motherDateOfBirth'
  },
  motherEducationAttainment: {
    defaultMessage: "Mother's level of formal education attained",
    description: 'Label for form field: Mother education',
    id: 'form.field.label.motherEducationAttainment'
  },
  motherFamilyName: {
    defaultMessage: 'Last Name(s) in Bengali',
    description: 'Label for form field: Family name',
    id: 'form.field.label.motherFamilyName'
  },
  motherFamilyNameEng: {
    defaultMessage: 'Last Name(s) in English',
    description: 'Label for form field: Family name in english',
    id: 'form.field.label.motherFamilyNameEng'
  },
  motherFirstNames: {
    defaultMessage: 'First Name(s) in Bengali',
    description: 'Label for form field: First names',
    id: 'form.field.label.motherFirstNames'
  },
  motherFirstNamesEng: {
    defaultMessage: 'First Name(s) in English',
    description: 'Label for form field: First names in english',
    id: 'form.field.label.motherFirstNamesEng'
  },
  motherName: {
    defaultMessage: 'Mother',
    description: 'Form section name for Mother',
    id: 'form.section.mother.name'
  },
  motherTitle: {
    defaultMessage: "Mother's details",
    description: 'Form section title for Mother',
    id: 'form.section.mother.title'
  },
  multipleBirth: {
    defaultMessage: 'Order of birth (number)',
    description: 'Label for form field: Order of birth',
    id: 'form.field.label.multipleBirth'
  },
  nationality: {
    defaultMessage: 'Nationality',
    description: 'Label for form field: Nationality',
    id: 'form.field.label.deceased.nationality'
  },
  nationalityBangladesh: {
    defaultMessage: 'Bangladesh',
    description: 'Option for form field: Nationality',
    id: 'form.field.label.father.nationalityBangladesh'
  },
  NID: {
    defaultMessage: 'NID',
    description: 'National ID',
    id: 'form.field.label.NID'
  },
  officeLocationId: {
    defaultMessage: 'Id: {locationId}',
    description: 'The location Id column',
    id: 'form.field.SearchField.officeLocationId'
  },
  optionalLabel: {
    defaultMessage: 'Optional',
    description: 'Optional label',
    id: 'form.field.label.optionalLabel'
  },
  otherDocuments: {
    defaultMessage:
      'Attested copy(s) of the document as prescribed by the Registrar',
    description: 'Attested copy(s) of the document',
    id: 'form.section.documents.list.otherDocuments'
  },
  otherHealthInstitution: {
    defaultMessage: 'Other Health Institution',
    description: 'Select item for Other Health Institution',
    id: 'form.field.label.otherHealthInstitution'
  },
  otherInstitution: {
    defaultMessage: 'Other Institution',
    description: 'Select item for Other Institution',
    id: 'form.field.label.otherInstitution'
  },
  otherOption: {
    defaultMessage: 'Other',
    description: 'Other option for select',
    id: 'form.field.label.otherOption'
  },
  paragraph: {
    defaultMessage:
      'For birth regiatration of children below 5 years old, one of the documents listed below is required:',
    description: 'Documents Paragraph text',
    id: 'form.section.documents.birth.requirements'
  },
  paragraph45daysTo5Years: {
    defaultMessage:
      'For birth regiatration of children below 5 years old, one of the documents listed below is required:',
    description: 'Documents Paragraph text',
    id: 'form.section.documents.paragraph45daysTo5Years'
  },
  paragraphAbove5Years: {
    defaultMessage:
      'For birth regiatration of children below 5 years old, one of the documents listed below is required:',
    description: 'Documents Paragraph text',
    id: 'form.section.documents.paragraphAbove5Years'
  },
  permanentAddress: {
    defaultMessage: 'What was their permanent address?',
    description: 'Title for the permanent address fields',
    id: 'form.field.label.permanentAddress'
  },
  permanentAddressSameAsCurrent: {
    defaultMessage:
      'Is applicant’s permanent address the same as their current address?',
    description:
      'Title for the radio button to select that the applicants current address is the same as their permanent address',
    id: 'form.field.label.applicantsCurrentAddressSameAsPermanent'
  },
  permanentAddressSameAsMother: {
    defaultMessage: "Is his permanent address the same as the mother's?",
    description:
      "Title for the radio button to select that the father's permanent address is the same as the mother's address",
    id: 'form.field.label.permanentAddressSameAsMother'
  },
  phoneNumber: {
    defaultMessage: 'Phone number',
    description: 'Input label for phone input',
    id: 'form.field.label.phoneNumber'
  },
  phoneVerificationWarning: {
    defaultMessage:
      'Check with the applicant that the mobile phone number you have entered is correct',
    description: 'Warning message to verify applicant phone number ',
    id: 'form.field.label.application.phoneVerificationWarning'
  },
  placeOfBirth: {
    defaultMessage: 'Place of delivery',
    description: 'Label for form field: Place of delivery',
    id: 'form.field.label.placeOfBirth'
  },
  postCode: {
    defaultMessage: 'Postcode',
    description: 'Title for the postcode field',
    id: 'form.field.label.postCode'
  },
  presentBoth: {
    defaultMessage: 'Both Parents',
    description: 'Label for "Both Parents" select option',
    id: 'form.field.label.application.whoIsPresent.both'
  },
  presentFather: {
    defaultMessage: 'Father',
    description: 'Label for "Father" select option',
    id: 'form.field.label.application.whoIsPresent.father'
  },
  presentMother: {
    defaultMessage: 'Mother',
    description: 'Label for "Mother" select option',
    id: 'form.field.label.application.whoIsPresent.mother'
  },
  presentOther: {
    defaultMessage: 'Other',
    description: 'Label for "Other" select option',
    id: 'form.field.label.application.whoIsPresent.other'
  },
  privateHome: {
    defaultMessage: 'Private Home',
    description: 'Select item for Private Home',
    id: 'form.field.label.privateHome'
  },
  prompt: {
    defaultMessage:
      'Because there are no details of this person on record, we need to capture their details:',
    description:
      'Labal for prompt in case of other person collects certificate',
    id: 'form.field.label.print.otherPersonPrompt'
  },
  proofOfBirthPlaceAndDate: {
    defaultMessage: 'Proof of Place and Date of Birth of Child',
    description: 'Label for list item Child Birth Proof',
    id: 'form.field.label.proofOfBirthPlaceAndDate'
  },
  proofOfDocCertificateOfChild: {
    defaultMessage:
      "Certificate from doctor to prove child's age OR School certificate",
    description: 'Label for list item Doctor Certificate',
    id: 'form.field.label.proofOfDocCertificateOfChild'
  },
  proofOfEPICardOfChild: {
    defaultMessage: 'EPI Card of Child',
    description: 'Label for list item EPI Card of Child',
    id: 'form.field.label.proofOfEPICardOfChild'
  },
  proofOfFathersID: {
    defaultMessage: "Proof of Father's ID",
    description: 'Label for list item Father ID Proof',
    id: 'form.field.label.proofOfFathersID'
  },
  proofOfMothersID: {
    defaultMessage: "Proof of Mother's ID",
    description: 'Label for list item Mother ID Proof',
    id: 'form.field.label.proofOfMothersID'
  },
  proofOfParentPermanentAddress: {
    defaultMessage: 'Proof of Permanent Address of Parent',
    description: 'Label for list item Parent Permanent Address Proof',
    id: 'form.field.label.proofOfParentPermanentAddress'
  },
  registrationName: {
    defaultMessage: 'Registration',
    description: 'Form section name for Registration',
    id: 'form.section.application.name'
  },
  registrationOffice: {
    defaultMessage: 'Registration Office',
    description: 'Registration office',
    id: 'form.field.label.registrationOffice'
  },
  registrationPhoneLabel: {
    defaultMessage: 'Phone number',
    description: 'Input label for phone input',
    id: 'form.field.label.application.phone'
  },
  registrationTitle: {
    defaultMessage: 'Registration',
    description: 'Form section title for Registration',
    id: 'form.section.application.title'
  },
  relationExtendedFamily: {
    defaultMessage: 'Extended Family',
    description: 'Label for option Extended Family',
    id: 'form.field.label.applicantRelation.extendedFamily'
  },
  relationOther: {
    defaultMessage: 'Other (Specify)',
    description: 'Label for option Other',
    id: 'form.field.label.applicantRelation.other'
  },
  relationshipPlaceHolder: {
    defaultMessage: 'eg. Grandmother',
    description: 'Relationship place holder',
    id: 'form.field.label.relationshipPlaceHolder'
  },
  searchFieldModalTitle: {
    id: 'form.field.SearchField.modalTitle',
    defaultMessage: `{fieldName, select, registrationOffice {Assigned Register Office}}`,
    description: 'Modal title'
  },
  searchFieldPlaceHolderText: {
    defaultMessage: 'Search',
    description: 'Place holder text ',
    id: 'form.field.SearchField.placeHolderText'
  },
  securityQuestionLabel: {
    defaultMessage: 'Security question {count}',
    description: 'Label to describe number of security questions entered',
    id: 'user.form.securityquestion.securityQuestionLabel'
  },
  select: {
    defaultMessage: 'Select',
    description: 'Placeholder text for a select',
    id: 'form.field.select.placeholder'
  },
  selectOne: {
    defaultMessage: 'Please select an option',
    description: 'Generic label for select on option',
    id: 'form.field.label.selectOne'
  },
  selectSecurityQuestion: {
    defaultMessage: 'Select a security question',
    description: 'Label to select a security question',
    id: 'user.form.securityquestion.selectSecurityQuestion'
  },
  self: {
    defaultMessage: 'Self',
    description: 'The title that appears when selecting self as informant',
    id: 'form.field.label.self'
  },
  signedAffidavitConfirmation: {
    defaultMessage: 'Do they have a signed affidavit?',
    description: 'Label for signed affidavit confirmation radio group',
    id: 'form.field.label.print.signedAffidavit'
  },
  someoneElse: {
    defaultMessage: 'Someone else',
    description: 'Other Label',
    id: 'form.field.label.someoneElse'
  },
  son: {
    defaultMessage: 'Son',
    description: 'Label for option Son',
    id: 'form.field.label.applicantRelation.son'
  },
  spouse: {
    defaultMessage: 'Spouse',
    description: 'Label for option Spouse',
    id: 'form.field.label.applicantRelation.spouse'
  },
  state: {
    defaultMessage: 'Division',
    description: 'Title for the state select',
    id: 'form.field.label.state'
  },
  typeOfDocument: {
    defaultMessage: 'Choose type of document',
    description: 'Label for Select Form Field: Type of Document',
    id: 'form.field.label.typeOfDocument'
  },
  uploadDocForChild: {
    defaultMessage: 'Child',
    description: 'Label for radio option Child',
    id: 'form.field.label.uploadDocForChild'
  },
  uploadDocForFather: {
    defaultMessage: 'Father',
    description: 'Label for radio option Father',
    id: 'form.field.label.uploadDocForFather'
  },
  uploadDocForMother: {
    defaultMessage: 'Mother',
    description: 'Label for radio option Mother',
    id: 'form.field.label.uploadDocForMother'
  },
  uploadDocForOther: {
    defaultMessage: 'Other',
    description: 'Label for radio option Other',
    id: 'form.field.label.uploadDocForOther'
  },
  uploadDocForWhom: {
    defaultMessage: 'Whose suppoting document are you uploading?',
    description: 'Question to ask user, for whom, documents are being uploaded',
    id: 'form.field.label.uploadDocForWhom'
  },
  uploadedList: {
    defaultMessage: 'Uploaded:',
    description: 'label for uploaded list',
    id: 'form.field.label.imageUpload.uploadedList'
  },
  uploadImage: {
    defaultMessage: 'Upload a photo of the supporting document',
    description: 'Title for the upload image button',
    id: 'form.section.documents.uploadImage'
  },
  userDetails: {
    defaultMessage: 'User details',
    description: 'User details section',
    id: 'form.section.userDetails'
  },
  userDevice: {
    defaultMessage: 'Device',
    description: 'User device',
    id: 'form.field.label.userDevice'
  },
  userFormReviewTitle: {
    defaultMessage: 'Please review the new users details',
    description: 'The title of the review page of the user form',
    id: 'form.section.user.preview.title'
  },
  userFormSecurityQuestionsDescription: {
    defaultMessage:
      'From the drop down lists below, select questions that can be used later to confirm your identity should you forget your password.',
    description: 'Description for the security questions form',
    id: 'user.form.securityquestion.description'
  },
  userFormSecurityQuestionsHeading: {
    defaultMessage: 'Set your security questions',
    description: 'Subtitle for the security questions form',
    id: 'user.form.securityquestion.heading'
  },
  userFormSecurityQuestionsTitle: {
    defaultMessage: 'Security questions',
    description: 'Title for the security questions form',
    id: 'user.form.securityquestion.title'
  },
  userFormTitle: {
    defaultMessage: 'Create new user',
    description: 'The title of user form',
    id: 'form.section.user.title'
  },
  verbalAutopsy: {
    defaultMessage: 'Verbal autopsy',
    description: 'Option for form field: Method of Cause of Death',
    id: 'form.field.label.verbalAutopsy'
  },
  warningNotVerified: {
    defaultMessage:
      'Please be aware that if you proceed you will be responsible for issuing a certificate without the necessary proof of ID from the collector.',
    description: 'Label for warning message when the collector is not verified',
    id: 'form.field.label.print.warningNotVerified'
  },
  weightAtBirth: {
    defaultMessage: 'Weight at birth',
    description: 'Label for form field: Weight at birth',
    id: 'form.field.label.weightAtBirth'
  },
  whatDocToUpload: {
    defaultMessage: 'Which document type are you uploading?',
    description:
      'Question to ask user, what type of documents are being uploaded',
    id: 'form.field.label.whatDocToUpload'
  },
  whoIsPresentLabel: {
    defaultMessage: 'Who is present for the registration',
    description: 'Input label for who is present input',
    id: 'form.field.label.application.whoIsPresent'
  },
  whoseContactDetailsLabel: {
    defaultMessage: 'Who is the contact person for this application?',
    description: 'Input label for contact details person',
    id: 'form.field.label.application.whoseContactDetails'
  }
}

export const formMessages: IFormMessages = defineMessages(messagesToDefine)
