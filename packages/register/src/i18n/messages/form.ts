import { defineMessages } from 'react-intl'

interface IFormMessages {
  uploadedList: ReactIntl.FormattedMessage.MessageDescriptor
  optionalLabel: ReactIntl.FormattedMessage.MessageDescriptor
  searchFieldModalTitle: ReactIntl.FormattedMessage.MessageDescriptor
  officeLocationId: ReactIntl.FormattedMessage.MessageDescriptor
  changeAssignedOffice: ReactIntl.FormattedMessage.MessageDescriptor
  country: ReactIntl.FormattedMessage.MessageDescriptor
  state: ReactIntl.FormattedMessage.MessageDescriptor
  district: ReactIntl.FormattedMessage.MessageDescriptor
  addressLine1: ReactIntl.FormattedMessage.MessageDescriptor
  addressLine2: ReactIntl.FormattedMessage.MessageDescriptor
  addressLine3: ReactIntl.FormattedMessage.MessageDescriptor
  addressLine3CityOption: ReactIntl.FormattedMessage.MessageDescriptor
  addressLine4: ReactIntl.FormattedMessage.MessageDescriptor
  postCode: ReactIntl.FormattedMessage.MessageDescriptor
  permanentAddress: ReactIntl.FormattedMessage.MessageDescriptor
  confirm: ReactIntl.FormattedMessage.MessageDescriptor
  deny: ReactIntl.FormattedMessage.MessageDescriptor
  addressSameAsMother: ReactIntl.FormattedMessage.MessageDescriptor
  permanentAddressSameAsMother: ReactIntl.FormattedMessage.MessageDescriptor
  currentAddressSameAsPermanent: ReactIntl.FormattedMessage.MessageDescriptor
  educationAttainmentNone: ReactIntl.FormattedMessage.MessageDescriptor
  educationAttainmentISCED1: ReactIntl.FormattedMessage.MessageDescriptor
  educationAttainmentISCED2: ReactIntl.FormattedMessage.MessageDescriptor
  educationAttainmentISCED3: ReactIntl.FormattedMessage.MessageDescriptor
  educationAttainmentISCED4: ReactIntl.FormattedMessage.MessageDescriptor
  educationAttainmentISCED5: ReactIntl.FormattedMessage.MessageDescriptor
  educationAttainmentISCED6: ReactIntl.FormattedMessage.MessageDescriptor
  educationAttainmentNotStated: ReactIntl.FormattedMessage.MessageDescriptor
  iDType: ReactIntl.FormattedMessage.MessageDescriptor
  iDTypePassport: ReactIntl.FormattedMessage.MessageDescriptor
  iDTypeNationalID: ReactIntl.FormattedMessage.MessageDescriptor
  iDTypeDrivingLicense: ReactIntl.FormattedMessage.MessageDescriptor
  iDTypeBRN: ReactIntl.FormattedMessage.MessageDescriptor
  iDTypeDRN: ReactIntl.FormattedMessage.MessageDescriptor
  iDTypeRefugeeNumber: ReactIntl.FormattedMessage.MessageDescriptor
  iDTypeAlienNumber: ReactIntl.FormattedMessage.MessageDescriptor
  iDTypeOther: ReactIntl.FormattedMessage.MessageDescriptor
  iDTypeNoId: ReactIntl.FormattedMessage.MessageDescriptor
  iDTypeOtherLabel: ReactIntl.FormattedMessage.MessageDescriptor
  iD: ReactIntl.FormattedMessage.MessageDescriptor
  searchFieldPlaceHolderText: ReactIntl.FormattedMessage.MessageDescriptor
  otherOption: ReactIntl.FormattedMessage.MessageDescriptor
  maritalStatus: ReactIntl.FormattedMessage.MessageDescriptor
  maritalStatusSingle: ReactIntl.FormattedMessage.MessageDescriptor
  maritalStatusMarried: ReactIntl.FormattedMessage.MessageDescriptor
  maritalStatusDivorced: ReactIntl.FormattedMessage.MessageDescriptor
  maritalStatusNotStated: ReactIntl.FormattedMessage.MessageDescriptor
  maritalStatusWidowed: ReactIntl.FormattedMessage.MessageDescriptor
  dateOfMarriage: ReactIntl.FormattedMessage.MessageDescriptor
  confirmMotherDetails: ReactIntl.FormattedMessage.MessageDescriptor
  givenNames: ReactIntl.FormattedMessage.MessageDescriptor
  familyName: ReactIntl.FormattedMessage.MessageDescriptor
  signedAffidavitConfirmation: ReactIntl.FormattedMessage.MessageDescriptor
  documentNumber: ReactIntl.FormattedMessage.MessageDescriptor
  warningNotVerified: ReactIntl.FormattedMessage.MessageDescriptor
  prompt: ReactIntl.FormattedMessage.MessageDescriptor
  attendantAtBirth: ReactIntl.FormattedMessage.MessageDescriptor
  attendantAtBirthLayperson: ReactIntl.FormattedMessage.MessageDescriptor
  attendantAtBirthMidwife: ReactIntl.FormattedMessage.MessageDescriptor
  attendantAtBirthNone: ReactIntl.FormattedMessage.MessageDescriptor
  attendantAtBirthNurse: ReactIntl.FormattedMessage.MessageDescriptor
  attendantAtBirthOther: ReactIntl.FormattedMessage.MessageDescriptor
  attendantAtBirthOtherParamedicalPersonnel: ReactIntl.FormattedMessage.MessageDescriptor
  attendantAtBirthPhysician: ReactIntl.FormattedMessage.MessageDescriptor
  birthLocation: ReactIntl.FormattedMessage.MessageDescriptor
  birthType: ReactIntl.FormattedMessage.MessageDescriptor
  birthTypeHigherMultipleDelivery: ReactIntl.FormattedMessage.MessageDescriptor
  birthTypeQuadruplet: ReactIntl.FormattedMessage.MessageDescriptor
  birthTypeSingle: ReactIntl.FormattedMessage.MessageDescriptor
  birthTypeTriplet: ReactIntl.FormattedMessage.MessageDescriptor
  birthTypeTwin: ReactIntl.FormattedMessage.MessageDescriptor
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
  deliveryAddress: ReactIntl.FormattedMessage.MessageDescriptor
  deliveryInstitution: ReactIntl.FormattedMessage.MessageDescriptor
  hospital: ReactIntl.FormattedMessage.MessageDescriptor
  multipleBirth: ReactIntl.FormattedMessage.MessageDescriptor
  otherInstitution: ReactIntl.FormattedMessage.MessageDescriptor
  placeOfBirth: ReactIntl.FormattedMessage.MessageDescriptor
  privateHome: ReactIntl.FormattedMessage.MessageDescriptor
  select: ReactIntl.FormattedMessage.MessageDescriptor
  otherHealthInstitution: ReactIntl.FormattedMessage.MessageDescriptor
  weightAtBirth: ReactIntl.FormattedMessage.MessageDescriptor
  documentsName: ReactIntl.FormattedMessage.MessageDescriptor
  documentsTitle: ReactIntl.FormattedMessage.MessageDescriptor
  uploadImage: ReactIntl.FormattedMessage.MessageDescriptor
  paragraph: ReactIntl.FormattedMessage.MessageDescriptor
  informantAttestation: ReactIntl.FormattedMessage.MessageDescriptor
  attestedVaccination: ReactIntl.FormattedMessage.MessageDescriptor
  attestedBirthRecord: ReactIntl.FormattedMessage.MessageDescriptor
  certification: ReactIntl.FormattedMessage.MessageDescriptor
  otherDocuments: ReactIntl.FormattedMessage.MessageDescriptor
  documentsUploadName: ReactIntl.FormattedMessage.MessageDescriptor
  documentsUploadTitle: ReactIntl.FormattedMessage.MessageDescriptor
  uploadDocForWhom: ReactIntl.FormattedMessage.MessageDescriptor
  uploadDocForChild: ReactIntl.FormattedMessage.MessageDescriptor
  uploadDocForMother: ReactIntl.FormattedMessage.MessageDescriptor
  uploadDocForFather: ReactIntl.FormattedMessage.MessageDescriptor
  uploadDocForOther: ReactIntl.FormattedMessage.MessageDescriptor
  whatDocToUpload: ReactIntl.FormattedMessage.MessageDescriptor
  docTypeBR: ReactIntl.FormattedMessage.MessageDescriptor
  docTypeNIDFront: ReactIntl.FormattedMessage.MessageDescriptor
  docTypeNIDBack: ReactIntl.FormattedMessage.MessageDescriptor
  docTypePassport: ReactIntl.FormattedMessage.MessageDescriptor
  docTypeSC: ReactIntl.FormattedMessage.MessageDescriptor
  docTypeOther: ReactIntl.FormattedMessage.MessageDescriptor
  docTypeChildBirthProof: ReactIntl.FormattedMessage.MessageDescriptor
  docTypeEPICard: ReactIntl.FormattedMessage.MessageDescriptor
  docTypeDoctorCertificate: ReactIntl.FormattedMessage.MessageDescriptor
  proofOfMothersID: ReactIntl.FormattedMessage.MessageDescriptor
  proofOfFathersID: ReactIntl.FormattedMessage.MessageDescriptor
  proofOfBirthPlaceAndDate: ReactIntl.FormattedMessage.MessageDescriptor
  proofOfEPICardOfChild: ReactIntl.FormattedMessage.MessageDescriptor
  proofOfDocCertificateOfChild: ReactIntl.FormattedMessage.MessageDescriptor
  fatherName: ReactIntl.FormattedMessage.MessageDescriptor
  fatherTitle: ReactIntl.FormattedMessage.MessageDescriptor
  fathersDetailsExist: ReactIntl.FormattedMessage.MessageDescriptor
  nationality: ReactIntl.FormattedMessage.MessageDescriptor
  nationalityBangladesh: ReactIntl.FormattedMessage.MessageDescriptor
  fatherFirstNames: ReactIntl.FormattedMessage.MessageDescriptor
  fatherFamilyName: ReactIntl.FormattedMessage.MessageDescriptor
  fatherFirstNamesEng: ReactIntl.FormattedMessage.MessageDescriptor
  fatherFamilyNameEng: ReactIntl.FormattedMessage.MessageDescriptor
  defaultLabel: ReactIntl.FormattedMessage.MessageDescriptor
  fatherDateOfBirth: ReactIntl.FormattedMessage.MessageDescriptor
  fatherEducationAttainment: ReactIntl.FormattedMessage.MessageDescriptor
  currentAddress: ReactIntl.FormattedMessage.MessageDescriptor
  fetchFatherDetails: ReactIntl.FormattedMessage.MessageDescriptor
  proofOfParentPermanentAddress: ReactIntl.FormattedMessage.MessageDescriptor
  fetchIdentifierModalTitle: ReactIntl.FormattedMessage.MessageDescriptor
  fetchIdentifierModalSuccessTitle: ReactIntl.FormattedMessage.MessageDescriptor
  fetchIdentifierModalErrorTitle: ReactIntl.FormattedMessage.MessageDescriptor
  fetchRegistrationModalErrorText: ReactIntl.FormattedMessage.MessageDescriptor
  fetchPersonByNIDModalErrorText: ReactIntl.FormattedMessage.MessageDescriptor
  fetchRegistrationModalInfo: ReactIntl.FormattedMessage.MessageDescriptor
  motherName: ReactIntl.FormattedMessage.MessageDescriptor
  motherTitle: ReactIntl.FormattedMessage.MessageDescriptor
  motherFirstNames: ReactIntl.FormattedMessage.MessageDescriptor
  motherFamilyName: ReactIntl.FormattedMessage.MessageDescriptor
  fetchPersonByNIDModalInfo: ReactIntl.FormattedMessage.MessageDescriptor
  motherFirstNamesEng: ReactIntl.FormattedMessage.MessageDescriptor
  motherDateOfBirth: ReactIntl.FormattedMessage.MessageDescriptor
  motherFamilyNameEng: ReactIntl.FormattedMessage.MessageDescriptor
  motherEducationAttainment: ReactIntl.FormattedMessage.MessageDescriptor
  fetchMotherDetails: ReactIntl.FormattedMessage.MessageDescriptor
  registrationName: ReactIntl.FormattedMessage.MessageDescriptor
  registrationTitle: ReactIntl.FormattedMessage.MessageDescriptor
  whoIsPresentLabel: ReactIntl.FormattedMessage.MessageDescriptor
  presentBoth: ReactIntl.FormattedMessage.MessageDescriptor
  presentMother: ReactIntl.FormattedMessage.MessageDescriptor
  presentFather: ReactIntl.FormattedMessage.MessageDescriptor
  presentOther: ReactIntl.FormattedMessage.MessageDescriptor
  whoseContactDetailsLabel: ReactIntl.FormattedMessage.MessageDescriptor
  contactDetailsBoth: ReactIntl.FormattedMessage.MessageDescriptor
  contactDetailsFather: ReactIntl.FormattedMessage.MessageDescriptor
  contactDetailsMother: ReactIntl.FormattedMessage.MessageDescriptor
  registrationPhoneLabel: ReactIntl.FormattedMessage.MessageDescriptor
  phoneVerificationWarning: ReactIntl.FormattedMessage.MessageDescriptor
  commentsOrNotesLabel: ReactIntl.FormattedMessage.MessageDescriptor
  commentsOrNotesDescription: ReactIntl.FormattedMessage.MessageDescriptor
  applicantName: ReactIntl.FormattedMessage.MessageDescriptor
  applicantTitle: ReactIntl.FormattedMessage.MessageDescriptor
  applicantsIdType: ReactIntl.FormattedMessage.MessageDescriptor
  applicantsGivenNames: ReactIntl.FormattedMessage.MessageDescriptor
  applicantsFamilyName: ReactIntl.FormattedMessage.MessageDescriptor
  applicantsGivenNamesEng: ReactIntl.FormattedMessage.MessageDescriptor
  applicantsFamilyNameEng: ReactIntl.FormattedMessage.MessageDescriptor
  applicantsNationality: ReactIntl.FormattedMessage.MessageDescriptor
  applicantsDateOfBirth: ReactIntl.FormattedMessage.MessageDescriptor
  permanentAddressSameAsCurrent: ReactIntl.FormattedMessage.MessageDescriptor
  applicantsPhone: ReactIntl.FormattedMessage.MessageDescriptor
  fetchInformantDetails: ReactIntl.FormattedMessage.MessageDescriptor
  applicantsRelationWithDeceased: ReactIntl.FormattedMessage.MessageDescriptor
  relationFather: ReactIntl.FormattedMessage.MessageDescriptor
  relationMother: ReactIntl.FormattedMessage.MessageDescriptor
  relationSpouse: ReactIntl.FormattedMessage.MessageDescriptor
  relationSon: ReactIntl.FormattedMessage.MessageDescriptor
  relationDaughter: ReactIntl.FormattedMessage.MessageDescriptor
  relationExtendedFamily: ReactIntl.FormattedMessage.MessageDescriptor
  relationOther: ReactIntl.FormattedMessage.MessageDescriptor
  applicantOtherRelationship: ReactIntl.FormattedMessage.MessageDescriptor
  causeOfDeathName: ReactIntl.FormattedMessage.MessageDescriptor
  causeOfDeathTitle: ReactIntl.FormattedMessage.MessageDescriptor
  causeOfDeathNotice: ReactIntl.FormattedMessage.MessageDescriptor
  causeOfDeathEstablished: ReactIntl.FormattedMessage.MessageDescriptor
  methodOfCauseOfDeath: ReactIntl.FormattedMessage.MessageDescriptor
  causeOfDeathCode: ReactIntl.FormattedMessage.MessageDescriptor
  verbalAutopsy: ReactIntl.FormattedMessage.MessageDescriptor
  medicallyCertified: ReactIntl.FormattedMessage.MessageDescriptor
  deceasedName: ReactIntl.FormattedMessage.MessageDescriptor
  deceasedTitle: ReactIntl.FormattedMessage.MessageDescriptor
  deceasedIdType: ReactIntl.FormattedMessage.MessageDescriptor
  fetchDeceasedDetails: ReactIntl.FormattedMessage.MessageDescriptor
  deceasedGivenNames: ReactIntl.FormattedMessage.MessageDescriptor
  deceasedFamilyName: ReactIntl.FormattedMessage.MessageDescriptor
  deceasedGivenNamesEng: ReactIntl.FormattedMessage.MessageDescriptor
  deceasedFamilyNameEng: ReactIntl.FormattedMessage.MessageDescriptor
  deceasedSex: ReactIntl.FormattedMessage.MessageDescriptor
  deceasedSexMale: ReactIntl.FormattedMessage.MessageDescriptor
  deceasedSexFemale: ReactIntl.FormattedMessage.MessageDescriptor
  deceasedSexOther: ReactIntl.FormattedMessage.MessageDescriptor
  deceasedSexUnknown: ReactIntl.FormattedMessage.MessageDescriptor
  deceasedDateOfBirth: ReactIntl.FormattedMessage.MessageDescriptor
  deceasedCurrentAddressSameAsPermanent: ReactIntl.FormattedMessage.MessageDescriptor
  deceasedIDProof: ReactIntl.FormattedMessage.MessageDescriptor
  deceasedPermanentAddressProof: ReactIntl.FormattedMessage.MessageDescriptor
  deceasedDeathProof: ReactIntl.FormattedMessage.MessageDescriptor
  deceasedDoBProof: ReactIntl.FormattedMessage.MessageDescriptor
  applicantIDProof: ReactIntl.FormattedMessage.MessageDescriptor
  deceasedParagraph: ReactIntl.FormattedMessage.MessageDescriptor
  typeOfDocument: ReactIntl.FormattedMessage.MessageDescriptor
  docTypePostMortemReport: ReactIntl.FormattedMessage.MessageDescriptor
  docTypeHospitalDischargeCertificate: ReactIntl.FormattedMessage.MessageDescriptor
  docTypeLetterOfDeath: ReactIntl.FormattedMessage.MessageDescriptor
  docTypeDeathCertificate: ReactIntl.FormattedMessage.MessageDescriptor
  docTypeCopyOfBurialReceipt: ReactIntl.FormattedMessage.MessageDescriptor
  docTypeFuneralReceipt: ReactIntl.FormattedMessage.MessageDescriptor
  deathEventName: ReactIntl.FormattedMessage.MessageDescriptor
  deathEventTitle: ReactIntl.FormattedMessage.MessageDescriptor
  deathDate: ReactIntl.FormattedMessage.MessageDescriptor
  manner: ReactIntl.FormattedMessage.MessageDescriptor
  selectOne: ReactIntl.FormattedMessage.MessageDescriptor
  mannerNatural: ReactIntl.FormattedMessage.MessageDescriptor
  mannerAccident: ReactIntl.FormattedMessage.MessageDescriptor
  mannerSuicide: ReactIntl.FormattedMessage.MessageDescriptor
  mannerHomicide: ReactIntl.FormattedMessage.MessageDescriptor
  mannerUndetermined: ReactIntl.FormattedMessage.MessageDescriptor
  deathPlace: ReactIntl.FormattedMessage.MessageDescriptor
  deathAtFacility: ReactIntl.FormattedMessage.MessageDescriptor
  deathAtPrivateHome: ReactIntl.FormattedMessage.MessageDescriptor
  deathAtOtherLocation: ReactIntl.FormattedMessage.MessageDescriptor
  deathPlaceAddress: ReactIntl.FormattedMessage.MessageDescriptor
  deathPlaceAddressSameAsPermanent: ReactIntl.FormattedMessage.MessageDescriptor
  deathPlaceAddressSameAsCurrent: ReactIntl.FormattedMessage.MessageDescriptor
  deathPlaceAddressOther: ReactIntl.FormattedMessage.MessageDescriptor
  deathPlaceAddressType: ReactIntl.FormattedMessage.MessageDescriptor
  healthInstitution: ReactIntl.FormattedMessage.MessageDescriptor
}
const messagesToDefine: IFormMessages = {
  deathEventName: {
    id: 'form.section.deathEvent.name',
    defaultMessage: 'When did the death occur?',
    description: 'Form section name for Death Event'
  },
  deathEventTitle: {
    id: 'form.section.deathEvent.title',
    defaultMessage: 'When did the death occur?',
    description: 'Form section title for Death Event'
  },
  deathDate: {
    id: 'form.field.label.deathDate',
    defaultMessage:
      'Enter the date in the format day, month and year. For example 24 10 2020.',
    description: 'Label for form field: Date of occurrence'
  },
  manner: {
    id: 'form.field.label.mannerOfDeath',
    defaultMessage: 'What was the manner of death?',
    description: 'Label for form field: Manner of death'
  },
  selectOne: {
    id: 'form.field.label.selectOne',
    defaultMessage: 'Please select an option',
    description: 'Generic label for select on option'
  },
  mannerNatural: {
    id: 'form.field.label.mannerOfDeathNatural',
    defaultMessage: 'Natural causes',
    description: 'Option for form field: Manner of death'
  },
  mannerAccident: {
    id: 'form.field.label.mannerOfDeathAccident',
    defaultMessage: 'Accident',
    description: 'Option for form field: Manner of death'
  },
  mannerSuicide: {
    id: 'form.field.label.mannerOfDeathSuicide',
    defaultMessage: 'Suicide',
    description: 'Option for form field: Manner of death'
  },
  mannerHomicide: {
    id: 'form.field.label.mannerOfDeathHomicide',
    defaultMessage: 'Homicide',
    description: 'Option for form field: Manner of death'
  },
  mannerUndetermined: {
    id: 'form.field.label.mannerOfDeathUndetermined',
    defaultMessage: 'Manner undetermined',
    description: 'Option for form field: Manner of death'
  },
  deathPlace: {
    id: 'form.field.label.deathPlace',
    defaultMessage: 'Place of Occurrence of Death',
    description: 'Title for place of occurrence of death'
  },
  deathAtFacility: {
    id: 'form.field.label.deathAtFacility',
    defaultMessage: 'What hospital did the death occur at?',
    description: 'Label for form field: Hospital or Health Institution'
  },
  deathAtPrivateHome: {
    id: 'form.field.label.deathAtPrivateHome',
    defaultMessage: 'What is the address of the private home?',
    description: 'Label for form field: Private Home Address'
  },
  deathAtOtherLocation: {
    id: 'form.field.label.deathAtOtherLocation',
    defaultMessage: 'What is the other address did the death occur at?',
    description: 'Label for form field: Other Location Address'
  },
  deathPlaceAddress: {
    id: 'form.field.label.deathPlaceAddress',
    defaultMessage: 'Where did the death occur?',
    description: 'Label for form field: Place of occurrence of death'
  },
  deathPlaceAddressSameAsPermanent: {
    id: 'form.field.label.deathPlaceAddressSameAsPermanent',
    defaultMessage: 'Permanent address of the deceased',
    description: 'Option for form field: Place of occurrence of death'
  },
  deathPlaceAddressSameAsCurrent: {
    id: 'form.field.label.deathPlaceAddressSameAsCurrent',
    defaultMessage: 'Current address of the deceased',
    description: 'Option for form field: Place of occurrence of death'
  },
  deathPlaceAddressOther: {
    id: 'form.field.label.deathPlaceAddressOther',
    defaultMessage: 'Different Address',
    description: 'Option for form field: Place of occurrence of death'
  },
  deathPlaceAddressType: {
    id: 'form.field.label.deathPlaceAddressType',
    defaultMessage: 'Type of Place',
    description: 'Label for form field: Type of place of death occurrence'
  },
  otherHealthInstitution: {
    id: 'form.field.label.otherHealthInstitution',
    defaultMessage: 'Other Health Institution',
    description: 'Select item for Other Health Institution'
  },
  healthInstitution: {
    id: 'form.field.label.healthInstitution',
    defaultMessage: 'Health Institution',
    description: 'Select item for Health Institution'
  },
  privateHome: {
    id: 'form.field.label.privateHome',
    defaultMessage: 'Private Home',
    description: 'Select item for Private Home'
  },
  deceasedIDProof: {
    id: 'form.field.label.deceasedIDProof',
    defaultMessage: "Proof of Deceased's ID",
    description: 'Option for radio group field: Type of Document To Upload'
  },
  deceasedPermanentAddressProof: {
    id: 'form.field.label.deceasedPermanentAddressProof',
    defaultMessage: 'Proof of Permanent Address of Deceased',
    description: 'Option for radio group field: Type of Document To Upload'
  },
  deceasedDeathProof: {
    id: 'form.field.label.deceasedDeathProof',
    defaultMessage: 'Proof of Death of Deceased',
    description: 'Option for radio group field: Type of Document To Upload'
  },
  deceasedDoBProof: {
    id: 'form.field.label.deceasedDoBProof',
    defaultMessage: 'Proof of Date of Birth of Deceased',
    description: 'Option for radio group field: Type of Document To Upload'
  },
  applicantIDProof: {
    id: 'form.field.label.applicantIDProof',
    defaultMessage: "Proof of Applicant's ID",
    description: 'Option for radio group field: Type of Document To Upload'
  },
  deceasedParagraph: {
    id: 'form.field.label.deceasedDocumentParagraph',
    defaultMessage:
      'For this death registration, the following documents are required:',
    description: 'Documents Paragraph text'
  },
  typeOfDocument: {
    id: 'form.field.label.typeOfDocument',
    defaultMessage: 'Choose type of document',
    description: 'Label for Select Form Field: Type of Document'
  },
  docTypeBR: {
    id: 'form.field.label.docTypeBR',
    defaultMessage: 'Birth Registration',
    description: 'Label for select option Birth Registration'
  },
  docTypeNIDFront: {
    id: 'form.field.label.docTypeNIDFront',
    defaultMessage: 'National ID (front)',
    description: 'Label for select option radio option NID front'
  },
  docTypeNIDBack: {
    id: 'form.field.label.docTypeNIDBack',
    defaultMessage: 'National ID (back)',
    description: 'Label for select option radio option NID back'
  },
  docTypePostMortemReport: {
    id: 'form.field.label.docTypePostMortemReport',
    defaultMessage: 'Certified Post Mortem Report',
    description: 'Label for select option Post Mortem Report'
  },
  docTypeHospitalDischargeCertificate: {
    id: 'form.field.label.docTypeHospitalDischargeCertificate',
    defaultMessage: 'Hospital Discharge Certificate',
    description: 'Label for select option Hospital Discharge Certificate'
  },
  docTypeLetterOfDeath: {
    id: 'form.field.label.docTypeLetterOfDeath',
    defaultMessage: 'Attested Letter of Death',
    description: 'Label for select option Attested Letter of Death'
  },
  docTypeDeathCertificate: {
    id: 'form.field.label.docTypeDeathCertificate',
    defaultMessage: 'Attested Certificate of Death',
    description: 'Label for select option Attested Certificate of Death'
  },
  docTypeCopyOfBurialReceipt: {
    id: 'form.field.label.docTypeCopyOfBurialReceipt',
    defaultMessage: 'Certified Copy of Burial Receipt',
    description: 'Label for select option Certified Copy of Burial Receipt'
  },
  docTypeFuneralReceipt: {
    id: 'form.field.label.docTypeFuneralReceipt',
    defaultMessage: 'Certified Copy of Funeral Receipt',
    description: 'Label for select option Certified Copy of Funeral Receipt'
  },
  deceasedName: {
    id: 'form.section.deceased.name',
    defaultMessage: 'Deceased',
    description: 'Form section name for Deceased'
  },
  deceasedTitle: {
    id: 'form.section.deceased.title',
    defaultMessage: 'What are the deceased details?',
    description: 'Form section title for Deceased'
  },
  deceasedIdType: {
    id: 'form.field.label.deceasedIdType',
    defaultMessage: 'Type of ID',
    description: 'Label for form field: Existing ID'
  },
  fetchDeceasedDetails: {
    id: 'form.field.label.fetchDeceasedDetails',
    defaultMessage: "Retrieve Deceased's Details",
    description: 'Label for loader button'
  },
  fetchIdentifierModalTitle: {
    id: 'form.field.label.fetchIdentifierModalTitle',
    defaultMessage: 'Checking',
    description: 'Label for fetch modal title'
  },
  fetchIdentifierModalSuccessTitle: {
    id: 'form.field.label.fetchIdentifierModalSuccessTitle',
    defaultMessage: 'ID valid',
    description: 'Label for fetch modal success title'
  },
  fetchIdentifierModalErrorTitle: {
    id: 'form.field.label.fetchIdentifierModalErrorTitle',
    defaultMessage: 'Invalid Id',
    description: 'Label for fetch modal error title'
  },
  fetchRegistrationModalErrorText: {
    id: 'form.field.label.fetchRegistrationModalErrorText',
    defaultMessage: 'No registration found for provided BRN',
    description: 'Label for fetch modal error title'
  },
  fetchPersonByNIDModalErrorText: {
    id: 'form.field.label.fetchPersonByNIDModalErrorText',
    defaultMessage: 'No person found for provided NID',
    description: 'Label for fetch modal error title'
  },
  fetchRegistrationModalInfo: {
    id: 'form.field.label.fetchRegistrationModalInfo',
    defaultMessage: 'Birth Registration Number',
    description: 'Label for loader button'
  },
  fetchInformantDetails: {
    id: 'form.field.label.fetchInformantDetails',
    defaultMessage: "Retrieve Informant's Details",
    description: 'Label for loader button'
  },
  fetchPersonByNIDModalInfo: {
    id: 'form.field.label.fetchPersonByNIDModalInfo',
    defaultMessage: 'National ID',
    description: 'Label for loader button'
  },
  deceasedGivenNames: {
    id: 'form.field.label.deceasedGivenNames',
    defaultMessage: 'First Name(s) in Bengali',
    description: 'Label for form field: Given names'
  },
  deceasedFamilyName: {
    id: 'form.field.label.deceasedFamilyName',
    defaultMessage: 'Last Name(s) in Bengali',
    description: 'Label for form field: Family name'
  },
  deceasedGivenNamesEng: {
    id: 'form.field.label.deceasedGivenNamesEng',
    defaultMessage: 'First Name(s) in English',
    description: 'Label for form field: Given names in english'
  },
  deceasedFamilyNameEng: {
    id: 'form.field.label.deceasedFamilyNameEng',
    defaultMessage: 'Last Name(s) in English',
    description: 'Label for form field: Family name in english'
  },
  nationality: {
    id: 'form.field.label.deceased.nationality',
    defaultMessage: 'Nationality',
    description: 'Label for form field: Nationality'
  },
  deceasedSex: {
    id: 'form.field.label.deceasedSex',
    defaultMessage: 'Sex',
    description: 'Label for form field: Sex name'
  },
  deceasedSexMale: {
    id: 'form.field.label.deceasedSexMale',
    defaultMessage: 'Male',
    description: 'Option for form field: Sex name'
  },
  deceasedSexFemale: {
    id: 'form.field.label.deceasedSexFemale',
    defaultMessage: 'Female',
    description: 'Option for form field: Sex name'
  },
  deceasedSexOther: {
    id: 'form.field.label.deceasedSexOther',
    defaultMessage: 'Other',
    description: 'Option for form field: Sex name'
  },
  deceasedSexUnknown: {
    id: 'form.field.label.deceasedSexUnknown',
    defaultMessage: 'Unknown',
    description: 'Option for form field: Sex name'
  },
  deceasedDateOfBirth: {
    id: 'form.field.label.deceasedDateOfBirth',
    defaultMessage: 'Date of Birth',
    description: 'Label for form field: Date of birth'
  },
  deceasedCurrentAddressSameAsPermanent: {
    id: 'form.field.label.deceasedCurrentAddressSameAsPermanent',
    defaultMessage:
      'Is deceased’s current address the same as their permanent address?',
    description:
      'Title for the radio button to select that the deceased current address is the same as their permanent address'
  },
  currentAddress: {
    id: 'form.field.label.currentAddress',
    defaultMessage: 'Current Address',
    description: 'Title for the current address fields'
  },
  permanentAddress: {
    id: 'form.field.label.permanentAddress',
    defaultMessage: 'What was their permanent address?',
    description: 'Title for the permanent address fields'
  },
  causeOfDeathName: {
    id: 'form.section.causeOfDeath.name',
    defaultMessage: 'What is the official cause of death?',
    description: 'Form section name for Cause of Death'
  },
  causeOfDeathTitle: {
    id: 'form.section.causeOfDeath.title',
    defaultMessage: 'What is the official cause of death?',
    description: 'Form section title for Cause of Death'
  },
  causeOfDeathNotice: {
    id: 'form.section.causeOfDeathNotice',
    defaultMessage:
      'Official cause of death is not mandatory to submit the application. A cause of death can be added at a later date.',
    description: 'Form section notice for Cause of Death'
  },
  causeOfDeathEstablished: {
    id: 'form.field.label.causeOfDeathEstablished',
    defaultMessage: 'Has an official cause of death been established ?',
    description: 'Label for form field: Cause of Death Established'
  },
  methodOfCauseOfDeath: {
    id: 'form.field.label.methodOfCauseOfDeath',
    defaultMessage: 'Method of Cause of Death',
    description: 'Label for form field: Method of Cause of Death'
  },
  causeOfDeathCode: {
    id: 'form.field.label.causeOfDeathCode',
    defaultMessage: 'Cause of Death Code',
    description: 'Label for form field: Cause of Death Code'
  },
  verbalAutopsy: {
    id: 'form.field.label.verbalAutopsy',
    defaultMessage: 'Verbal autopsy',
    description: 'Option for form field: Method of Cause of Death'
  },
  medicallyCertified: {
    id: 'form.field.label.medicallyCertified',
    defaultMessage: 'Medically Certified Cause of Death',
    description: 'Option for form field: Method of Cause of Death'
  },
  applicantName: {
    id: 'form.section.applicant.name',
    defaultMessage: 'Applicant',
    description: 'Form section name for Applicant'
  },
  applicantTitle: {
    id: 'form.section.applicant.title',
    defaultMessage: "What are the applicant's details?",
    description: 'Form section title for applicants'
  },
  applicantsIdType: {
    id: 'form.field.label.applicantsIdType',
    defaultMessage: 'Type of ID',
    description: 'Label for form field: Existing ID'
  },
  applicantsGivenNames: {
    id: 'form.field.label.applicantsGivenNames',
    defaultMessage: 'First Name(s) in Bengali',
    description: 'Label for form field: Given names'
  },
  applicantsFamilyName: {
    id: 'form.field.label.applicantsFamilyName',
    defaultMessage: 'Last Name(s) in Bengali',
    description: 'Label for form field: Family name'
  },
  applicantsGivenNamesEng: {
    id: 'form.field.label.applicantsGivenNamesEng',
    defaultMessage: 'First Name(s) in English',
    description: 'Label for form field: Given names in english'
  },
  applicantsFamilyNameEng: {
    id: 'form.field.label.applicantsFamilyNameEng',
    defaultMessage: 'Last Name(s) in English',
    description: 'Label for form field: Family name in english'
  },
  applicantsNationality: {
    id: 'form.field.label.applicants.nationality',
    defaultMessage: 'Nationality',
    description: 'Label for form field: Nationality'
  },
  applicantsDateOfBirth: {
    id: 'form.field.label.applicantsDateOfBirth',
    defaultMessage: 'Date of Birth',
    description: 'Label for form field: Date of birth'
  },
  permanentAddressSameAsCurrent: {
    id: 'form.field.label.applicantsCurrentAddressSameAsPermanent',
    defaultMessage:
      'Is applicant’s permanent address the same as their current address?',
    description:
      'Title for the radio button to select that the applicants current address is the same as their permanent address'
  },
  applicantsPhone: {
    defaultMessage: 'Phone number',
    id: 'form.field.label.applicant.phone',
    description: 'Input label for phone input'
  },
  applicantsRelationWithDeceased: {
    id: 'form.field.label.applicantsRelationWithDeceased',
    defaultMessage: 'Relationship to Deceased',
    description: 'Label for Relationship to Deceased select'
  },
  relationFather: {
    id: 'form.field.label.applicantRelation.father',
    defaultMessage: 'Father',
    description: 'Label for option Father'
  },
  relationMother: {
    id: 'form.field.label.applicantRelation.mother',
    defaultMessage: 'Mother',
    description: 'Label for option Mother'
  },
  relationSpouse: {
    id: 'form.field.label.applicantRelation.spouse',
    defaultMessage: 'Spouse',
    description: 'Label for option Spouse'
  },
  relationSon: {
    id: 'form.field.label.applicantRelation.son',
    defaultMessage: 'Son',
    description: 'Label for option Son'
  },
  relationDaughter: {
    id: 'form.field.label.applicantRelation.daughter',
    defaultMessage: 'Daughter',
    description: 'Label for option Daughter'
  },
  relationExtendedFamily: {
    id: 'form.field.label.applicantRelation.extendedFamily',
    defaultMessage: 'Extended Family',
    description: 'Label for option Extended Family'
  },
  relationOther: {
    id: 'form.field.label.applicantRelation.other',
    defaultMessage: 'Other(Specify)',
    description: 'Label for option Other'
  },
  applicantOtherRelationship: {
    id: 'form.field.label.applicantOtherRelationship',
    defaultMessage: 'Other relation',
    description: 'Label for form field: Other relation'
  },
  registrationName: {
    id: 'form.section.application.name',
    defaultMessage: 'Registration',
    description: 'Form section name for Registration'
  },
  registrationTitle: {
    id: 'form.section.application.title',
    defaultMessage: 'Registration',
    description: 'Form section title for Registration'
  },
  whoIsPresentLabel: {
    defaultMessage: 'Who is present for the registration',
    id: 'form.field.label.application.whoIsPresent',
    description: 'Input label for who is present input'
  },
  presentBoth: {
    id: 'form.field.label.application.whoIsPresent.both',
    defaultMessage: 'Both Parents',
    description: 'Label for "Both Parents" select option'
  },
  presentMother: {
    id: 'form.field.label.application.whoIsPresent.mother',
    defaultMessage: 'Mother',
    description: 'Label for "Mother" select option'
  },
  presentFather: {
    id: 'form.field.label.application.whoIsPresent.father',
    defaultMessage: 'Father',
    description: 'Label for "Father" select option'
  },
  presentOther: {
    id: 'form.field.label.application.whoIsPresent.other',
    defaultMessage: 'Other',
    description: 'Label for "Other" select option'
  },
  whoseContactDetailsLabel: {
    defaultMessage: 'Who is the contact person for this application?',
    id: 'form.field.label.application.whoseContactDetails',
    description: 'Input label for contact details person'
  },
  contactDetailsBoth: {
    id: 'form.field.label.application.whoseContactDetails.both',
    defaultMessage: 'Both Parents',
    description: 'Label for "Both Parents" select option'
  },
  contactDetailsMother: {
    id: 'form.field.label.application.whoseContactDetails.mother',
    defaultMessage: 'Mother',
    description: 'Label for "Mother" select option'
  },
  contactDetailsFather: {
    id: 'form.field.label.application.whoseContactDetails.father',
    defaultMessage: 'Father',
    description: 'Label for "Father" select option'
  },
  registrationPhoneLabel: {
    defaultMessage: 'Phone number',
    id: 'form.field.label.application.phone',
    description: 'Input label for phone input'
  },
  phoneVerificationWarning: {
    id: 'form.field.label.application.phoneVerificationWarning',
    defaultMessage:
      'Check with the applicant that the mobile phone number you have entered is correct',
    description: 'Warning message to verify applicant phone number '
  },
  commentsOrNotesLabel: {
    defaultMessage: 'Comments or notes',
    id: 'form.field.label.application.commentsOrNotes',
    description: 'Input label for comments or notes textarea'
  },
  commentsOrNotesDescription: {
    id: 'form.field.label.application.commentsOrNotes.description',
    description: 'Help text for the notes field',
    defaultMessage:
      'Use this section to add any comments or notes that might be relevant to the completion and certification of this registration. This information won’t be shared with the informants.'
  },
  motherName: {
    id: 'form.section.mother.name',
    defaultMessage: 'Mother',
    description: 'Form section name for Mother'
  },
  motherTitle: {
    id: 'form.section.mother.title',
    defaultMessage: "Mother's details",
    description: 'Form section title for Mother'
  },
  motherFirstNames: {
    id: 'form.field.label.motherFirstNames',
    defaultMessage: 'First Name(s) in Bengali',
    description: 'Label for form field: First names'
  },
  motherFamilyName: {
    id: 'form.field.label.motherFamilyName',
    defaultMessage: 'Last Name(s) in Bengali',
    description: 'Label for form field: Family name'
  },
  motherFirstNamesEng: {
    id: 'form.field.label.motherFirstNamesEng',
    defaultMessage: 'First Name(s) in English',
    description: 'Label for form field: First names in english'
  },
  motherFamilyNameEng: {
    id: 'form.field.label.motherFamilyNameEng',
    defaultMessage: 'Last Name(s) in English',
    description: 'Label for form field: Family name in english'
  },
  motherDateOfBirth: {
    id: 'form.field.label.motherDateOfBirth',
    defaultMessage: 'Date of birth',
    description: 'Label for form field: Date of birth'
  },
  motherEducationAttainment: {
    id: 'form.field.label.motherEducationAttainment',
    defaultMessage: "Mother's level of formal education attained",
    description: 'Label for form field: Mother education'
  },
  fetchMotherDetails: {
    id: 'form.field.label.fetchMotherDetails',
    defaultMessage: "Retrieve Mother's Details",
    description: 'Label for loader button'
  },
  select: {
    id: 'form.field.select.placeholder',
    defaultMessage: 'Select',
    description: 'Placeholder text for a select'
  },
  fatherName: {
    id: 'form.section.father.name',
    defaultMessage: 'Father',
    description: 'Form section name for Father'
  },
  fatherTitle: {
    id: 'form.section.father.title',
    defaultMessage: "Father's details",
    description: 'Form section title for Father'
  },
  fathersDetailsExist: {
    id: 'form.field.label.fathersDetailsExist',
    defaultMessage: "Do you have the father's details?",
    description: "Question to ask the user if they have the father's details"
  },
  nationalityBangladesh: {
    id: 'form.field.label.father.nationalityBangladesh',
    defaultMessage: 'Bangladesh',
    description: 'Option for form field: Nationality'
  },
  fatherFirstNames: {
    id: 'form.field.label.fatherFirstNames',
    defaultMessage: 'First Name(s) in Bengali',
    description: 'Label for form field: First name'
  },
  fatherFamilyName: {
    id: 'form.field.label.fatherFamilyName',
    defaultMessage: 'Last Name(s) in Bengali',
    description: 'Label for form field: Family name'
  },
  fatherFirstNamesEng: {
    id: 'form.field.label.fatherFirstNamesEng',
    defaultMessage: 'First Name(s) in English',
    description: 'Label for form field: First names in english'
  },
  fatherFamilyNameEng: {
    id: 'form.field.label.fatherFamilyNameEng',
    defaultMessage: 'Last Name(s) in English',
    description: 'Label for form field: Family name in english'
  },
  defaultLabel: {
    id: 'form.field.label.defaultLabel',
    defaultMessage: 'Label goes here',
    description: 'default label'
  },
  fatherDateOfBirth: {
    id: 'form.field.label.fatherDateOfBirth',
    defaultMessage: 'Date of birth',
    description: 'Label for form field: Date of birth'
  },
  fatherEducationAttainment: {
    id: 'form.field.label.fatherEducationAttainment',
    defaultMessage: "Father's level of formal education attained",
    description: 'Label for form field: Father education'
  },
  fetchFatherDetails: {
    id: 'form.field.label.fetchFatherDetails',
    defaultMessage: "Retrieve Father's Details",
    description: 'Label for loader button'
  },
  documentsName: {
    id: 'form.section.documents.name',
    defaultMessage: 'Documents',
    description: 'Form section name for Documents'
  },
  documentsTitle: {
    id: 'form.section.documents.title',
    defaultMessage: 'Supporting documents',
    description: 'Form section title for Documents'
  },
  uploadImage: {
    id: 'form.section.documents.uploadImage',
    defaultMessage: 'Upload a photo of the supporting document',
    description: 'Title for the upload image button'
  },
  paragraph: {
    id: 'form.section.documents.birth.requirements',
    defaultMessage:
      'For birth regiatration of children below 5 years old, one of the documents listed below is required:',
    description: 'Documents Paragraph text'
  },
  informantAttestation: {
    id: 'form.section.documents.list.informantAttestation',
    defaultMessage: 'Attestation of the informant, or',
    description: 'Attested document of the informant'
  },
  attestedVaccination: {
    id: 'form.section.documents.list.attestedVaccination',
    defaultMessage: 'Attested copy of the vaccination (EPI) card, or',
    description: 'Attested copy of the vaccination card'
  },
  attestedBirthRecord: {
    id: 'form.section.documents.list.attestedBirthRecord',
    defaultMessage: 'Attested copy of hospital document or birth record, or',
    description: 'Attested copy of hospital document'
  },
  certification: {
    id: 'form.section.documents.list.certification',
    defaultMessage:
      'Certification regarding NGO worker authorized by registrar in favour of date of birth, or',
    description: 'Certification regarding NGO worker'
  },
  otherDocuments: {
    id: 'form.section.documents.list.otherDocuments',
    defaultMessage:
      'Attested copy(s) of the document as prescribed by the Registrar',
    description: 'Attested copy(s) of the document'
  },
  documentsUploadName: {
    id: 'form.section.upload.documentsName',
    defaultMessage: 'Documents Upload',
    description: 'Form section name for Documents Upload'
  },
  documentsUploadTitle: {
    id: 'form.section.upload.documentsTitle',
    defaultMessage: 'Supporting documents',
    description: 'Form section title for Documents'
  },
  uploadDocForWhom: {
    id: 'form.field.label.uploadDocForWhom',
    defaultMessage: 'Whose suppoting document are you uploading?',
    description: 'Question to ask user, for whom, documents are being uploaded'
  },
  uploadDocForChild: {
    id: 'form.field.label.uploadDocForChild',
    defaultMessage: 'Child',
    description: 'Label for radio option Child'
  },
  uploadDocForMother: {
    id: 'form.field.label.uploadDocForMother',
    defaultMessage: 'Mother',
    description: 'Label for radio option Mother'
  },
  uploadDocForFather: {
    id: 'form.field.label.uploadDocForFather',
    defaultMessage: 'Father',
    description: 'Label for radio option Father'
  },
  uploadDocForOther: {
    id: 'form.field.label.uploadDocForOther',
    defaultMessage: 'Other',
    description: 'Label for radio option Other'
  },
  whatDocToUpload: {
    id: 'form.field.label.whatDocToUpload',
    defaultMessage: 'Which document type are you uploading?',
    description:
      'Question to ask user, what type of documents are being uploaded'
  },
  docTypePassport: {
    id: 'form.field.label.docTypePassport',
    defaultMessage: 'Passport',
    description: 'Label for radio option Passport'
  },
  docTypeSC: {
    id: 'form.field.label.docTypeSC',
    defaultMessage: 'School Certificate',
    description: 'Label for radio option School Certificate'
  },
  docTypeOther: {
    id: 'form.field.label.docTypeOther',
    defaultMessage: 'Other',
    description: 'Label for radio option Other'
  },
  docTypeChildBirthProof: {
    id: 'form.field.label.docTypeChildBirthProof',
    defaultMessage: 'Proof of Place and Date of Birth',
    description: 'Label for select option Child Birth Proof'
  },
  docTypeEPICard: {
    id: 'form.field.label.docTypeEPICard',
    defaultMessage: 'EPI Card',
    description: 'Label for select option EPI Card'
  },
  docTypeDoctorCertificate: {
    id: 'form.field.label.docTypeDoctorCertificate',
    defaultMessage: 'Doctor Certificate',
    description: 'Label for select option Doctor Certificate'
  },
  proofOfMothersID: {
    id: 'form.field.label.proofOfMothersID',
    defaultMessage: "Proof of Mother's ID",
    description: 'Label for list item Mother ID Proof'
  },
  proofOfFathersID: {
    id: 'form.field.label.proofOfFathersID',
    defaultMessage: "Proof of Father's ID",
    description: 'Label for list item Father ID Proof'
  },
  proofOfBirthPlaceAndDate: {
    id: 'form.field.label.proofOfBirthPlaceAndDate',
    defaultMessage: 'Proof of Place and Date of Birth of Child',
    description: 'Label for list item Child Birth Proof'
  },
  proofOfParentPermanentAddress: {
    id: 'form.field.label.proofOfParentPermanentAddress',
    defaultMessage: 'Proof of Permanent Address of Parent',
    description: 'Label for list item Parent Permanent Address Proof'
  },
  proofOfEPICardOfChild: {
    id: 'form.field.label.proofOfEPICardOfChild',
    defaultMessage: 'EPI Card of Child',
    description: 'Label for list item EPI Card of Child'
  },
  proofOfDocCertificateOfChild: {
    id: 'form.field.label.proofOfDocCertificateOfChild',
    defaultMessage:
      "Certificate from doctor to prove child's age OR School certificate",
    description: 'Label for list item Doctor Certificate'
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
  birthLocation: {
    defaultMessage: 'Hospital / Clinic',
    description: 'Label for form field: Hospital or Health Institution',
    id: 'form.field.label.birthLocation'
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
  hospital: {
    defaultMessage: 'Hospital',
    description: 'Select item for hospital',
    id: 'form.field.label.hospital'
  },
  multipleBirth: {
    defaultMessage: 'Order of birth (number)',
    description: 'Label for form field: Order of birth',
    id: 'form.field.label.multipleBirth'
  },
  otherInstitution: {
    defaultMessage: 'Other Institution',
    description: 'Select item for Other Institution',
    id: 'form.field.label.otherInstitution'
  },
  placeOfBirth: {
    defaultMessage: 'Place of delivery',
    description: 'Label for form field: Place of delivery',
    id: 'form.field.label.placeOfBirth'
  },
  weightAtBirth: {
    defaultMessage: 'Weight at birth',
    description: 'Label for form field: Weight at birth',
    id: 'form.field.label.weightAtBirth'
  },
  confirmMotherDetails: {
    id: 'form.field.label.print.confirmMotherInformation',
    defaultMessage:
      'Does their proof of ID document match the following details?',
    description: 'The label for mother details paragraph'
  },
  givenNames: {
    id: 'form.field.label.print.otherPersonGivenNames',
    defaultMessage: 'Given name',
    description: 'Label for given name text input'
  },
  familyName: {
    id: 'form.field.label.print.otherPersonFamilyName',
    defaultMessage: 'Family name',
    description: 'Label for family name text input'
  },
  signedAffidavitConfirmation: {
    id: 'form.field.label.print.signedAffidavit',
    defaultMessage: 'Do they have a signed affidavit?',
    description: 'Label for signed affidavit confirmation radio group'
  },
  documentNumber: {
    id: 'form.field.label.print.documentNumber',
    defaultMessage: 'Document number',
    description: 'Label for document number input field'
  },
  warningNotVerified: {
    id: 'form.field.label.print.warningNotVerified',
    defaultMessage:
      'Please be aware that if you proceed you will be responsible for issuing a certificate without the necessary proof of ID from the collector.',
    description: 'Label for warning message when the collector is not verified'
  },
  prompt: {
    id: 'form.field.label.print.otherPersonPrompt',
    defaultMessage:
      'Because there are no details of this person on record, we need to capture their details:',
    description: 'Labal for prompt in case of other person collects certificate'
  },
  maritalStatus: {
    id: 'form.field.label.maritalStatus',
    defaultMessage: 'Marital status',
    description: 'Label for form field: Marital status'
  },
  maritalStatusSingle: {
    id: 'form.field.label.maritalStatusSingle',
    defaultMessage: 'Unmarried',
    description: 'Option for form field: Marital status'
  },
  maritalStatusMarried: {
    id: 'form.field.label.maritalStatusMarried',
    defaultMessage: 'Married',
    description: 'Option for form field: Marital status'
  },
  maritalStatusWidowed: {
    id: 'form.field.label.maritalStatusWidowed',
    defaultMessage: 'Widowed',
    description: 'Option for form field: Marital status'
  },
  maritalStatusDivorced: {
    id: 'form.field.label.maritalStatusDivorced',
    defaultMessage: 'Divorced',
    description: 'Option for form field: Marital status'
  },
  maritalStatusNotStated: {
    id: 'form.field.label.maritalStatusNotStated',
    defaultMessage: 'Not stated',
    description: 'Option for form field: Marital status'
  },
  dateOfMarriage: {
    id: 'form.field.label.dateOfMarriage',
    defaultMessage: 'Date of marriage',
    description: 'Option for form field: Date of marriage'
  },
  otherOption: {
    id: 'form.field.label.otherOption',
    defaultMessage: 'Other',
    description: 'Other option for select'
  },
  iDType: {
    id: 'form.field.label.iDType',
    defaultMessage: 'Type of ID',
    description: 'Label for form field: Type of ID'
  },
  iDTypePassport: {
    id: 'form.field.label.iDTypePassport',
    defaultMessage: 'Passport',
    description: 'Option for form field: Type of ID'
  },
  iDTypeNationalID: {
    id: 'form.field.label.iDTypeNationalID',
    defaultMessage: 'National ID',
    description: 'Option for form field: Type of ID'
  },
  iDTypeDrivingLicense: {
    id: 'form.field.label.iDTypeDrivingLicense',
    defaultMessage: 'Drivers License',
    description: 'Option for form field: Type of ID'
  },
  iDTypeBRN: {
    id: 'form.field.label.iDTypeBRN',
    defaultMessage: 'Birth Registration Number',
    description: 'Option for form field: Type of ID'
  },
  iDTypeDRN: {
    id: 'form.field.label.iDTypeDRN',
    defaultMessage: 'Death Registration Number',
    description: 'Option for form field: Type of ID'
  },
  iDTypeRefugeeNumber: {
    id: 'form.field.label.iDTypeRefugeeNumber',
    defaultMessage: 'Refugee Number',
    description: 'Option for form field: Type of ID'
  },
  iDTypeAlienNumber: {
    id: 'form.field.label.iDTypeAlienNumber',
    defaultMessage: 'Alien Number',
    description: 'Option for form field: Type of ID'
  },
  iDTypeOther: {
    id: 'form.field.label.iDTypeOther',
    defaultMessage: 'Other',
    description: 'Option for form field: Type of ID'
  },
  iDTypeNoId: {
    id: 'form.field.label.iDTypeNoID',
    defaultMessage: 'No ID available',
    description: 'Option for form field: Type of ID'
  },
  iDTypeOtherLabel: {
    id: 'form.field.label.iDTypeOtherLabel',
    defaultMessage: 'Other type of ID',
    description: 'Label for form field: Other type of ID'
  },
  iD: {
    id: 'form.field.label.iD',
    defaultMessage: 'ID Number',
    description: 'Label for form field: ID Number'
  },
  educationAttainmentNone: {
    id: 'form.field.label.educationAttainmentNone',
    defaultMessage: 'No schooling',
    description: 'Option for form field: no education'
  },
  educationAttainmentISCED1: {
    id: 'form.field.label.educationAttainmentISCED1',
    defaultMessage: 'Primary',
    description: 'Option for form field: ISCED1 education'
  },
  educationAttainmentISCED2: {
    id: 'form.field.label.educationAttainmentISCED2',
    defaultMessage: 'Lower secondary',
    description: 'Option for form field: ISCED2 education'
  },
  educationAttainmentISCED3: {
    id: 'form.field.label.educationAttainmentISCED3',
    defaultMessage: 'Upper secondary',
    description: 'Option for form field: ISCED3 education'
  },
  educationAttainmentISCED4: {
    id: 'form.field.label.educationAttainmentISCED4',
    defaultMessage: 'Post secondary',
    description: 'Option for form field: ISCED4 education'
  },
  educationAttainmentISCED5: {
    id: 'form.field.label.educationAttainmentISCED5',
    defaultMessage: 'First stage tertiary',
    description: 'Option for form field: ISCED5 education'
  },
  educationAttainmentISCED6: {
    id: 'form.field.label.educationAttainmentISCED6',
    defaultMessage: 'Second stage tertiary',
    description: 'Option for form field: ISCED6 education'
  },
  educationAttainmentNotStated: {
    id: 'form.field.label.educationAttainmentNotStated',
    defaultMessage: 'Not stated',
    description: 'Option for form field: not stated education'
  },
  uploadedList: {
    id: 'form.field.label.imageUpload.uploadedList',
    defaultMessage: 'Uploaded:',
    description: 'label for uploaded list'
  },
  optionalLabel: {
    id: 'form.field.label.optionalLabel',
    defaultMessage: 'Optional',
    description: 'Optional label'
  },
  searchFieldModalTitle: {
    id: 'form.field.SearchField.modalTitle',
    defaultMessage: `{fieldName, select, registrationOffice {Assigned Register Office}}`,
    description: 'Modal title'
  },
  officeLocationId: {
    id: 'form.field.SearchField.officeLocationId',
    defaultMessage: 'Id: {locationId}',
    description: 'The location Id column'
  },
  changeAssignedOffice: {
    id: 'form.field.SearchField.changeAssignedOffice',
    defaultMessage: 'Change assigned office',
    description: 'Edit button text'
  },
  searchFieldPlaceHolderText: {
    id: 'form.field.SearchField.placeHolderText',
    defaultMessage: 'Search',
    description: 'Place holder text '
  },
  country: {
    id: 'form.field.label.country',
    defaultMessage: 'Country',
    description: 'Title for the country select'
  },
  state: {
    id: 'form.field.label.state',
    defaultMessage: 'Division',
    description: 'Title for the state select'
  },
  district: {
    id: 'form.field.label.district',
    defaultMessage: 'District',
    description: 'Title for the district select'
  },
  addressLine1: {
    id: 'form.field.label.addressLine1',
    defaultMessage: 'Street and house number',
    description: 'Title for the address line 1'
  },
  addressLine2: {
    id: 'form.field.label.addressLine2',
    defaultMessage: 'Area / Ward / Mouja / Village',
    description: 'Title for the address line 2'
  },
  addressLine3: {
    id: 'form.field.label.addressLine3',
    defaultMessage: 'Union / Municipality / Cantonement',
    description: 'Title for the address line 3 option 1'
  },
  addressLine3CityOption: {
    id: 'form.field.label.addressLine3CityOption',
    defaultMessage: 'Ward',
    description: 'Title for the address line 3 option 2'
  },
  addressLine4: {
    id: 'form.field.label.addressLine4',
    defaultMessage: 'Upazila (Thana) / City',
    description: 'Title for the address line 4'
  },
  postCode: {
    id: 'form.field.label.postCode',
    defaultMessage: 'Postcode',
    description: 'Title for the postcode field'
  },
  confirm: {
    id: 'form.field.label.confirm',
    defaultMessage: 'Yes',
    description: 'confirmation label for yes / no radio button'
  },
  deny: {
    id: 'form.field.label.deny',
    defaultMessage: 'No',
    description: 'deny label for yes / no radio button'
  },
  addressSameAsMother: {
    id: 'form.field.label.addressSameAsMother',
    defaultMessage: "Is his current address the same as the mother's?",
    description:
      "Title for the radio button to select that the father's current address is the same as the mother's address"
  },
  permanentAddressSameAsMother: {
    id: 'form.field.label.permanentAddressSameAsMother',
    defaultMessage: "Is his permanent address the same as the mother's?",
    description:
      "Title for the radio button to select that the father's permanent address is the same as the mother's address"
  },
  currentAddressSameAsPermanent: {
    id: 'form.field.label.currentAddressSameAsPermanent',
    defaultMessage: 'Is her current address the same as her permanent address?',
    description:
      'Title for the radio button to select that the mothers current address is the same as her permanent address'
  }
}

export const formMessages: IFormMessages = defineMessages(messagesToDefine)
