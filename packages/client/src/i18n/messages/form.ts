/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { defineMessages } from 'react-intl'

interface IFormMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  accountDetails: MessageDescriptor
  addressLine1: MessageDescriptor
  addressLine2: MessageDescriptor
  addressLine3: MessageDescriptor
  addressLine3UrbanOption: MessageDescriptor
  addressLine4: MessageDescriptor
  answer: MessageDescriptor
  proofOfInformantsID: MessageDescriptor
  witnessName: MessageDescriptor
  informantName: MessageDescriptor
  otherInformantType: MessageDescriptor
  informantsDateOfBirth: MessageDescriptor
  informantsFamilyName: MessageDescriptor
  informantsFamilyNameEng: MessageDescriptor
  informantsGivenNames: MessageDescriptor
  informantsGivenNamesEng: MessageDescriptor
  informantsIdType: MessageDescriptor
  informantsRelationWithChild: MessageDescriptor
  informantsRelationWithDeceased: MessageDescriptor
  birthInformantTitle: MessageDescriptor
  deathInformantTitle: MessageDescriptor
  witnessOneTitle: MessageDescriptor
  witnessTwoTitle: MessageDescriptor
  assignedRegistrationOffice: MessageDescriptor
  assignedRegistrationOfficeGroupTitle: MessageDescriptor
  attendantAtBirth: MessageDescriptor
  attendantAtBirthLayperson: MessageDescriptor
  attendantAtBirthMidwife: MessageDescriptor
  attendantAtBirthTraditionalBirthAttendant: MessageDescriptor
  attendantAtBirthNone: MessageDescriptor
  attendantAtBirthNurse: MessageDescriptor
  attendantAtBirthOther: MessageDescriptor
  attendantAtBirthOtherParamedicalPersonnel: MessageDescriptor
  physician: MessageDescriptor
  attestedBirthRecord: MessageDescriptor
  attestedVaccination: MessageDescriptor
  birthAttendant: MessageDescriptor
  birthLocation: MessageDescriptor
  birthMedicalInstitution: MessageDescriptor
  birthType: MessageDescriptor
  birthTypeHigherMultipleDelivery: MessageDescriptor
  birthTypeQuadruplet: MessageDescriptor
  birthTypeSingle: MessageDescriptor
  birthTypeTriplet: MessageDescriptor
  birthTypeTwin: MessageDescriptor
  causeOfDeathMethod: MessageDescriptor
  causeOfDeathEstablished: MessageDescriptor
  causeOfDeathName: MessageDescriptor
  causeOfDeathNotice: MessageDescriptor
  causeOfDeathTitle: MessageDescriptor
  certification: MessageDescriptor
  changeButtonLabel: MessageDescriptor
  dateOfBirth: MessageDescriptor
  childFamilyName: MessageDescriptor
  childFirstNames: MessageDescriptor
  firstNames: MessageDescriptor
  informantFirstNames: MessageDescriptor
  sex: MessageDescriptor
  sexFemale: MessageDescriptor
  sexMale: MessageDescriptor
  childSexOther: MessageDescriptor
  sexUnknown: MessageDescriptor
  other: MessageDescriptor
  childTab: MessageDescriptor
  childTitle: MessageDescriptor
  commentsOrNotesDescription: MessageDescriptor
  commentsOrNotesLabel: MessageDescriptor
  confirm: MessageDescriptor
  confirmMotherDetails: MessageDescriptor
  contactDetailsInformant: MessageDescriptor
  contactDetailsBoth: MessageDescriptor
  contactDetailsFather: MessageDescriptor
  contactDetailsMother: MessageDescriptor
  certifyRecordToMother: MessageDescriptor
  certifyRecordToFather: MessageDescriptor
  country: MessageDescriptor
  secondaryAddress: MessageDescriptor
  dateOfMarriage: MessageDescriptor
  daughter: MessageDescriptor
  daughterInLaw: MessageDescriptor
  granddaughter: MessageDescriptor
  deathAtFacility: MessageDescriptor
  deathAtOtherLocation: MessageDescriptor
  deathAtPrivateHome: MessageDescriptor
  deathDate: MessageDescriptor
  deathEventName: MessageDescriptor
  deathEventTitle: MessageDescriptor
  marriageEventName: MessageDescriptor
  marriageEventTitle: MessageDescriptor
  deathPlace: MessageDescriptor
  placeOfDeath: MessageDescriptor
  placeOfMarriage: MessageDescriptor
  placeOfDeathOther: MessageDescriptor
  placeOfDeathSameAsCurrent: MessageDescriptor
  placeOfDeathSameAsPrimary: MessageDescriptor
  placeOfDeathType: MessageDescriptor
  deceasedCurrentAddressSameAsPrimary: MessageDescriptor
  deceasedDeathProof: MessageDescriptor
  deceasedDoBProof: MessageDescriptor
  deceasedFamilyName: MessageDescriptor
  deceasedGivenNames: MessageDescriptor
  deceasedIDProof: MessageDescriptor
  deceasedIdType: MessageDescriptor
  deceasedName: MessageDescriptor
  deceasedParagraph: MessageDescriptor
  deceasedPrimaryAddressProof: MessageDescriptor
  nameInEnglishPreviewGroup: MessageDescriptor
  deceasedSexOther: MessageDescriptor
  deceasedTitle: MessageDescriptor
  defaultLabel: MessageDescriptor
  deliveryAddress: MessageDescriptor
  deliveryInstitution: MessageDescriptor
  deny: MessageDescriptor
  district: MessageDescriptor
  docTaxReceipt: MessageDescriptor
  docTypeBirthCert: MessageDescriptor
  docTypeChildAgeProof: MessageDescriptor
  docTypeChildBirthProof: MessageDescriptor
  docTypeMarriageNotice: MessageDescriptor
  docTypeCopyOfBurialReceipt: MessageDescriptor
  docTypeDeathCertificate: MessageDescriptor
  docTypePoliceCertificate: MessageDescriptor
  docTypeDoctorCertificate: MessageDescriptor
  docTypeEPICard: MessageDescriptor
  docTypeEPIStaffCertificate: MessageDescriptor
  docTypeFuneralReceipt: MessageDescriptor
  docTypeLetterOfDeath: MessageDescriptor
  docTypeNID: MessageDescriptor
  docTypeOther: MessageDescriptor
  docTypePassport: MessageDescriptor
  docTypePostMortemReport: MessageDescriptor
  docTypeSC: MessageDescriptor
  documentNumber: MessageDescriptor
  documentsName: MessageDescriptor
  documentsTitle: MessageDescriptor
  documentsUploadName: MessageDescriptor
  educationAttainmentISCED1: MessageDescriptor
  educationAttainmentISCED4: MessageDescriptor
  educationAttainmentISCED5: MessageDescriptor
  educationAttainmentNone: MessageDescriptor
  enterResponse: MessageDescriptor
  familyName: MessageDescriptor
  firstNameFamilyName: MessageDescriptor
  marriedLastName: MessageDescriptor
  father: MessageDescriptor
  fatherFamilyName: MessageDescriptor
  fatherFirstNames: MessageDescriptor
  fatherName: MessageDescriptor
  fathersDetailsExist: MessageDescriptor
  mothersDetailsExist: MessageDescriptor
  fatherTitle: MessageDescriptor
  fetchDeceasedDetails: MessageDescriptor
  fetchFatherDetails: MessageDescriptor
  fetchIdentifierModalErrorTitle: MessageDescriptor
  fetchIdentifierModalSuccessTitle: MessageDescriptor
  fetchIdentifierModalTitle: MessageDescriptor
  fetchInformantDetails: MessageDescriptor
  fetchMotherDetails: MessageDescriptor
  fetchPersonByNIDModalErrorText: MessageDescriptor
  fetchPersonByNIDModalNetworkErrorText: MessageDescriptor
  fetchPersonByNIDModalInfo: MessageDescriptor
  fetchRegistrationModalErrorText: MessageDescriptor
  fetchRegistrationModalInfo: MessageDescriptor
  firstNameBn: MessageDescriptor
  firstNameEn: MessageDescriptor
  givenNames: MessageDescriptor
  healthInstitution: MessageDescriptor
  hospital: MessageDescriptor
  internationalState: MessageDescriptor
  internationalDistrict: MessageDescriptor
  internationalCity: MessageDescriptor
  internationalAddressLine1: MessageDescriptor
  internationalAddressLine2: MessageDescriptor
  internationalAddressLine3: MessageDescriptor
  internationalPostcode: MessageDescriptor
  iD: MessageDescriptor
  iDType: MessageDescriptor
  iDTypeAlienNumber: MessageDescriptor
  iDTypeBRN: MessageDescriptor
  iDTypeDrivingLicense: MessageDescriptor
  iDTypeDRN: MessageDescriptor
  iDTypeNationalID: MessageDescriptor
  iDTypeNoId: MessageDescriptor
  iDTypeOther: MessageDescriptor
  iDTypeOtherLabel: MessageDescriptor
  iDTypePassport: MessageDescriptor
  iDTypeRefugeeNumber: MessageDescriptor
  informantAttestation: MessageDescriptor
  lastNameEn: MessageDescriptor
  manner: MessageDescriptor
  mannerAccident: MessageDescriptor
  mannerHomicide: MessageDescriptor
  mannerNatural: MessageDescriptor
  mannerSuicide: MessageDescriptor
  mannerUndetermined: MessageDescriptor
  typeOfMarriage: MessageDescriptor
  polygamy: MessageDescriptor
  monogamy: MessageDescriptor
  maritalStatus: MessageDescriptor
  maritalStatusDivorced: MessageDescriptor
  maritalStatusMarried: MessageDescriptor
  maritalStatusNotStated: MessageDescriptor
  maritalStatusSeparated: MessageDescriptor
  maritalStatusSingle: MessageDescriptor
  maritalStatusWidowed: MessageDescriptor
  medicallyCertified: MessageDescriptor
  deathDescription: MessageDescriptor
  methodOfCauseOfDeath: MessageDescriptor
  mother: MessageDescriptor
  educationAttainment: MessageDescriptor
  motherFamilyName: MessageDescriptor
  motherFirstNames: MessageDescriptor
  motherName: MessageDescriptor
  motherTitle: MessageDescriptor
  groomName: MessageDescriptor
  groomTitle: MessageDescriptor
  brideName: MessageDescriptor
  brideTitle: MessageDescriptor
  headOfGroomFamily: MessageDescriptor
  headOfBrideFamily: MessageDescriptor
  multipleBirth: MessageDescriptor
  nationality: MessageDescriptor
  nationalityBangladesh: MessageDescriptor
  NID: MessageDescriptor
  officeLocationId: MessageDescriptor
  optionalLabel: MessageDescriptor
  otherDocuments: MessageDescriptor
  otherHealthInstitution: MessageDescriptor
  otherInstitution: MessageDescriptor
  otherOption: MessageDescriptor
  paragraphTargetDaysTo5Years: MessageDescriptor
  documentsParagraph: MessageDescriptor
  paragraphAbove5Years: MessageDescriptor
  deceasedPrimaryAddress: MessageDescriptor
  primaryAddressSameAsCurrent: MessageDescriptor
  primaryAddressSameAsOtherPrimary: MessageDescriptor
  primaryAddressSameAsDeceasedsPrimary: MessageDescriptor
  phoneNumber: MessageDescriptor
  phoneVerificationWarning: MessageDescriptor
  placeOfBirth: MessageDescriptor
  postCode: MessageDescriptor
  presentBoth: MessageDescriptor
  presentFather: MessageDescriptor
  presentMother: MessageDescriptor
  presentOther: MessageDescriptor
  privateHome: MessageDescriptor
  prompt: MessageDescriptor
  proofOfBirth: MessageDescriptor
  proofOfMarriageNotice: MessageDescriptor
  proofOfDocCertificateOfChild: MessageDescriptor
  proofOfEPICardOfChild: MessageDescriptor
  proofOfFathersID: MessageDescriptor
  otherBirthSupportingDocuments: MessageDescriptor
  legalGuardianProof: MessageDescriptor
  proofOfMothersID: MessageDescriptor
  proofOfGroomsID: MessageDescriptor
  proofOfBridesID: MessageDescriptor
  proofOfParentPrimaryAddress: MessageDescriptor
  placeOfBirthPreview: MessageDescriptor
  registrationName: MessageDescriptor
  registrationOffice: MessageDescriptor
  registrationPhoneLabel: MessageDescriptor
  registrationTitle: MessageDescriptor
  relationExtendedFamily: MessageDescriptor
  relationOther: MessageDescriptor
  relationshipPlaceHolder: MessageDescriptor
  searchFieldModalTitle: MessageDescriptor
  searchFieldPlaceHolderText: MessageDescriptor
  securityQuestionLabel: MessageDescriptor
  select: MessageDescriptor
  selectOne: MessageDescriptor
  selectSecurityQuestion: MessageDescriptor
  self: MessageDescriptor
  signedAffidavitConfirmation: MessageDescriptor
  someoneElse: MessageDescriptor
  someoneElseCollector: MessageDescriptor
  son: MessageDescriptor
  sonInLaw: MessageDescriptor
  grandson: MessageDescriptor
  spouse: MessageDescriptor
  grandfather: MessageDescriptor
  grandmother: MessageDescriptor
  brother: MessageDescriptor
  sister: MessageDescriptor
  legalGuardian: MessageDescriptor
  headOfTheInstitute: MessageDescriptor
  driverOfTheVehicle: MessageDescriptor
  ownerOfTheHouse: MessageDescriptor
  officerInCharge: MessageDescriptor
  state: MessageDescriptor
  typeOfDocument: MessageDescriptor
  uploadDocForChild: MessageDescriptor
  uploadDocForFather: MessageDescriptor
  uploadDocForMother: MessageDescriptor
  uploadDocForOther: MessageDescriptor
  uploadDocForWhom: MessageDescriptor
  uploadImage: MessageDescriptor
  userDetails: MessageDescriptor
  userDevice: MessageDescriptor
  userFormReviewTitle: MessageDescriptor
  userFormSecurityQuestionsDescription: MessageDescriptor
  userFormSecurityQuestionsHeading: MessageDescriptor
  userFormSecurityQuestionsTitle: MessageDescriptor
  userFormTitle: MessageDescriptor
  verbalAutopsy: MessageDescriptor
  verbalAutopsyReport: MessageDescriptor
  warningNotVerified: MessageDescriptor
  weightAtBirth: MessageDescriptor
  ageOfMother: MessageDescriptor
  ageOfFather: MessageDescriptor
  ageOfInformant: MessageDescriptor
  ageOfDeceased: MessageDescriptor
  ageOfGroom: MessageDescriptor
  ageOfBride: MessageDescriptor
  whatDocToUpload: MessageDescriptor
  whoIsPresentLabel: MessageDescriptor
  whoseContactDetailsLabel: MessageDescriptor
  uploadedList: MessageDescriptor
  userSignatureAttachmentTitle: MessageDescriptor
  docTypeCoronersReport: MessageDescriptor
  userSignatureAttachment: MessageDescriptor
  userAttachmentSection: MessageDescriptor
  userSignatureAttachmentDesc: MessageDescriptor
  addFile: MessageDescriptor
  uploadFile: MessageDescriptor
  fileUploadError: MessageDescriptor
  fileSizeError: MessageDescriptor
  typeOfId: MessageDescriptor
  firstName: MessageDescriptor
  lastName: MessageDescriptor
  relationship: MessageDescriptor
  relationshipToSpouses: MessageDescriptor
  primaryAddress: MessageDescriptor
  parentDetailsType: MessageDescriptor
  motherRadioButton: MessageDescriptor
  fatherRadioButton: MessageDescriptor
  reasonNA: MessageDescriptor
  reasonParentsNotApplying: MessageDescriptor
  motherDeceasedLabel: MessageDescriptor
  fatherDeceasedLabel: MessageDescriptor
  motherCaregiverTypeLabel: MessageDescriptor
  fatherCaregiverTypeLabel: MessageDescriptor
  legalGuardianCaregiverTypeLabel: MessageDescriptor
  parentsCaregiverTypeLabel: MessageDescriptor
  informantCaregiverTypeLabel: MessageDescriptor
  otherCaregiverTypeLabel: MessageDescriptor
  nameFieldLabel: MessageDescriptor
  reasonMNAPreview: MessageDescriptor
  reasonFNAPreview: MessageDescriptor
  tooltipNationalID: MessageDescriptor
  dateRangePickerCheckboxLabel: MessageDescriptor
  deceasedFatherSectionName: MessageDescriptor
  deceasedFatherSectionTitle: MessageDescriptor
  deceasedFathersFamilyName: MessageDescriptor
  deceasedFathersFamilyNameEng: MessageDescriptor
  deceasedFathersGivenNames: MessageDescriptor
  deceasedFathersGivenNamesEng: MessageDescriptor
  deceasedMotherSectionName: MessageDescriptor
  deceasedMotherSectionTitle: MessageDescriptor
  deceasedMothersFamilyName: MessageDescriptor
  deceasedMothersFamilyNameEng: MessageDescriptor
  deceasedMothersGivenNames: MessageDescriptor
  deceasedMothersGivenNamesEng: MessageDescriptor
  deceasedSpouseSectionName: MessageDescriptor
  deceasedSpouseSectionTitle: MessageDescriptor
  deceasedHasSpouseDetails: MessageDescriptor
  deceasedHasNoSpouseDetails: MessageDescriptor
  deceasedSpousesFamilyName: MessageDescriptor
  deceasedSpousesFamilyNameEng: MessageDescriptor
  deceasedSpousesGivenNames: MessageDescriptor
  deceasedSpousesGivenNamesEng: MessageDescriptor
  certificatePrintInAdvance: MessageDescriptor
  nationalIdOption: MessageDescriptor
  brnOption: MessageDescriptor
  helperTextNID: MessageDescriptor
  formSelectPlaceholder: MessageDescriptor
  selectContactPoint: MessageDescriptor
  reviewLabelMainContact: MessageDescriptor
  deceasedSecondaryAddressSameAsPrimary: MessageDescriptor
  deceasedSecondaryAddress: MessageDescriptor
  informantSecondaryAddressSameAsPrimary: MessageDescriptor
  informantSecondaryAddress: MessageDescriptor
  emptyStringForSubSection: MessageDescriptor
  assignedResponsibilityProof: MessageDescriptor
  showLabel: MessageDescriptor
  hideLabel: MessageDescriptor
}

