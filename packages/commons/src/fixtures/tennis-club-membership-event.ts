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
import { defineConfig } from '../events'

export const tennisClubMembershipEvent = defineConfig({
  id: 'TENNIS_CLUB_MEMBERSHIP',
  label: {
    defaultMessage: 'Tennis club membership application',
    description: 'This is what this event is referred as in the system',
    id: 'event.tennis-club-membership.label'
  },
  summary: {
    title: {
      defaultMessage: 'Summary',
      description: 'This is the title of the summary',
      id: 'event.tennis-club-membership.summary.title'
    },
    fields: [
      {
        id: 'applicant.firstname',
        emptyValueMessage: {
          defaultMessage: 'First name is not provided',
          description: 'This is the message to show when the field is empty',
          id: 'event.tennis-club-membership.summary.field.firstname.empty'
        }
      }
    ]
  },
  workqueues: [
    {
      id: 'in-progress',
      title: {
        defaultMessage: 'In progress',
        description: 'Label for in progress workqueue',
        id: 'event.tennis-club-membership.workqueue.in-progress.label'
      },
      fields: [
        {
          id: 'applicant.firstname',
          label: {
            defaultMessage: 'First name',
            description: 'Label for first name',
            id: 'event.tennis-club-membership.workqueue.in-progress.field.firstname.label'
          }
        },
        {
          id: 'event.type',
          label: {
            defaultMessage: 'Type',
            description: 'Label for type',
            id: 'event.tennis-club-membership.workqueue.in-progress.field.type.label'
          }
        },
        {
          id: 'event.createdAt',
          label: {
            defaultMessage: 'Created at',
            description: 'Label for created at',
            id: 'event.tennis-club-membership.workqueue.in-progress.field.createdAt.label'
          }
        },
        {
          id: 'event.modifiedAt',
          label: {
            defaultMessage: 'Modified at',
            description: 'Label for modified at',
            id: 'event.tennis-club-membership.workqueue.in-progress.field.modifiedAt.label'
          }
        }
      ],
      filters: [
        {
          status: ['CREATED']
        }
      ]
    }
  ],
  actions: [
    {
      type: 'DECLARE',
      label: {
        defaultMessage: 'Send an application',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.tennis-club-membership.action.declare.label'
      },
      forms: [
        {
          label: {
            id: 'event.tennis-club-membership.action.declare.form.label',
            defaultMessage: 'Tennis club membership application',
            description: 'This is what this form is referred as in the system'
          },
          active: true,
          version: {
            id: '1.0.0',
            label: {
              id: 'event.tennis-club-membership.action.declare.form.version.1',
              defaultMessage: 'Version 1',
              description: 'This is the first version of the form'
            }
          },
          review: {
            title: {
              id: 'event.tennis-club-membership.action.declare.form.review.title',
              defaultMessage: 'Member declaration for {firstname} {surname}',
              description: 'Title of the form to show in review page'
            }
          },
          pages: [
            {
              id: 'applicant',
              title: {
                id: 'event.tennis-club-membership.action.declare.form.section.who.title',
                defaultMessage: 'Who is applying for the membership?',
                description: 'This is the title of the section'
              },
              fields: [
                {
                  id: 'applicant.firstname',
                  type: 'TEXT',
                  required: true,
                  conditionals: [],
                  label: {
                    defaultMessage: "Applicant's first name",
                    description: 'This is the label for the field',
                    id: 'event.tennis-club-membership.action.declare.form.section.who.field.firstname.label'
                  }
                },
                {
                  id: 'applicant.surname',
                  type: 'TEXT',
                  required: true,
                  conditionals: [],
                  label: {
                    defaultMessage: "Applicant's surname",
                    description: 'This is the label for the field',
                    id: 'event.tennis-club-membership.action.declare.form.section.who.field.surname.label'
                  }
                },
                {
                  id: 'applicant.dob',
                  type: 'DATE',
                  required: true,
                  conditionals: [],
                  label: {
                    defaultMessage: "Applicant's date of birth",
                    description: 'This is the label for the field',
                    id: 'event.tennis-club-membership.action.declare.form.section.who.field.dob.label'
                  }
                }
              ]
            },
            {
              id: 'recommender',
              title: {
                id: 'event.tennis-club-membership.action.declare.form.section.recommender.title',
                defaultMessage: 'Who is recommending the applicant?',
                description: 'This is the title of the section'
              },
              fields: [
                {
                  id: 'recommender.firstname',
                  type: 'TEXT',
                  required: true,
                  conditionals: [],
                  label: {
                    defaultMessage: "Recommender's first name",
                    description: 'This is the label for the field',
                    id: 'event.tennis-club-membership.action.declare.form.section.recommender.field.firstname.label'
                  }
                },
                {
                  id: 'recommender.surname',
                  type: 'TEXT',
                  required: true,
                  conditionals: [],
                  label: {
                    defaultMessage: "Recommender's surname",
                    description: 'This is the label for the field',
                    id: 'event.tennis-club-membership.action.declare.form.section.recommender.field.surname.label'
                  }
                },
                {
                  id: 'recommender.id',
                  type: 'TEXT',
                  required: true,
                  conditionals: [],
                  label: {
                    defaultMessage: "Recommender's membership ID",
                    description: 'This is the label for the field',
                    id: 'event.tennis-club-membership.action.declare.form.section.recommender.field.id.label'
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
})
