import { defineMessages } from 'react-intl'

export enum QUESTION_KEYS {
  BIRTH_TOWN,
  FIRST_SCHOOL,
  MOTHER_NICK_NAME,
  FATHER_NICK_NAME,
  FAVORITE_TEACHER,
  FAVORITE_MOVIE,
  FAVORITE_COLOR
}

export const questionMessages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  BIRTH_TOWN: {
    id: 'register.userSetup.securityQuestions.BIRTH_TOWN',
    defaultMessage: 'In what city were you born?',
    description: 'The description for BIRTH_TOWN key'
  },
  FIRST_SCHOOL: {
    id: 'register.userSetup.securityQuestions.FIRST_SCHOOL',
    defaultMessage: 'What is the name of your first school?',
    description: 'The description for FIRST_SCHOOL key'
  },
  MOTHER_NICK_NAME: {
    id: 'register.userSetup.securityQuestions.MOTHER_NICK_NAME',
    defaultMessage: "What is your mother's nick name?",
    description: 'The description for MOTHER_NICK_NAME key'
  },
  FATHER_NICK_NAME: {
    id: 'register.userSetup.securityQuestions.FATHER_NICK_NAME',
    defaultMessage: "What is your father's nick name?",
    description: 'The description for FATHER_NICK_NAME key'
  },
  FAVORITE_TEACHER: {
    id: 'register.userSetup.securityQuestions.FAVORITE_TEACHER',
    defaultMessage: 'Who is your favorite teacher?',
    description: 'The description for FAVORITE_TEACHER key'
  },
  FAVORITE_MOVIE: {
    id: 'register.userSetup.securityQuestions.FAVORITE_MOVIE',
    defaultMessage: 'What is your favorite movie?',
    description: 'The description for FAVORITE_MOVIE key'
  },
  FAVORITE_COLOR: {
    id: 'register.userSetup.securityQuestions.FAVORITE_COLOR',
    defaultMessage: 'What is your favorite color?',
    description: 'The description for FAVORITE_COLOR key'
  }
})
