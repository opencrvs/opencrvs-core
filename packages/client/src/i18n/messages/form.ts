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
import { defineMessages } from 'react-intl'

export const formMessageDescriptors = {
  addFile: {
    defaultMessage: 'Add file',
    description: 'text for add file button',
    id: 'form.field.label.addFile'
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
  uploadDocForMother: {
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
