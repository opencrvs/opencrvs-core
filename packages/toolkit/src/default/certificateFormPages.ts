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

import { defineForm } from '@opencrvs/commons/events'
import { field } from '../conditionals'

export const defaultCertificateCollectorFormConfig = defineForm({
  label: {
    id: 'event.tennis-club-membership.action.certificate.form.label',
    defaultMessage: 'Tennis club membership certificate collector',
    description: 'This is what this form is referred as in the system'
  },
  review: {
    title: {
      id: 'event.tennis-club-membership.action.certificate.form.review.title',
      defaultMessage: 'Member certificate collector for {firstname} {surname}',
      description: 'Title of the form to show in review page'
    }
  },
  active: true,
  version: {
    id: '1.0.0',
    label: {
      id: 'event.tennis-club-membership.action.certificate.form.version.1',
      defaultMessage: 'Version 1',
      description: 'This is the first version of the form'
    }
  },
  pages: [
    {
      id: 'collector',
      title: {
        id: 'event.tennis-club-membership.action.certificate.form.section.who.title',
        defaultMessage: 'Print certified copy',
        description: 'This is the title of the section'
      },
      fields: [
        {
          id: 'collector.certificateTemplateId',
          type: 'SELECT',
          required: true,
          label: {
            defaultMessage: 'Select Certificate Template',
            description: 'This is the label for the field',
            id: 'event.tennis-club-membership.action.certificate.form.section.who.field.surname.label'
          },
          options: [
            {
              label: {
                id: 'certificates.tennis-club-membership.certificate.copy',
                defaultMessage: 'Tennis Club Membership Certificate copy',
                description:
                  'The label for a tennis-club-membership certificate'
              },
              value: 'tennis-club-membership-certificate'
            },
            {
              label: {
                id: 'certificates.tennis-club-membership.certificate.certified-copy',
                defaultMessage:
                  'Tennis Club Membership Certificate certified copy',
                description:
                  'The label for a tennis-club-membership certificate'
              },
              value: 'tennis-club-membership-certified-certificate'
            }
          ]
        },
        {
          id: 'collector.requesterId',
          type: 'SELECT',
          required: true,
          label: {
            defaultMessage: 'Requester',
            description: 'This is the label for the field',
            id: 'event.tennis-club-membership.action.certificate.form.section.requester.label'
          },
          options: [
            {
              label: {
                id: 'event.tennis-club-membership.action.certificate.form.section.requester.informant.label',
                defaultMessage: 'Print and issue Informant',
                description: 'This is the label for the field'
              },
              value: 'INFORMANT'
            },
            {
              label: {
                id: 'event.tennis-club-membership.action.certificate.form.section.requester.other.label',
                defaultMessage: 'Print and issue someone else',
                description: 'This is the label for the field'
              },
              value: 'OTHER'
            },
            {
              label: {
                id: 'event.tennis-club-membership.action.certificate.form.section.requester.printInAdvance.label',
                defaultMessage: 'Print in advance',
                description: 'This is the label for the field'
              },
              value: 'PRINT_IN_ADVANCE'
            }
          ]
        },
        {
          id: 'collector.OTHER.idType',
          type: 'SELECT',
          required: true,
          label: {
            defaultMessage: 'Select Type of ID',
            description: 'This is the label for selecting the type of ID',
            id: 'event.tennis-club-membership.action.form.section.idType.label'
          },
          conditionals: [
            {
              type: 'HIDE',
              conditional: field(
                'collector.requesterId'
              ).isUndefinedOrNotInArray(['OTHER'])
            }
          ],
          options: [
            {
              label: {
                id: 'event.tennis-club-membership.action.form.section.idType.passport.label',
                defaultMessage: 'Passport',
                description: 'Option for selecting Passport as the ID type'
              },
              value: 'PASSPORT'
            },
            {
              label: {
                id: 'event.tennis-club-membership.action.form.section.idType.drivingLicense.label',
                defaultMessage: 'Driving License',
                description:
                  'Option for selecting Driving License as the ID type'
              },
              value: 'DRIVING_LICENSE'
            },
            {
              label: {
                id: 'event.tennis-club-membership.action.form.section.idType.refugeeNumber.label',
                defaultMessage: 'Refugee Number',
                description:
                  'Option for selecting Refugee Number as the ID type'
              },
              value: 'REFUGEE_NUMBER'
            },
            {
              label: {
                id: 'event.tennis-club-membership.action.form.section.idType.alienNumber.label',
                defaultMessage: 'Alien Number',
                description: 'Option for selecting Alien Number as the ID type'
              },
              value: 'ALIEN_NUMBER'
            },
            {
              label: {
                id: 'event.tennis-club-membership.action.form.section.idType.other.label',
                defaultMessage: 'Other',
                description: 'Option for selecting Other as the ID type'
              },
              value: 'OTHER'
            },
            {
              label: {
                id: 'event.tennis-club-membership.action.form.section.idType.noId.label',
                defaultMessage: 'No ID',
                description: 'Option for selecting No ID as the ID type'
              },
              value: 'NO_ID'
            }
          ]
        },
        {
          id: 'collector.PASSPORT.details',
          type: 'TEXT',
          required: true,
          label: {
            defaultMessage: 'Passport Details',
            description: 'Field for entering Passport details',
            id: 'event.tennis-club-membership.action.form.section.passportDetails.label'
          },
          conditionals: [
            {
              type: 'HIDE',
              conditional: field(
                'collector.OTHER.idType'
              ).isUndefinedOrNotInArray(['PASSPORT'])
            }
          ]
        },
        {
          id: 'collector.DRIVING_LICENSE.details',
          type: 'TEXT',
          required: true,
          label: {
            defaultMessage: 'Driving License Details',
            description: 'Field for entering Driving License details',
            id: 'event.tennis-club-membership.action.form.section.drivingLicenseDetails.label'
          },
          conditionals: [
            {
              type: 'HIDE',
              conditional: field(
                'collector.OTHER.idType'
              ).isUndefinedOrNotInArray(['DRIVING_LICENSE'])
            }
          ]
        },
        {
          id: 'collector.REFUGEE_NUMBER.details',
          type: 'TEXT',
          required: true,
          label: {
            defaultMessage: 'Refugee Number Details',
            description: 'Field for entering Refugee Number details',
            id: 'event.tennis-club-membership.action.form.section.refugeeNumberDetails.label'
          },
          conditionals: [
            {
              type: 'HIDE',
              conditional: field(
                'collector.OTHER.idType'
              ).isUndefinedOrNotInArray(['REFUGEE_NUMBER'])
            }
          ]
        },
        {
          id: 'collector.ALIEN_NUMBER.details',
          type: 'TEXT',
          required: true,
          label: {
            defaultMessage: 'Alien Number Details',
            description: 'Field for entering Alien Number details',
            id: 'event.tennis-club-membership.action.form.section.alienNumberDetails.label'
          },
          conditionals: [
            {
              type: 'HIDE',
              conditional: field(
                'collector.OTHER.idType'
              ).isUndefinedOrNotInArray(['ALIEN_NUMBER'])
            }
          ]
        },
        {
          id: 'collector.OTHER.idTypeOther',
          type: 'TEXT',
          required: true,
          label: {
            defaultMessage: 'Other ID Type (if applicable)',
            description: 'Field for entering ID type if "Other" is selected',
            id: 'event.tennis-club-membership.action.form.section.idTypeOther.label'
          },
          conditionals: [
            {
              type: 'HIDE',
              conditional: field(
                'collector.OTHER.idType'
              ).isUndefinedOrNotInArray(['OTHER'])
            }
          ]
        },
        {
          id: 'collector.OTHER.firstName',
          type: 'TEXT',
          required: true,
          label: {
            defaultMessage: 'First Name',
            description: 'This is the label for the first name field',
            id: 'event.tennis-club-membership.action.form.section.firstName.label'
          },
          conditionals: [
            {
              type: 'HIDE',
              conditional: field(
                'collector.requesterId'
              ).isUndefinedOrNotInArray(['OTHER'])
            }
          ]
        },
        {
          id: 'collector.OTHER.lastName',
          type: 'TEXT',
          required: true,
          label: {
            defaultMessage: 'Last Name',
            description: 'This is the label for the last name field',
            id: 'event.tennis-club-membership.action.form.section.lastName.label'
          },
          conditionals: [
            {
              type: 'HIDE',
              conditional: field(
                'collector.requesterId'
              ).isUndefinedOrNotInArray(['OTHER'])
            }
          ]
        },
        {
          id: 'collector.OTHER.relationshipToMember',
          type: 'TEXT',
          required: true,
          label: {
            defaultMessage: 'Relationship to Member',
            description:
              'This is the label for the relationship to member field',
            id: 'event.tennis-club-membership.action.form.section.relationshipToMember.label'
          },
          conditionals: [
            {
              type: 'HIDE',
              conditional: field(
                'collector.requesterId'
              ).isUndefinedOrNotInArray(['OTHER'])
            }
          ]
        },
        {
          id: 'collector.OTHER.signedAffidavit',
          type: 'FILE',
          required: false,
          label: {
            defaultMessage: 'Signed Affidavit (Optional)',
            description: 'This is the label for uploading a signed affidavit',
            id: 'event.tennis-club-membership.action.form.section.signedAffidavit.label'
          },
          conditionals: [
            {
              type: 'HIDE',
              conditional: field(
                'collector.requesterId'
              ).isUndefinedOrNotInArray(['OTHER'])
            }
          ]
        }
      ]
    }
  ]
})