export const formMessageDescriptors: IFormMessages = {
  docTypeCoronersReport: {
    defaultMessage: "Coroner's report",
    description: "Label for select option Coroner's report",
    id: 'form.field.label.docTypeCoronersReport'
  },
  uploadFile: {
    defaultMessage: 'Upload',
    description: 'text for upload file button',
    id: 'form.field.label.uploadFile'
  },
  iDType: {
    id: 'form.field.label.iDType',
    defaultMessage: 'Type of ID'
  },
  iDTypeAlienNumber: {
    id: 'form.field.label.iDTypeAlienNumber',
    defaultMessage: 'Alien Number'
  },
  iDTypeBRN: {
    id: 'form.field.label.iDTypeBRN',
    defaultMessage: 'Birth Registration Number'
  },
  iDTypeDrivingLicense: {
    id: 'form.field.label.iDTypeDrivingLicense',
    defaultMessage: 'Drivers License'
  },
  iDTypeDRN: {
    id: 'form.field.label.iDTypeDRN',
    defaultMessage: 'Death Registration Number'
  },
  iDTypeNationalID: {
    id: 'form.field.label.iDTypeNationalID',
    defaultMessage: 'National ID'
  },
  iDTypeNoID: {
    id: 'form.field.label.iDTypeNoID',
    defaultMessage: 'No ID available'
  },
  iDTypeOther: {
    id: 'form.field.label.iDTypeOther',
    defaultMessage: 'Other'
  },
  iDTypePassport: {
    id: 'form.field.label.iDTypePassport',
    defaultMessage: 'Passport'
  },
  iDTypeRefugeeNumber: {
    id: 'form.field.label.iDTypeRefugeeNumber',
    defaultMessage: 'Refugee Number'
  },
  helperTextNID: {
    defaultMessage:
      'The National ID can only be numeric and must be 10 digits long',
    description: 'Helper text for nid input field',
    id: 'form.field.helpertext.nid'
  },
  tooltipNationalID: {
    defaultMessage:
      'The National ID can only be numeric and must be 10 digits long',
    description: 'Tooltip for form field: iD number',
    id: 'form.field.tooltip.tooltipNationalID'
  },
  securityQuestionLabel: {
    id: 'user.form.securityquestion.securityQuestionLabel',
    defaultMessage: 'Security question {count}'
  },
  selectSecurityQuestion: {
    id: 'user.form.securityquestion.selectSecurityQuestion',
    defaultMessage: 'Select a security question'
  },
  answer: {
    id: 'user.form.securityquestion.answer',
    defaultMessage: 'Answer'
  },
  userFormSecurityQuestionsDescription: {
    id: 'user.form.securityquestion.description',
    defaultMessage:
      'From the drop down lists below, select questions that can be used later to confirm your identity should you forget your password.'
  },
  enterResponse: {
    id: 'user.form.securityquestion.enterResponse',
    defaultMessage: 'Enter a response to your chosen security question'
  },
  userFormSecurityQuestionsHeading: {
    id: 'user.form.securityquestion.heading',
    defaultMessage: 'Set your security questions'
  },
  userFormSecurityQuestionsTitle: {
    id: 'user.form.securityquestion.title',
    defaultMessage: 'Security questions'
  },
  country: {
    defaultMessage: 'Country',
    description: 'Title for the country select',
    id: 'form.field.label.country'
  },
  state: {
    defaultMessage: 'Division',
    description: 'Title for the state select',
    id: 'form.field.label.state'
  },
  district: {
    defaultMessage: 'District',
    description: 'Title for the district select',
    id: 'form.field.label.district'
  },
  select: {
    defaultMessage: 'Select',
    description: 'Placeholder text for a select',
    id: 'form.field.select.placeholder'
  },
  NID: {
    defaultMessage: 'NID',
    description: 'National ID',
    id: 'form.field.label.NID'
  },
  placeOfBirth: {
    defaultMessage: 'Location',
    description: 'Label for form field: Place of delivery',
    id: 'form.field.label.placeOfBirth'
  },
  dateOfBirth: {
    defaultMessage: 'Date of birth',
    description: 'Label for form field: Date of birth',
    id: 'form.field.label.dateOfBirth'
  },
  multipleBirth: {
    defaultMessage: 'No. of previous births',
    description: 'Label for form field: multipleBirth',
    id: 'form.field.label.multipleBirth'
  },
  optionalLabel: {
    defaultMessage: 'Optional',
    description: 'Optional label',
    id: 'form.field.label.optionalLabel'
  },
  formSelectPlaceholder: {
    defaultMessage: 'Select',
    description: 'Placeholder text for a select',
    id: 'form.field.select.placeholder'
  },
  firstNames: {
    defaultMessage: 'First name(s)',
    description: 'Label for form field: First names',
    id: 'form.field.label.firstNames'
  },
  informantFirstNames: {
    defaultMessage: 'First name(s)',
    description: 'Label for form field: First names',
    id: 'form.field.label.informantFirstNames'
  },
  familyName: {
    defaultMessage: 'Last name',
    description: 'Label for family name text input',
    id: 'form.field.label.familyName'
  },
  sex: {
    defaultMessage: 'Sex',
    description: 'Label for form field: Sex name',
    id: 'form.field.label.sex'
  },
  sexMale: {
    defaultMessage: 'Male',
    description: 'Option for form field: Sex name',
    id: 'form.field.label.sexMale'
  },
  sexFemale: {
    defaultMessage: 'Female',
    description: 'Option for form field: Sex name',
    id: 'form.field.label.sexFemale'
  },
  sexUnknown: {
    defaultMessage: 'Unknown',
    description: 'Option for form field: Sex name',
    id: 'form.field.label.sexUnknown'
  },
  healthInstitution: {
    defaultMessage: 'Health Institution',
    description: 'Select item for Health Institution',
    id: 'form.field.label.healthInstitution'
  },
  privateHome: {
    defaultMessage: 'Residential address',
    description: 'Select item for Private Home',
    id: 'form.field.label.privateHome'
  },
  firstName: {
    defaultMessage: 'First name',
    description: "Input label for certificate collector's first name",
    id: 'form.field.label.firstName'
  },
  certifyRecordToMother: {
    defaultMessage: 'Print and issue to informant (Mother)',
    description: 'Label for mother select option to certify record',
    id: 'form.field.label.app.certifyRecordTo.mother'
  },
  someoneElseCollector: {
    defaultMessage: 'Print and issue to someone else',
    description: 'Other Label',
    id: 'form.field.label.someoneElseCollector'
  },
  certificatePrintInAdvance: {
    defaultMessage: 'Print in advance',
    description: 'Label for certificate collection option',
    id: 'form.field.label.certificatePrintInAdvance'
  },
  certifyRecordToFather: {
    defaultMessage: 'Print and issue to informant (Father)',
    description: 'Label for father select option to certify record',
    id: 'form.field.label.app.certifyRecordTo.father'
  },
  typeOfId: {
    defaultMessage: 'Type of ID',
    description: "Input label for certificate collector's id type options",
    id: 'form.field.label.typeOfId'
  },
  iDTypeOtherLabel: {
    defaultMessage: 'Other type of ID',
    description: 'Label for form field: Other type of ID',
    id: 'form.field.label.iDTypeOtherLabel'
  },
  iD: {
    defaultMessage: 'ID Number',
    description: 'Label for form field: ID Number',
    id: 'form.field.label.iD'
  },
  lastName: {
    defaultMessage: 'Last name',
    description: "Input label for certificate collector's last name",
    id: 'form.field.label.lastName'
  },
  informantsRelationWithChild: {
    defaultMessage: 'Relationship to child',
    description: 'Label for Relationship to child',
    id: 'form.field.label.informantsRelationWithChild'
  },
  informantName: {
    defaultMessage: 'Informant',
    description: 'Form section name for Informant',
    id: 'form.section.informant.name'
  },
  informantsRelationWithDeceased: {
    defaultMessage: 'Relationship to Deceased',
    description: 'Label for Relationship to Deceased select',
    id: 'form.field.label.informantsRelationWithDeceased'
  },
  brideName: {
    defaultMessage: 'Bride',
    description: 'Form section name for Bride',
    id: 'form.section.bride.name'
  },
  groomName: {
    defaultMessage: 'Groom',
    description: 'Form section name for Groom',
    id: 'form.section.groom.name'
  },
  relationshipToSpouses: {
    defaultMessage: 'Relationship to spouses',
    description: "Input label for witness's relationship with spouses",
    id: 'form.field.label.relationshipToSpouses'
  },
  otherOption: {
    defaultMessage: 'Other',
    description: 'Other option for select',
    id: 'form.field.label.otherOption'
  },
  dateRangePickerCheckboxLabel: {
    defaultMessage: '{rangeStart} to {rangeEnd}',
    description: 'Label for daterange picker checkbox',
    id: 'form.field.dateRangepicker.checkbox.dateLabel'
  },
  confirm: {
    defaultMessage: 'Yes',
    description: 'confirmation label for yes / no radio button',
    id: 'form.field.label.confirm'
  },
  deny: {
    defaultMessage: 'No',
    description: 'deny label for yes / no radio button',
    id: 'form.field.label.deny'
  },
  groomTitle: {
    defaultMessage: "Groom's details",
    description: 'Form section title for Groom',
    id: 'form.section.groom.title'
  },
  childTitle: {
    defaultMessage: "Child's details",
    description: 'Form section title for Child',
    id: 'form.section.child.title'
  },
  birthLocation: {
    defaultMessage: 'Hospital / Clinic',
    description: 'Label for form field: Hospital or Health Institution',
    id: 'form.field.label.birthLocation'
  },
  deceasedTitle: {
    defaultMessage: 'What are the deceased details?',
    description: 'Form section title for Deceased',
    id: 'form.section.deceased.title'
  },
  motherTitle: {
    defaultMessage: "Mother's details",
    description: 'Form section title for Mother',
    id: 'form.section.mother.title'
  },
  documentsName: {
    defaultMessage: 'Documents',
    description: 'Form section name for Documents',
    id: 'form.section.documents.name'
  },
  documentsTitle: {
    defaultMessage: 'Attach supporting documents',
    description: 'Form section title for Documents',
    id: 'form.section.documents.title'
  },
  documentsUploadName: {
    defaultMessage: 'Documents Upload',
    description: 'Form section name for Documents Upload',
    id: 'form.section.upload.documentsName'
  },
  educationAttainmentISCED1: {
    defaultMessage: 'Primary',
    description: 'Option for form field: ISCED1 education',
    id: 'form.field.label.educationAttainmentISCED1'
  },
  educationAttainmentISCED4: {
    defaultMessage: 'Secondary',
    description: 'Option for form field: ISCED4 education',
    id: 'form.field.label.educationAttainmentISCED4'
  },
  educationAttainmentISCED5: {
    defaultMessage: 'Tertiary',
    description: 'Option for form field: ISCED5 education',
    id: 'form.field.label.educationAttainmentISCED5'
  },
  educationAttainmentNone: {
    defaultMessage: 'No schooling',
    description: 'Option for form field: no education',
    id: 'form.field.label.educationAttainmentNone'
  },
  enterResponse: {
    defaultMessage: 'Enter a response to your chosen security question',
    description: 'Label to input an answer to a security question',
    id: 'user.form.securityquestion.enterResponse'
  },
  familyName: {
    defaultMessage: 'Last name',
    description: 'Label for family name text input',
    id: 'form.field.label.familyName'
  },
  firstNameFamilyName: {
    defaultMessage: 'Name and surname',
    description: 'Label for family name text input',
    id: 'form.field.label.firstNameFamilyName'
  },
  marriedLastName: {
    defaultMessage: 'Married Last name (if different)',
    description: 'Label for married last name text input',
    id: 'form.field.label.marriedLastName'
  },
  father: {
    defaultMessage: 'Father',
    description: 'Label for option Father',
    id: 'form.field.label.informantRelation.father'
  },
  fatherFamilyName: {
    defaultMessage: 'নামের শেষাংশ বাংলায়',
    description: 'Label for form field: Family name',
    id: 'form.field.label.fatherFamilyName'
  },
  fatherFirstNames: {
    defaultMessage: 'নামের প্রথমাংশ বাংলায়',
    description: 'Label for form field: First name',
    id: 'form.field.label.fatherFirstNames'
  },
  fatherName: {
    defaultMessage: 'Father',
    description: 'Form section name for Father',
    id: 'form.section.father.name'
  },
  mothersDetailsExist: {
    defaultMessage: "Mother's details are not available",
    description: "Question to ask the user if they have the mother's details",
    id: 'form.field.label.mothersDetailsExist'
  },
  fathersDetailsExist: {
    defaultMessage: "Father's details are not available",
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
    defaultMessage: 'VERIFY NATIONAL ID',
    description: 'Label for loader button',
    id: 'form.field.label.fetchMotherDetails'
  },
  fetchPersonByNIDModalErrorText: {
    defaultMessage:
      'National ID not found. Please enter a valid National ID and date of birth.',
    description: 'Label for fetch modal error title',
    id: 'form.field.label.fetchPersonByNIDModalErrorText'
  },
  fetchPersonByNIDModalNetworkErrorText: {
    defaultMessage:
      'The request to the NID system was unsuccessful. Please try again with a better connection.',
    description: 'Label for fetch modal error title',
    id: 'form.field.label.NIDNetErr'
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
    defaultMessage: 'Birth registration number (in English)',
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
    defaultMessage: 'National ID number (in English)',
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
  lastNameEn: {
    defaultMessage: 'English last name',
    description: 'English last name',
    id: 'form.field.label.lastNameEN'
  },
  manner: {
    defaultMessage: 'Manner of death',
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
  typeOfMarriage: {
    defaultMessage: 'Type of marriage',
    description: 'Option for form field: Type of marriage',
    id: 'form.field.label.typeOfMarriage'
  },
  polygamy: {
    defaultMessage: 'Polygamous',
    description: 'Option for form field: Polygamy',
    id: 'form.field.label.polygamy'
  },
  monogamy: {
    defaultMessage: 'Monogamous',
    description: 'Option for form field: Monogamy',
    id: 'form.field.label.monogamy'
  },
  maritalStatus: {
    defaultMessage: 'Marital status',
    description: 'Label for form field: Marital status',
    id: 'form.field.label.maritalStatus'
  },
  maritalStatusSeparated: {
    id: 'form.field.label.maritalStatusSeparated',
    defaultMessage: 'Separated',
    description: 'Option for form field: Marital status'
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
    defaultMessage: 'Single',
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
    description: 'Label for radio option Mother',
    id: 'form.field.label.uploadDocForMother'
  },
  docTypeBirthCert: {
    defaultMessage: 'Birth certificate',
    description: 'Label for select option birth certificate',
    id: 'form.field.label.docTypeBirthCert'
  },
  nidVerified: {
    defaultMessage: 'Authenticated',
    description: 'label for unverified nid state',
    id: 'form.field.nidVerified'
  },
  nidNotVerified: {
    defaultMessage: 'Authenticate',
    description: 'label for verified nid state',
    id: 'form.field.nidNotVerified'
  },
  nidOffline: {
    defaultMessage:
      'National ID authentication is currently not available offline.',
    description:
      'Label for indicating offline status for the user. NID verification is not currently available offline.',
    id: 'form.field.nidVerificationOngoing'
  },
  nidNotVerifiedReviewSection: {
    defaultMessage: 'Unauthenticated',
    description:
      'Label for indicating unauthenticated status for the a review section',
    id: 'form.field.nidNotVerifiedReviewSection'
  },
  fileSizeError: {
    defaultMessage: 'File size must be less than 2MB',
    description: 'text for error on file size',
    id: 'form.field.label.fileSizeError'
  },
  fileUploadError: {
    defaultMessage: '{type} supported image only',
    description: 'text for error on file upload',
    id: 'form.field.label.fileUploadError'
  },
  contactDetailsMother: {
    defaultMessage: 'Mother',
    description: 'Label for "Mother" select option',
    id: 'form.field.label.app.whoContDet.mother'
  },
  contactDetailsFather: {
    defaultMessage: 'Father',
    description: 'Label for "Father" select option',
    id: 'form.field.label.app.whoContDet.father'
  },
  contactDetailsInformant: {
    id: 'form.field.label.app.whoContDet.app',
    defaultMessage: 'Informant',
    description: 'Label for "Informant" select option'
  },
  otherFamilyMember: {
    defaultMessage: 'Other family member',
    description: 'Label for option Other family member',
    id: 'form.field.label.relationOtherFamilyMember'
  },
  legalGuardian: {
    defaultMessage: 'Legal guardian',
    description: 'Label for option Legal Guardian',
    id: 'form.field.label.informantRelation.legalGuardian'
  },
  grandmother: {
    defaultMessage: 'Grandmother',
    description: 'Label for option Grandmother',
    id: 'form.field.label.informantRelation.grandmother'
  },
  grandfather: {
    defaultMessage: 'Grandfather',
    description: 'Label for option Grandfather',
    id: 'form.field.label.informantRelation.grandfather'
  },
  brother: {
    defaultMessage: 'Brother',
    description: 'Label for option brother',
    id: 'form.field.label.informantRelation.brother'
  },
  sister: {
    defaultMessage: 'Sister',
    description: 'Label for option Sister',
    id: 'form.field.label.informantRelation.sister'
  },
  userFormTitle: {
    defaultMessage: 'Create new user',
    description: 'The title of user form',
    id: 'form.section.user.title'
  }
}

export const formMessages = defineMessages(formMessageDescriptors)
